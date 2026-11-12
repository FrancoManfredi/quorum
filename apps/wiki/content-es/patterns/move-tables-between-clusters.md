---
title: Mover tablas entre clústeres: GitHub
summary: GitHub dividió un clúster de MySQL en dominios de esquema y luego movió las tablas a clústeres separados con Vitess y un cutover de escrituras.
section: patterns
group: Ran in production
order: 954
aliases: github, mysql, vitess, proxysql, partitioning, schema domains, monolith, particionado, dominios de esquema, monolito, mover tablas
---

GitHub.com funcionó sobre un único clúster de MySQL llamado `mysql1` durante cerca de una década. En 2019 el clúster respondía casi un millón de consultas por segundo, y todas las funcionalidades compartían las mismas tablas. El equipo dividió primero el código: las tablas pasaron a dominios de esquema con nombre, y un linter hacía fallar una compilación cuando una consulta cruzaba el límite de un dominio. Solo entonces se movieron las tablas.

## El sistema

El movimiento usó dos métodos independientes. Vitess puso un proxy delante de MySQL y copió tablas enteras entre clústeres en segundo plano. Un cutover de escrituras a medida se apoyó en la replicación normal de MySQL y en ProxySQL, y la ventana de solo lectura duró decenas de milisegundos. En 2021 las mismas tablas respondían 1.2 millones de consultas por segundo repartidas en varios clústeres, y la carga media de cada host se había reducido a la mitad.

## El tablero

::Design{id="github-move-tables"}

Los dos Servidores de aplicaciones son los dos dominios de esquema, el núcleo y las funcionalidades. Cada uno tiene su propio Pooler de conexiones, que representa a ProxySQL, y su propia Base de datos. La Réplica de lectura es una de las copias de lectura que quitaron carga a la primaria. Los tipos del Balanceador de carga representan la división por dominios, no una separación real de lecturas y escrituras.

## Por qué funciona

La división es virtual antes de ser física. Cuando el código ya no puede hacer joins entre dominios, las tablas pueden moverse un dominio cada vez, y un error se queda dentro de un clúster. [Divide la base de datos por funcionalidad](/patterns/split-the-database-by-feature) y [expand and contract](/patterns/expand-and-contract) son los dos pasos que hacen seguro el movimiento.

## Hasta dónde llega el juego

El Pooler de conexiones del juego es PgBouncer, no Vitess ni ProxySQL, y no puede enrutar una consulta por tabla. El tablero muestra dos dominios y dos bases de datos, no los linters, los procesos VTGate ni las 130 tablas que se movieron en un solo cutover. El pie de figura es el resultado de Quorum, no la tasa de consultas de GitHub.

## Fuentes

- [Partitioning GitHub's relational databases to handle scale, The GitHub Blog](https://github.blog/engineering/infrastructure/partitioning-githubs-relational-databases-scale): los dominios de esquema, los linters, Vitess y el cutover de escrituras.
- [Vitess documentation](https://vitess.io/docs/): el proxy, los procesos VTGate y VTTablet, y el modelo de sharding.
- [ProxySQL](https://proxysql.com/): el pooler de conexiones que GitHub usó para el cutover.
