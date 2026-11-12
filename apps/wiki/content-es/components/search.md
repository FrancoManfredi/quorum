El Motor de búsqueda representa a Elasticsearch: un índice separado construido para la búsqueda de texto completo.

## Cuándo colocarlo

- Colócalo cuando las búsquedas carguen la Base de datos: su CPU sube a medida que crece la parte de Búsqueda en la mezcla, y todas las demás consultas se ralentizan con ella. Se desbloquea con [Búsqueda de texto completo](/research/full-text-search).
- Auméntalo de tamaño cuando su tarjeta lo muestre cerca de su límite.
- Añade un standby cuando tengas [Múltiples zonas](/research/multi-az).

## Cómo funciona

Responde cada consulta de búsqueda en un tiempo fijo, a un número fijo por segundo en cada escalón de tamaño, y las Funcionalidades que hacen las búsquedas más pesadas reducen ese número. Solo le llegan consultas de búsqueda, y ningún Componente queda aguas abajo de él. Consulta [índice invertido](/glossary/inverted-index).

Hasta que enlazas un Motor de búsqueda, la [Base de datos](/components/database) responde las búsquedas con su búsqueda de texto completo integrada. Cuando un Servidor de aplicaciones se enlaza con ambos, las búsquedas van al Motor de búsqueda, y Postgres deja de responderlas.

## Opciones

::Options{id="search"}

- **Producto**: Elasticsearch y OpenSearch comparten perfil y admiten todas las opciones siguientes. Meilisearch es un nodo más pequeño y rápido sin shards, réplicas ni heap, y su relevancia cae a medida que crece el índice.
- **Refresco**: cuánto espera un documento nuevo antes de poder buscarse, y cuánta CPU de indexación gasta el Nodo. Un intervalo largo responde más consultas por segundo pero devuelve resultados más obsoletos. Uno corto es más fresco y responde menos. Un resultado obsoleto hace fallar una búsqueda que necesitaba el documento nuevo.
- **Shards**: paralelizan el índice pero reparten cada consulta entre todos, así que cada uno aporta menos que el anterior.
- **Réplicas**: cada una añade capacidad de consulta, una máquina y una copia del índice en un volumen.
- **Heap**: cambia pausas de recolección de basura por caché del sistema de archivos. Demasiado pequeño pausa a menudo. Demasiado grande pausa mucho y responde menos consultas.

[Capa de datos](/design/07-data-tier#search-engine) contiene los números. Consulta [Búsqueda de texto completo y el índice invertido](/patterns/full-text-search-and-inverted-index).

## Cómo falla

- Sobrecargado, descarta búsquedas. Las búsquedas fallan, pero el resto del Diseño está bien.
- Sin uno, la carga de búsqueda recae sobre el primario, y una búsqueda ocupada ralentiza los checkouts y las escrituras.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Motor de búsqueda se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las búsquedas fallan, porque la Base de datos no las recupera mientras haya un Motor de búsqueda enlazado.
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

## Consejos

- Mantén bajo el p99 de búsqueda: las consultas de búsqueda están entre los tipos de mayor valor.
- Dale un standby cuando tengas Múltiples zonas.

:::Note{tone="real"}
Los equipos reales alimentan un índice de búsqueda desde la base de datos con escrituras dobles o captura de cambios de datos, y los resultados van un poco por detrás. Consulta [CDC](/glossary/cdc-change-data-capture).
:::
