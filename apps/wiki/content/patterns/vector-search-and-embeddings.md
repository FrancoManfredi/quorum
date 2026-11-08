---
title: Vector search and embeddings
summary: Keep embeddings of your documents in a Vector Index and look up the nearest ones before each prompt, so answers use your own data instead of only the model's.
section: patterns
group: Scaling steps
order: 134
aliases: vector database, embeddings, rag, retrieval augmented generation, hnsw, nearest neighbour, pgvector, pinecone, qdrant, recall
---

Retrieve the closest documents by meaning, and hand them to the model with the prompt.

## Move up when

- AI answers sound generic, because the model has never seen your documents.
- Keyword search misses results that mean the same thing in other words.
- The model invents facts about your product.

## The Design

::Design{id="vector-index"}

The App Server calls the Database, the Vector Index and the LLM API. For a prompt it looks up the nearest embeddings first, then asks the model.

## Why it works

The index holds each document as a vector and returns the nearest ones. An exact index compares the query to every vector, which is perfect but slows as the index grows. HNSW walks a graph instead, so it answers more queries and keeps a high share of true neighbours.

A prompt answered with retrieved documents earns more. A Python Stack gets a further bonus, since it can run small models in process, though PyPy cannot.

## What it costs

The index lives in memory, so HNSW bills more memory than an exact index. An approximate index misses a neighbour now and then, which takes part of the lift and returns a stale result. The caption's errors are those misses, counted as stale results. Embedding quality, chunking and reranking are outside the game, which models only the lookup and its recall.

## In Quorum

Place a [Vector Index](/components/vec) and link the App Server to it. Set **Index type**. Research [Embeddings](/research/embeddings) and [Hosted models](/research/hosted-models). Read [model inference](/glossary/model-inference).
