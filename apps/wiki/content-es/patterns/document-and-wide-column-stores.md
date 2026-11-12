---
title: Almacenes documentales y de columnas anchas
summary: Usa un almacén documental para datos que se leen y escriben por clave con una forma cambiante, y uno de columnas anchas cuando las escrituras superan una máquina, y acepta a qué renuncia cada uno.
section: patterns
group: Scaling steps
order: 114
aliases: nosql, mongodb, dynamodb, firestore, cassandra, quorum, tunable consistency, leaderless, almacén documental, columnas anchas, quórum, consistencia ajustable, sin líder
---

Mueve los datos que una tabla relacional encaja mal a un almacén documental o a uno de columnas anchas, y deja en la Base de datos lo que necesita joins.

## Cuándo dar el paso

- El esquema cambia sin parar y las funcionalidades salen despacio porque cada cambio es una migración.
- El trabajo son documentos leídos por clave, como un perfil, un carrito o una página de ajustes.
- Las escrituras superan a una Base de datos, incluso con una máquina más grande, y puedes vivir sin joins.

## El Diseño

::Design{id="document-store"}

El Servidor de aplicaciones llama a un Almacén de documentos para los documentos y a un Proveedor de pagos para los cobros. Un pago escribe varios documentos, así que **Multi-document transactions** está activado, lo que mantiene atómico el pedido.

::Design{id="wide-column-quorum"}

El segundo Diseño usa un Almacén de columnas anchas con N réplicas por clave. Una escritura espera a **W** de ellas y una lectura pregunta a **R**.

## Por qué funciona

Un almacén documental cambia los joins por rapidez de cambio: sin migración, sin pool que compartir y una tasa plana para lecturas y escrituras. Un almacén de columnas anchas reparte cada clave entre N réplicas y no tiene primario único, así que las escrituras escalan horizontalmente. Cuando R más W es mayor que N, una lectura siempre pregunta al menos a una réplica que tiene la última escritura.

## Qué cuesta

Un almacén documental no tiene joins, así que un pago o un informe que abarca documentos cuesta más trabajo, y sin transacciones un pago puede quedar guardado a medias. Un almacén de columnas anchas gasta N operaciones de réplica en cada escritura, así que un ajuste fuerte cuesta capacidad y reduce la tasa. Un ajuste débil es barato y sirve lecturas obsoletas. Ni siquiera un quórum fuerte es linealizable, así que mantén los pagos en un almacén relacional.

## En Quorum

El [Almacén de documentos](/components/doc) necesita [Bases de datos documentales](/research/document-db). El [Almacén de columnas anchas](/components/wide) necesita [Sharding](/research/sharding) y luego [Replicación sin líder](/research/leaderless). Atento al incidente [Clave caliente](/incidents/hot-key). Consulta [quórum](/glossary/quorum) y [consistencia eventual](/glossary/eventual-consistency), y el patrón sobre [Lecturas y escrituras de quórum](/patterns/quorum-reads-and-writes). El siguiente paso mantiene separados varios almacenes: [Divide la base de datos por funcionalidad](/patterns/split-the-database-by-feature).
