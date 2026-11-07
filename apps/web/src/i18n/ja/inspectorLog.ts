import type { Messages } from '../messages.ts'

export const inspectorLog: Messages['inspectorLog'] = {
  partitions: 'パーティション',
  keyed: 'キー指定',
  roundRobin: 'ラウンドロビン',
  oneKeyKeepsAnEntityIn:
    '1つのキーはエンティティを1つのパーティションに保つので、そのイベントは順序どおりに残ります。ホットキーはパーティションを埋め、遅くします。',
  eventsSpreadEvenlyAndOrderIs:
    'イベントは均等に分散し、順序は失われます。置き換えられた書き込みが、それを置き換えた書き込みの後に着地することがあります。',
  aConsumerGroupReadsOneConsumer: (p0) =>
    `コンシューマーグループはパーティションごとに1つのコンシューマーを読むので、このストリームは最大${p0}/sしか渡しません。`,
  durability: '耐久性',
  retention: '保持',
  messagesStayAfterTheyAreRead:
    'メッセージは読まれた後も残るので、コンシューマーはデータベースに触れずに、新しいインデックスや2つ目のワーカーへ再生できます。保持期間より遅れたコンシューマーは最も古いイベントを失います。',
  inbound: '流入',
  s: (p0) => `${p0}/s`,
  lag: 'ラグ',
  behind: '遅延中',
  caughtUp: '追随済み',
  s2: (p0) => `${p0}秒`,
  replicas: 'レプリカ',
  burn: '支出',
  aProducerWaitsForTheAppend: (multiple) =>
    `プロデューサーは5 msの追記の${multiple}倍待ちます。2つ目以降のレプリカはブローカーの支出の半分を追加で請求されます。`,
  replicaCount: (count) => `${count}レプリカ`,
  oneReplicaHoldsTheOnlyCopy:
    'レプリカが1つだけで唯一のコピーを保持します。落ちたブローカーは抱えていたすべてのイベントを失います。',
  aBrokerThatFailsLoses: (share) =>
    `落ちたブローカーは、抱えていたイベントの${share}%を失います。レプリカがコピーしていなかった分です。`,
  everyReplicaHadEveryEvent:
    'すべてのレプリカがあらゆる承認済みイベントを持っていたので、ブローカーが落ちても失うものはありません。',
  events: (count) => `${count}イベント`,
  replicasAndAcks: (replicas, acks) => `${replicas} · acks ${acks}`,
}
