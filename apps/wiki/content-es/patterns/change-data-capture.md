---
title: Captura de cambios de datos
summary: Lee el registro de cambios de la base de datos y publica cada cambio como un evento, para que el buscador, el almacén de datos y la caché sigan al día sin que la app escriba dos veces.
section: patterns
group: Messaging and async
order: 408
aliases: cdc, debezium, wal, write-ahead log, binlog, logical decoding, dual write, change stream, captura de cambios de datos, registro de escritura anticipada, decodificación lógica, doble escritura, flujo de cambios
---

La captura de cambios de datos (change data capture) convierte el propio registro de la base de datos en un flujo de eventos que otros sistemas siguen.

## Cuándo usarlo

- Una segunda copia de los datos debe seguir a la base de datos: un índice de búsqueda, un almacén de datos, una caché u otro servicio.
- La app escribe ahora mismo en dos almacenes, y estos se desincronizan tras una caída.
- No puedes cambiar a cada escritor para que emita eventos.

## Cómo funciona

Toda base de datos escribe los cambios en un registro antes de aplicarlos. Un conector como Debezium lee ese registro y publica cada inserción, actualización y borrado en un flujo. Los consumidores leen el flujo y aplican los cambios a sus copias. La app escribe una vez, en la base de datos, así que no hay nada que pueda discrepar.

Usa como clave del flujo la clave primaria de la fila. El orden solo se mantiene dentro de una partición, así que un flujo sin clave puede aplicar una escritura vieja después de la más nueva.

## Qué cuesta

Las copias van retrasadas respecto a la base de datos tanto como lo esté el consumidor, y un consumidor que va más atrás que la retención del flujo pierde cambios. Los cambios son a nivel de fila, así que los consumidores ven el esquema, y una migración puede romperlos. Tienes que operar un conector y un flujo. Un consumidor que escribe de vuelta en el origen puede iniciar un bucle.

## En Quorum

::Design{id="cdc-stream"}

Enlaza la [Base de datos](/components/database) con un [Conector CDC](/components/cdc), el conector con un [Flujo de eventos](/components/log), y el flujo con la copia que sigue: un [Motor de búsqueda](/components/search), un [Almacén de datos](/components/warehouse) o una [Caché](/components/cache). El conector no tiene opciones propias. Copia las escrituras que procesa la Base de datos y nunca las ralentiza. La clave y las particiones del flujo fijan el orden y la velocidad de lectura.

El Motor de búsqueda de la imagen también responde las consultas del Servidor de aplicaciones; los demás Nodos extra solo sirven los tipos de petición restantes de la Serie B. Investiga [Captura de cambios de datos](/research/cdc), que necesita [Streaming de eventos](/research/event-streaming) y [Almacenamiento de datos](/research/data-warehouse). El mismo efecto sin un flujo es el [outbox transaccional](/patterns/transactional-outbox). El glosario define [CDC](/glossary/cdc-change-data-capture).
