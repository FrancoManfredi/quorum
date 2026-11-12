---
title: Informes fuera de la primaria, en un almacén
summary: Envía los recorridos de informes a un Almacén de datos columnar, para que la analítica deje de expulsar la caché de búfer de la que dependen los pagos.
section: patterns
group: Scaling steps
order: 121
aliases: olap, oltp, bigquery, redshift, snowflake, analytics, reporting, columnar, data warehouse, analítica, informes, almacén de datos
---

Responde los recorridos de informes desde un Almacén de datos, y reserva la primaria para las transacciones para las que se construyó.

## Cuándo dar el paso

- Los informes se ejecutan en la primaria, y las lecturas y escrituras de todo tipo se ralentizan mientras tanto.
- Un informe expulsa la caché de búfer, así que el siguiente pago lee de disco.
- El volumen de informes crece con el negocio.

## El Diseño

::Design{id="reports-on-warehouse"}

El Servidor de aplicaciones envía los recorridos de informes al Almacén de datos y todo lo demás a la Base de datos. El Almacén no tiene opciones. El Servidor de aplicaciones es algo mayor, porque un recorrido es lento y ocupa un hueco de worker durante toda su ejecución.

## Por qué funciona

Un recorrido en la primaria lee rangos enormes, saca de la memoria las filas calientes y mantiene bloqueos. Un almacén guarda los datos por columna y lee solo las columnas que necesita un informe, así que un recorrido grande sale barato allí. Sin los recorridos, la Base de datos conserva su memoria para las filas que necesitan los pagos, y cada tipo que no es informe va más rápido.

Un Almacén no tiene límite de capacidad y factura por recorrido, así que un mes ajetreado cuesta más y uno tranquilo cuesta poco.

## Qué cuesta

Cada recorrido es lento, así que esto es para informes y no para cargas de página. El almacén necesita datos, y este Diseño no los carga. En los sistemas reales una canalización copia los cambios, y el paso anterior muestra una. Los datos van algo por detrás, y el precio por recorrido castiga a un cuadro de mando que se actualiza cada pocos segundos.

## En Quorum

Coloca un [Almacén de datos](/components/warehouse) tras [Almacenamiento de datos](/research/data-warehouse), y vigila el incidente [El informe tumba la Base de datos](/incidents/report-db). El patrón está en [Separar OLTP y OLAP](/patterns/oltp-and-olap-split), y el glosario tiene [OLTP y OLAP](/glossary/oltp-and-olap). El siguiente paso protege la puerta de entrada: [WAF y gateway al frente](/patterns/waf-and-gateway-at-the-front).
