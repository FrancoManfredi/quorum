---
title: Consumidores competidores
summary: Deja que varios workers lean de una misma cola, para que cada tarea vaya a exactamente uno de ellos y el throughput crezca añadiendo workers.
section: patterns
group: Messaging and async
order: 402
aliases: worker pool, parallel consumers, consumer group, prefetch, work queue, scale workers, competing consumers, pool de workers, consumidores en paralelo, grupo de consumidores, cola de trabajo, escalar workers
---

Los consumidores competidores (competing consumers) son varios workers que sacan de la misma cola, así que el trabajo se reparte y cada tarea va a un worker.

## Cuándo usarlo

- Un solo worker no puede vaciar la cola, y la profundidad de la cola sigue subiendo.
- Las tareas son independientes, así que cualquier worker puede tomar cualquier tarea.
- Quieres añadir capacidad añadiendo workers, no reescribiendo al productor.

## Cómo funciona

El broker entrega cada tarea a un consumidor listo y espera una confirmación (ack). Si un consumidor muere antes de confirmar, el broker da la tarea a otro, y por eso la entrega es al menos una vez. Si un worker gestiona 20 tareas por segundo y llegan 100, cinco workers aguantan el ritmo.

El prefetch es cuántas tareas toma un worker por adelantado. Un valor alto oculta los viajes de ida y vuelta al broker. Un valor bajo reparte las tareas con equidad cuando varían en duración, y deja menos tareas atascadas en un worker que se cae.

## Qué cuesta

Se pierde el orden: dos tareas del mismo usuario pueden ejecutarse a la vez o desordenadas. Lo arreglas particionando por una clave, para que una misma entidad vaya siempre a un mismo consumidor. Los workers que comparten una base de datos también comparten su límite de conexiones, así que más workers pueden mover el cuello de botella, no eliminarlo.

## En Quorum

::Design{id="competing-workers"}

Ambos [Workers](/components/worker) se enlazan con la misma [Cola](/components/queue), que ofrece a cada uno lo que llega. El prefetch es el ajuste de un Worker. Una caída pierde todas las tareas que un proceso había tomado, y un reinicio planificado las devuelve antes. Un [Pooler de conexiones](/components/pooler) protege la Base de datos cuando los Workers se multiplican.

Añade copias con un [Autoescalador](/components/autoscaler) según la profundidad de la cola. Investiga [Trabajos en segundo plano](/research/background-jobs) y [Colas de mensajes](/research/queues). El glosario define [entrega al menos una vez](/glossary/at-least-once-delivery).
