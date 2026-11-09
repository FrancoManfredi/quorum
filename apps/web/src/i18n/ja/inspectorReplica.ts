import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'レプリケーション',
  primary: 'プライマリ',
  primaryNote: (name) =>
    `${name}が書き込みを受けます。このノードはそのコピーから読み取りを返します。`,
  noSinglePrimary:
    'この設計には複数のデータベースがあるため、このリードレプリカに単一のプライマリはありません。',
  asynchronous: '非同期',
  synchronous: '同期',
  runsThePrimaryEngine: 'プライマリと同じエンジンで動きます。',
  noWriteCostAndTheReplica:
    '書き込みのコストはなく、レプリカは遅れます。書き込み直後の読み取りが古いことがあります。',
  everyWriteWaits: (wait) =>
    `すべての書き込みがこのレプリカを${wait}待ちます。ゾーンやリージョンをまたぐともっと待ちます。古い読み取りは返しませんが、落ちている間は書き込みが止まります。`,
}
