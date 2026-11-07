import type { Messages } from '../messages.ts'

export const inspectorCache: Messages['inspectorCache'] = {
  cache: 'キャッシュ',
  aWriteReturnsFromTheCache:
    '書き込みはキャッシュから返り、データベースには遅れて届きます。クラッシュするとフラッシュ前の分は失われます。',
  everyWriteGoesToTheCache:
    'すべての書き込みがキャッシュとデータベースの両方へ行きます。より新しいぶん、書き込みは長くなります。',
  readsComeFromTheCacheWrites:
    '読み取りはキャッシュから返り、書き込みはキャッシュを迂回します。ミスはTTLまで古い行を残すことがあります。',
  everyMiss: 'すべてのミス',
  coalesce: 'まとめる',
  expireOnTheTTL: 'TTLで失効',
  refreshEarly: '早めに更新',
  missOnExpiry: '失効時にミス',
  staleWhileRevalidating: '再検証中は古いまま返す',
  coldStart: 'コールドスタート',
  warmStart: 'ウォームスタート',
}
