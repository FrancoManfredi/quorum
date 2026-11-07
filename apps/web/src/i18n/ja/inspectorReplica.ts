import type { Messages } from '../messages.ts'

export const inspectorReplica: Messages['inspectorReplica'] = {
  replication: 'レプリケーション',
  asynchronous: '非同期',
  synchronous: '同期',
  noWriteCostAndTheReplica:
    '書き込みのコストはなく、レプリカは遅れます。書き込み直後の読み取りが古いことがあります。',
  everyWriteWaits: (wait) =>
    `すべての書き込みがこのレプリカを${wait}待ちます。ゾーンやリージョンをまたぐともっと待ちます。古い読み取りは返しませんが、落ちている間は書き込みが止まります。`,
}
