---
title: CQRS
summary: CQRS usa un modelo para cambiar los datos y otro distinto para leerlos, de modo que cada lado se pueda modelar y escalar para su propio trabajo.
section: patterns
group: Outside the game
order: 1002
aliases: cqrs, command query responsibility segregation, read model, write model, query side, segregación de responsabilidades de comandos y consultas, modelo de lectura, modelo de escritura, lado de consulta
---

Command Query Responsibility Segregation (segregación de responsabilidades de comandos y consultas) usa un modelo separado para los comandos que cambian el estado y para las consultas que lo leen. Pueden ser clases distintas en un mismo servicio o bases de datos distintas.

Úsalo cuando las lecturas y las escrituras tienen formas distintas. Un pago escribe un pedido normalizado en cinco tablas, mientras que la página del historial de pedidos quiere una fila plana por pedido con el nombre del producto ya incluido. Un almacén de lectura construido para esa página, y escalado aparte del almacén de escritura, responde con una sola búsqueda. Las pantallas colaborativas o basadas en tareas también ganan, ya que los comandos pueden ser pequeños y específicos y así entran menos en conflicto.

El coste es un segundo modelo que mantener sincronizado. Cuando el almacén de lectura es independiente, es eventualmente consistente, así que un usuario puede guardar un pedido y no verlo durante un momento, y el código debe manejarlo. La mensajería entre los lados trae duplicados y reintentos. Martin Fowler advierte de que para la mayoría de los sistemas CQRS añade una complejidad arriesgada, y de que un diseño CRUD simple encaja mejor en muchos dominios. Empieza con una Réplica de lectura o una vista antes de dividir el modelo.

## Lo más parecido en Quorum

El juego construye el lado de lectura sin el modelo dividido. Una [Réplica de lectura](/patterns/read-replicas) sirve consultas desde una copia retrasada, y las [Vistas materializadas y desnormalización](/patterns/materialized-views-and-denormalization) guardan la respuesta que necesita una página. La [Captura de cambios de datos](/patterns/change-data-capture) alimenta un segundo almacén desde el registro de escrituras, y el [Conector CDC](/components/cdc) es el Componente. Investiga [Desnormalización](/research/denormalization) y [Captura de cambios de datos](/research/cdc), y lee [Separar OLTP y OLAP](/patterns/oltp-and-olap-split) para la misma idea aplicada a los informes.

## Referencias

- [CQRS, Martin Fowler](https://martinfowler.com/bliki/CQRS.html): la definición breve y la advertencia de que la mayoría de los sistemas no lo necesitan.
- [CQRS pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs): almacenes separados, problemas de consistencia y cuándo usarlo.
- [CQRS, microservices.io](https://microservices.io/patterns/data/cqrs.html): cómo responde CQRS a las consultas que abarcan varios servicios.
