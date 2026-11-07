import type { Messages } from '../messages.ts'

export const inspectorCdc: Messages['inspectorCdc'] = {
  changeStream: '変更ストリーム',
  itReadsEveryWriteOffThe:
    'データベースの書き込みログからすべての書き込みを読み取り、イベントストリームへ流します。だから検索エンジンやデータウェアハウスは、アプリが二重に書かなくてもデータベースに追随できます。',
  linkADatabaseIntoItAnd:
    '何かを運ばせる前に、データベースをこれに、これをイベントストリームにリンクしてください。',
  readingPublishingTo: (p0, p1) => `${p0}を読み取り、${p1}へ配信しています。`,
  itAddsLagAConsumerReads:
    '遅延が加わります。コンシューマーは自分のペースでストリームを読むので、検索結果やレポートはストリームのラグだけ遅れます。順序が保たれるのはパーティションの中だけで、それを決めるのはストリームのキーです。',
  notBuiltTheDualWriteInconsistency:
    '未構築：これが取り除く二重書き込みの不整合。ビルドが二度書くことはないからです。',
  changes: '変更',
  s: (p0) => `${p0}/s`,
  load: '負荷',
  ofS: (p0, p1) => `${p0} / ${p1}/s`,
  idle: 'アイドル',
  lag: 'ラグ',
  caughtUp: '追随済み',
  sBehind: (p0) => `${p0}秒の遅れ`,
  noStream: 'ストリームなし',
  published: '配信',
  latency: 'レイテンシ',
  burn: '支出',
}
