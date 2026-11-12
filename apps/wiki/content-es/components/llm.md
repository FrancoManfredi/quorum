La API de LLM es un modelo alojado: las GPU de otro detrás de una API.

## Cuándo colocarla

- Colócala cuando lances tu primera Funcionalidad de IA. No exige trabajo de operaciones y no cuesta nada mientras el tráfico es bajo. Se desbloquea con [Modelos alojados](/research/hosted-models).
- Sáltatela para una carga estable cuando la factura de tokens crezca mucho. Compara la factura con el Gasto de un Nodo GPU ocupado antes de cambiar. La API de LLM sigue siendo más barata que un Nodo GPU que funciona casi siempre ocioso.
- Auméntala de tamaño antes del pico cuando un [Pico de tráfico](/incidents/spike) pueda llevarte por encima de su límite.

## Cómo funciona

Factura cada token que sirve, y es un Componente gestionado, así que colocarla no cuesta nada y sirve a todas las regiones. Las llamadas de inferencia llegan desde tus Servidores de aplicaciones y ningún Componente queda aguas abajo de ella. Cada prompt espera un tiempo fijo hasta el primer token, más que en un [Nodo GPU](/components/gpu). Consulta [inferencia de modelo](/glossary/model-inference).

Tiene límite de tasa. Cada escalón de tamaño es un nivel de uso que duplica cuántos prompts por segundo admite, y por encima del límite los prompts fallan al instante como `throttled`. Consulta [limitación de tasa](/glossary/rate-limiting).

## Cómo falla

- Por encima de su nivel, los prompts fallan como `throttled`.
- Su coste crece con cada prompt. Vigila los costes de terceros en el Ledger.
- Cada prompt espera al primer token, así que el p99 de los prompts de IA se mantiene alto.

También te protege. Durante una [Escasez de GPU](/incidents/gpu-shortage), un Servidor de aplicaciones enlazado tanto con un Nodo GPU como con la API de LLM sigue sirviendo prompts.

### [Fallo de instancia](/incidents/instance)

- **Señales:** La tarjeta de la API de LLM se pone gris y su aviso dice "El host bajo esta VM murió. Sigue facturando." Las peticiones enviadas a ella quedan atascadas.
- **Qué hacer ahora:** Selecciona el Nodo y haz clic en **Reemplazar**. Cuesta Caja y vuelve en frío.
- **Prevenir:** Ejecuta un segundo Nodo de API de LLM, para que los prompts tengan otro sitio adonde ir.

## Consejos

- Mantén una API de LLM enlazada como respaldo incluso después de colocar Nodos GPU.
