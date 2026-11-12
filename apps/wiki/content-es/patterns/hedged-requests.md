---
title: Peticiones hedged
summary: Envía una segunda copia de una llamada lenta y quédate con la primera respuesta, para que un servidor lento poco frecuente deje de marcar tu latencia de cola.
section: patterns
group: Resilience
order: 507
aliases: hedge, hedged request, tail latency, backup request, p99, tail at scale, petición hedged, peticiones especulativas, latencia de cola, petición de respaldo
---

Una petición hedged (especulativa) recorta la cola haciendo competir una segunda copia de una llamada que tarda demasiado.

## Cuándo usarlo

- El p99 está muy por encima del p50 porque unas pocas llamadas caen en una réplica lenta o en un momento de mucha carga.
- La llamada es de solo lectura o es segura de repetir.
- El destinatario tiene capacidad de sobra para un poco de tráfico extra.

## Cómo funciona

El llamador envía una petición y pone en marcha un reloj. Si no llega respuesta hacia la latencia p95, envía la misma petición a otra réplica y usa la respuesta que llegue primero. Una llamada solo es lenta cuando ambas copias son lentas, así que la respuesta lenta poco frecuente debe ocurrir dos veces. Google lo describió en "The Tail at Scale". Cubrirse solo después del p95 significa que alrededor del 5% de las llamadas recibe una segunda copia, no todas.

## Qué cuesta

El destinatario ve carga extra, y un hedge con un umbral equivocado la duplica. Un hedge en una escritura puede ejecutarla dos veces, así que úsalo para lecturas o llamadas idempotentes. También oculta una réplica lenta en lugar de arreglarla, y durante una sobrecarga real las copias extra empeoran las cosas. Cancela la copia perdedora cuando vuelve la ganadora.

## En Quorum

::Design{id="hedged-database-call"}

**Hedge** es un ajuste de un Enlace, así que cada Enlace elige por sí mismo. Envía una segunda copia tras una primera lenta y se queda con la respuesta más rápida: la cola baja, y la Base de datos ve una pequeña parte de llamadas extra. [Peticiones especulativas](/research/hedged-requests) lo desbloquea y necesita [Trazado distribuido](/research/tracing). El glosario define la [petición hedged](/glossary/hedged-request) y el [tail at scale](/glossary/tail-at-scale).
