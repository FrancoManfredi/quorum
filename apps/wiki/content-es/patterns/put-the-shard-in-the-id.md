---
title: Pon el shard en el ID: Pinterest
summary: Pinterest ejecutó 4,096 shards de MySQL y codificó el número de shard en el ID de 64 bits de cada objeto, de modo que una lectura no necesitaba un servicio de consulta.
section: patterns
group: Ran in production
order: 960
aliases: pinterest, sharding, mysql, shard id, 4096 shards, memcached, redis, id de shard, 4096 shards
---

En 2012 Pinterest empezó a hacer sharding de su flota de MySQL. Ejecutaba ocho servidores EC2, creó 4,096 shards virtuales y puso el número de shard en los 16 bits superiores de cada ID de objeto de 64 bits. El ID de un Pin nombra su shard, su tipo y su fila, así que la aplicación se conecta directamente a la base de datos correcta.

## El sistema

Cada shard es una base de datos MySQL, y una tabla de configuración asigna rangos de shards a un maestro y a su standby. El par se replica maestro-maestro, y producción lee y escribe solo en el maestro, así que una copia retrasada no puede servir una fila obsoleta. Los objetos viven en Memcached y las asignaciones en Redis, porque los dos patrones de acceso encajan con almacenes distintos. Un rango muy ocupado se divide en un par nuevo, de modo que la capacidad crece de un rango en un rango.

## El tablero

::Design{id="pinterest-id-shards"}

La Base de datos tiene ocho shards sobre una clave hash, que representan los 4,096. La clave representa el número de shard del ID, para el que el juego no tiene campo. La Caché es la capa de Memcached y Redis colapsada en un solo nodo, y el Servidor de aplicaciones es la API que decodifica el ID.

## Por qué funciona

El ID lleva el shard, así que una lectura necesita una decodificación de ID y una consulta a la base de datos. Ningún servicio de consulta se interpone ante la flota, y no hace falta volver a calcular hashes cuando un rango se divide. [Haz sharding de la base de datos](/patterns/shard-the-database) cubre el compromiso general, y [claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards) es el fallo al que responde la división.

## Hasta dónde llega el juego

El tablero tiene ocho shards, no 4,096, y no tiene tabla de configuración ni par maestro-maestro. La clave hash es por usuario, no por ID de objeto. También mantiene una sola caché, mientras que Pinterest ejecuta Memcached y Redis en paralelo. El pie de figura es el resultado de Quorum, no el tráfico de Pinterest.

## Fuentes

- [Sharding Pinterest: How we scaled our MySQL fleet, Pinterest Engineering](https://medium.com/pinterest-engineering/sharding-pinterest-how-we-scaled-our-mysql-fleet-3f341e96ca6f): los ocho servidores, los 4,096 shards, el ID de 64 bits, la tabla de configuración y las dos cachés.
- [Shard or Do Not Shard: Pinterest's Hand-Built MySQL Fleet, behindscale](https://www.behindscale.com/articles/pinterest-sharding-mysql): un recorrido detallado del shard codificado en el ID y de la división de rangos.
- [MySQL replication, MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/replication.html): cómo se configura el par maestro-maestro y cómo se promueve un standby.
