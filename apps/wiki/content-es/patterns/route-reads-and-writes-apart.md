---
title: Enruta lecturas y escrituras por separado
summary: Envía las escrituras a la primaria y las lecturas a una réplica, y devuelve a la primaria las lecturas que siguen a una escritura para que los usuarios nunca vean que falta su propio cambio.
section: patterns
group: Scaling steps
order: 112
aliases: read write split, read replica routing, read your writes, replica lag, stale read, primary and replica, separación de lectura y escritura, enrutado a réplicas, retraso de réplica, lectura obsoleta, primaria y réplica
---

Enlaza el Servidor de aplicaciones tanto a la Base de datos primaria como a una Réplica de lectura, y activa read-your-writes para que una escritura reciente nunca se lea de una copia obsoleta.

## Cuándo dar el paso

- La barra de carga de la Base de datos está en rojo y la mayor parte de su trabajo son consultas de lectura.
- Las lecturas posteriores a una escritura vuelven `stale`, o aparece en el banner un incidente de Retraso de replicación.
- Una [Caché](/patterns/cache-aside) no puede guardar los datos, porque cambian demasiado a menudo o varían demasiado.

## El Diseño

::Design{id="read-write-split"}

Los Usuarios llaman al Servidor de aplicaciones. El Servidor de aplicaciones envía las escrituras a la Base de datos y reparte las lecturas entre ambos Nodos. La Réplica aplica cada escritura que recibe la primaria y solo responde lecturas. **Read your writes** es un ajuste del Servidor de aplicaciones, no de la Réplica, porque el Servidor de aplicaciones decide adónde va una lectura.

## Por qué funciona

Las lecturas superan a las escrituras en la mayoría de los productos, así que sacarlas de la primaria la deja libre para las escrituras y para las lecturas que deben ser frescas. La barra de carga de la Base de datos baja.

Read-your-writes cubre el punto débil. Una réplica va por detrás de la primaria un momento, así que un usuario que guarda un perfil y recarga puede leer la copia antigua. Con el ajuste activado, el Servidor de aplicaciones envía a la primaria la lectura de un pago, y la mayoría de las lecturas que siguen a una escritura.

## Qué cuesta

La segunda máquina repite cada escritura, así que una mezcla con muchas escrituras no gana nada. Una pequeña parte de las lecturas aún puede ser obsoleta, porque el enrutado oculta la mayor parte del retraso y no todo. Una réplica síncrona elimina la obsolescencia, pero entonces cada escritura la espera.

Las escrituras no escalan en absoluto. Cuando llenan la primaria, recurre al [sharding](/patterns/sharding), no a más réplicas.

## En Quorum

Coloca una [Réplica de lectura](/components/replica) tras la Investigación [Réplicas de lectura](/research/replication), y activa **Read your writes** en el [Servidor de aplicaciones](/components/server) cuando [Enrutado read-your-writes](/research/ryw-routing) esté hecho. Vigila [Retraso de replicación](/incidents/repl-lag) y [Lecturas obsoletas](/incidents/stale-read), que es un incidente de Caché que el mismo ajuste también previene. [Escalar la base de datos](/guides/scale-the-database) ordena los pasos, y [Réplicas de lectura](/patterns/read-replicas) cubre el patrón. El siguiente paso mueve la búsqueda a su propia máquina: [Búsqueda junto a la base de datos](/patterns/search-beside-the-database).
