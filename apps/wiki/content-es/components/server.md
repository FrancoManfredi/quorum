El Servidor de aplicaciones representa a una máquina virtual que ejecuta tu código.

## Cuándo colocarlo

- Añade una copia, o un escalón de tamaño, cuando su tarjeta muestre la CPU, los workers o la memoria cerca del límite y el p99 suba.
- Pon un [Balanceador de carga](/components/lb) delante antes de la segunda copia.
- Arregla antes los backends cuando el límite sean los workers con la CPU baja: la máquina está esperándolos. Consulta [Encontrar el cuello de botella](/guides/find-the-bottleneck).

## Cómo funciona

Responde él mismo las vistas de página y los bots, y convierte todos los demás tipos de petición en llamadas al backend: consultas de lectura y escritura, llamadas de autenticación, tareas, cobros y más. Su capacidad depende de su tipo de instancia, su [runtime y su framework](/runtimes). Lo fija el más ajustado de cuatro límites: CPU, slots de worker, memoria y red.

Una petición retiene su slot de worker mientras espera cada llamada al backend. Así que una Base de datos lenta también reduce la capacidad de los runtimes que retienen un worker mientras esperan. Es la [ley de Little](/glossary/littles-law).

La máquina del Garaje ejecuta Postgres en el mismo equipo. Cuando la enlazas con una [Base de datos](/components/database), un [Pooler de conexiones](/components/pooler) o una [Caché](/components/cache), Postgres sale de la máquina para siempre. Una máquina Burstable gana créditos de CPU mientras está ociosa y se limita cuando se agotan.

## Opciones

::Options{id="server"}

### Stack

El Stack es el lenguaje, su runtime y el framework. Fija cómo reparte el trabajo la máquina, lo rápido que se ejecuta cada petición, la memoria que guarda cada proceso y si el runtime puede mantener abierta una conexión.

- **Runtime**: el servidor que ejecuta tu código. Cada uno usa un modelo como un proceso por petición, un pool de hilos o un bucle de eventos, y el modelo decide cómo espera una petición a un backend. Consulta [Runtimes](/runtimes).
- **Framework**: la librería que rodea al runtime. Añade CPU y memoria a cada petición, y compra velocidad. El selector lista los frameworks del lenguaje del runtime.
- **Tamaño del pool**: cuántos procesos worker sirven peticiones. Una petición retiene un slot mientras espera cada llamada al backend, así que una Base de datos lenta llena el pool mientras la CPU sigue ociosa. La cifra junto al control indica cuántos workers caben en la RAM de la máquina. Si te pasas, la máquina hace swap y luego mata un proceso.
- **Gestor de procesos**: PHP-FPM mantiene un pool de procesos worker, y el gestor de procesos decide cuáles siguen en ejecución. Estático mantiene todo el pool residente, así que ninguna petición espera un fork, y la máquina retiene esa memoria aunque esté ociosa. Dinámico mantiene los workers ocupados más dos de reserva, así que una ráfaga hace que una pequeña parte de las peticiones espere un momento por un fork. Bajo demanda mantiene solo los workers ocupados, así que la RAM ociosa es la más baja y más peticiones esperan. Elige Estático cuando sobre RAM, Dinámico para la mayoría de los Diseños, y Bajo demanda cuando la memoria sea el límite y la cola pueda esperar.
- **Reciclar workers**: reinicia cada proceso de vez en cuando. Limita una fuga de memoria antes de que el proceso se quede sin ella, y cada reinicio vuelve en frío. Actívalo para un runtime que conserva memoria entre peticiones.
- **Compresión**: Gzip en las respuestas que se comprimen bien. Reduce su tamaño, el egress que facturan y el tiempo que tardan en llegar a un usuario, y cuesta CPU en cada una. Las subidas y el vídeo no se comprimen.
- **Servicio**: a qué Servicio pertenece el Nodo. Aparece cuando la aplicación se divide en más de un Servicio.

