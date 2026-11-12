---
title: Publicación y suscripción
summary: Publica cada evento una vez en un tema y deja que lo lean todos los servicios interesados, para que los productores dejen de saber quién consume sus eventos.
section: patterns
group: Messaging and async
order: 403
aliases: pubsub, pub/sub, topic, event bus, kafka, fan-out, sns, event stream, consumer group, tema, bus de eventos, flujo de eventos, grupo de consumidores, publicación-suscripción
---

Publicación y suscripción envía cada evento a un tema, y cada suscriptor recibe su propia copia.

## Cuándo usarlo

- Más de un servicio debe reaccionar al mismo evento, como un índice de búsqueda, un almacén de datos y un emisor de correos.
- El productor no debería cambiar cuando aparece un consumidor nuevo.
- Un consumidor nuevo debe poder reproducir el historial.

## Cómo funciona

Una cola entrega una tarea a un worker. Un tema entrega un evento a cada grupo de suscriptores, y dentro de un grupo los miembros se reparten el trabajo. Con un log como Kafka, los eventos permanecen durante una ventana de retención, así que un suscriptor nuevo puede leer desde el principio, y uno lento se queda atrás sin frenar a nadie más.

Un tema se divide en particiones, y un grupo puede usar como máximo un consumidor por partición. Usar como clave la entidad de los eventos mantiene en orden los eventos de una entidad dentro de una partición.

## Qué cuesta

La entrega es al menos una vez, así que los consumidores deben tolerar duplicados. El orden se mantiene solo dentro de una partición. El retraso de un suscriptor lento crece sin ningún fallo visible, así que vigila el retraso, no la latencia. Una clave que concentra la mayor parte del tráfico sobrecarga su partición sea cual sea el número de particiones.

## En Quorum

::Design{id="pubsub-stream"}

Un [Flujo de eventos](/components/log) representa a Kafka. El Servidor de aplicaciones añade eventos a él, y sus consumidores leen a su ritmo mientras los eventos permanecen. Las particiones limitan cuántos consumidores leen a la vez, la clave decide el orden, la retención decide cuánto puede quedarse atrás un consumidor, y los acuses de recibo cambian latencia de escritura por durabilidad.

Los Workers enlazados a un mismo flujo se reparten sus tareas, así que el juego no da a cada uno su propia copia. El [Proveedor de notificaciones push](/components/msgp) del juego envía mensajes push y de correo, que es otra cosa. Investiga [Streaming de eventos](/research/event-streaming) después de [Colas de mensajes](/research/queues). [Clave caliente](/incidents/hot-key) muestra una clave llenando una partición. El glosario define la [entrega al menos una vez](/glossary/at-least-once-delivery).
