El Worker representa a un ejecutor de trabajos en segundo plano como Sidekiq: tu código, fuera de la ruta de la petición.

## Cuándo colocarlo

- Coloca un Worker cuando coloques una Cola, porque sin una las tareas no tienen adónde ir.
- Añade copias cuando la profundidad de la Cola siga creciendo.

## Cómo funciona

Toma tareas de una [Cola](/components/queue) y ejecuta la parte asíncrona de cada tipo. Envía consultas de lectura y escritura, puts de objetos, mensajes push y llamadas a servidores de clientes. Ejecuta los mismos [runtimes y frameworks](/runtimes) que un Servidor de aplicaciones, con un tipo de instancia y un tamaño. Los usuarios nunca lo esperan, y su rendimiento decide si la Cola se vacía o crece.

Una exportación ejecuta muchas consultas de lectura en su tarea, y una subida guarda su archivo, así que enlaza el Worker con los datos que lee y escribe: la [Base de datos](/components/database), una [Caché](/components/cache), una [Réplica de lectura](/components/replica) y el [Almacenamiento de objetos](/components/storage). Enlázalo con el [Proveedor de notificaciones push](/components/msgp) para las notificaciones.

## Opciones

::Options{id="worker"}

El Stack controla el trabajo igual que en un [Servidor de aplicaciones](/components/server#options). Un Worker llena su pool con tareas en lugar de peticiones, y una tarea retiene un worker mientras se ejecuta, incluida cada llamada al backend que espera.

- **Tamaño del pool**: cuántas tareas se ejecutan a la vez. Más workers vacían la Cola más rápido, retienen más memoria y cuestan más CPU cuando las tareas compiten por ella.
- **Gestor de procesos**: la regla de PHP-FPM sobre qué workers siguen en ejecución. Estático mantiene todo el pool residente, Dinámico mantiene dos de reserva y Bajo demanda mantiene solo los workers ocupados. El equilibrio es el mismo: RAM ociosa frente a una breve espera por un fork.
- **Reciclar workers**: reinicia cada proceso de vez en cuando, lo que limita una fuga y cuesta un arranque en frío. Un reinicio planificado devuelve primero sus tareas precargadas.
- **Precarga**: cuántas tareas toma cada worker de la Cola por adelantado. Una precarga mayor pasa menos tiempo esperando al broker, y una caída pierde más.

## Cómo falla

- Si es demasiado lento, el backlog de la Cola crece hasta que su longitud máxima rechaza tareas nuevas.
- Una caída pierde las tareas que había precargado. Un reinicio planificado las devuelve primero.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Worker se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído. Una copia dentro de un Clúster se reprograma sola.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

### [Mensaje envenenado](/incidents/poison)

- **Señales:** La profundidad de la Cola sube sin fin mientras los Workers siguen ocupados, y su Inspector dice "Una tarea falla una y otra vez. Los Workers la reintentan para siempre."
- **Qué hacer ahora:** Selecciona la Cola y pulsa **Eliminar mensaje**. Con una cola de mensajes muertos activada no hace falta nada; termina por sí solo tras 120 s como máximo.
- **Prevenir:** Activa la **Cola de mensajes muertos** en la Cola y fija el máximo de intentos. No hace falta ninguna Investigación.

### [Reclamación de Spot](/incidents/spot-reclaim)

- **Señales:** Su Inspector dice "El proveedor reclama este Nodo Spot en N s. Reemplázalo por bajo demanda." Tras 10 s el Nodo se pone gris.
- **Qué hacer ahora:** Pulsa **Cambiar a bajo demanda** antes de que se agote el aviso. Si no, vuelve por sí solo cuando termina el incidente.
- **Prevenir:** Mantén los Nodos de la ruta de peticiones con precios Bajo demanda o Reservado, y usa Spot solo en una flota que pueda perder un Nodo.

### [Despliegue defectuoso](/incidents/bad-deploy)

- **Señales:** La tasa de errores se dispara justo después de un despliegue, y aparece un banner "Despliegue defectuoso" con un botón **Revertir**.
- **Qué hacer ahora:** Pulsa **Revertir** en el banner. Necesita [Entrega continua](/research/ci); sin ella el incidente termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Entrega continua](/research/ci) y [Pruebas automatizadas](/research/testing-culture). Una estrategia de despliegue Canary y los Feature flags limitan cuánto rompe un despliegue defectuoso.

### [Push de configuración defectuoso](/incidents/config)

- **Señales:** Los Servidores de aplicaciones y los Workers se caen a la vez, y aparece un banner "Push de configuración defectuoso" con un botón **Revertir**.
- **Qué hacer ahora:** Pulsa **Revertir** en el banner. Se reinician con la configuración anterior.
- **Prevenir:** Investiga [GitOps](/research/gitops) y escalona el despliegue, para que un push llegue primero a una región.

### [Agotamiento de conexiones](/incidents/connections)

- **Señales:** La tarjeta de la Base de datos dice "Rechazando N consultas/s: demasiadas conexiones."
- **Qué hacer ahora:** Nada en los Servidores de aplicaciones lo termina; termina por sí solo tras 40 s como máximo. Un [Pooler de conexiones](/components/pooler) entre los Servidores de aplicaciones y la Base de datos limita las conexiones que esta mantiene.
- **Prevenir:** Investiga [Pooling de conexiones](/research/pooling) y coloca un Pooler de conexiones delante de la Base de datos.

## Consejos

- Enlaza los Workers con un [Autoescalador](/components/autoscaler) para que sigan al backlog.
- Mantén baja la precarga en los Workers que se caen a menudo.

:::Note{tone="real"}
Las colas reales entregan al menos una vez, así que un trabajo puede ejecutarse dos veces. Consulta [entrega al menos una vez](/glossary/at-least-once-delivery).
:::
