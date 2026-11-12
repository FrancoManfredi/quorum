---
title: 'Una caché delante del grafo: Meta'
summary: Meta puso un nivel de memcached con write-through delante de MySQL con sharding, y mantuvo una región primaria para cada shard.
section: patterns
group: Ran in production
order: 956
aliases: meta, facebook, tao, memcached, social graph, write through, sharding, grafo social, caché write-through
---

Facebook construyó TAO en 2013 para responder las consultas del grafo social, que son sobre todo de lectura, sin enviar cada una a MySQL. TAO es una caché write-through: una lectura se sirve desde memcached, y una escritura pasa por la caché hasta el shard que es dueño del objeto. El conjunto de datos se divide en cientos de miles de shards, y cada shard tiene una región primaria.

## El sistema

La API es pequeña y fija: obtener un objeto, obtener sus aristas salientes, contarlas e iterar un rango. Los servidores de TAO mantienen la caché consistente entre regiones, y la replicación de MySQL lleva las actualizaciones de cada shard desde su región primaria hasta las regiones secundarias. Una región secundaria reenvía las escrituras a la primaria, y su caché write-through mantiene la consistencia de lectura tras escritura para el miembro que hizo el cambio. En 2022 TAO atendía más de 10 mil millones de peticiones por segundo.

## El tablero

::Design{id="meta-cache-graph"}

La Caché es el nivel de memcached de TAO, con write-through, así que una escritura actualiza la caché y la base de datos. La Base de datos tiene ocho shards con clave hash, que representan los cientos de miles de shards de TAO. El tablero muestra una región. Una segunda región lee a través de su propia caché y reenvía las escrituras a la primaria, algo que el tablero no dibuja.

## Por qué funciona

Un grafo con muchas lecturas gasta la mayoría de sus consultas en los mismos objetos populares. Una caché write-through mantiene esos objetos en memoria y mantiene la caché correcta en una escritura, así que la base de datos solo ve las escrituras y los fallos. [Write-through y write-behind](/patterns/write-through-and-write-behind) y [haz sharding de la base de datos](/patterns/shard-the-database) son las dos mitades.

## Hasta dónde llega el juego

El juego tiene una región primaria por Base de datos, no una por shard, y el tablero dibuja una región. No muestra la API de TAO, su mapa de primarios por shard ni la flota de memcached. El pie de imagen es el resultado de Quorum, no los 10 mil millones de peticiones por segundo de Meta.

## Fuentes

- [TAO: The power of the graph, Engineering at Meta](https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph): la API, la caché write-through, los shards y la región primaria por shard.
- [Open-sourcing TAOBench, Engineering at Meta](https://engineering.fb.com/2022/09/07/core-infra/taobench): la cifra de 10 mil millones de peticiones por segundo y la forma de la carga de trabajo.
- [Scaling Memcache at Facebook, NSDI 2013](https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf): la flota de cachés y el modelo de consistencia que hay detrás.
