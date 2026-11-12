---
title: Contrapresión
summary: Haz que un consumidor lento presione hacia atrás a sus productores, para que una cola siga acotada en lugar de crecer hasta agotar la memoria o la latencia.
section: patterns
group: Messaging and async
order: 405
aliases: bounded queue, max length, reject publish, flow control, load shedding, slow consumer, backpressure, contrapresión, cola acotada, longitud máxima, control de flujo, consumidor lento
---

La contrapresión (backpressure) es la señal que un consumidor lento envía hacia atrás para que los productores vayan más despacio, encolen menos o fallen rápido.

## Cuándo usarlo

- Los productores pueden superar a los consumidores durante periodos largos, no solo en ráfagas.
- Una cola sin límite haría que cada tarea esperase minutos, algo que los usuarios juzgan como un fallo.
- Prefieres rechazar parte del trabajo ahora a terminarlo todo demasiado tarde.

## Cómo funciona

Acota el búfer. Cuando una cola llega a su máximo, las tareas nuevas se rechazan, y el productor debe decidir: reintentar más tarde, descartar el trabajo o avisar al usuario. Con un límite de 10,000 tareas y workers que drenan 100 por segundo, nada espera más de unos 100 segundos.

Otras formas son un pool de workers acotado, un token que el productor debe tener para enviar y un límite de tasa en el borde. Todas convierten una acumulación invisible en un rechazo visible.

## Qué cuesta

Alguien pierde trabajo, así que el productor necesita un plan para un rechazo. Un límite demasiado bajo rechaza trabajo en ráfagas normales. Demasiado alto, y no protege nada. Los rechazos pueden desencadenar reintentos, que añaden carga, así que combina el límite con backoff y con el [descarte de carga](/patterns/load-shedding).

## En Quorum

::Design{id="queue-bounded"}

El Diseño empieza con la Cola ya en su límite y el Worker más lento que las llegadas, así que el pie de imagen muestra los rechazos. La tarjeta de la [Cola](/components/queue) tiene una longitud máxima. Pasada esta, la Cola rechaza lo que sus Workers no pueden asumir, y esas peticiones fallan como dropped. Sin límite, la profundidad crece siempre que los Workers drenan más despacio de lo que llegan las tareas, y una tarea nueva espera detrás de la acumulación.

Añade Workers o hazlos más grandes para bajar la profundidad. Consulta [Capacidad, utilización y colas](/explanation/queues). El glosario define [contrapresión](/glossary/backpressure).
