Analítica registra lo que hicieron tus peticiones, como un colector de OpenTelemetry con un backend de trazas.

## Cuándo colocarlo

- Colócala cuando el Conocimiento de un tipo de petición crezca despacio, o cuando un Componente nuevo lleve tráfico que aún no has muestreado. Enlaza ese Nodo con ella.
- Auméntala de tamaño cuando su tarjeta la muestre al máximo de rendimiento.

El tablero del Garaje empieza con un Nodo de Analítica enlazado al Servidor de aplicaciones.

## Cómo funciona

Analítica es una derivación. Enlaza cualquier Nodo con ella y recibirá una copia del tráfico de ese Nodo, no una parte. Muestrea la copia con la tasa de muestreo que fijes, y cada muestra aporta Conocimiento al pool de su tipo de petición. Una petición que falla o frustra a su usuario aporta además Conocimiento de fallos, que enseña más que una sana.

El Conocimiento crece con la raíz cuadrada de las muestras, contadas por tipo de Componente y por tipo de petición. Por eso derivar muchos Componentes distintos enseña más que derivar uno solo, aunque sea grande. [Conocimiento y observabilidad](/explanation/observability) explica el modelo completo.

Analítica conserva un número limitado de muestras por segundo, y cada escalón de tamaño lo duplica. Pasado ese límite, descarta muestras de forma uniforme.

## Opciones

::Options{id="analytics"}

- **Tasa de muestreo**: qué parte de la copia derivada muestrea. Una tasa más alta aporta más Conocimiento y un desglose más fino por tipos, y cuesta CPU y latencia en cada Nodo derivado, además de Gasto de almacenamiento. Con una tasa más baja se te escapa más, y el tráfico que ninguna derivación ve aparece como sin clasificar.

## Cómo falla

Analítica nunca rompe una petición y ningún incidente la tiene como objetivo. Sí tiene costes:

- Sobrecargada, descarta muestras y el Conocimiento se ralentiza.
- Una tasa de muestreo alta añade CPU y latencia a cada Nodo derivado.
- Sin Analítica no obtienes Conocimiento del tráfico y la Investigación se estanca.
- El tráfico que no llega a ninguna derivación queda sin clasificar: el Diseño lo atiende, no aporta nada y no puedes ver qué es. La tarjeta de Analítica y la pantalla de Investigación muestran esa proporción, y una derivación en la ruta la corrige.

:::Note{tone="real"}
Los sistemas de trazado reales también muestrean. Conservar todas las trazas es caro, y una muestra pequeña ya enseña los caminos habituales. Consulta [trazabilidad distribuida](/glossary/distributed-tracing) y [observabilidad](/glossary/observability).
:::

## Consejos

- Deriva un Nodo de cada tipo de Componente antes de subir la tasa de muestreo.
- Baja la tasa de muestreo en los Servidores de aplicaciones más cargados si te importa más el p99 que el Conocimiento.
