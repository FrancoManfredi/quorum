La Cola representa a RabbitMQ: un broker que guarda el trabajo ahora para que los [Workers](/components/worker) lo hagan después.

## Cuándo colocarla

- Colócala cuando los tipos lentos retengan slots de los Servidores de aplicaciones, por ejemplo subidas de clientes lentos o exportaciones.
- Auméntala de tamaño o añade Workers cuando su profundidad siga creciendo: es la señal más temprana de que los Workers son demasiado lentos.

## Cómo funciona

Cuando un Servidor de aplicaciones se enlaza con una Cola, los tipos que pueden ir en asíncrono le entregan como tareas la mayor parte de su trabajo: subidas, exportaciones, webhooks y notificaciones. El usuario espera solo al encolado. La Cola ofrece a sus Workers lo que llega, más una parte de su backlog cuando tienen hueco. Tiene un límite de rendimiento, y cada escalón de tamaño lo duplica.

La profundidad de la cola es el número de tareas en espera. Un backlog grande ralentiza un poco cada encolado.

## Opciones

::Options{id="queue"}

- **Cola de mensajes muertos**: aparta una tarea tras su máximo de intentos. Sin una, una tarea que falla se reintenta para siempre y bloquea la Cola. Consulta [cola de mensajes muertos](/glossary/dead-letter-queue).
- **Máximo de intentos**: cuántas veces se prueba una tarea antes de apartarla. Más intentos sobreviven a un fallo temporal y retrasan el momento en que un mensaje envenenado deja de retener la Cola.
- **Longitud máxima**: rechaza tareas nuevas cuando está llena, en lugar de crecer sin límite. Consulta [contrapresión](/glossary/backpressure).

## Cómo falla

- Sin ningún Worker enlazado, todas las tareas quedan atascadas.
- Una Cola llena rechaza lo que sus Workers no pueden asumir, y esas peticiones fallan como descartadas.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la Cola se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a ella quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído. Un **Standby** (sección Zona, necesita [Múltiples zonas](/research/multi-az)) toma el relevo por sí solo, sin hacer clic.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner o en la tarjeta del Nodo. Necesita [Múltiples zonas](/research/multi-az) y promueve al instante el **Standby** del Nodo; después el Nodo se queda sin standby hasta que le des uno. Un Nodo sin standby permanece caído hasta que termina el incidente, como máximo 120 segundos de simulación, y uno con standby también hace failover por sí solo pasada una parte de ese tiempo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona. Dale un **Standby**.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

### [Mensaje envenenado](/incidents/poison)

- **Señales:** La profundidad de la Cola sube sin fin mientras los Workers siguen ocupados, y su Inspector dice "Una tarea falla una y otra vez. Los Workers la reintentan para siempre."
- **Qué hacer ahora:** Selecciona la Cola y pulsa **Eliminar mensaje**. Con una cola de mensajes muertos activada no hace falta nada; termina por sí solo tras 120 s como máximo.
- **Prevenir:** Activa la **Cola de mensajes muertos** en la Cola y fija el máximo de intentos. No hace falta ninguna Investigación.

## Consejos

- Activa la cola de mensajes muertos en cuanto coloques una Cola.
- Vigila la profundidad, no la latencia: los usuarios no notan un backlog hasta que llega a la longitud máxima.
