---
title: Mover shards en línea: Stripe
summary: Stripe movió cientos de millones de objetos sin tiempo de inactividad y luego construyó una Data Movement Platform que copia chunks entre shards de MongoDB mientras la aplicación sigue escribiendo.
section: patterns
group: Ran in production
order: 963
aliases: stripe, docdb, mongodb, sharding, online migration, kafka, oplog, migración en línea, mover shards
---

En 2017 Stripe migró cientos de millones de Suscripciones en cuatro fases, con escrituras duales y un backfill con MapReduce, y siguió sirviendo durante todo el proceso. Más tarde construyó DocDB sobre MongoDB, con una Data Movement Platform que mueve chunks entre shards en línea.

## El sistema

DocDB es una flota de MongoDB autogestionada. La Data Movement Platform lee el oplog de cada shard, lo envía a Kafka, lo archiva en almacenamiento de objetos y reproduce las mutaciones en el shard de destino. El cambio de destino (cutover) se mantiene más corto que una conmutación planificada de la primaria, porque ese es el presupuesto de reintentos que las aplicaciones del producto ya tienen. Stripe informa de un 99.999% de disponibilidad durante las migraciones.

## El tablero

::Design{id="stripe-online-shards"}

La Base de datos tiene cuatro shards sobre una clave hash, que representan los shards de DocDB. El Conector CDC es el lector del oplog, el Flujo de eventos es Kafka, y el Almacén de datos hace de shard de destino que reproduce los cambios. La aplicación sigue escribiendo en el shard antiguo mientras el flujo de cambios pone al día el nuevo. La copia de chunks y el cutover de escrituras duales quedan fuera del tablero.

## Por qué funciona

Mover un shard es una copia más un flujo de cambios, no un volcado y una restauración. La aplicación escribe una vez, y el flujo de cambios lleva la misma escritura al destino. El cutover solo tiene que cubrir los últimos segundos, así que la ventana de solo lectura cabe en el presupuesto de reintentos. Las [migraciones en línea](/patterns/online-migrations) y la [captura de cambios de datos](/patterns/change-data-capture) son los dos mecanismos.

## Hasta dónde llega el juego

La Base de datos del juego no es MongoDB ni DocDB, y el tablero no tiene copia de chunks ni cutover de escrituras duales. Muestra el almacén con shards y el flujo de cambios, que son las partes que un Diseño puede representar. El pie de figura es el resultado de Quorum, no la disponibilidad de Stripe.

## Fuentes

- [How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations, Stripe](https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations): DocDB, la Data Movement Platform, el oplog hacia Kafka y S3, y el cutover del tamaño de una conmutación.
- [Online migrations at scale, Stripe](https://stripe.com/blog/online-migrations): la migración de Suscripciones en cuatro fases y el backfill con MapReduce.
- [Sharding, MongoDB documentation](https://www.mongodb.com/docs/manual/sharding/): las operaciones de shard, chunk y movimiento sobre las que se construye DocDB.
