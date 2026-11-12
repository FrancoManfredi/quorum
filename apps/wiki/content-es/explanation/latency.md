---
title: Latencia y percentiles
summary: A dónde va el tiempo de una petición, por qué la media esconde a tus usuarios más lentos y cómo calcula el juego p50, p95 y p99.
section: explanation
order: 2
aliases: latency, p99, p95, p50, percentile, tail latency, mean, fan-out, gc pause, latencia, percentil, latencia de cola, media, pausa de GC
gdd: /design/04-simulation
---

La vista del Garaje muestra la latencia media, y es el número menos útil de la pantalla. Tus usuarios no
experimentan la media. Experimentan su propia petición, y unos pocos esperan mucho más que el resto. Quorum
calcula la latencia de cada tipo de petición en cada camino de tu Diseño, y te paga según la espera, así que
la cola lenta cuesta ingresos reales.

## A dónde va el tiempo

La latencia de una petición es la suma de todos los saltos de su camino síncrono. Cada salto añade cuatro
partes:

- **Sobrecarga fija.** Cada Componente añade una pequeña latencia base. El primer salto, a través de internet
  desde los Usuarios hasta tu edge, es el mayor en un Diseño pequeño.
- **Tiempo de servicio.** El tiempo de CPU que necesita el trabajo, dividido por la velocidad del runtime,
  más la E/S en los Nodos de datos.
- **Espera en cola.** El tiempo que una petición espera un slot libre. Crece de golpe a medida que un Nodo se
  llena. Mira [Capacidad, utilización y colas](/explanation/queues).
- **Red.** Una llamada dentro de una zona es barata. Una llamada a otra zona cuesta más, y una llamada a otra
  región paga el viaje de ida y vuelta.

Además de esto, **eventos de cola** poco frecuentes golpean a una pequeña parte de las peticiones: una pausa
de recolección de basura, un bloqueo del event loop, un arranque en frío. Añaden mucho tiempo a unas pocas
peticiones.

Un salto asíncrono no suma a lo que espera el usuario: una petición que pasa por una [Cola](/components/queue)
espera solo el encolado, así que la puntuación de ese tipo cuenta el tiempo hasta que el resultado está listo.

## Por qué miente la media

La mayoría de las peticiones son rápidas y unas pocas son muy lentas, que es la cola clásica de un solo
servidor, donde los tiempos de respuesta siguen una curva exponencial. En esa curva el percentil 99 es
alrededor de 4.6 veces la media de la parte variable.

Así que una media de 100 ms puede esconder usuarios que esperan medio segundo. Un evento de cola que golpea
al 2% de las peticiones apenas mueve la media, porque el otro 98% no cambia. El p99 salta.

Un [percentil](/glossary/percentile-p50-p95-p99) hace una pregunta mejor: ¿qué tan lenta es la parte más
lenta de mis usuarios? El p50 es la petición típica. El p95 y el p99 son tus usuarios con mala suerte, y en
un sitio con mucho tráfico son mucha gente.

::Quiz{question="Una pausa de GC añade 150 ms a cerca del 2% de las peticiones de un Servidor de aplicaciones. ¿Qué número se mueve más?" options="La media|El p50|El p99" answer="3" explain="Solo el 2% más lento de las peticiones recibe la pausa, así que cae en el p99. El p50 no cambia, y la media sube solo un poco."}

## Qué ves y cuándo

La vista del Garaje muestra la latencia media. La investigación [Percentiles](/research/percentiles) añade el
p99 al HUD y p50, p95 y p99 a cada tipo de petición. El Libro mayor calcula percentiles desde el principio, y
las peticiones lentas te cuestan ingresos antes de que puedas verlas. La investigación solo cambia lo que
muestra la pantalla.

Un percentil sale de la distribución del modelo y no de una muestra. Las partes fijas se suman directamente,
la parte exponencial fija la curva, y los eventos de cola caen sobre la parte más lenta de las peticiones,
igual a su probabilidad. Para saber cómo actuar según el número, mira [Lee el p99](/guides/read-p99).

## Las colas de latencia se suman a lo largo de un camino

Una petición acumula los eventos de cola de todos los Nodos de su camino. Si un Nodo bloquea el 1% de las
peticiones y el siguiente bloquea otro 1%, una petición que cruza ambos tiene cerca de un 2% de probabilidad
de bloquearse, porque dos probabilidades `a` y `b` se combinan como `1 − (1 − a)(1 − b)`. Una cadena larga de
Nodos que se bloquean de vez en cuando tiene un p99 peor que cualquiera de ellos por separado.

El fan-out lo empeora. Cuando una petición hace muchas llamadas al backend y espera a todas, la llamada más
lenta decide su latencia. Un feed por pull lee muchas publicaciones por petición, así que su cola es larga.
Esto es [la cola a gran escala](/glossary/tail-at-scale) y el [fan-out](/glossary/fan-out).

:::Note{tone="real"}
Jeff Dean y Luiz Barroso describieron esto en "The Tail at Scale" (2013). Si un servidor es lento en el 1% de
las peticiones y una página llama a 100 servidores, la mayoría de las cargas de página tocan al menos un
servidor lento. Los grandes servicios combaten la cola con peticiones hedged, tiempos de espera y menos saltos
en el camino crítico.
:::

## Los runtimes dan forma a la cola de latencia

Algunos eventos de cola vienen de tu Stack:

- **Recolección de basura.** Cuando el heap de un Servidor de aplicaciones está casi lleno, su recolector
  pausa a una pequeña parte de las peticiones. La duración depende del runtime y del recolector.
- **Event loops.** En Node.js, una petición que consume mucha CPU, como un hash de contraseña al iniciar
  sesión, bloquea todas las peticiones que hay detrás de ella en ese bucle.
- **Arranques en frío.** Un Servidor de aplicaciones nuevo o reiniciado va lento hasta que se calienta, así
  que escalar horizontalmente durante un pico puede empeorar el p99 por un tiempo.

Esto se nota en el p99 mucho antes de que mueva la media. Las páginas de [Runtimes](/runtimes) enumeran el
comportamiento de cada runtime, y el glosario explica las [pausas de GC](/glossary/gc-pause), el
[event loop](/glossary/event-loop) y el [calentamiento JIT](/glossary/jit-warmup).

::Sandbox{id="gc-pauses"}

## Los tiempos de espera recortan la cola de latencia, con un precio

Un Enlace espera una respuesta hasta su tiempo de espera. Una petición que espera más falla como `timeout`.
Un tiempo de espera corto evita que un receptor lento retenga los slots de quien llama durante mucho tiempo,
pero convierte las peticiones lentas en fallidas. Mira [Errores y reintentos](/explanation/errors-and-retries)
para ver cómo funciona ese intercambio.
