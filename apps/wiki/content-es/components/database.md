La Base de datos es la única fuente de la verdad de tus datos, como lo son PostgreSQL o MySQL.

## Cuándo colocarla

- Colócala cuando la máquina compartida del Garaje se quede sin memoria o CPU: separa Postgres de ella. Consulta [Escalar la base de datos](/guides/scale-the-database).
- Auméntala de tamaño cuando su CPU siga alta y suba la latencia de las consultas.
- Añade un [Pooler de conexiones](/components/pooler) o cambia el motor a MySQL, no una máquina más grande, cuando los errores muestren conexiones rechazadas.
- Aplica sharding cuando se quede sin CPU en las escrituras.

## Cómo funciona

Responde ella misma lecturas, escrituras, transacciones y escrituras de timeline, y nada de lo que responde pasa a otro Nodo. Su puerto de salida solo la enlaza con un [Conector CDC](/components/cdc). También suple a los Componentes que no has enlazado: sin [Motor de búsqueda](/components/search), [Almacenamiento de objetos](/components/storage) ni [Almacén de datos](/components/warehouse) enlazados, responde búsquedas, guarda archivos como filas y ejecuta escaneos de informes. Hace las tres cosas mal a gran volumen.

Su CPU limita cuántas consultas responde. Cuando el conjunto de trabajo supera la RAM, las lecturas van a disco y se ralentizan. Los escaneos de informes expulsan la caché de búfer, así que también se ralentizan todas las demás consultas.

## Opciones

::Options{id="database"}

### Motor

Postgres ejecuta un proceso por conexión, y la Base de datos rechaza las conexiones que pasan de su límite
(100). Cada Servidor de aplicaciones y cada proceso de Worker tiene su propio pool de conexiones, así que más
Servidores de aplicaciones pueden tumbar la Base de datos. [El nivel de datos](/explanation/the-data-tier) explica por qué. MySQL da
un hilo a cada conexión en lugar de un proceso, y admite 500, cada una con aproximadamente la octava parte de la memoria
de un backend de Postgres.

Los motores también difieren en lo que cuesta una consulta. Postgres lee y escanea un 5–10% más barato y su
búsqueda de texto completo es la más potente. Las escrituras y checkouts de MySQL cuestan un 30% menos aproximadamente, y sus
cambios de esquema usan DDL en línea en lugar de tomar el bloqueo de la tabla. Solo Postgres sufre el Bloat de tabla,
porque solo Postgres conserva filas muertas para VACUUM. Elige según la mezcla: con muchas lecturas, Postgres;
con muchas escrituras, MySQL.

