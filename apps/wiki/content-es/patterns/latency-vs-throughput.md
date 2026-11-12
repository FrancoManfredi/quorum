---
title: Latencia frente a throughput
summary: La latencia es cuánto tarda una petición, el throughput es cuántas terminan por segundo, y subir una a menudo empuja a la otra en el sentido equivocado.
section: patterns
group: Foundations
order: 10
aliases: latency, throughput, response time, rps, qps, batching, saturation, latencia, tiempo de respuesta, peticiones por segundo, procesamiento por lotes, saturación
---

La latencia es el tiempo que tarda una petición desde que se envía hasta que recibe respuesta, y el throughput es el número de peticiones que terminan cada segundo. Un diseño puede ser bueno en una y malo en la otra.

Toma un servidor con 8 workers y una petición que necesita 100 ms de trabajo. Cada worker termina 10 peticiones por segundo, así que el throughput del servidor tiene su techo en 80 por segundo, y una petición que llega cuando un worker está libre tarda 100 ms. Con 40 peticiones por segundo ambos números están bien. Con 79 no, porque las llegadas esperan en cola a un worker libre, y la espera sale de la latencia del usuario mientras el throughput se queda plano en 80.

Esa es la forma que hay que recordar. El throughput sube con la carga hasta un límite, y pasado cerca del 70% de ese límite la latencia sube con fuerza. En una cola simple la espera crece en proporción a ρ / (1 − ρ), donde ρ es la parte de la capacidad en uso. Pasar del 50% al 90% de ocupación multiplica la espera por 9.

El procesamiento por lotes cambia en el otro sentido. Una base de datos que confirma una fila cada vez puede lograr 2,000 inserciones por segundo, y 100 filas por commit pueden superar las 20,000, pero cada fila espera a que se llene su lote.

## Qué cambia en un diseño

Dimensiona un servicio para la latencia que prometes, no para su throughput máximo. Una máquina que aguanta 80 peticiones por segundo en un benchmark debería planificarse para unas 55 en producción, para que la cola siga corta. Añade copias antes de que la primera se caliente, porque el último 20% de capacidad compra muy poco.

Elige según quién espera: una persona ante un spinner necesita baja latencia, y una exportación nocturna necesita throughput. Cuando un camino necesita ambas, envía la petición del usuario por el camino rápido y empuja la parte pesada a una cola ([Nivelación de carga con colas](/patterns/queue-load-leveling)).

Informa de la latencia como percentiles ([Percentiles, no promedios](/patterns/percentiles-not-averages)), y usa la [ley de Little](/patterns/littles-law) para convertir una latencia y una tasa en la concurrencia que debes proporcionar.

## En Quorum

Cada Nodo muestra su [utilización](/glossary/utilization), y el Panel grafica la latencia a su lado, así que puedes ver cómo una sube mientras la otra se aplana. [Latencia y percentiles](/explanation/latency) explica cómo construye el juego el tiempo de una petición, y [Capacidad, utilización y colas](/explanation/queues) cubre la espera que crece cerca del límite. Los usuarios satisfechos se cuentan con [Apdex](/glossary/apdex).
