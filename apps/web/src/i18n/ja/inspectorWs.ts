import type { Messages } from '../messages.ts'

export const inspectorWs: Messages['inspectorWs'] = {
  runtime: 'ランタイム',
  holdsNoConnectionsPickARuntime: (p0) =>
    `${p0}は接続を保持しません。保持するランタイムを選んでください。`,
  holdsAboutConnections: (p0) => `約${p0}接続を保持します。`,
  clients: 'クライアント',
  noPresence: 'プレゼンスなし',
  presence: 'プレゼンス',
  reconnectAtOnce: '即座に再接続',
  backoffWithJitter: 'バックオフとジッター',
  oneBox: '1台',
  clustered: 'クラスター化',
  boxesShareAPubSubBackbone:
    'ボックスはpub/subバックボーンを共有するので、サイズ段階ごとに余地が増えます。',
  oneBoxTakesEveryConnectionLarger:
    '1台がすべての接続を引き受けます。大きいサイズは支出を増やすだけで、余地は増えません。',
  connections: '接続',
  messages: 'メッセージ',
  s: (p0) => `${p0}/s`,
  latency: 'レイテンシ',
  dropped: '破棄',
  burn: '支出',
}
