---
title: Claves de idempotencia
summary: Etiqueta cada escritura con una clave única que el servidor recuerda, para que una petición reintentada haga el trabajo una sola vez.
section: patterns
group: Messaging and async
order: 406
aliases: idempotency, idempotent, duplicate, double charge, dedupe, exactly once, idempotencia, idempotente, duplicado, cobro duplicado, deduplicar, exactamente una vez
---

Una clave de idempotencia permite que un cliente repita una petición sin repetir su efecto.

## Cuándo usarlo

- Una petición cambia el estado: un cobro, un pedido, una transferencia.
- El cliente puede reintentar tras un timeout y no puede saber si el primer intento funcionó.
- Una cola de mensajes puede entregar el mismo mensaje dos veces.

## Cómo funciona

El cliente genera una clave, como un UUID, una vez por operación y la envía con cada intento. El servidor guarda la clave con el resultado en la misma transacción que el cambio. Una repetición con una clave conocida devuelve el resultado guardado y no hace nada más.

Un cobro con tarjeta agota su tiempo a los 10 segundos. El cobro en realidad se hizo, y el cliente reintenta. Sin clave, el cliente paga dos veces. Con una, el segundo intento recibe el recibo del primer cobro.

## Qué cuesta

El servidor debe conservar las claves mientras pueda llegar un reintento, a menudo un día, así que el almacenamiento y la búsqueda se acumulan. La comprobación y la escritura deben ser atómicas, o dos intentos simultáneos pasan ambos. Y una clave identifica una operación, así que reutilizarla para una petición distinta debe ser un error, no una repetición silenciosa.

## En Quorum

El incidente [Cobro duplicado](/incidents/double-charge) es el fallo, y [Claves de idempotencia](/research/idempotency-keys) es la investigación que lo previene. El glosario define la [idempotencia](/glossary/idempotency). Combínalo con [Tiempos de espera](/patterns/timeouts) y [Reintentos con backoff y jitter](/patterns/retry-with-backoff).
