---
title: Nivelación de carga con colas
summary: Pon una cola entre un productor a ráfagas y un consumidor constante, para que un pico se convierta en una espera corta en lugar de un fallo.
section: patterns
group: Messaging and async
order: 401
aliases: queue, message queue, async, background jobs, buffer, worker, load leveling, cola, cola de mensajes, asíncrono, trabajos en segundo plano, búfer, nivelación de carga
---

Una cola absorbe una ráfaga de trabajo y deja que los workers la drenen a un ritmo que puedan sostener.

## Cuándo usarlo

- El usuario no necesita el resultado antes de la respuesta, como un correo de confirmación o una miniatura.
- El tráfico llega en ráfagas, y dimensionar para el pico dejaría capacidad ociosa el resto del día.
- Un servicio posterior es más lento o menos fiable que el front end.

## Cómo funciona

La capa web escribe un trabajo en la cola y responde al instante. Un conjunto de workers lee los trabajos y hace la parte lenta. Si llegan 5,000 registros en un minuto y los workers atienden 50 por segundo, la cola crece un rato y luego se vacía, y ningún registro falla. Añade workers para drenar más rápido, o escálalos según la profundidad de la cola.

La entrega suele ser al menos una vez, así que un trabajo puede ejecutarse dos veces tras una caída. Haz que los trabajos sean seguros de repetir, y envía los que siguen fallando a una cola de mensajes muertos en lugar de reintentarlos para siempre.

## Qué cuesta

El trabajo deja de ser instantáneo, así que el usuario ve un resultado retrasado o una página de estado. Una cola que solo crece significa que los workers son más lentos que la tasa de llegada, y entonces el tiempo de espera no tiene límite, no está nivelado. Vigila la profundidad de la cola y la antigüedad del trabajo más viejo, porque la profundidad sola oculta los trabajos lentos.

## En Quorum

::Design{id="queue-leveled"}

El Servidor de aplicaciones se enlaza a una [Cola](/components/queue) y a la Base de datos. Los tipos que pueden ir en asíncrono, como las subidas, las exportaciones y los webhooks, pasan la mayor parte de su trabajo a la Cola, así que el usuario espera solo el encolado. La Cola se enlaza a un [Worker](/components/worker), que dimensiona el ritmo de drenaje. Cambia el tamaño de los Workers, o añade copias, cuando la profundidad de la Cola sigue creciendo.

Investiga [Trabajos en segundo plano](/research/background-jobs) y luego [Colas de mensajes](/research/queues). [Capacidad, utilización y colas](/explanation/queues) explica por qué la espera sube con la carga. El glosario define la [entrega al menos una vez](/glossary/at-least-once-delivery) y la [cola de mensajes muertos](/glossary/dead-letter-queue).
