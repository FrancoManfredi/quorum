---
title: Haz sharding de la tabla de bloques: Notion
summary: Notion dividió su tabla de bloques en 480 shards lógicos, y luego envió los cambios por Kafka a un data lake.
section: patterns
group: Ran in production
order: 957
aliases: notion, postgres, sharding, cdc, data lake, kafka, s3, tabla de bloques, lago de datos
---

Notion guardó cada bloque, la unidad de la que se compone una página, en una sola base de datos Postgres durante cinco años. En 2021 la tabla de bloques tenía más de 20 mil millones de filas, y `VACUUM` había empezado a atascarse. El equipo la dividió en 480 shards lógicos repartidos en 32 bases de datos físicas, y luego creció a 96 bases de datos físicas en 2023 manteniendo 480 shards lógicos.

## El sistema

Un shard lógico es un esquema de Postgres, y una base de datos física contiene varios. La aplicación conoce el shard, así que una consulta va a una base de datos cuando tiene la clave. La ruta de analítica salió de la primaria: Debezium lee el write-ahead log de Postgres, Kafka transporta los cambios y Hudi los escribe en S3. En 2024 el lago manejaba decenas de megabytes por segundo de cambios de filas, y la tabla de bloques había superado los 200 mil millones de filas.

## El tablero

::Design{id="notion-block-shards"}

La Base de datos tiene cuatro shards sobre una clave hash, que representan los 480 shards lógicos. El Conector CDC es Debezium, el Flujo de eventos es Kafka y el Almacén de datos es el lago donde aterrizan los cambios. La aplicación nunca escribe dos veces: escribe el bloque, y el conector lee el cambio.

## Por qué funciona

El shard mantiene la tabla en línea lo bastante pequeña para `VACUUM` y para las IOPS de una máquina. El log mantiene la analítica fuera de la primaria, y da al lago un flujo ordenado de cambios. La [captura de cambios de datos](/patterns/change-data-capture) y el [almacenamiento de objetos y reglas de ciclo de vida](/patterns/object-storage-and-lifecycle-rules) son las dos rutas.

## Hasta dónde llega el juego

El tablero tiene cuatro shards, no 480, y no tiene esquemas dentro de una base de datos física. No muestra Hudi, los 480 conectores de Fivetran que el equipo reemplazó, la capa de S3 en la que escribe el lago ni las lecturas en la sombra que hicieron seguro el cutover. El pie de figura es el resultado de Quorum, no la tasa de cambios de Notion.

## Fuentes

- [Herding elephants: Lessons learned from sharding Postgres at Notion, Notion](https://www.notion.com/blog/sharding-postgres-at-notion): los 480 shards lógicos, las 32 bases de datos físicas y la migración.
- [The Great Re-shard: adding Postgres capacity (again) with zero downtime, Notion](https://www.notion.com/blog/the-great-re-shard): el paso a 96 bases de datos físicas y el mapa de shards.
- [Building and scaling Notion's data lake, Notion](https://www.notion.com/blog/building-and-scaling-notions-data-lake): Debezium, Kafka, Hudi, S3 y los 200 mil millones de filas de bloques.
