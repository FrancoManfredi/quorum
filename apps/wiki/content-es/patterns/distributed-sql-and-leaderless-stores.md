---
title: SQL distribuido y almacenes sin líder
summary: Sustituye los shards hechos a mano por un almacén que replica por sí solo, ya sea sin líder con quórums ajustables o SQL sobre Raft, y elige según si necesitas que cada lectura sea correcta.
section: patterns
group: Scaling steps
order: 127
aliases: cassandra, cockroachdb, raft, quorum, leaderless replication, wide column, newsql, tunable consistency, n r w, SQL distribuido, replicación sin líder, columnas anchas, consistencia ajustable, quórum
---

Deja que el almacén se encargue de la replicación y la división: un almacén sin líder para la velocidad, o SQL distribuido para la corrección.

## Cuándo dar el paso

- Hacer resharding a mano cuesta Horas de desarrollo que no tienes, y las transacciones entre shards fallan.
- Una carga de feed o de logs escribe mucho más de lo que puede asumir un primario único.
- Un pago debe ser correcto en todas partes, y una réplica que se retrasa no es aceptable.

## El Diseño

::Design{id="quorum-store"}

El Almacén de columnas anchas sin líder replica cada clave en N nodos. Una lectura pregunta a R de ellos y una escritura espera a W. Una Base de datos se queda a su lado para los tipos que el almacén no admite.

::Design{id="distributed-sql"}

SQL distribuido pone un almacén SQL sobre Raft. Cada escritura espera a una mayoría de sus réplicas, así que toda lectura la ve.

## Por qué funciona

Cuando R más W supera N, una lectura siempre se encuentra con un nodo que recibió la última escritura. Bajar R o W lo hace más rápido y deja pasar lecturas obsoletas. SQL distribuido da esa garantía para las transacciones y cuesta más latencia por escritura.

Ni siquiera un quórum fuerte es una transacción. Un pago en el almacén de columnas anchas sigue saliendo mal de vez en cuando, así que usa SQL distribuido para el dinero y un almacén sin líder para los feeds.

## Qué cuesta

Ambos facturan varios nodos a la vez, y SQL distribuido factura más. Ninguno admite búsquedas ni subidas de archivos, así que se queda una Base de datos para ellas. Una división puede perder una réplica, y un quórum que necesita todas las réplicas entonces rechaza. Ambos pueden también hacer **Spread** entre regiones, que es lo que usa el paso multirregión. El juego no modela una transacción ligera en el almacén de columnas anchas.

## En Quorum

Coloca un [Almacén de columnas anchas](/components/wide) o [SQL distribuido](/components/dsql). Investiga [Replicación sin líder](/research/leaderless) o [Bases de datos de consenso](/research/consensus). Lee sobre [quórums](/glossary/quorum), [Raft](/glossary/raft) y [El nivel de datos](/explanation/the-data-tier). El siguiente paso, [logs, métricas y trazas](/patterns/logs-metrics-and-traces), muestra dónde gastan su tiempo estos almacenes.
