---
title: Latencia de cola
summary: El pequeño porcentaje de peticiones más lentas determina cómo se siente un servicio, y una petición que se abre en abanico a muchos servidores se topa con esa cola casi siempre.
section: patterns
group: Foundations
order: 15
aliases: tail latency, p99, p999, tail at scale, fan-out, stragglers, hedging, long tail, latencia de cola, cola larga, rezagados
---

La latencia de cola es la latencia de tus peticiones más lentas, normalmente el p99 o el p99.9, y decide cómo se siente un servicio porque los usuarios que la sufren la recuerdan.

Una pausa de GC añade 150 ms al 2% de las peticiones de un servicio que normalmente responde en 40 ms. La media sube a 43 ms, lo que parece ruido. El p99 es ahora de unos 190 ms, casi cinco veces los 40 habituales, un cambio que la media ocultó.

El fan-out lo empeora. El artículo "The Tail at Scale" de Jeff Dean y Luiz Barroso da el caso: cada servidor responde en 10 ms pero tarda un segundo entero el 1% de las veces. Una petición atendida por un servidor es lenta 1 vez de cada 100. Una petición que debe reunir respuestas de 100 servidores así es lenta si lo es cualquiera de ellos, lo que ocurre en 1 − 0.99^100, cerca del 63% de las peticiones. La lentitud es rara en cada servidor y común para el usuario.

La solución que cuenta el artículo es una petición especulativa (hedged request). Envía la petición a una réplica, y si no ha respondido al llegar al percentil 95 de la latencia normal, envía una copia a otra y quédate con la que responda primero. En un benchmark de Google que leía 1,000 claves de 100 servidores, especular tras 10 ms redujo el percentil 99.9 de 1,800 ms a 74 ms con un 2% más de peticiones.

## Qué cambia en un diseño

Mide percentiles, nunca solo la media ([Percentiles, no promedios](/patterns/percentiles-not-averages)). Fija los SLO sobre el p99, y vigila el p99 por ruta, porque una página rápida y una exportación lenta no comparten nada.

Reduce el fan-out. Una página que llama a 30 servicios en paralelo hereda la cola del peor de ellos, así que menos llamadas valen más que llamadas más rápidas. Donde no puedas, especula en las lecturas que son seguras de repetir ([Peticiones hedged](/patterns/hedged-requests)), limita cada llamada con un [tiempo de espera](/patterns/timeouts) y descarta las llamadas opcionales que lleguen tarde.

Elimina las causas donde puedas: pausas de GC, cachés frías, vecinos ruidosos y colas que funcionan casi llenas. Las colas son una causa común, así que mantén baja la utilización ([Latencia frente a throughput](/patterns/latency-vs-throughput)).

## En Quorum

Una petición recoge los eventos de cola de cada Nodo de su ruta, así que una cadena larga tiene un p99 peor que cualquier Nodo de ella. La Investigación [Percentiles](/research/percentiles) cambia la media del HUD por el p99, y [Peticiones especulativas](/research/hedged-requests) desbloquea la solución. El Incidente [Tormenta de pausas de GC](/incidents/gc-storm) muestra un evento de cola, [Lee el p99](/guides/read-p99) recorre el Cuadro de mando, y el glosario define [tail at scale](/glossary/tail-at-scale) y [percentiles](/glossary/percentile-p50-p95-p99).
