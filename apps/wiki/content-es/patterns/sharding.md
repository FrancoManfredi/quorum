---
title: Sharding
summary: Divide un conjunto de datos entre varias bases de datos según una clave, para que las escrituras y el almacenamiento escalen más allá de lo que cabe en una máquina.
section: patterns
group: Scaling data
order: 301
aliases: shard, partition, horizontal partitioning, shard key, scatter-gather, resharding, partición, particionado horizontal, clave de shard
---

El sharding da a cada shard una porción de los datos, elegida por una clave presente en cada fila. Una Base de datos puede dividirse
en shards dentro de su Nodo, o un Grupo de datos puede ejecutar la topología con sharding y colocar cada shard en su
propio Nodo de Base de datos. Ambos dividen por la misma clave, y los costes de abajo son los mismos en los dos casos.

## Cuándo usarlo

- La primaria está en su límite de escritura o de disco después de réplicas, caché y una máquina mayor.
- La mayoría de las consultas nombran a un cliente o a un usuario, así que cada una toca una porción.

## Cómo funciona

Una clave de shard como `user_id` pasa por un hash, y el resultado elige el shard. Con 4 shards, el usuario 8191 podría caer en el shard 3, y cada lectura y escritura de ese usuario va allí. Las escrituras se reparten entre los shards, así que dos shards reciben aproximadamente el doble de escrituras que uno.

La clave lo decide todo. Una buena clave reparte la carga de forma uniforme y mantiene juntas las filas relacionadas. Una mala construye un shard caliente: haz sharding por país y el país más grande se lleva la mayor parte del tráfico. El [hashing consistente](/patterns/consistent-hashing) es cómo un sistema real añade un shard sin mover la mayoría de los datos.

## Qué cuesta

Las consultas que abarcan shards, como un informe sobre todos los usuarios, se convierten en lentos trabajos de scatter-gather. Una transacción entre shards es más lenta y falla más a menudo, y los joins son difíciles o imposibles. Cambiar la clave o el número de shards más tarde implica copiar los datos, lo que lleva tiempo de ingeniería y tiempo de calendario. Trata el sharding como el último paso, cuando las [réplicas de lectura](/patterns/read-replicas), la caché y las mejoras de consultas se han agotado.

## En Quorum

::Design{id="sharded-hash-key"}

La tarjeta de la Base de datos tiene un número de shards y una clave de shard en una Base de datos. Agrupa dos o más Bases de datos en una caja como Grupo de datos y elige Con sharding, y cada Base de datos es otro shard. Una clave hash reparte a los usuarios de forma uniforme, una clave por rango amontona a los usuarios nuevos en el último shard, una clave de tenant mantiene junto a un tenant pero deja que uno grande se caliente, y una clave de región mantiene a los usuarios cerca de sus datos al precio de un viaje de ida y vuelta lejano para el resto. [Claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards) pone la clave por rango en un Tablero.

Investiga [Sharding](/research/sharding) para desbloquearlo. El incidente [Shard caliente del tenant grande](/incidents/hot-shard) lleva al mayor tenant a un solo shard. [El nivel de datos](/explanation/the-data-tier) muestra dónde encaja, y el glosario define el [sharding](/glossary/sharding).
