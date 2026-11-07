import type { Messages } from '../messages.ts'

export const inspectorStorage: Messages['inspectorStorage'] = {
  product: 'プロダクト',
  egressToTheInternetBillsPer:
    'インターネットへのエグレスはGB単位で課金されます。CDNが返す場合は別です。',
  storageClass: 'ストレージクラス',
  cheapestToKeepMediaReadsFail:
    '保持は最も安い。オブジェクトを復元するまで、メディアの読み取りはタイムアウトで失敗します。',
  halfTheStoragePriceAndPer: (p0) => `ストレージ料金は半分で、読み戻しはGBあたり\$${p0}。`,
  fullStoragePriceReadsComeBack: 'ストレージ料金は満額。読み取りはすぐに返ります。',
  lifecycle: 'ライフサイクル',
  off: 'オフ',
  d: (p0) => `${p0}日`,
  ofTheStoreIsOlderThan: (p0, p1) =>
    `ストアの${p0}%が${p1}日より古く、1つ安いクラスへ移ります。アーカイブ済みオブジェクトの読み取りは失敗します。`,
  everyObjectKeepsTheClassAbove: 'どのオブジェクトも古さにかかわらず上のクラスに残ります。',
  noEgressToTheInternet: (wait) =>
    `インターネットへのエグレスはありません。CDNが盤面になければ、読み取りは最初のバイトまでさらに${wait}待ちます。`,
}
