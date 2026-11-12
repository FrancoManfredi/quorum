---
title: Nueve servidores, una base de datos: Stack Overflow
summary: Stack Overflow mantuvo un solo SQL Server y un puñado de grandes servidores web, y puso Redis y Elasticsearch a su lado.
section: patterns
group: Ran in production
order: 950
aliases: stack overflow, stackexchange, monolith, scale up, one database, sql server, redis, elasticsearch, monolito, escalar verticalmente, una base de datos
---

A principios de 2016 Stack Overflow servía unos 209 millones de peticiones HTTP al mes. Las atendían nueve servidores web IIS principales, detrás de cuatro balanceadores de carga HAProxy, con una primaria de SQL Server, un standby en caliente, copias de solo lectura, dos servidores Redis y tres servidores Elasticsearch. La serie de arquitectura de Nick Craver enumera cada máquina.

## El sistema

El sitio era una sola aplicación .NET, multi-tenant para toda la red Stack Exchange, detrás de cuatro balanceadores de carga HAProxy. Redis guardaba una caché L1/L2. Elasticsearch respondía las búsquedas, de modo que la base de datos solo veía las escrituras y los fallos de caché. La base de datos siguió siendo una máquina grande con un standby en caliente, y cuando el equipo necesitó más, compró RAM y un disco más rápido antes de plantearse el sharding.

## El tablero

::Design{id="so-nine-servers"}

El Balanceador de carga representa las cuatro máquinas HAProxy. Nueve copias de Servidor de aplicaciones representan los nueve servidores IIS principales. La Caché es Redis, la Base de datos es la primaria de SQL Server y su standby, y el Motor de búsqueda son las tres máquinas Elasticsearch. Los enlaces son la ruta de la petición: la aplicación lee la caché, un fallo cruza a la base de datos, y la búsqueda va a su propia capa.

## Por qué funciona

La forma gasta dinero en tres cosas que quitan trabajo a la base de datos: una gran caché de búfer, una capa de Redis y una capa de búsqueda. La base de datos se queda con las escrituras y con las lecturas que fallan en la capa de Redis. [Escala primero hacia arriba](/patterns/scale-up-first) es la misma decisión, y [búsqueda junto a la base de datos](/patterns/search-beside-the-database) es la tercera capa.

## Hasta dónde llega el juego

Quorum no tiene SQL Server, así que la Base de datos ejecuta Postgres en el tablero, y el pie de figura es el resultado de Quorum, no la latencia del sitio. El tablero no puede mostrar una caché de búfer de 384 GB ni las copias SQL de solo lectura. Muestra la forma: una base de datos primaria con una caché y una capa de búsqueda a su lado.

## Fuentes

- [Stack Overflow: The Architecture, 2016 Edition, Nick Craver](https://nickcraver.com/blog/2016/02/17/stack-overflow-the-architecture-2016-edition/): la lista de servidores, el número de peticiones y las capas de caché y búsqueda.
- [Stack Overflow: The Hardware, 2016 Edition, Nick Craver](https://nickcraver.com/blog/2016/03/29/stack-overflow-the-hardware-2016-edition/): la RAM, el disco y la red de cada máquina.
- [Engineering Stack Overflow with Roberta Arcoverde, Hanselminutes #847](https://hanselminutes.com/847/engineering-stack-overflow-with-roberta-arcoverde): la visión de 2022 de la misma arquitectura y del equipo que la opera.
