---
title: Un pooler entre los servidores y la base de datos
summary: Pon un Pooler de conexiones entre los Servidores de aplicaciones y la Base de datos para que muchas conexiones de la aplicación compartan unas pocas conexiones de la base de datos.
section: patterns
group: Scaling steps
order: 107
aliases: connection pooling, pgbouncer, max connections, too many connections, connection pool, proxy, pooling de conexiones, demasiadas conexiones, pool de conexiones
---

Coloca un Pooler de conexiones delante de la Base de datos y apunta cada Servidor de aplicaciones a él.

## Cuándo dar el paso

- La tarjeta de la Base de datos indica que rechaza consultas por demasiadas conexiones mientras su CPU no está llena.
- Añadir un Servidor de aplicaciones, o desplegar, empeora los errores.

## El Diseño

::Design{id="pools-exhaust-database"}

::Design{id="pooler-shares-connections"}

Las dos imágenes ejecutan los mismos servidores. En la primera, cada worker de PHP-FPM mantiene su propia conexión, así que dos servidores piden más de lo que la Base de datos permite y se rechazan peticiones. En la segunda, los servidores se conectan al pooler, que mantiene unas pocas conexiones con la Base de datos.

## Por qué funciona

Postgres crea un proceso por conexión, así que su límite llega pronto. El pooler convierte muchas conexiones de cliente cortas en unas pocas de servidor largas. La tarjeta de la Base de datos en la segunda imagen muestra un recuento de conexiones pequeño y estable, y las peticiones rechazadas desaparecen.

## Qué cuesta

El pooler añade un pequeño salto y un Nodo más que puede fallar. El modo transacción rompe el código que mantiene estado de sesión, como las sentencias preparadas o los ajustes a nivel de sesión, así que una parte de las peticiones falla hasta que tu Equipo termine la tarea Eliminar el estado de sesión. El modo sentencia no puede ejecutar una transacción que abarque varias sentencias, así que los pagos fallan. El modo sesión no rompe nada y ayuda poco.

## En Quorum

Investiga [Pooling de conexiones](/research/pooling) para desbloquear el [Pooler de conexiones](/components/pooler). El Sandbox [Límite de conexiones](/sandboxes/connection-limit) muestra el fallo, y [Agotamiento de conexiones](/incidents/connections) es el incidente. [Pool de conexiones](/patterns/connection-pooling) cubre el patrón. El siguiente paso es [DNS por delante](/patterns/dns-in-front).
