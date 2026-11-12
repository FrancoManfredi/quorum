---
title: Haz sharding de la base de datos
summary: Divide la Base de datos en shards por una clave, para que las escrituras se reparta entre varias primarias cuando una máquina en su mayor tamaño ya está llena.
section: patterns
group: Scaling steps
order: 126
aliases: partitioning, horizontal partitioning, shard key, resharding, scatter gather, cross shard transaction, hash sharding, range sharding, particionado, particionado horizontal, clave de shard, resharding, transacción entre shards, sharding por hash, sharding por rango
---

Divide una Base de datos en varios shards según una clave, para que cada shard reciba una parte de las escrituras.

## Cuándo dar el paso

- La primaria está en su mayor tamaño y aun así se satura con las escrituras, con réplicas ya añadidas.
- Las operaciones de disco se encolan en la primaria incluso después de comprar volúmenes más rápidos.
- El crecimiento vertical se ha agotado, así que el siguiente paso no puede ser una máquina mayor.

## El Diseño

::Design{id="sharded-database"}

El Servidor de aplicaciones llama a un Nodo de Base de datos. El Nodo representa varios shards, cada uno una copia de su
tamaño, o un Grupo de datos ejecuta la topología con sharding y cada Base de datos es otro shard. En cualquier caso una
petición va al shard que posee su clave. Hacer sharding de los Nodos multiplica los costes por shard de abajo por el número de Nodos: con N Nodos y M shards cada uno, los costes de dispersión, del shard más ocupado y entre shards crecen con N × M.

## Por qué funciona

Las lecturas y escrituras escalan con el número de shards, porque cada shard ve solo su porción. La clave decide lo equilibrada que es esa porción. Un hash del ID de usuario reparte los Usuarios de forma uniforme. Una clave por rango envía los Usuarios nuevos al último shard, y una clave de tenant envía a un tenant grande a un solo shard, así que esas dejan un shard caliente. Una clave de región mantiene los datos cerca de sus Usuarios pero paga un viaje de ida y vuelta por los lejanos.

## Qué cuesta

Cada shard se factura como una Base de datos completa. Un informe o una búsqueda toca todos los shards, así que cada shard más allá del primero añade CPU y algo de latencia. Una transacción que abarca shards hace commit en cada uno, y cualquiera puede hacerla fallar. Cambiar el número o la clave más tarde es un resharding que cuesta horas de desarrollo y una larga copia, así que elige la clave pronto. El juego no ofrece una opción de hashing consistente para el mapa de shards, solo estas cuatro claves.

## En Quorum

Fija **Shards** y **Clave de shard** en una [Base de datos](/components/database). Investiga [Sharding](/research/sharding). El incidente [Shard caliente del tenant grande](/incidents/hot-shard) muestra una mala clave. Mira [sharding](/patterns/sharding), [claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards) y [Escalar la base de datos](/guides/scale-the-database). El siguiente paso, [SQL distribuido y almacenes sin líder](/patterns/distributed-sql-and-leaderless-stores), traslada la división al propio almacén.