### Recolección de basura

- **Colector**: el recolector de basura de un runtime Java. G1 equilibra pausa y rendimiento. Parallel es algo más rápido y pausa más tiempo, con algo menos de memoria. ZGC mantiene pausas diminutas con menos rendimiento y más memoria. Elige ZGC cuando un pico de p99 duela más que la CPU.
- **GOGC**: el objetivo de recolección de un runtime Go. Un valor más bajo recolecta más a menudo, así que la memoria se mantiene pequeña y la CPU va al recolector. Un valor más alto hace lo contrario. Go recolecta sin una pausa larga en cualquiera de los dos casos.

### Sobrecarga

- **Descarte**: el [Descarte de carga por prioridad](/patterns/load-shedding) responde a un Nodo lleno descartando tipos de petición enteros, primero los de menor valor, hasta que vuelve por debajo de su línea. El valor predeterminado, Descartar por igual, rechaza una parte de cada tipo en lugar de tipos enteros. Los tipos que conserva siguen siendo rápidos, y los descartados cuentan como errores.
- **Degradación**: la [Degradación elegante](/patterns/graceful-degradation) descarta primero los tipos que más CPU cuestan, para que los tipos baratos y de gran volumen conserven su latencia. Un Nodo con ambos ajustes activados degrada primero.
- **Leer tus escrituras**: envía al primario una lectura que sigue a una escritura, para que una réplica con retraso no pueda responderla con datos viejos. Consulta [Lee tus propias escrituras](/patterns/read-your-writes).

### Feeds

- **Reparto**: cómo sirve el Servidor de aplicaciones un feed. Pull une en el momento de la lectura las cuentas que sigue un usuario. Push escribe una copia en el timeline de cada seguidor. Push se convierte en el híbrido con [Fan-out híbrido](/research/hybrid-fanout). Consulta [Fan-out en escritura y en lectura](/patterns/fan-out-on-write-and-on-read).

## Cómo falla

- Sobrecargado, encola peticiones y luego las descarta.
- Una máquina con muy poca RAM hace swap, y un pool dimensionado demasiado grande para su RAM se mata.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Servidor de aplicaciones se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
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

### [Fuga de memoria](/incidents/leak)

- **Señales:** El Inspector de la tarjeta dice "La memoria crece: N GB de fuga." Si se deja, el proceso se queda sin memoria y se reinicia en frío.
- **Qué hacer ahora:** Pulsa **Reiniciar** en el Inspector. Libera la memoria filtrada y vuelve en frío.
- **Prevenir:** Activa **Reciclar workers** (reinicios periódicos), haz la tarea Corregir la fuga de memoria, o ejecuta un runtime que no persista, como PHP-FPM. Investiga [Métricas](/research/metrics) y [Alertas](/research/alerting) para verla antes.

### [Bloqueo del bucle de eventos](/incidents/loop)

- **Señales:** El p99 sube en todos los tipos que responde ese servicio, porque un tipo que consume mucha CPU, como `login`, retiene el bucle de eventos.
- **Qué hacer ahora:** Pulsa **Mover el inicio de sesión** en el banner. Necesita un [API Gateway](/components/gw) delante de un Servidor de aplicaciones con bucle de eventos, y un Enlace desde el Gateway a otro Servidor de aplicaciones con un runtime sin bucle: el Gateway envía entonces `login` solo allí, y el incidente termina cuando ningún inicio de sesión llega a un bucle. Sin eso, termina por sí solo tras 35 s como máximo.
- **Prevenir:** Investiga [Pool de hilos de libuv](/research/libuv-pool) e [Identidad gestionada](/research/auth-provider), que sacan el trabajo pesado del bucle.

### [Tormenta de pausas de GC](/incidents/gc-storm)

