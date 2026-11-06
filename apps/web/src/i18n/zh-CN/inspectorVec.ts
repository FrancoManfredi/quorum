import type { Messages } from '../messages.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (p0, p1, p2) =>
    `精确索引把查询与每个向量比较：每次查找都能找到最近邻，每个规格档位每秒 ${p0}。HNSW 则遍历一张图：查找量为 ${p1} 倍，内存的支出翻倍，召回率为 ${p2}，所以每二十次查找就有一次引用了错误的文档。`,
  recallBurnS: (p0, p1) => `召回率 ${p0} · 消耗 ${p1}/秒`,
  retrieval: '检索',
  linkANodeThatAnswersPrompts: (p0) =>
    `把回答提示的节点连接到它，每个提示都要为所引用的文档付出一次最近邻查找。这些回答多赚 ${p0}%，而 Python 技术栈只有在路径上有索引时，才能保留它的 ML 生态加成。`,
  nothingAnswersPromptsThroughItYet: '目前还没有节点通过它回答提示。请把应用服务器连接到它。',
  lookups: '查询',
  s: (p0) => `${p0}/秒`,
  load: '负载',
  ofS: (p0, p1) => `${p0} / ${p1}/秒`,
  idle: '空闲',
  recall: '召回率',
  latency: '延迟',
  burn: '支出',
  index: '索引',
  nodesRetrieveFromIt: (count) => `${count} 个节点从中检索。`,
}
