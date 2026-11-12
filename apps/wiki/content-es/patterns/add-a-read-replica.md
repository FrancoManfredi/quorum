---
title: Añadir una réplica de lectura
summary: Copia la Base de datos en una réplica que responde las lecturas, para que la capacidad del primario se dedique a las escrituras y el tráfico de lectura escale horizontalmente.
section: patterns
group: Scaling steps
order: 111
aliases: replica, replication, follower, read scaling, replication lag, stale read, standby reads, réplica, replicación, seguidor, retraso de replicación, lectura obsoleta
---

Enlaza el Servidor de aplicaciones con una Réplica de lectura además del primario, para que las lecturas se repartan entre ambos.

## Cuándo dar el paso

- La barra de carga del primario está llena por las lecturas, y los datos calientes son demasiado grandes o variados para una Caché.
- El primario muestra un límite de disco y el p99 sube.

## El Diseño

::Design{id="primary-alone"}

::Design{id="primary-and-replica"}

En la primera imagen una sola Base de datos se lo lleva todo. En la segunda, el Servidor de aplicaciones escribe en el primario y envía lecturas a los dos. La réplica solo recibe lecturas.

## Por qué funciona

La réplica copia al primario y responde consultas de lectura, así que cada Base de datos carga con más o menos la mitad de las lecturas. La barra de carga del primario baja de lleno, y el p99 pasa de segundos a lo normal.

## Qué cuesta

Una réplica va por detrás del primario, así que algunas lecturas llegan obsoletas. En el registro eso aparece como errores de lectura obsoleta, porque una lectura obsoleta falla una lectura de API o un pago que lee su propia escritura, aunque una vista de página la tolera. El retraso crece con el ritmo de escritura. Las escrituras no escalan en absoluto, así que una carga con muchas escrituras necesita un primario más grande o sharding. Además pagas por una segunda Base de datos.

## En Quorum

Investiga [Réplicas de lectura](/research/replication) para desbloquear la [Réplica de lectura](/components/replica), y luego enlaza la Base de datos con ella: ese enlace envía el registro de escrituras y pone a ambas en un mismo Grupo de datos. El Sandbox [Pago desactualizado](/sandboxes/stale-checkout) muestra la lectura obsoleta, y [Retraso de replicación](/incidents/repl-lag) es el incidente. [Enrutado read-your-writes](/research/ryw-routing) es la reparación. [Réplicas de lectura](/patterns/read-replicas) explica el patrón. El siguiente paso es [enruta lecturas y escrituras por separado](/patterns/route-reads-and-writes-apart).