- **Señales:** El p99 se dispara mientras el p50 sigue normal, en un runtime con recolector de basura cuyo heap supera el 90% de la RAM.
- **Qué hacer ahora:** Pulsa **Reiniciar** en el Inspector. Un reinicio limpia el heap.
- **Prevenir:** Da más RAM a la máquina, cambia Java a [ZGC](/research/zgc) en la sección **Colector**, o ajusta Go con [Ajuste del GC de Go](/research/gogc-tuning) y el ajuste **GOGC**.

### [Calentamiento de JVM bajo carga](/incidents/jvm-warmup)

- **Señales:** Las copias que un Autoescalador añade durante un pico responden a la velocidad en frío del runtime, y el p99 empeora durante 30 s.
- **Qué hacer ahora:** Pulsa **Drenar** en la copia fría. Necesita [Comprobaciones de estado](/research/health-checks) y termina el incidente cuando el Nodo queda vacío. Si no, espera al calentamiento.
- **Prevenir:** Activa **Arranque lento** en el Balanceador de carga, investiga [Imagen nativa de GraalVM](/research/graal-native), o escala de forma programada con [Escalado programado](/research/scheduled-scaling).

### [OPcache obsoleto](/incidents/stale-opcache)

- **Señales:** Un Servidor de aplicaciones PHP ocupado con OPcache falla el 30% de sus peticiones, ejecutando el código viejo contra el esquema nuevo.
- **Qué hacer ahora:** Pulsa **Reiniciar** en el banner o en el Inspector. Restablece la caché y termina el incidente.
- **Prevenir:** Investiga [Entrega continua](/research/ci). Un Pipeline de CI/CD restablece la caché en cada despliegue.

### [Incompatibilidad de librería](/incidents/gevent-compat)

- **Señales:** Un Servidor de aplicaciones gevent ocupado falla el 15% de sus peticiones.
- **Qué hacer ahora:** Pulsa **Reiniciar** en el banner o en el Inspector. Termina el incidente.
- **Prevenir:** Investiga [Pruebas automatizadas](/research/testing-culture).

### [Compatibilidad de runtime](/incidents/bun-compat)

- **Señales:** Un Servidor de aplicaciones Bun ocupado falla el 20% de sus peticiones.
- **Qué hacer ahora:** Pulsa **Reiniciar** en el banner o en el Inspector. Termina el incidente.
- **Prevenir:** Investiga [Pruebas automatizadas](/research/testing-culture).

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

### [Compromiso de la cadena de suministro](/incidents/supply-chain)

- **Señales:** Los usuarios caen un 10% de golpe al perderse la reputación, y aparece un banner "Compromiso de la cadena de suministro" con un botón **Fijar y volver a desplegar**.
- **Qué hacer ahora:** Pulsa **Fijar y volver a desplegar** en el banner.
- **Prevenir:** Investiga [Escaneo de dependencias](/research/dependency-scanning) o [Deno](/research/deno). Un Equipo de seguridad vuelve a reducir las probabilidades.

### [Segundo intercalar o desfase de reloj](/incidents/leap-second)

- **Señales:** Todos los Nodos de la región del Servidor de aplicaciones responden con 1,000 ms de retraso, y el 10% de sus respuestas agota el tiempo de espera. Aparece un banner con un botón **Reiniciar nodos**.
- **Qué hacer ahora:** Pulsa **Reiniciar nodos** en el banner. Un clic resincroniza toda la región.
- **Prevenir:** Investiga [Leap smearing](/research/leap-smearing).

## Consejos

- Ajusta la familia de instancia al runtime: Cómputo para runtimes limitados por CPU, Memoria para muchos workers.
- Reinicia un servidor con fuga para liberar su memoria. Vuelve en frío.

:::Note{tone="real"}
Los servidores sin estado son fáciles de copiar. Por eso los equipos reales los escalan primero en horizontal. Consulta [escalado vertical y horizontal](/glossary/vertical-and-horizontal-scaling).
:::
