import type { Messages } from '../messages.ts'

export const glossary: Messages['glossary'] = {
  category: 'カテゴリ',
  all: 'すべて',
  met: '達成',
  inTheGame: 'ゲーム内では',
  related: '関連',
  learnMore: 'さらに詳しく',
  glossary: '用語集',
  ofTermsMet: (met, total) => `${total}語中${met}語`,
  searchTheGlossary: '用語集を検索',
  terms: '用語',
  noMatches: '該当なし',
  performance: 'パフォーマンス',
  reliability: '信頼性',
  observability: '可観測性',
  data: 'データ',
  runtimes: 'ランタイム',
  network: 'ネットワーク',
  security: 'セキュリティ',
  delivery: 'デリバリー',
  team: 'チーム',
  business: 'ビジネス',
  cveDefinition: (score, components) => `スコアは${score}/10。${components}に影響します。`,
  cveInGame: (cost, minutes) =>
    `セキュリティのメールがこれを名指しし、パッチのチケットを起票します。${cost}、公開から${minutes}分後が期限です。期限を過ぎるとチームのバックログで赤くなり、その1分後に悪用されます。`,
}
