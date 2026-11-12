---
title: Ley de Little
summary: El número de peticiones dentro de un sistema es igual a la tasa de llegada por el tiempo que cada una pasa allí, lo que dimensiona cada pool, cola y límite de conexiones.
section: patterns
group: Foundations
order: 14
aliases: little's law, littles law, concurrency, in flight, pool sizing, queueing, l = lambda w, ley de Little, concurrencia, en vuelo, dimensionar pools, teoría de colas
---

La ley de Little dice que en un sistema estable el número medio de elementos dentro, L, es igual a la tasa media de llegada, λ, por el tiempo medio que se queda cada elemento, W. John Little la demostró en 1961, y vale para cualquier patrón de llegada y cualquier orden de servicio.

Un servidor web recibe 200 peticiones por segundo, y cada una tarda 250 ms. L = 200 × 0.25 = 50, así que hay unas 50 peticiones en vuelo en cada momento. Un pool de workers de 40 no puede retenerlas, así que las 10 de más esperan en una cola o son rechazadas. Un pool de 64 las retiene con margen para ráfagas.

La misma aritmética dimensiona un pool de conexiones de base de datos. 500 consultas por segundo, cada una reteniendo una conexión 20 ms, necesitan 500 × 0.02 = 10 conexiones de media. Muchos equipos fijan el pool en 100 y se preguntan por qué la base de datos está sobrecargada, cuando 10 conexiones habrían hecho el trabajo.

## Qué cambia en un diseño

La ley muestra cómo una dependencia lenta se convierte en una caída. Si la base de datos pasa de 20 ms a 2 s, las mismas 500 peticiones por segundo necesitan ahora 500 × 2 = 1,000 conexiones. El pool se llena, los llamadores hacen cola, la cola retiene sus hilos, y el nivel web está lleno en segundos, aunque nada allí se haya vuelto más lento. La concurrencia creció 100 veces porque lo hizo W.

De ahí salen tres decisiones. Primera, dimensiona los pools a partir de λ × W con margen, no por costumbre. Segunda, acota W con [tiempos de espera](/patterns/timeouts), porque una llamada que espera 30 s multiplica los slots que retiene durante 30 s. Tercera, da a cada dependencia sus propios slots ([Bulkhead](/patterns/bulkhead)) para que una dependencia lenta no pueda quedarse con todos.

La ley también funciona al revés. Si ves 120 peticiones en vuelo a 400 peticiones por segundo, la petición media tarda 0.3 s, y no tuviste que medirlo.

La ley solo promete medias, así que vigila la cola por separado ([Latencia de cola](/patterns/tail-latency)).

## En Quorum

Un Servidor de aplicaciones que retiene un worker o un hilo por petición tiene un número fijo de slots, y cada petición conserva su slot durante su tiempo de CPU más cada llamada a la base de datos que espera. Cuando la Base de datos se ralentiza, los slots se llenan primero. La entrada del glosario de la [ley de Little](/glossary/littles-law) da la versión del juego, el [pool de conexiones](/glossary/connection-pooling) y el [pool de hilos](/glossary/thread-pool) describen los límites, y [Capacidad, utilización y colas](/explanation/queues) muestra la cola que se forma cuando se agotan los slots.
