The Vector Index stands for pgvector, Pinecone and Qdrant: the place a company's embeddings live so that a prompt can retrieve them.

## When to place it

- Place it when `ai` is worth earning more from than it costs to serve, and the loop is a product feature rather than a demo: search over your own documents, a support assistant, a recommender. It unlocks with [Embeddings](/research/embeddings) in Series B, for 16,000 ◇.
- Move from Exact to HNSW when the lookups, not the vectors, are the limit.

## How it works

It answers nearest-neighbour lookups, `q-search`, at **500 a second** at its first size and twice that at each of its six sizes. Each lookup takes twenty milliseconds, and the index it searches lives in memory.

A prompt that reaches an index retrieves from it. Link the App Server, Worker or [Serverless Function](/components/fn) that answers `ai` into the Vector Index, and each prompt pays one lookup for the documents it quotes. Those answers earn **35% more**, because they use the company's own data instead of only the model's. An approximate index takes its recall's share of that lift, so HNSW earns a little less per prompt than Exact and answers twice as many.

It also unlocks Python's ML ecosystem bonus, as the [Runtimes](/runtimes) page describes. A Python Stack's `+20%` on `ai` needs an index in the path, because a small model in process is only worth having when it has something to embed and something to quote.

Search requests route to it too, because a similarity search is a search. A Design with both a Vector Index and a [Search Engine](/components/search) splits its searches between them. The Search Engine matches keywords, and the Vector Index matches meaning.

## Options

| Type  | Lookups | Memory                                                          | Recall                                               |
| ----- | ------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| Exact | 1×      | 1×                                                              | 100%: every lookup finds its true nearest neighbour. |
| HNSW  | 2×      | 2×: the graph sits beside the vectors, and bills twice the Burn | 95%: one lookup in twenty quotes the wrong document. |

Exact scans every vector. That is perfect, but slow once the collection outgrows a scan. HNSW walks a graph instead, which is what a real index does at scale, and it gives up a little recall for it.

## How it fails

- **Recall.** An approximate index misses a true neighbour now and then. A search that needed that document comes back stale, and a prompt that quoted it earns less.
- **Memory.** The index is resident, so its size decides how many vectors fit and its type decides how much of the box they take. HNSW bills twice the Burn for the same vectors.
- **The lookup is not free.** Each prompt waits for its lookup before the model starts. Twenty milliseconds is cheap next to a model's first token, and it is latency all the same.
- **A prompt with no index.** Remove the link and the prompt is answered from the model alone: no lift, no Python bonus, and nothing of the company's own in the answer.

## Tips

- Link it to every Node that answers `ai`, not just the App Servers. A Worker that answers a batch of prompts retrieves too.
- Start with Exact: it is the honest index for a small collection, and it costs half the memory.
- Pair it with a [Cache](/components/cache): the same prompt asked twice retrieves the same documents twice.
