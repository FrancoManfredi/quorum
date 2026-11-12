---
title: Particiona los mensajes por canal: Discord
summary: Discord guardó billones de mensajes en un almacén de columnas anchas, particionados por canal y por tiempo, y los leyó con un quórum.
section: patterns
group: Ran in production
order: 952
aliases: discord, cassandra, scylladb, wide column, quorum, hot partition, chat, columnas anchas, quórum, partición caliente
---

Discord movió sus mensajes de MongoDB a Cassandra en 2017, cuando tenía 12 nodos y miles de millones de mensajes. A principios de 2022 el clúster tenía 177 nodos y billones de mensajes, y el equipo lo migró otra vez, a ScyllaDB. El esquema particiona los mensajes por canal y por un bloque de tiempo, y replica cada partición tres veces.

## El sistema

Cada fila de mensaje tiene como clave el canal y el bloque, así que los mensajes recientes de un canal quedan juntos y una lectura es un recorrido por rango. Las lecturas y las escrituras usan consistencia de quórum. El punto débil es la partición caliente: un servidor con cientos de miles de miembros envía mucho más tráfico a un canal que un servidor pequeño. Discord añadió servicios de datos delante del almacén, con enrutado por hash consistente según el canal, de modo que las peticiones de un canal se fusionan en una instancia del servicio.

## El tablero

::Design{id="discord-channel-partitions"}

El Almacén de columnas anchas es el clúster de mensajes, con tres réplicas por clave y un quórum de lectura y escritura de dos. El Hub en tiempo real es la capa de gateway, sobre BEAM porque un proceso ligero por conexión es lo que permite que una máquina aguante muchas. La Caché guarda el estado caliente de los canales.

## Por qué funciona

Una lectura de quórum de dos réplicas se solapa con la última escritura de dos, así que una lectura ve el último mensaje incluso después de que falle un nodo. Particionar por canal mantiene contiguo el historial de una conversación. [Lecturas y escrituras de quórum](/patterns/quorum-reads-and-writes) y [claves calientes y shards calientes](/patterns/hot-keys-and-hot-shards) son las dos ideas en las que se apoya el esquema.

## Hasta dónde llega el juego

El tablero tiene un Almacén de columnas anchas, no 72 nodos de ScyllaDB, y no muestra los servicios de datos ni las particiones por canal. El pie de figura es el resultado de Quorum, no el p99 de Discord. El incidente Clave caliente del juego es el mismo fallo que los servicios de datos se construyeron para absorber.

## Fuentes

- [How Discord Stores Trillions of Messages, Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages): la migración de Cassandra a ScyllaDB, el cambio de 177 a 72 nodos y las cifras de latencia.
- [How Discord Stores Billions of Messages, Discord](https://discord.com/blog/how-discord-stores-billions-of-messages): el esquema original y por qué agrupaba los mensajes por bloques de tiempo.
- [How Discord Supercharges Network Disks for Extreme Low Latency, Discord](https://discord.com/blog/how-discord-supercharges-network-disks-for-extreme-low-latency): la topología de almacenamiento detrás del clúster de ScyllaDB.
