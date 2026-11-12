---
title: Añadir una caché
summary: Coloca una Caché entre el Servidor de aplicaciones y la Base de datos para que las lecturas repetidas se respondan desde memoria y la Base de datos conserve su capacidad para las escrituras.
section: patterns
group: Scaling steps
order: 110
aliases: redis, memcached, ttl, hit ratio, in memory, read heavy, cache aside, añadir una caché, tasa de aciertos, en memoria, lecturas intensivas
---

Coloca una Caché entre el Servidor de aplicaciones y la Base de datos para responder desde memoria las lecturas repetidas.

## Cuándo dar el paso

- La CPU de la Base de datos está alta y casi todo su trabajo son consultas de lectura.
- El p99 sube con los Usuarios mientras el Servidor de aplicaciones aún tiene margen.

## El Diseño

::Design{id="reads-hit-database"}

::Design{id="cache-in-front"}

En la primera imagen, cada consulta de lectura llega a la Base de datos. En la segunda, el Servidor de aplicaciones llama a la Caché, y la Caché llama a la Base de datos solo cuando hay un fallo de caché (miss). Las escrituras pasan de largo.

## Por qué funciona

La Caché sirve por sí misma la parte de lecturas que equivale a su tasa de aciertos. La Base de datos ve una fracción menor, así que su barra de carga baja y el p99 cae. Redis responde con un solo hilo, que es mucho más de lo que necesita este tráfico. El TTL cambia tasa de aciertos por frescura: uno más largo retiene más aciertos y sirve datos más viejos.

## Qué cuesta

Compras lecturas obsoletas. Una escritura invalida los datos, pero una condición de carrera de cache-aside puede conservar una fila vieja hasta que termine su TTL, así que el registro muestra una pequeña proporción de lecturas obsoletas. Una mezcla con muchas escrituras hace bajar la tasa de aciertos. Una Caché nueva o recién reiniciada empieza en frío, y la Base de datos soporta toda la carga hasta que se llena. Si la memoria es demasiado pequeña para los datos calientes, los aciertos bajan a medida que crecen los Usuarios.

## En Quorum

Investiga [Caché](/research/caching) para desbloquear la [Caché](/components/cache). El Sandbox [Mayoría de lecturas](/sandboxes/read-mostly) muestra el síntoma. [Cache-aside](/patterns/cache-aside) explica el patrón, y [Protección contra estampidas](/research/stampede-protection) resuelve un arranque en frío. El siguiente paso es [añadir una réplica de lectura](/patterns/add-a-read-replica).
