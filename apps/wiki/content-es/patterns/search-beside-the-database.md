---
title: Búsqueda junto a la base de datos
summary: Pon la búsqueda de texto completo en su propio Motor de búsqueda, para que una consulta pesada deje de quitar CPU y caché a los pagos y a las escrituras.
section: patterns
group: Scaling steps
order: 113
aliases: elasticsearch, opensearch, meilisearch, full text search, inverted index, search index, lucene, búsqueda de texto completo, índice invertido, índice de búsqueda
---

Dale a la búsqueda su propio índice en un Motor de búsqueda y enlaza el Servidor de aplicaciones a él, para que la Base de datos deje de responder búsquedas.

## Cuándo dar el paso

- La CPU de la Base de datos sube a medida que crece la cuota de Búsqueda en la mezcla, y todas las demás consultas se ralentizan con ella.
- La latencia de búsqueda es alta aunque la Base de datos tenga margen para lecturas puntuales.
- Quieres ordenar resultados por relevancia o tolerar erratas, algo que una consulta `LIKE` no puede hacer de forma barata.

## El Diseño

::Design{id="search-engine"}

Los Usuarios llaman al Servidor de aplicaciones. Las consultas de búsqueda van al Motor de búsqueda, y todo lo demás sigue yendo a la Base de datos. La Base de datos guarda las filas y sigue siendo la fuente de verdad. El índice es una copia construida para la consulta.

## Por qué funciona

Un Motor de búsqueda mantiene un índice invertido, que asigna cada palabra a los documentos que la contienen, así que una consulta lee unas pocas listas en lugar de recorrer filas. Una vez enlazado un Motor de búsqueda, la Base de datos deja de responder búsquedas por completo, y la barra de carga de la Base de datos baja.

El **Intervalo de refresco** es la palanca que importa. Un documento nuevo no se puede buscar hasta el siguiente refresco, así que un intervalo corto es fresco y cuesta CPU de indexación, y uno largo responde más consultas por segundo pero devuelve resultados más obsoletos. Los shards y las réplicas de Elasticsearch cambian fan-out por capacidad de consulta.

## Qué cuesta

Ahora mantienes dos copias de los datos. Si la aplicación escribe en ambas en una misma petición, una caída entre las dos escrituras las deja en desacuerdo, y el juego lo cuenta como resultados de búsqueda obsoletos. Un [Outbox transaccional](/patterns/transactional-outbox) o la [captura de cambios de datos](/patterns/stream-changes-with-cdc) cierra la brecha. Meilisearch es más barato y rápido, pero no tiene shards, réplicas ni heap, y su relevancia cae a medida que crece el índice.

## En Quorum

Coloca un [Motor de búsqueda](/components/search) tras [Búsqueda de texto completo](/research/full-text-search). El patrón está en [Búsqueda de texto completo y el índice invertido](/patterns/full-text-search-and-inverted-index), y el glosario define el [índice invertido](/glossary/inverted-index). El siguiente paso guarda datos que no caben en filas: [Almacenes documentales y de columnas anchas](/patterns/document-and-wide-column-stores).
