---
title: 'Indexar los blobs: Dropbox'
summary: Dropbox puso un Block Index en MySQL con sharding delante de los bloques inmutables de Magic Pocket, así que una lectura era una búsqueda por hash y una obtención de bloque.
section: patterns
group: Ran in production
order: 962
aliases: dropbox, magic pocket, object storage, block index, exabyte, erasure coding, almacenamiento de objetos, índice de bloques, exabytes, codificación de borrado
---

En 2016 Dropbox sacó los datos de sus archivos de S3 y los llevó a Magic Pocket, su propio almacén de varios exabytes. Un archivo se corta en bloques de hasta 4 MB, cada bloque recibe un hash SHA-256, y el hash va a un Block Index en MySQL con sharding. Una lectura busca el hash y obtiene el bloque.

## El sistema

Los bloques se empaquetan en buckets de 1 GB y se escriben en volúmenes repartidos entre máquinas, en forma replicada o con codificación de borrado, en tres zonas de EE. UU. El Block Index es un clúster MySQL con sharding detrás de una capa RPC, y decide qué volúmenes contienen un bloque. El Watcher muestrea el 1% de los bloques escritos y los obtiene de nuevo al cabo de un minuto, una hora, un día, una semana y un mes. El escáner de metadatos recorre el índice a cerca de un millón de bloques por segundo.

## El tablero

::Design{id="dropbox-block-index"}

El Almacenamiento de objetos es el almacén de bloques: bloques inmutables, con el hash como clave. La Base de datos es el Block Index, cuatro shards con clave hash. El Servidor de aplicaciones calcula el hash del bloque, lo escribe en el almacenamiento y escribe su hash y su ubicación en el índice.

## Por qué funciona

Los bloques son inmutables, así que el índice solo añade y nunca actualiza una fila. El índice es diminuto junto a los bytes, así que un clúster MySQL con sharding puede contenerlo mientras los bloques viven en discos baratos. Una lectura es una búsqueda por hash y una obtención. [Almacenamiento de objetos y reglas de ciclo de vida](/patterns/object-storage-and-lifecycle-rules) y [haz sharding de la base de datos](/patterns/shard-the-database) son las dos mitades.

## Hasta dónde llega el juego

El Almacenamiento de objetos del juego es un servicio gestionado, no el hardware propio de Magic Pocket. El tablero no puede mostrar los bloques de 4 MB, los buckets de 1 GB, la codificación de borrado ni las tres zonas. Muestra la división: un índice por hash delante de un almacén de bloques inmutables. El pie de imagen es el resultado de Quorum, no los exabytes de Dropbox.

## Fuentes

- [Inside the Magic Pocket, Dropbox](https://dropbox.tech/infrastructure/inside-the-magic-pocket): los bloques, los buckets, los volúmenes, el Block Index en MySQL con sharding y el diseño multizona.
- [Scaling to exabytes and beyond, Dropbox](https://dropbox.tech/infrastructure/magic-pocket-infrastructure): por qué Dropbox dejó S3 y qué tenía que hacer el almacén.
- [Pocket watch: Verifying exabytes of data, Dropbox](https://dropbox.tech/infrastructure/pocket-watch): el escáner y el Watcher que muestrean y vuelven a obtener bloques.
