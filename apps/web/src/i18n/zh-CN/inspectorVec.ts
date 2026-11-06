import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (p0, p1, p2) =>
    `Exact compares the query to every vector: every lookup finds its nearest neighbour, at ${arg(p0)} a second per size step. HNSW walks a graph instead: ${arg(p1)}× the lookups, twice the memory in Burn, and ${arg(p2)} recall, so one lookup in twenty quotes the wrong document.`,
  recallBurnS: (p0, p1) => `召回率 ${arg(p0)} · 消耗 ${arg(p1)}/秒`,
  retrieval: '检索',
  linkANodeThatAnswersPrompts: (p0) =>
    `Link a Node that answers prompts into it and each prompt pays one nearest-neighbour lookup for the documents it quotes. Those answers earn ${arg(p0)}% more, and a Python Stack keeps its ML ecosystem bonus only with an index in the path.`,
  nothingAnswersPromptsThroughItYet:
    'Nothing answers prompts through it yet. Link an App Server into it.',
  lookups: '查询',
  s: (p0) => `${arg(p0)}/秒`,
  load: '负载',
  ofS: (p0, p1) => `${arg(p0)} / ${arg(p1)}/秒`,
  idle: '空闲',
  recall: '召回率',
  latency: '延迟',
  burn: '支出',
}
