import type { Messages } from '../messages.ts'

export const inspectorVec: Messages['inspectorVec'] = {
  exactComparesTheQueryToEvery: (p0, p1, p2) =>
    `厳密検索はクエリをすべてのベクトルと比較します。どの検索も最近傍を見つけ、サイズ段階あたり毎秒${p0}です。HNSWはグラフをたどります：検索は${p1}倍、支出のメモリは2倍、再現率${p2}なので、20回に1回は間違ったドキュメントを引用します。`,
  recallBurnS: (p0, p1) => `再現率${p0} · 支出${p1}/s`,
  retrieval: '検索方式',
  linkANodeThatAnswersPrompts: (p0) =>
    `プロンプトに答えるノードをリンクすると、各プロンプトは引用するドキュメントのために最近傍検索を1回払います。その回答は${p0}%多く稼ぎ、Pythonスタックは経路にインデックスがあるときだけMLエコシステムのボーナスを保てます。`,
  nothingAnswersPromptsThroughItYet:
    'まだ何もこれを通してプロンプトに答えていません。アプリサーバーをリンクしてください。',
  lookups: '検索回数',
  s: (p0) => `${p0}/s`,
  load: '負荷',
  ofS: (p0, p1) => `${p0} / ${p1}/s`,
  idle: 'アイドル',
  recall: '再現率',
  latency: 'レイテンシ',
  burn: '支出',
  index: 'インデックス',
  nodesRetrieveFromIt: (count) => `${count}ノードがここから取得しています。`,
}
