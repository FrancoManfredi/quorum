Una Caché responde desde memoria las lecturas repetidas para que la [Base de datos](/components/database) no tenga que hacerlo, como Redis, un almacén en memoria.

## Cuándo colocarla

- Colócala cuando dominen las lecturas y la CPU de la Base de datos esté alta. El Sandbox [Lectura mayoritaria](/sandboxes/read-mostly) muestra el síntoma.
- Colócala antes de una [Réplica de lectura](/components/replica) cuando se lean una y otra vez las mismas filas calientes: es la más barata de las tres. Cuando los datos calientes superen su memoria, o las lecturas se repartan entre muchas filas, añade una réplica.
- Auméntala de tamaño cuando la tasa de aciertos caiga al crecer los usuarios.
- Cambia a Memcached cuando el límite sea el hilo único de Redis.

## Cómo funciona

Ponla delante de la Base de datos o del [Pooler de conexiones](/components/pooler). Sirve ella misma una parte de las consultas de lectura, su tasa de aciertos, y pasa los fallos. Las escrituras la atraviesan e invalidan los datos cacheados, así que una mezcla con muchas escrituras hace bajar la tasa de aciertos.

La tasa de aciertos sube con la memoria en relación con tus datos calientes, y tus datos calientes crecen con los usuarios. Un TTL más largo también sube la tasa, a costa de más lecturas obsoletas. Una Caché nueva o reiniciada arranca en frío y se llena a medida que llegan lecturas. Consulta [tasa de aciertos de caché](/glossary/cache-hit-rate) y [cache-aside](/glossary/cache-aside).

## Opciones

::Options{id="cache"}

### Estrategia

[Estrategias de caché](/research/cache-strategies) añade las tres estrategias que una Caché puede ejecutar además de cache-aside:

- **Cache-aside** (la predeterminada): las lecturas salen de la Caché y las escrituras la rodean. Una escritura puede competir con un fallo concurrente, así que la Caché puede conservar una fila vieja hasta que venza su TTL.
- **Read-through**: la Caché carga ella misma un fallo, lo que cierra casi toda esa carrera. La mayor parte de la obsolescencia propia del TTL sigue ahí.
- **Write-through**: cada escritura va a la Caché y a la Base de datos a la vez. Nada detrás de la Caché queda obsoleto, y cada escritura espera una escritura más en la caché.
- **Write-behind**: la escritura vuelve desde la Caché y llega tarde a la Base de datos, así que las escrituras son rápidas y la Base de datos recibe menos carga de escritura. Un fallo lee una Base de datos que va con retraso, y una caída de la Caché pierde lo que aún no se ha volcado.

