---
title: Pool de conexiones
summary: Pon un pooler entre la app y la base de datos para que muchas conexiones de la app compartan unas pocas conexiones a la base de datos.
section: patterns
group: Scaling reads and compute
order: 209
aliases: pgbouncer, connection pool, max connections, too many connections, session pooling, transaction pooling, pool de conexiones, pooling de conexiones, demasiadas conexiones, máximo de conexiones
---

Un pooler de conexiones mantiene un conjunto pequeño de conexiones abiertas a la base de datos y las presta a las conexiones de la app solo mientras trabajan.

## Cuándo usarlo

- La base de datos registra "too many connections" después de añadir servidores de aplicaciones o workers.
- La mayoría de las conexiones de la app están ociosas entre consultas.
- Cada proceso de la app abre su propio pool, así que el total crece con cada despliegue.

## Cómo funciona

Una conexión a la base de datos es costosa. PostgreSQL arranca un proceso por cada una y por defecto admite 100 conexiones. Si 20 servidores de aplicaciones mantienen cada uno un pool de 20, son 400 conexiones para una base de datos que admite 100. Un pooler como PgBouncer acepta las 400 y reenvía las consultas por unas pocas decenas.

El modo fija cuánto tiempo se presta una conexión. El modo de sesión la retiene durante toda la sesión del cliente, así que ahorra poco. El modo de transacción la devuelve después de cada transacción, que es la elección habitual. El modo de sentencia la devuelve después de cada sentencia y no puede ejecutar una transacción de varias sentencias.

## Qué cuesta

El modo de transacción rompe todo lo que dependa del estado de la sesión, como variables de sesión, advisory locks y, en algunas configuraciones, prepared statements. El pooler es además un salto más y una pieza más que mantener en marcha. El pooling oculta una escasez de conexiones, pero no hace más rápida la base de datos.

## En Quorum

Coloca un [Pooler de conexiones](/components/pooler) entre el [Servidor de aplicaciones](/components/server) y la [Base de datos](/components/database) después de investigar [Pooling de conexiones](/research/pooling). El modo es el único ajuste.

::Design{id="pooled"}

El incidente [Agotamiento de conexiones](/incidents/connections) es lo que previene. El glosario define el [pool de conexiones](/glossary/connection-pooling).
