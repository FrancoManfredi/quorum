export const inspectorVec = {
  exactComparesTheQueryToEvery: (
    p0: string | number | null,
    p1: string | number | null,
    p2: string | number | null,
  ) =>
    `Exact compares the query to every vector: every lookup finds its nearest neighbour, at ${p0} a second per size step. HNSW walks a graph instead: ${p1}× the lookups, twice the memory in Burn, and ${p2} recall, so one lookup in twenty quotes the wrong document.`,
  recallBurnS: (p0: string | number | null, p1: string | number | null) =>
    `Recall ${p0} · Burn ${p1}/s`,
  retrieval: 'Retrieval',
  linkANodeThatAnswersPrompts: (p0: string | number | null) =>
    `Link a Node that answers prompts into it and each prompt pays one nearest-neighbour lookup for the documents it quotes. Those answers earn ${p0}% more, and a Python Stack keeps its ML ecosystem bonus only with an index in the path.`,
  nothingAnswersPromptsThroughItYet:
    'Nothing answers prompts through it yet. Link an App Server into it.',
  lookups: 'Lookups',
  s: (p0: string | number | null) => `${p0}/s`,
  load: 'Load',
  ofS: (p0: string | number | null, p1: string | number | null) => `${p0} of ${p1}/s`,
  idle: 'idle',
  recall: 'Recall',
  latency: 'Latency',
  burn: 'Burn',
}
