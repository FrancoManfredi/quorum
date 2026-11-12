---
title: Event sourcing
summary: Event sourcing guarda cada cambio como un evento en un registro de solo adición y construye el estado actual reproduciéndolo.
section: patterns
group: Outside the game
order: 1003
aliases: event sourcing, event log, replay, snapshot, audit log, temporal query, registro de eventos, reproducción, instantánea, registro de auditoría, consulta temporal
---

Event sourcing guarda cada cambio de una entidad como un evento inmutable en un registro ordenado, y el estado actual es lo que obtienes al reproducir esos eventos.

Úsalo cuando el historial importa tanto como el presente. El saldo de una cuenta es la suma de sus ingresos y retiradas, así que el registro es una pista de auditoría que no puedes editar a escondidas. Martin Fowler enumera lo que aporta: reconstruir el estado desde cero, preguntar cuál era el estado en cualquier momento pasado y reproducir un evento corregido junto con los posteriores. Chris Richardson añade un uso que encaja con los microservicios, y es que publicar los eventos es la misma escritura que guardarlos, así que no hace falta enviar un mensaje aparte de forma atómica.

Cuesta más de lo que parece. Reproducir un historial largo es lento, así que conservas instantáneas periódicas y reproduces solo lo posterior. Los eventos viven para siempre, así que cambiar su forma requiere esquemas versionados. Leer el estado actual necesita un modelo de lectura construido a partir del registro, por lo que suele combinarse con CQRS, y ese modelo de lectura es eventualmente consistente. Azure lo llama un patrón complejo y costoso de adoptar o de abandonar, así que adóptalo solo cuando el historial lo merezca.

## Lo más parecido en Quorum

El juego tiene el registro, no el patrón. El [Flujo de eventos](/components/log) conserva los mensajes después de leerlos para que los consumidores puedan reproducirlos, y la Investigación [Streaming de eventos](/research/event-streaming) lo desbloquea. La [Captura de cambios de datos](/patterns/change-data-capture) convierte el registro de escrituras de una base de datos en eventos, lo que da parte del beneficio sin hacer de los eventos la fuente de verdad. El [Outbox transaccional](/patterns/transactional-outbox) resuelve el problema de escribir y publicar de la manera habitual.

## Referencias

- [Event Sourcing, Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html): reconstrucción completa, consulta temporal y reproducción de eventos, explicadas con un ejemplo de envíos.
- [Event Sourcing pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing): cuándo usarlo, y los problemas con las instantáneas, el orden y el versionado.
- [Event sourcing, microservices.io](https://microservices.io/patterns/data/event-sourcing.html): cómo un almacén de eventos elimina la necesidad de un commit en dos fases entre una base de datos y un broker.
