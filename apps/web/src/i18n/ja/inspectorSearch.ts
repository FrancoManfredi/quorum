import type { Messages } from '../messages.ts'

export const inspectorSearch: Messages['inspectorSearch'] = {
  product: 'プロダクト',
  fullFeaturesOnAJVMShards: 'JVM上のフル機能：シャード、レプリカ、そして調整すべきヒープ。',
  answersHalfAgainAsManyQueries:
    '1つ小さいノードで、より短いホップで1.5倍のクエリに答えられますが、インデックスが育つほど関連性は落ちます。シャードもレプリカもヒープもありません。',
  shardsAndReplicas: 'シャードとレプリカ',
  moreShardsParallelizeTheIndexAnd:
    'シャードを増やすとインデックスが並列化し、すべてのクエリがファンアウトします。レプリカはクエリ容量とマシンとインデックスのコピーを1つずつ足します。',
  heap: 'ヒープ',
  tooSmallGarbageCollectionPauses: '小さすぎ：GCポーズが入ります。',
  tooLargeLongPausesAndLess: '大きすぎ：長いポーズと、少ないファイルシステムキャッシュ。',
  theJVMHeapHoldsCachesWithout:
    'JVMヒープはファイルシステムキャッシュを飢えさせずにキャッシュを保持します。',
  refresh: '更新間隔',
  s: (p0) => `${p0}秒`,
  aNewDocumentIsSearchableWithin:
    '新しいドキュメントは1秒以内に検索できます。代わりにインデックス作成のCPUがかかります。',
  aNewDocumentWaitsUpTo: (p0) =>
    `新しいドキュメントは最大${p0}秒待ちます。インデックス作成は安く、回答はより古くなります。`,
  shardCount: (count) => `${count}シャード`,
  replicaCount: (count) => `${count}レプリカ`,
  heaps: { small: 'RAMの25%', half: 'RAMの50%', large: 'RAMの75%' },
}
