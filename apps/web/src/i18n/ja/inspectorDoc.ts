import type { Messages } from '../messages.ts'

export const inspectorDoc: Messages['inspectorDoc'] = {
  oneDocument: '単一ドキュメント',
  multiDocument: 'マルチドキュメント',
  aCheckoutWritesSeveralDocumentsWithout:
    'チェックアウトは複数のドキュメントを書きます。マルチドキュメントトランザクションがなければ一部だけ書かれて残りが落ちることがあり、リトライはカードにもう一度課金します。あればすべての書き込みが他の書き込みを待つので、レイテンシは1.5倍になります。',
  accessPatterns: 'アクセスパターン',
  thereAreNoJoinsAQuery: (p0, p1) =>
    `結合はありません。ドキュメントをまたぐクエリはスキャンになり、操作は${p0}倍、機能が必要とする新しいパターンごとに、書き込むべきコレクションとインデックスが増えます。データの形を変える機能なら、マイグレーションがない分、開発時間が${p1}%少なく済みます。ほかの機能は少し高くつきます。`,
  theTeamPanelChargesTheDev:
    'チームパネルは開発時間を計上します。データベースはこのトレードオフの反対側で、結合とスキーマをマイグレーションの代償とともに提供します。',
  inbound: '流入',
  s: (p0) => `${p0}/s`,
  load: '負荷',
  idle: 'アイドル',
  joins: '結合',
  connections: '接続',
  noneToPool: 'プールする接続なし',
  latency: 'レイテンシ',
  burn: '支出',
  transactions: 'トランザクション',
  multiDocumentValue: 'マルチドキュメント',
  oneDocumentValue: '単一ドキュメント',
  ofOpsPerSecond: (load, capacity) => `${load} / ${capacity} ops/s`,
}
