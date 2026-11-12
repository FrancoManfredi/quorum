El Índice vectorial representa a pgvector, Pinecone y Qdrant: el lugar donde viven los embeddings de una empresa para que un prompt pueda recuperarlos.

## Cuándo colocarlo

- Colócalo cuando `ai` dé más ingresos de los que cuesta servirlo y el bucle sea una funcionalidad de producto y no una demo: búsqueda sobre tus propios documentos, un asistente de soporte, un recomendador. Se desbloquea con [Embeddings](/research/embeddings) en la Serie B, por 16,000 ◇.
- Pasa de Exacto a HNSW cuando el límite sean las búsquedas, no los vectores.

## Cómo funciona

Responde búsquedas de vecino más cercano, `q-vector`, a **500 por segundo** en su primer tamaño y el doble en cada uno de sus seis tamaños. Cada búsqueda tarda veinte milisegundos, y el índice en el que busca vive en memoria.

Un prompt que llega a un índice recupera de él. Enlaza con el Índice vectorial el Servidor de aplicaciones o la [Función serverless](/components/fn) que responde `ai`, y cada prompt paga una búsqueda por los documentos que cita. Esas respuestas aportan **un 35% más**, porque usan los datos propios de la empresa en lugar de solo los del modelo. Un índice aproximado se lleva la parte de esa mejora que corresponde a su recall, así que HNSW aporta algo menos por prompt que Exacto y responde el doble.

También desbloquea la bonificación del ecosistema de ML de Python, como describe la página de [Runtimes](/runtimes). El `+20%` de un Stack de Python en `ai` necesita un índice en la ruta, porque un modelo pequeño en proceso solo merece la pena cuando tiene algo que incrustar y algo que citar.

Una búsqueda de texto no llega a él. El Motor de búsqueda responde `q-search`, y la recuperación de un prompt es su propia búsqueda `q-vector`, así que un Diseño con ambos mantiene separadas la búsqueda por palabras clave y la búsqueda por significado.

## Opciones

::Options{id="vec"}

- **Índice**: Exacto compara la consulta con cada vector, así que el recall es perfecto y una colección grande lo ralentiza. HNSW recorre un grafo en su lugar, responde más consultas, mantiene el índice en memoria con un Gasto mayor y renuncia a algo de recall: de vez en cuando una búsqueda cita el documento equivocado, lo que hace fallar una búsqueda que lo necesitaba. Consulta [Búsqueda vectorial y embeddings](/patterns/vector-search-and-embeddings).

## Cómo falla

- **Recall.** Un índice aproximado se deja de vez en cuando un vecino verdadero. Una búsqueda que necesitaba ese documento vuelve obsoleta, y un prompt que lo citaba aporta menos.
- **Memoria.** El índice es residente, así que su tamaño decide cuántos vectores caben y su tipo decide cuánto de la máquina ocupan. HNSW factura el doble de Gasto por los mismos vectores.
- **La búsqueda no es gratis.** Cada prompt espera su búsqueda antes de que empiece el modelo. Veinte milisegundos es barato al lado del primer token de un modelo, y sigue siendo latencia.
- **Un prompt sin índice.** Quita el enlace y el prompt se responde solo con el modelo: sin mejora, sin bonificación de Python y sin nada propio de la empresa en la respuesta.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Índice vectorial se pone gris, su Inspector dice "El host bajo esta VM murió. Sigue facturando.", y las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Pulsa **Reemplazar** en su Inspector y paga el precio. Vuelve en frío.
- **Prevenir:** Ejecuta una segunda copia: [Balanceo de carga](/research/load-balancing) pone las copias detrás de un Balanceador de carga, y las [Comprobaciones de estado](/research/health-checks) se saltan el host caído.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y luego pon copias en zonas distintas con el ajuste Zona.

### [Caída de región](/incidents/region)

- **Señales:** Todos los Nodos de una región se ponen grises a la vez, y el tablero de esa región se pone gris con ellos.
- **Qué hacer ahora:** Nada lo acelera. **Hacer failover** mueve solo Nodos que no guardan datos, así que este sigue caído hasta que termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error. Un almacén repartido entre regiones no necesita nada de ti.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region) y [GeoDNS](/research/geo-dns), y luego ejecuta una copia en una segunda región.

## Consejos

- Enlaza con él todos los Servidores de aplicaciones y [Funciones serverless](/components/fn) que respondan `ai`. Un Worker ejecuta tareas, no prompts, así que no recupera del índice.
- Empieza con Exacto: es el índice honesto para una colección pequeña, y cuesta la mitad de memoria.
- Combínalo con una [Caché](/components/cache): el mismo prompt preguntado dos veces recupera los mismos documentos dos veces.
