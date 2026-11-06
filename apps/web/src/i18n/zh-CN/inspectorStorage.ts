import type { Messages } from '../messages.ts'

export const inspectorStorage: Messages['inspectorStorage'] = {
  product: '产品',
  egressToTheInternetBillsPer: '出口到互联网按 GB 计费,除非由 CDN 提供。',
  storageClass: '存储类别',
  cheapestToKeepMediaReadsFail: '保存成本最低。对象恢复前，媒体读取会以 timeout 失败。',
  halfTheStoragePriceAndPer: (p0) => `存储价格的一半，每读回 1 GB 收 \$${p0}。`,
  fullStoragePriceReadsComeBack: '完整存储价格。读取立即返回。',
  lifecycle: '生命周期',
  off: '关闭',
  d: (p0) => `${p0} 天`,
  ofTheStoreIsOlderThan: (p0, p1) =>
    `${p0}% 的存储早于 ${p1} 天，会降到便宜一档的类别。读取已归档对象会失败。`,
  everyObjectKeepsTheClassAbove: '无论多旧，每个对象都保持上面的类别。',
  noEgressToTheInternet: (wait) =>
    `没有到互联网的出站流量。除非本板上有 CDN，否则每次读取的首字节要多等 ${wait}。`,
}
