---
title: Haz sharding de Postgres tras un router: Figma
summary: Figma mantuvo Postgres y construyó un router de consultas delante de shards horizontales, cuando el particionado vertical se agotó.
section: patterns
group: Ran in production
order: 958
aliases: figma, postgres, sharding, dbproxy, query router, scatter gather, router de consultas
---

Figma ejecutaba una sola base de datos Postgres en la mayor instancia física de AWS en 2020. Dos años después tenía caché, réplicas de lectura y una docena de bases de datos particionadas verticalmente, y las tablas más grandes aún contenían varios terabytes y miles de millones de filas. `VACUUM` sobre esas tablas arriesgaba el límite del ID de transacción, y la unidad mínima del particionado vertical es una tabla.

## El sistema

El equipo hizo sharding horizontal en la capa de aplicación, y luego movió los shards a bases de datos físicas. Un servicio llamado DBProxy analiza cada consulta SQL y la envía al shard que contiene la clave. Una consulta sin clave de sharding se convierte en un scatter-gather por todos los shards, así que la aplicación tiene que aportar la clave. La primera tabla llevó unos nueve meses, y Figma mantuvo Postgres sin shards como vía de vuelta atrás.

## El tablero

::Design{id="figma-shard-router"}

El Pooler de conexiones representa a DBProxy: cada escritura y transacción pasa por él hacia la Base de datos. La Base de datos tiene cuatro shards sobre una clave hash. La Caché responde las lecturas repetidas antes de que lleguen al router. El tablero mantiene el router en la ruta de escritura, porque una lectura sin clave es el caso caro.

## Por qué funciona

Postgres se queda, así que el código del producto y el modelo relacional se quedan. El router oculta el mapa de shards a la aplicación, y la caché mantiene las filas más calientes fuera de la ruta de scatter-gather. [Haz sharding de la base de datos](/patterns/shard-the-database) y [pool de conexiones](/patterns/connection-pooling) son las dos piezas.

## Hasta dónde llega el juego

El Pooler de conexiones del juego es PgBouncer, no un motor de consultas. No puede analizar SQL, enrutar por clave ni hacer scatter-gather. El tablero muestra la forma: un router, muchos shards, una caché delante. El pie de figura es el resultado de Quorum, no la latencia de consultas de Figma.

## Fuentes

- [How Figma's databases team lived to tell the scale, Figma](https://www.figma.com/blog/how-figmas-databases-team-lived-to-tell-the-scale): las particiones verticales, DBProxy, el despliegue de shards y la primera tabla de nueve meses.
- [PostgreSQL documentation: VACUUM](https://www.postgresql.org/docs/current/sql-vacuum.html): por qué el límite del ID de transacción obliga a dividir.
- [PostgreSQL documentation: Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html): el desbordamiento del ID de transacción y el coste de una tabla que crece.