El Inspector muestra por qué camino viaja una escritura. [Capa de datos](/design/07-data-tier#strategies-a-tradeoff-card) contiene la tabla.

### Opciones contra la estampida

[Protección contra estampidas](/research/stampede-protection) añade tres interruptores. Los tres responden al momento en que una clave popular caduca y todas las peticiones fallan a la vez.

- **Coalescer**: una petición recarga la clave mientras las demás esperan. La Base de datos ve un fallo en lugar de toda la oleada.
- **Refrescar antes**: refresca una clave un poco antes de que caduque, así que un TTL corto conserva más aciertos y la Base de datos recibe unas pocas lecturas extra.
- **Obsoleto mientras se revalida**: responde con el valor antiguo mientras una petición lo refresca, de modo que una clave caducada nunca falla, y esas respuestas cuentan como obsoletas.

Consulta [Protección contra estampidas de caché](/patterns/cache-stampede-protection).

### Motor y TTL

- **Motor**: Redis funciona con un hilo principal y recarga parte de sus datos tras un reinicio. Memcached usa todos los núcleos y vuelve vacío.
- **TTL**: cuánto tiempo permanece un valor. Un TTL más largo conserva más aciertos y sirve datos más obsoletos.
- **Calentamiento**: con [Precalentamiento de caché](/research/cache-warming), el Arranque en caliente llena la Caché antes de que reciba tráfico, para que un reinicio no empiece en frío. Consulta [Calentamiento de caché y caché en niveles](/patterns/cache-warming-and-tiered-caching).
- **Claves calientes**: con [Fan-out híbrido](/research/hybrid-fanout), Dividir pone una clave caliente en su propio shard, de modo que una sola clave deja de marcar el ritmo. Consulta [Claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards).

## Cómo falla

- Un TTL largo sirve datos obsoletos, lo que hace fallar las lecturas que necesitan datos frescos.
- Cuando los datos calientes no caben en su memoria, cada recarga expulsa una clave más antigua: la tarjeta y la fila de Caché del Dashboard muestran las expulsiones por segundo, y la tasa de aciertos cae con ellas. Una Caché más grande acoge los datos y las detiene.
- Una Caché no reduce las conexiones: deja pasar las conexiones de quienes la llaman.

### [Estampida de caché](/incidents/stampede)

- **Señales:** La Tasa de aciertos de la tarjeta cae hacia cero, y la Base de datos que tiene detrás se pone ámbar y luego roja. Mientras la Base de datos siga sobrecargada, las recargas agotan su tiempo de espera y la Caché sigue fría.
- **Qué hacer ahora:** Quita carga a la Base de datos: activa **Coalescer** en la tarjeta de la Caché, activa **Descartar lo menos valioso** en los Servidores de aplicaciones, o aumenta el tamaño de la Base de datos. Coalescer necesita [Protección contra estampidas](/research/stampede-protection), y Descartar lo menos valioso necesita [Descarte de carga por prioridad](/research/load-shedding).
- **Prevenir:** Investiga [Protección contra estampidas](/research/stampede-protection) y [Precalentamiento de caché](/research/cache-warming), y luego activa **Coalescer** y **Arranque en caliente**.

### [Clave caliente](/incidents/hot-key)

- **Señales:** Una Caché se pone roja mientras las demás están ociosas, porque una clave se lleva una gran parte de las lecturas.
- **Qué hacer ahora:** Pon Claves calientes en la tarjeta de la Caché en **Dividir**. Necesita [Fan-out híbrido](/research/hybrid-fanout).
- **Prevenir:** Investiga [Fan-out híbrido](/research/hybrid-fanout) y deja **Dividir** activado.

### [Lecturas obsoletas](/incidents/stale-read)

- **Señales:** Aparecen errores `stale` en las lecturas de la API y en los checkouts, y las respuestas de la Caché son más antiguas que las escrituras que tiene detrás.
- **Qué hacer ahora:** Acorta el TTL en la tarjeta de la Caché.
- **Prevenir:** Mantén un TTL corto en datos con muchas escrituras, cambia la estrategia a **Write-through** tras [Estrategias de caché](/research/cache-strategies), o activa el enrutado read-your-writes ([Enrutado read-your-writes](/research/ryw-routing)).

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la Caché se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a ella quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío. Un Nodo con **Standby** hace failover por sí solo, o al instante cuando pulsas **Hacer failover**.
- **Prevenir:** Activa **Standby** en la sección Zona, que necesita [Múltiples zonas](/research/multi-az), o ejecuta una segunda Caché.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, la Caché con ellos.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner o en la tarjeta del Nodo. Necesita [Múltiples zonas](/research/multi-az) y promueve al instante el **Standby** del Nodo; después el Nodo se queda sin standby hasta que le des uno. Un Nodo sin standby permanece caído hasta que termina el incidente, como máximo 120 segundos de simulación, y uno con standby también hace failover por sí solo pasada una parte de ese tiempo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az), activa **Standby** en la sección Zona y mantén una copia en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y la Caché que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

::Sandbox{id="stampede"}

## Consejos

- Activa la coalescencia en cuanto tengas Protección contra estampidas.
- Usa Memcached cuando el límite sea un único hilo de Redis.
