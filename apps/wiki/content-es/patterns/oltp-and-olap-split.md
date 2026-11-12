---
title: Separar OLTP y OLAP
summary: Ejecuta los informes en un almacén columnar aparte, para que los grandes recorridos dejen de expulsar la caché y de frenar la base de datos que atiende a los usuarios.
section: patterns
group: Scaling data
order: 310
aliases: olap, oltp, data warehouse, bigquery, redshift, snowflake, analytics database, reporting, columnar, almacén de datos, base de datos analítica, informes, columnar
---

Deja la analítica en un almacén que guarda columnas, y reserva la base de datos transaccional para las lecturas y escrituras pequeñas que los usuarios esperan.

## Cuándo usarlo

- Un informe o una exportación dispara la CPU de la primaria y ralentiza los pagos.
- Los analistas quieren recorrer meses de historial, y la base de datos de producción no puede guardarlo todo de forma barata.
- Las consultas agregan unas pocas columnas sobre millones de filas.

## Cómo funciona

Una base de datos transaccional guarda cada fila junta, lo que sirve para traer un pedido. Un almacén guarda cada columna junta, así que sumar `amount` sobre 100 millones de filas lee una columna, no la tabla entera. Las filas llegan al almacén por una canalización, a menudo con [captura de cambios de datos](/patterns/change-data-capture), así que la aplicación nunca lo consulta para el tráfico en vivo.

Un gran recorrido en la primaria también saca las filas calientes de su caché de búfer, así que las lecturas normales van a disco después. Ese segundo daño es la razón por la que un solo informe nocturno puede frenar toda la tarde.

## Qué cuesta

El almacén va por detrás de la primaria por el retraso de la canalización, así que los informes muestran datos algo viejos. Pagas por recorrido o por byte leído, y una consulta descuidada puede salir cara. También operas una canalización y mantienes dos esquemas sincronizados. Una réplica absorbe carga de lectura pero no la analítica de recorridos pesados, porque tiene la misma disposición por filas.

## En Quorum

::Design{id="warehouse-for-reports"}

Los demás Nodos de la imagen solo atienden los otros tipos de petición de la Serie B, como los pagos y el tiempo real. Las peticiones de informe envían recorridos. Con solo una [Base de datos](/components/database), los recorridos se ejecutan allí. Con un [Almacén de datos](/components/warehouse) enlazado, los recorridos van a él, y la Base de datos atiende solo a los usuarios. Un recorrido en el almacén es lento pero no tiene límite de capacidad, y se factura por recorrido. El juego no modela cuán desactualizada está la copia del almacén.

El almacén se desbloquea con [Almacenamiento de datos](/research/data-warehouse). El incidente [El informe tumba la Base de datos](/incidents/report-db) es lo que evita. El glosario define [OLTP y OLAP](/glossary/oltp-and-olap). [Informes fuera de la primaria](/patterns/reports-off-the-primary-warehouse) es el paso.
