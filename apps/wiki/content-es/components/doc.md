El Almacén de documentos guarda documentos en lugar de filas, como hacen MongoDB, Firestore y DynamoDB.

## Cuándo colocarlo

- Colócalo cuando el esquema cambie sin parar y las funcionalidades salgan despacio por ello. Una Funcionalidad que cambia la forma de los datos es la razón para tener uno, y el backlog del Equipo lo muestra: sus horas de desarrollo bajan en cuanto el Almacén sirve.
- Colócalo cuando el trabajo sean documentos que se leen y escriben por clave: un perfil, un carrito, una página de ajustes. Se desbloquea con [Bases de datos documentales](/research/document-db) en la Serie A, por 3,500 ◇.
- Sáltatelo para informes. Un informe funciona, pero mal, así que enlaza mejor un [Almacén de datos](/components/warehouse), o deja los informes en la Base de datos, que sigue guardando el dinero.
- Deja el dinero en la [Base de datos](/components/database) y los documentos aquí.

## Cómo funciona

Cambia joins y transacciones por velocidad de desarrollo, y es la imagen especular de la [Base de datos](/components/database): más barato de cambiar, peor con las preguntas que abarcan más de un registro.

Sirve `q-read` y `q-write` sobre documentos, también responde el `q-tx` de un checkout y el `q-scan` de un informe, y no envía nada más allá. Tiene una tasa plana de **3,000 ops por segundo** en su primer tamaño, que se duplica en cada uno de sus ocho tamaños. Una lectura o una escritura es una op. Un join son tres. Por encima de su tasa, el exceso se descarta, como en cualquier Nodo de capacidad plana.

Se diferencia de una [tabla relacional](/components/database) en tres cosas:

- **Sin joins.** Una consulta que abarca varios documentos es un escaneo de la colección, a [tres veces las ops](#a-join-costs-three-ops). Un checkout que escribe varios documentos no es atómico salvo que estén activadas las transacciones multi-documento, y con ellas cada escritura espera a las demás, así que su latencia sube la mitad.
- **Sin conexiones que poolear.** Un Servidor de aplicaciones no abre ningún pool que haya que compartir mediante un [Pooler de conexiones](/components/pooler), así que un pico de Servidores de aplicaciones no puede agotarlo como se agotan las 100 conexiones de PostgreSQL. Tampoco tiene caché de búfer ni volumen de IOPS, así que no se aplica ningún límite de disco.
- **Sin esquema que migrar.** Una Funcionalidad que cambia la forma de los datos cuesta **un 25% menos de horas de desarrollo**, porque no hay migración que escribir, ejecutar ni que bloquee una tabla. Cualquier otra Funcionalidad cuesta **un 10% más**, porque sin joins cada patrón de acceso que añade es su propia colección e índice que escribir y leer. El panel de [Equipo](/team) cobra el total.

### Un join cuesta tres ops

Una Funcionalidad que añade lecturas encaja con un Almacén de documentos, que las responde a una op cada una dentro de su propia tasa plana. Lo que no puede hacer a bajo coste es preguntar a dos documentos el uno por el otro:

| Qué responde                  | Ops que cuesta | Por qué                                                                  |
| ----------------------------- | -------------- | ------------------------------------------------------------------------ |
| Una lectura de un documento   | 1              | Una búsqueda por clave, o una búsqueda por índice en una colección.      |
| Una escritura de un documento | 1              | Un documento es atómico.                                                 |
| Un checkout (`q-tx`)          | 3              | Lee el carrito, escribe el pedido y escribe el recibo, en la aplicación. |
| Un informe (`q-scan`)         | 3              | Escanea toda la colección, porque no hay join que la acote.              |

Un shard caliente del incidente [Clave caliente](/incidents/hot-key) divide su tasa, igual que divide la de un [Almacén de columnas anchas](/components/wide).

## Opciones

::Options{id="doc"}

- **Transacciones**: Multi-documento hace atómico un checkout entre documentos, y cada escritura espera a las demás, así que su latencia sube. Un documento es más rápido y no puede confirmar dos documentos juntos.

## Cómo falla

- **El join.** Un checkout repartido en documentos pierde atomicidad sin transacciones multi-documento: un reintento puede cobrar la tarjeta dos veces, y la tarjeta muestra el duplicado. Actívalas y paga la mitad más de latencia de escritura.
- **El informe.** Un `q-scan` a través de un Almacén de documentos es un escaneo de colección a tres ops. Además ocupa los slots de la Colección mientras se ejecuta.
- **Claves calientes.** La clave de un shard se lleva el tráfico, y la tasa plana del Nodo es lo primero que cede.
- **Un Almacén de documentos no es una Base de datos.** Nada hace joins, nada es transaccional por defecto y no hay recuperación a un punto en el tiempo que investigar. Un Diseño que guarda aquí su dinero pierde un cobro de vez en cuando.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Almacén de documentos se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Nodo del Componente, de modo que uno siga sirviendo mientras se reemplaza el otro.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, el Almacén de documentos con ellos.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y mantén una copia del Componente en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el Almacén de documentos que hay en ella cae.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

### [Error tipográfico del operador](/incidents/operator-typo)

- **Señales:** Todos los Nodos de Almacén de documentos de una región caen a la vez.
- **Qué hacer ahora:** Coloca un Almacén de documentos nuevo en esa región y enlázalo. El incidente termina cuando un Nodo de ese Componente vuelve a estar activo.
- **Prevenir:** Investiga [Infraestructura como código](/research/infra-as-code), para que un plan muestre lo que quita un cambio antes de ejecutarlo.

## Consejos

- Enlaza el Servidor de aplicaciones tanto con la Base de datos como con el Almacén de documentos, y cada uno se queda con los tipos que acepta.
- Pon una [Caché](/components/cache) delante. Sus aciertos nunca llegan al Almacén, y el Almacén no tiene caché de búfer, así que sus lecturas no compiten con una.
