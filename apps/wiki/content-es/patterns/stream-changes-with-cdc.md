---
title: Transmite los cambios con CDC
summary: Lee el log de escritura de la Base de datos y publica cada cambio en un flujo, para que la búsqueda y otras copias sigan a los datos sin una segunda escritura.
section: patterns
group: Scaling steps
order: 120
aliases: change data capture, debezium, kafka, event stream, dual write, binlog, write ahead log, captura de cambios de datos, flujo de eventos, escritura doble, log de escritura anticipada
---

Publica cada cambio del log de escritura en un Flujo de eventos, y deja que los consumidores construyan sus copias a partir de él.

## Cuándo dar el paso

- La aplicación escribe en la Base de datos y en el índice de búsqueda en una misma petición, y los dos se desincronizan.
- Un almacén de datos, una caché u otro servicio necesita seguir a los datos.
- Aparecen resultados de búsqueda obsoletos tras una caída entre las dos escrituras.

## El Diseño

::Design{id="cdc-feed"}

El Servidor de aplicaciones escribe una vez, en la Base de datos. El Conector CDC lee el log de la Base de datos y publica cada cambio en el Flujo de eventos. El flujo alimenta al Motor de búsqueda, que aplica cada cambio a su índice mientras sigue respondiendo las consultas del Servidor de aplicaciones. El flujo tiene **Con clave por entidad**, así que los cambios de una fila se quedan en una partición y llegan en orden.

## Por qué funciona

La aplicación nunca escribe el mismo hecho dos veces, así que una caída no puede dejar las copias en desacuerdo para siempre. El conector lee el log, así que no añade trabajo a una escritura. El flujo conserva sus mensajes, así que un índice nuevo puede reproducirlos, y un segundo consumidor también puede leerlos.

Vigila el retraso del consumidor, no el conector. Un índice lento se ve como un retraso creciente, y el arreglo está en el consumidor o en el flujo.

## Qué cuesta

Añades un conector y un flujo, y cada uno tiene su propio Gasto y sus propios modos de fallo. La copia es eventualmente consistente, así que una búsqueda puede perderse la fila más reciente durante un momento. Un consumidor que va más atrás que la ventana de retención pierde los cambios más antiguos. Un flujo sin clave con varias particiones puede aplicar un cambio viejo después de uno más nuevo.

## En Quorum

El [Conector CDC](/components/cdc) necesita [Captura de cambios de datos](/research/cdc), que sigue a [Streaming de eventos](/research/event-streaming) y [Almacenamiento de datos](/research/data-warehouse). Colócalo junto al [Flujo de eventos](/components/log). El patrón es la [Captura de cambios de datos](/patterns/change-data-capture), y la opción más antigua es el [Outbox transaccional](/patterns/transactional-outbox). El glosario tiene [CDC](/glossary/cdc-change-data-capture). El siguiente paso saca los informes de la primaria: [Informes fuera de la primaria, en un almacén](/patterns/reports-off-the-primary-warehouse).
