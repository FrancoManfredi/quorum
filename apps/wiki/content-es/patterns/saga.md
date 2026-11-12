---
title: Saga
summary: Una saga ejecuta una transacción de negocio como una cadena de transacciones locales entre servicios y deshace los pasos terminados con acciones compensatorias cuando falla un paso posterior.
section: patterns
group: Outside the game
order: 1001
aliases: saga, distributed transaction, compensating transaction, orchestration, choreography, long-running transaction, transacción distribuida, transacción compensatoria, orquestación, coreografía, transacción de larga duración
---

Una saga es una transacción de negocio dividida en transacciones locales, una por servicio, donde un fallo a medias se repara ejecutando transacciones compensatorias para los pasos que ya terminaron.

Recurre a ella cuando una acción toca datos que pertenecen a varios servicios y una sola transacción ACID no puede abarcarlos. Un flujo de pedido reserva existencias, cobra una tarjeta y luego reserva un mensajero. Si falla el paso del mensajero, la saga reembolsa la tarjeta y libera las existencias. Existen dos estilos. En la coreografía cada servicio publica un evento que dispara el siguiente. En la orquestación un coordinador central dice a cada participante qué hacer y lleva el estado, lo que es más fácil de seguir cuando el flujo se complica.

Te cuesta el rollback y el aislamiento. Una compensación es lógica de negocio nueva que debes diseñar y probar para cada paso, y algunos pasos no se pueden deshacer en absoluto, como un correo ya enviado. Azure llama al punto sin retorno una transacción pivote. Como otras peticiones ven el estado a medio terminar, necesitas contramedidas como marcar un pedido como PENDING hasta que acabe la saga. Depurar también se complica, porque la historia está repartida en los logs de varios servicios.

## Lo más parecido en Quorum

El juego no tiene saga, pero enseña las piezas que hacen falta. El [Outbox transaccional](/patterns/transactional-outbox) publica un evento de forma atómica con la escritura que lo causó, algo que un paso de saga necesita para ser fiable. Las [Claves de idempotencia](/patterns/idempotency-keys) hacen inofensivo un paso repetido, y una [Cola](/components/queue) lleva los mensajes. Investiga [Outbox transaccional](/research/outbox) y [Claves de idempotencia](/research/idempotency-keys) para construirlas.

## Referencias

- [Saga pattern, microservices.io](https://microservices.io/patterns/data/saga.html): la definición de Chris Richardson con ejemplos de coreografía y orquestación, y una lista clara de los inconvenientes.
- [Saga design pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga): transacciones compensables y pivote, y qué sopesar antes de elegir la orquestación.
- [Sagas, Garcia-Molina and Salem (1987)](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf): el artículo original que dio nombre al patrón, para transacciones de base de datos de larga duración.
