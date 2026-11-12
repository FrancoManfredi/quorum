---
title: Búsqueda de texto completo y el índice invertido
summary: Indexa cada palabra con los documentos que la contienen en un motor de búsqueda aparte, para que una consulta lea unas pocas listas cortas en lugar de recorrer cada fila.
section: patterns
group: Scaling data
order: 309
aliases: search, elasticsearch, opensearch, meilisearch, lucene, inverted index, relevance, tokenizer, búsqueda, índice invertido, relevancia, tokenizador, búsqueda de texto completo
---

Un motor de búsqueda construye un índice invertido, que asigna cada palabra a los documentos que la contienen, para que una consulta lea unas pocas listas en lugar de cada fila.

## Cuándo usarlo

- Los usuarios escriben texto libre y esperan resultados ordenados y tolerantes a erratas, y `LIKE '%word%'` es lento.
- Las consultas de búsqueda usan tanta CPU de la base de datos que los pagos se ralentizan.
- Necesitas filtros, facetas o sugerencias además del texto.

## Cómo funciona

Al escribir, el motor divide el texto en términos y guarda, para cada término, la lista ordenada de los documentos que lo contienen. Una consulta de `red shoes` obtiene dos listas y las intersecta. El índice se divide en shards para poder crecer, y cada shard tiene réplicas que responden consultas y sobreviven a un fallo.

Un documento nuevo no es buscable al instante. El motor refresca a intervalos, a menudo de un segundo, y un intervalo más largo ahorra trabajo de indexación a costa de resultados más obsoletos. El índice de búsqueda es una copia, así que algo debe mantenerlo sincronizado con la base de datos: consulta la [captura de cambios de datos](/patterns/change-data-capture).

## Qué cuesta

Operas un segundo sistema que nunca es la fuente de verdad, y puede desviarse de la base de datos. Más shards añaden un fan-out, porque cada consulta pregunta a todos. Un intervalo de refresco más largo devuelve resultados de hace unos segundos. Los equipos que se saltan el paso de sincronización encuentran elementos borrados que aún aparecen en los resultados.

## En Quorum

::Design{id="search-index-tuned"}

Sin un [Motor de búsqueda](/components/search), la [Base de datos](/components/database) responde las búsquedas por sí misma, con mucha más CPU que una lectura normal. Importa la elección de producto de la tarjeta: Elasticsearch y OpenSearch admiten shards, réplicas y un ajuste de heap, y Meilisearch ejecuta un solo nodo sin nada de eso, y su relevancia se degrada a medida que crece el índice.

La búsqueda se desbloquea con [Búsqueda de texto completo](/research/full-text-search). Desde la Serie B el juego también cuenta una parte de las respuestas de búsqueda como obsoletas cuando la app escribe en ambos almacenes y nada transporta el cambio, hasta que hay un [Outbox transaccional](/research/outbox) o un [Conector CDC](/components/cdc). El glosario define el [índice invertido](/glossary/inverted-index).
