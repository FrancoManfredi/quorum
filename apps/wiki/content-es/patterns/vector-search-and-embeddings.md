---
title: Búsqueda vectorial y embeddings
summary: Guarda embeddings de tus documentos en un Índice vectorial y busca los más cercanos antes de cada prompt, para que las respuestas usen tus propios datos en lugar de solo los del modelo.
section: patterns
group: Scaling steps
order: 134
aliases: vector database, embeddings, rag, retrieval augmented generation, hnsw, nearest neighbour, pgvector, pinecone, qdrant, recall, base de datos vectorial, generación aumentada por recuperación, vecino más cercano, recuperación
---

Recupera los documentos más cercanos por significado y entrégalos al modelo junto con el prompt.

## Cuándo dar el paso

- Las respuestas de la IA suenan genéricas, porque el modelo nunca ha visto tus documentos.
- La búsqueda por palabras clave se pierde resultados que significan lo mismo con otras palabras.
- El modelo se inventa hechos sobre tu producto.

## El Diseño

::Design{id="vector-index"}

El Servidor de aplicaciones llama a la Base de datos, al Índice vectorial y a la API de LLM. Para un prompt busca primero los embeddings más cercanos, y luego consulta al modelo.

## Por qué funciona

El índice guarda cada documento como un vector y devuelve los más cercanos. Un índice exacto compara la consulta con cada vector, lo que es perfecto pero se ralentiza a medida que el índice crece. HNSW recorre un grafo en su lugar, así que responde más consultas y mantiene una alta proporción de vecinos verdaderos.

Un prompt respondido con documentos recuperados rinde más. Un Stack de Python obtiene una bonificación adicional, ya que puede ejecutar modelos pequeños en proceso, aunque PyPy no puede.

## Qué cuesta

El índice vive en memoria, así que HNSW factura más memoria que un índice exacto. Un índice aproximado se pierde un vecino de vez en cuando, lo que se lleva parte de la mejora y devuelve un resultado obsoleto. Los errores del pie de figura son esos fallos, contados como resultados obsoletos. La calidad de los embeddings, el troceado y el reordenado quedan fuera del juego, que solo modela la búsqueda y su recall.

## En Quorum

Coloca un [Índice vectorial](/components/vec) y enlaza el Servidor de aplicaciones a él. Fija el **Tipo de índice**. Investiga [Embeddings](/research/embeddings) y [Modelos alojados](/research/hosted-models). Lee [inferencia de modelo](/glossary/model-inference).
