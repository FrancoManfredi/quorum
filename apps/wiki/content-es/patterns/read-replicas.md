---
title: Réplicas de lectura
summary: Copia la base de datos a seguidores que sirven lecturas, para que el tráfico de lectura escale hacia fuera mientras una primaria recibe las escrituras.
section: patterns
group: Scaling reads and compute
order: 205
aliases: replica, replication, replication lag, read scaling, stale read, read your writes, réplica, replicación, retraso de replicación, escalado de lectura, lectura obsoleta, lectura de tus propias escrituras
---

Una réplica de lectura es una copia de la base de datos primaria que responde consultas pero no acepta escrituras.

## Cuándo usarlo

- Las lecturas superan con mucho a las escrituras, y la CPU de la primaria se va sobre todo en consultas de lectura.
- Los informes o los trabajos de búsqueda ralentizan las consultas que esperan los usuarios.
- Algunas páginas pueden tolerar datos que tengan un momento de antigüedad.

## Cómo funciona

La primaria transmite sus cambios a cada réplica, que los aplica en orden. La aplicación envía las escrituras a la primaria y reparte las lecturas entre las réplicas. Tres réplicas pueden servir aproximadamente tres veces el volumen de lectura, mientras la primaria conserva toda su capacidad para escrituras.

La replicación suele ser asíncrona, así que una réplica va por detrás de la primaria unos milisegundos, y minutos si se queda atrás. Un usuario que guarda un perfil y recarga puede leer el antiguo. El arreglo habitual es la lectura de tus propias escrituras: enviar las lecturas de un usuario a la primaria durante un rato breve tras escribir.

## Qué cuesta

Compras lecturas obsoletas y una regla de enrutado a cambio de capacidad de lectura. Las escrituras no escalan en absoluto, así que una carga con muchas escrituras necesita [sharding](/patterns/sharding), no más réplicas. Cada réplica además repite cada escritura, así que las réplicas se quedan atrás primero cuando sube la tasa de escritura.

## En Quorum

Coloca una [Réplica de lectura](/components/replica) junto a la Base de datos y enlaza el Servidor de aplicaciones a ambas, tras investigar [Réplicas de lectura](/research/replication). Las lecturas van a cualquiera, y las escrituras van solo a la primaria. La replicación síncrona es una opción que hace que cada escritura espere a la réplica, y necesita [Replicación síncrona](/research/sync-replication).

::Design{id="read-replica"}

Vigila los incidentes [Retraso de replicación](/incidents/repl-lag) y [Lecturas obsoletas](/incidents/stale-read). [Enrutado read-your-writes](/research/ryw-routing) es el arreglo, y [Escalar la base de datos](/guides/scale-the-database) lo pone en orden. El glosario define las [réplicas de lectura](/glossary/read-replica) y el [retraso de replicación](/glossary/replication-lag).
