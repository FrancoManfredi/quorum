---
title: Cola de mensajes muertos
summary: Mueve un mensaje que sigue fallando a una cola aparte tras unos pocos intentos, para que un solo mensaje defectuoso no bloquee a los workers.
section: patterns
group: Messaging and async
order: 404
aliases: dlq, poison message, dead letter, failed messages, max attempts, redrive, dead-letter queue, mensaje envenenado, mensajes muertos, mensajes fallidos, máximo de intentos, reenvío
---

Una cola de mensajes muertos (dead-letter queue) guarda los mensajes que un consumidor no pudo procesar, tras un número fijo de intentos.

## Cuándo usarlo

- Un mensaje puede fallar siempre, como una carga malformada o un registro que fue borrado.
- Los workers siguen ocupados mientras la profundidad de la cola sube, que es la señal de un mensaje envenenado.
- Alguien necesita inspeccionar o reproducir más tarde los mensajes fallidos.

## Cómo funciona

El consumidor prueba un mensaje, y si falla, el broker lo vuelve a entregar tras una pausa. Tras el máximo de intentos, a menudo de 3 a 10, el broker lo mueve a la cola de mensajes muertos y los workers siguen adelante. Sin el límite, un solo mensaje envenenado se reintenta para siempre y se lleva la mayor parte del tiempo de los workers.

Una alarma sobre la profundidad de la cola de mensajes muertos te avisa de que algo va mal, y una herramienta de redrive reenvía los mensajes una vez corregido el bug.

## Qué cuesta

Los mensajes fallidos se quedan ahí hasta que alguien los mira. Los mensajes que solo tuvieron mala suerte, como durante una caída de la base de datos, acaban en el mismo sitio que los realmente malos. Se pierde el orden del mensaje aparcado. Una cola de mensajes muertos sin alarma es un lugar donde los datos desaparecen en silencio.

## En Quorum

::Design{id="queue-dlq"}

La tarjeta de la [Cola](/components/queue) tiene un interruptor de mensajes muertos y un valor de intentos máximos. Con él activado, una tarea se reintenta ese número de veces, con una pausa entre intentos, y luego se aparta. En el juego, una tarea que falla todos los intentos se pierde, ya que no hay una cola que inspeccionar. Sin él, una tarea que falla se reintenta para siempre.

El incidente [Mensaje envenenado](/incidents/poison) solo afecta a una Cola sin cola de mensajes muertos, y no necesita Investigación para prevenirse. El glosario define la [cola de mensajes muertos](/glossary/dead-letter-queue). Combínala con [Reintentar con backoff](/patterns/retry-with-backoff) y [Claves de idempotencia](/patterns/idempotency-keys).
