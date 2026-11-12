---
title: Vistas materializadas y desnormalización
summary: Guarda la respuesta de una consulta costosa, o mantén una copia ya unida de los datos, para que las lecturas dejen de repetir el mismo trabajo una y otra vez.
section: patterns
group: Scaling reads and compute
order: 213
aliases: materialized view, denormalize, denormalization, pre-joined, summary table, refresh, report query, read model, vista materializada, desnormalizar, desnormalización, tabla resumen, actualización, consulta de informe, modelo de lectura
---

Una vista materializada guarda el resultado de una consulta, y la desnormalización almacena los datos con la forma en que se van a leer.

## Cuándo usarlo

- Una consulta de informe o de cuadro de mando recorre tablas grandes y se ejecuta una y otra vez.
- Las lecturas necesitan varios joins, y los mismos joins se ejecutan en cada petición.
- El lector puede aceptar datos tan viejos como la última actualización.

## Cómo funciona

Una vista materializada es una tabla rellenada por una consulta, como los ingresos diarios por región. Las lecturas van al resultado pequeño, y un trabajo de actualización lo recalcula cada pocos minutos u horas. PostgreSQL tiene `REFRESH MATERIALIZED VIEW` para esto. Un informe que recorría 50 millones de filas ahora lee unos cientos.

La desnormalización copia datos en la tabla que los necesita, como guardar el nombre de un cliente en cada pedido, para que una lectura se salte el join. Las lecturas salen más baratas, y cada escritura ahora debe actualizar cada copia.

## Qué cuesta

Ambas ponen datos viejos en pantalla. Una vista está tan desactualizada como su última actualización, y una copia desnormalizada es incorrecta entre una escritura y la actualización de sus copias. La desnormalización además encarece las escrituras y deja que las copias diverjan si una actualización falla. Usa una vista para lecturas que toleran retraso, y conserva una fuente de verdad normalizada.

## En Quorum

Una [Base de datos](/components/database) tiene un interruptor de Vista materializada tras investigar [Vistas materializadas](/research/precompute), que hace que los informes lean un resultado guardado y se nota en respuestas ligeramente desactualizadas. La [Desnormalización](/research/denormalization) no tiene interruptor: abarata las lecturas y encarece las escrituras, y el Diseño la lista como una investigación que necesita.

::Design{id="materialized-report"}

El incidente [El informe tumba la Base de datos](/incidents/report-db) muestra el coste de recorrer tablas en la primaria, y un Almacén de datos es la solución mayor. El glosario define [vista materializada](/glossary/materialized-view) y [desnormalización](/glossary/denormalization).
