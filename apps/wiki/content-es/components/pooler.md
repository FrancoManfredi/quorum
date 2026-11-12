El Pooler de conexiones representa a PgBouncer: un proxy que permite que muchas conexiones de la aplicación compartan unas pocas conexiones de base de datos.

## Cuándo colocarlo

- Colócalo cuando la Base de datos rechace conexiones: los errores muestran `refused` mientras su CPU no está llena. Ocurre cuando añades Servidores de aplicaciones, o cuando un runtime abre un pool grande por proceso.

El Sandbox [Límite de conexiones](/sandboxes/connection-limit) lo muestra.

::Sandbox{id="connection-limit"}

## Cómo funciona

Colócalo entre tus Servidores de aplicaciones o Workers y la [Base de datos](/components/database). Lleva las lecturas puntuales, las escrituras y las transacciones que usan una conexión de base de datos, y las pasa con casi ninguna latencia añadida. No lleva búsquedas, almacenamiento de objetos ni escaneos. Tiene un límite de rendimiento de **10,000 consultas por segundo** en su primer tamaño, y cada escalón de tamaño lo duplica.

Admite **un** enlace de salida. Un PgBouncer real no lee SQL y envía todas las conexiones a un único host, así que no puede enviar lecturas a una réplica y escrituras al primario. Para llegar también a una [Réplica de lectura](/components/replica), enlaza el pooler con un [Balanceador de carga](/components/lb) L4 (uno L7 lee HTTP y rechaza consultas), y el Balanceador de carga con la Base de datos y con cada réplica. El Balanceador de carga reparte entonces las lecturas según su algoritmo, mientras las escrituras van solo a la Base de datos.

Los dos modos con pooling rompen el estado de sesión del mismo modo: las prepared statements y los `SET` a nivel de sesión pertenecen a una conexión que el cliente ya no tiene. Consulta [pool de conexiones](/glossary/connection-pooling).

## Opciones

::Options{id="pooler"}

Su modo fija cuántas conexiones de Base de datos abre:

- **Transacción** (el predeterminado): todos los clientes comparten un pequeño conjunto de conexiones de servidor. El código que mantiene estado de sesión se rompe, y una parte de las peticiones falla hasta que tu equipo termine la tarea "Eliminar el estado de sesión" de la página de [Equipo](/team#tasks).
- **Sentencia**: una conexión de servidor por sentencia. Comparte el mismo conjunto pequeño, así que aquí no compacta más. Una transacción que abarca varias sentencias no puede pasar por él, así que todos los checkouts fallan. Elígelo solo en un Diseño cuyas escrituras sean sentencias únicas.
- **Sesión**: una conexión de servidor por cliente. No se rompe nada, y apenas ayuda.

## Cómo falla

- Sin uno, el [Agotamiento de conexiones](/incidents/connections) es mucho más probable. Un despliegue duplica todos los pools, y Postgres rechaza el exceso.
- En modo transacción, los fallos continúan hasta que se hace la tarea de estado de sesión.
- Sobrecargado, descarta consultas antes de que lleguen a la Base de datos.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Pooler de conexiones se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído. Un **Standby** (sección Zona, necesita [Múltiples zonas](/research/multi-az)) toma el relevo por sí solo, sin hacer clic.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner o en la tarjeta del Nodo. Necesita [Múltiples zonas](/research/multi-az) y promueve al instante el **Standby** del Nodo; después el Nodo se queda sin standby hasta que le des uno. Un Nodo sin standby permanece caído hasta que termina el incidente, como máximo 120 segundos de simulación, y uno con standby también hace failover por sí solo pasada una parte de ese tiempo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona. Dale un **Standby**.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Pon en cola la tarea "Eliminar el estado de sesión" en cuanto coloques un Pooler en modo transacción.
- Enlaza una [Caché](/components/cache) con el Pooler, no directamente con la Base de datos.
