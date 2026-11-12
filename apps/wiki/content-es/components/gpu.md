El Nodo GPU sirve inferencia en GPU alquiladas, como hace un servidor de modelos tipo vLLM sobre GPU de NVIDIA.

## Cuándo colocarlo

- Colócalo cuando los prompts de IA sean una parte grande de tu tráfico y la factura de la [API de LLM](/components/llm) sea una partida grande en el Ledger. Se desbloquea con [Servicio de modelos](/research/model-serving).
- Sáltatelo cuando la carga esté ociosa o a picos. Un Nodo GPU factura cada segundo que funciona, esté ocupado o no, y es más barato por token que la API de LLM solo mientras se mantiene ocupado.
- Ajusta su tamaño a tu carga de IA estable, y deja los picos a la API de LLM.

## Cómo funciona

Su capacidad se mide en tokens por segundo, y cada prompt de IA usa un número fijo de tokens. Cada escalón de tamaño duplica las GPU, y con ellas su capacidad y su Gasto. Las llamadas de inferencia llegan desde tus Servidores de aplicaciones y no pasa nada a otro Nodo. Consulta [inferencia de modelo](/glossary/model-inference).

Un Nodo GPU nuevo o reiniciado arranca en frío: carga su modelo y sirve a una fracción de su capacidad hasta que se calienta.

## Opciones

::Options{id="gpu"}

- **GPU**: T4 es barata y lenta. A100 es equilibrada. H100 es la más barata por token y la más difícil de conseguir. Cambiar el tipo reinicia el Nodo.
- **Modelo**: un modelo más grande aporta más por prompt y sirve menos. Los pesos, la precisión y la caché de atención del lote deben caber en la memoria de las GPU. Si no caben, el Nodo se mata al cargar y todos los prompts fallan como `oom`. Una precisión menor, un modelo más pequeño, un lote más pequeño o una GPU más grande lo hacen caber. Cambiar el modelo recarga los pesos.
- **Precisión**: una precisión menor sirve más rápido, usa menos memoria y vale menos por respuesta. Necesita [Cuantización](/research/quantization).
- **Lote**: un lote más grande sirve más prompts y aumenta el tiempo hasta el primer token. El [Batching continuo](/research/continuous-batching) mantiene el rendimiento y elimina la latencia añadida. Consulta [Un LLM detrás de un gateway en GPU](/patterns/llm-behind-a-gateway-on-gpus).

## Cómo falla

- Sobrecargado, descarta prompts. Los prompts de IA son un tipo de alto valor, así que esto cuesta ingresos rápido.
- Ocioso, quema dinero.

### [Escasez de GPU](/incidents/gpu-shortage)

- **Señales:** Un Nodo GPU se pone gris, y los prompts enviados a él fallan. No se puede conseguir una H100 hasta que termine.
- **Qué hacer ahora:** Enlaza una [API de LLM](/components/llm) desde el Servidor de aplicaciones para que los prompts tengan adónde ir, o coloca un Nodo GPU de un tipo más pequeño. Nada devuelve antes el Nodo reclamado: vuelve tras 120 segundos de simulación como máximo.
- **Prevenir:** Investiga [Modelos alojados](/research/hosted-models) y mantén enlazada una API de LLM. Evita H100 cuando no puedas permitirte una escasez.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta del Nodo GPU se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a él quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Nodo GPU y mantén enlazada una [API de LLM](/components/llm) para que los prompts tengan adónde ir. El Nodo vuelve en frío.

### [Caída de zona](/incidents/zone)

- **Señales:** Todos los Nodos de una zona se ponen grises a la vez, el Nodo GPU con ellos.
- **Qué hacer ahora:** Nada devuelve la zona antes. **Hacer failover** promueve un **Standby**, y este Componente no tiene ninguno, así que termina por sí solo tras 120 s como máximo.
- **Prevenir:** Investiga [Múltiples zonas](/research/multi-az) y mantén una copia del Componente en una segunda zona.

### [Caída de región](/incidents/region)

- **Señales:** El tablero de una región se pone gris y el Nodo GPU que hay en ella cae.
- **Qué hacer ahora:** Pulsa **Hacer failover** en el banner. Necesita [Múltiples zonas](/research/multi-az) y una segunda región abierta, y vuelve a arrancar el Nodo en la región más cercana, en frío, por el precio de un reemplazo. Si no, vuelve cuando termina el incidente: 180 segundos de simulación en el catálogo, 60 una vez que cuenta el presupuesto de error.
- **Prevenir:** Investiga [Múltiples regiones](/research/multi-region), mantén una copia en una segunda región y añade [GeoDNS](/research/geo-dns) para enviar allí a los usuarios.

## Consejos

- Ejecuta un Nodo GPU para la carga estable y la API de LLM para los picos.
- Evita H100 cuando no puedas permitirte una escasez.