Una Réplica de lectura usa el motor de su primario, y un cambio de motor llega a todas las Bases de datos a la vez,
porque la replicación solo copia entre motores iguales. La copia tarda un minuto por GB y por Base de datos.
[Capa de datos](/design/07-data-tier#variants) contiene los números.

### Topología

Una segunda Base de datos no es un seguidor. Encierra en una caja las Bases de datos que guardan un mismo conjunto de datos: la caja
forma un **Grupo de datos**, y su topología dice cómo esas Bases de datos se reparten las filas del grupo. Una Base de datos
fuera de una caja funciona sola, con su propia parte de las filas.

- **Primario único** (inicio): una Base de datos acepta escrituras y las Réplicas de lectura aceptan lecturas. La tarjeta marca
  esa Base de datos como el **Primario**, y su Inspector enlaza las Réplicas de lectura que la copian y las
  otras Bases de datos de su grupo. Encierra una segunda Base de datos con ella y el grupo pasa a Con sharding.
- **Con sharding**: cada Base de datos guarda su partición de las filas del grupo. Las escrituras se reparten entre ellas, una
  lectura pregunta a la única Base de datos que guarda su clave, y una transacción que abarca dos Bases de datos cuesta hasta
  3× y puede fallar en cualquiera de las dos. Los informes y las búsquedas leen todas las Bases de datos.
- **Multi-leader**: cada Base de datos guarda todas las filas y acepta escrituras. La certificación descarta las
  escrituras en conflicto (gana el primer commit), y cada escritura cuesta 1.25× la CPU para replicarse.

Cada grupo guarda su propia parte de las filas. Un Servicio lleva una parte igual de los datos de la Empresa
al grupo donde está su almacén de datos, así que dos grupos nunca tocan las filas del otro y ninguno sufre
la penalización de base de datos compartida por culpa del otro. [Capa de datos](/design/07-data-tier#data-groups) contiene las
reglas.

Cambiar la topología mueve las filas de ese grupo: 24 horas de desarrollo y una copia a un minuto por GB, como
un resharding. Un grupo con una sola Base de datos no tiene adónde moverlas, así que su tarjeta fija la topología de inmediato;
la copia empieza con la segunda Base de datos de la caja. Primario único admite una sola Base de datos, así que la
tarjeta rechaza volver a él mientras haya otra Base de datos en la caja. [Capa
de datos](/design/07-data-tier#topologies) contiene el equilibrio.

Los enlaces llevan peticiones, no replicación. Una Base de datos no tiene puerto de salida hacia otra Base de datos ni hacia una Réplica de
lectura. Enlaza los Servidores de aplicaciones con cada Base de datos, y enlaza las lecturas con la réplica.

### Volumen

Cada lectura que no acierta en la caché de búfer y cada escritura esperan al volumen, así que sus IOPS son un límite propio. Un volumen de propósito general basta para la mayoría de los Diseños, y una Base de datos pequeña ni lo nota.

Un volumen aprovisionado responde muchas veces más operaciones por segundo, y factura además una parte del Gasto de la máquina. Importa en una Base de datos grande cuyo conjunto de trabajo supera la RAM. Ahí cada lectura va a disco, y el volumen fija cuántas responde, un límite que la CPU nunca muestra. El Inspector indica las IOPS y el Gasto del volumen que elijas. [Capa de datos](/design/07-data-tier#capacity) contiene los números.

### Shards

Con [Sharding](/research/sharding) la Base de datos se divide en shards por clave, y la tarjeta ofrece un shard y los dobles a partir de ahí. Cada shard es otra máquina y factura como tal. Las escrituras se reparten entre ellos, y el shard más ocupado marca el ritmo. Las lecturas siguen preguntando a un solo shard, así que lo que quita lecturas al primario es una [Réplica de lectura](/components/replica).

La **clave de shard** decide lo uniforme que es el reparto:

- Un hash del ID de usuario reparte las escrituras de forma uniforme.
- Un rango de IDs envía los usuarios nuevos al último shard.
- Una clave de tenant envía al tenant más grande a un solo shard.
- Una clave de región mantiene los datos cerca de sus usuarios y hace esperar a los usuarios de otras regiones.

Una transacción que toca dos shards es una transacción distribuida. Paga varias veces su latencia y puede fallar en cualquier shard que participe. Un informe o una búsqueda toca todos los shards, así que cuesta más CPU y tiempo con cada shard que añades. Cambiar el número de shards o la clave es un resharding: cuesta horas de desarrollo y luego una copia de los datos durante la cual el volumen responde menos operaciones. [Capa de datos](/design/07-data-tier#partitioning-sharding) contiene los números.

### Filas y retención

Cada escritura que responde la Base de datos añade filas, y también cada mensaje en tiempo real que guarda su Hub, así que los datos crecen con los usuarios y la partida de Almacenamiento de la factura crece con los datos. Una fila cuesta más aquí que en Almacenamiento de objetos. Una copia de seguridad, una réplica o una migración no se ralentizan al crecer la tabla; solo lo hacen la factura y las filas que tiene que leer un informe.

[Políticas de retención](/research/retention) añade una ventana a la tarjeta:

| Política            | Almacenamiento   | Un informe                                                    |
| ------------------- | ---------------- | ------------------------------------------------------------- |
| Conservar todo      | Completo         | Lee la tabla.                                                 |
| Archivar a los 30 d | Una décima parte | Espera a la restauración de las filas archivadas.             |
| Eliminar a los 30 d | Nada             | Reconstruye sus cifras desde el log de eventos, más despacio. |

Una ventana limita las filas a lo que la Empresa escribe dentro de ella, así que una Empresa antigua que archiva deja de crecer. El precio es el historial, ya que un informe sobre la ventana es lento o hay que reconstruirlo. La tarjeta indica qué política está activa, y [Capa de datos](/design/07-data-tier#data-volume) contiene el equilibrio.

### Informes

- **Informes**: una vista materializada mantiene lista la respuesta de un informe, de modo que el informe la lee en lugar de escanear la tabla. Quita a la Base de datos la mayor parte de la CPU de escaneo, y unos pocos informes responden con un resultado algo obsoleto. Necesita [Vistas materializadas](/research/precompute). Consulta [Vistas materializadas y desnormalización](/patterns/materialized-views-and-denormalization).

### Copias de seguridad

- **Copias de seguridad**: Ninguno deja una tabla perdida sin nada que restaurar. Nocturno restaura el estado de la última copia, así que las escrituras posteriores se pierden. PITR restaura al momento anterior a la pérdida. Una copia factura sobre el Gasto de la Base de datos, y una restauración espera a las filas que lee. Pulsa **Simulacro de restauración** en la tarjeta para probar una antes de necesitarla. Consulta [RPO y RTO](/patterns/rpo-and-rto).

## Cómo falla

### [Agotamiento de conexiones](/incidents/connections)

- **Señales:** La tarjeta dice "Rechazando ... consultas/s: demasiadas conexiones", y Rechazadas sube por encima de cero en el Dashboard.
- **Qué hacer ahora:** Haz clic en **Menos workers** en Tamaño del pool de los Servidores de aplicaciones, o coloca un [Pooler de conexiones](/components/pooler) entre ellos y la Base de datos. Si no, termina solo tras 40 segundos de simulación como máximo.
- **Prevenir:** Investiga [Pooling de conexiones](/research/pooling) y coloca el Pooler, o cambia el motor a MySQL.

### [Consulta lenta](/incidents/slow-query)

- **Señales:** La tarjeta avisa "Una consulta nueva no tiene índice. Cada lectura escanea la tabla." y su CPU sube con el tamaño de sus datos.
- **Qué hacer ahora:** Haz clic en **Añadir índice** en la tarjeta. Necesita [Análisis de consultas](/research/query-analysis), y pone una tarea Añadir índice al principio del backlog. El incidente termina cuando el Equipo acaba la tarea. Sin Análisis de consultas, la tarjeta no tiene botón y el incidente sigue su reloj.
- **Prevenir:** Investiga [Análisis de consultas](/research/query-analysis) y pon una [Caché](/components/cache) delante, para que la mayoría de las lecturas nunca lleguen a la tabla.

### [Disco lleno](/incidents/disk-full)

- **Señales:** La tarjeta dice "El disco está lleno. Las escrituras fallan." y se rechazan todas las escrituras.
- **Qué hacer ahora:** Haz clic en **Ampliar el volumen** en la tarjeta. Cuesta lo que costaría un reemplazo.
- **Prevenir:** Investiga [Alertas](/research/alerting) para que salte una alerta de disco antes de que se llene, y fija una [ventana de retención](/research/retention) para que las filas dejen de acumularse.

### [El informe tumba la Base de datos](/incidents/report-db)

- **Señales:** La tarjeta dice "Un informe está escaneando todas las tablas." y todos los tipos de petición en la Base de datos se ralentizan.
- **Qué hacer ahora:** Haz clic en **Cancelar informe** en la tarjeta.
- **Prevenir:** Enlaza un [Almacén de datos](/components/warehouse), que quita los escaneos del primario. [Almacenamiento de datos](/research/data-warehouse) lo desbloquea.

### [Tormenta de reintentos](/incidents/retry-storm)

- **Señales:** La carga en la Base de datos sigue subiendo después de que termine la ralentización de 20 segundos que la inició, y los errores aguas arriba se extienden a otros servicios.
- **Qué hacer ahora:** En cada Servidor de aplicaciones que llame a la Base de datos, pon la llamada en **Backoff** o abre su **Circuit breaker** en Llamadas, y activa **Descartar lo menos valioso**. Cada uno necesita su Investigación. Sin ellas nada lo acelera: termina cuando se vacía el backlog.
- **Prevenir:** Investiga [Backoff con jitter](/research/backoff-jitter), [Circuit breakers](/research/circuit-breakers) y [Descarte de carga por prioridad](/research/load-shedding).

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la Base de datos se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a ella quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío. Un Nodo con **Standby** hace failover por sí solo, o al instante cuando pulsas **Hacer failover**.
- **Prevenir:** Activa **Standby** en la sección Zona, que necesita [Múltiples zonas](/research/multi-az). El standby toma el relevo por sí solo.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, la Base de datos con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner o en la tarjeta del Nodo. Necesita [Múltiples zonas](/research/multi-az) y promueve al instante el **Standby** del Nodo; después el Nodo se queda sin standby hasta que le des uno. Un Nodo sin standby permanece caído hasta que termina el incidente, como máximo 120 segundos de simulación, y uno con standby también hace failover por sí solo pasada una parte de ese tiempo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az), activa **Standby** en la sección Zona y mantén una copia en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y la Base de datos que hay en ella cae.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios. La Base de datos está atada a su región, así que una segunda región necesita su propia Base de datos o un almacén que se reparta entre regiones, como [SQL distribuido](/components/dsql).

### [Shard caliente del tenant grande](/incidents/hot-shard)

- **Señales:** Un shard se pone rojo mientras los demás están ociosos, y todos los tipos de petición en la Base de datos se ralentizan.
- **Qué hacer ahora:** Pon una [Caché](/components/cache) delante de la Base de datos para que las lecturas del tenant no lleguen al shard. Si no, termina solo tras 90 segundos de simulación como máximo.
- **Prevenir:** Investiga [Sharding](/research/sharding) y elige una clave de shard distinta de **Por tenant**, y mantén una Caché delante.

### [Bloqueo de migración de esquema](/incidents/migration-lock)

- **Señales:** Aparece el banner **Bloqueo de migración de esquema**, y las escrituras se encolan y fallan como `timeout`.
- **Qué hacer ahora:** Haz clic en **Cancelar migración** en el banner.
- **Prevenir:** Investiga [Migraciones de esquema en línea](/research/online-migrations).

### [Borrado accidental](/incidents/accidental-delete)

- **Señales:** Aparece el banner **Borrado accidental**, y las lecturas y escrituras fallan como `refused` hasta que la tabla vuelve.
- **Qué hacer ahora:** Haz clic en **Restaurar** en el banner. Una buena copia de seguridad restaura la tabla tras un retraso que crece con las filas que lee. Sin copia de seguridad, o con una rota, la restauración termina el incidente al instante pero se va el 10% de los Usuarios.
- **Prevenir:** Investiga [Recuperación a un punto en el tiempo](/research/pitr) y activa las copias de seguridad, y luego [Simulacros de restauración](/research/restore-drills) para que una copia se pruebe antes de necesitarla.

### [Bloat de tabla](/incidents/table-bloat)

- **Señales:** Las lecturas y escrituras en una Base de datos PostgreSQL cuestan 2× la CPU, y su tarjeta va al rojo.
- **Qué hacer ahora:** Nada lo termina antes. Sigue su curso, 120 segundos de simulación como máximo.
- **Prevenir:** Investiga [Políticas de retención](/research/retention) y fija la Retención en **Archivar a los 30 d** o **Eliminar a los 30 d**, o cambia el motor a MySQL, que no tiene filas muertas que limpiar.

### [Error tipográfico del operador](/incidents/operator-typo)

- **Señales:** Todos los Nodos de Base de datos de una región caen a la vez.
- **Qué hacer ahora:** Coloca una Base de datos nueva en esa región y enlázala. El incidente termina cuando un Nodo de ese Componente vuelve a estar activo.
- **Prevenir:** Investiga [Infraestructura como código](/research/infra-as-code), para que un plan muestre lo que quita un cambio antes de ejecutarlo.

## Consejos

- Pon una [Caché](/components/cache) delante para quitarle las lecturas repetidas, y [Réplicas de lectura](/components/replica) al lado para quitarle otras lecturas y los informes. Un cambio de tamaño reinicia la Base de datos, y la réplica no.
- Usa una instancia de Memoria cuando el conjunto de trabajo supere la RAM, o aprovisiona el volumen cuando las lecturas vayan a disco.
- Aplica sharding cuando la Base de datos se quede sin CPU en las escrituras. Cada shard es otro primario y cuesta como uno.
- Investiga [Recuperación a un punto en el tiempo](/research/pitr) para activar las copias de seguridad, y [Simulacros de restauración](/research/restore-drills) para que una copia se pruebe antes de necesitarla.
