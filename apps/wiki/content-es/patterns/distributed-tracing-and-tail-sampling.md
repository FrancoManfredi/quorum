---
title: Trazabilidad distribuida y muestreo de cola
summary: Sigue una petición a través de cada servicio como una traza, y decide cuando termina qué trazas conservar, para que las lentas y las fallidas sobrevivan al muestreo.
section: patterns
group: Operate and observe
order: 704
aliases: tracing, trace, span, opentelemetry, otel, jaeger, tempo, sampling, head sampling, tail sampling, sample rate, retention, trazabilidad, trazas, muestreo, muestreo de cola, muestreo de cabeza, tasa de muestreo, retención
---

Da a cada petición un ID que pase cada salto, y conserva las trazas que valga la pena leer y descarta el resto.

## Cuándo usarlo

- Una petición es lenta, el panel muestra todos los servicios sanos y nadie sabe qué salto gastó el tiempo.
- Una página llama a muchos servicios y necesitas el más lento, no el promedio.
- Trazar cada petición cuesta más que los problemas que encuentra.

## Cómo funciona

Cada servicio registra un **span**: su nombre, su inicio y su duración, con el ID de traza que recibió. Los spans de una petición, unidos por ese ID, forman una traza. Una cascada (waterfall) de ella muestra qué salto fue lento y cuáles se ejecutaron en paralelo.

El **muestreo de cabeza** (head sampling) decide en el primer servicio, por ejemplo conservar 1 petición de cada 100. Es barato, pero también descarta el 99% de las lentas. El **muestreo de cola** (tail sampling) guarda una traza en un búfer hasta que termina, y luego conserva todos los errores y todas las peticiones más lentas que un umbral, más una pequeña parte del resto. El collector de OpenTelemetry lo hace con un procesador de tail sampling, y el búfer retiene los spans durante una ventana de decisión de unos 30 segundos.

Con una tasa de errores del 1% y un muestreo de cabeza del 1%, 1 de cada 10,000 peticiones es un error que conservaste. El muestreo de cola los conserva todos.

## Qué cuesta

El muestreo de cola necesita todos los spans de una traza en un mismo collector, así que requiere enrutado por ID de traza y memoria para el búfer. Una traza también está tan completa como lo estén los servicios que propagan el ID. Un servicio que lo pierde parte todas las trazas en dos.

## En Quorum

Enlaza Nodos con un Nodo de [Analítica](/components/analytics) y este muestrea su tráfico, como abajo.

::Design{id="tracing-sampled"}

[Trazado distribuido](/research/tracing) nombra el salto más lento de cada tipo de petición, y [Muestreo de cola](/research/tail-sampling) hace que los fallos muestreados enseñen más Conocimiento de fallos. El juego no mantiene un búfer por traza, así que allí el muestreo de cola cambia el Conocimiento ganado, no lo que registra la toma. El glosario define la [trazabilidad distribuida](/glossary/distributed-tracing), y [Conocimiento y observabilidad](/explanation/observability) cubre el coste de una tasa más alta.
