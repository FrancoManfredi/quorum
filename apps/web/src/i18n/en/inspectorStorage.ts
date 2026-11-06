export const inspectorStorage = {
  product: 'Product',
  egressToTheInternetBillsPer: 'Egress to the internet bills per GB, unless a CDN serves it.',
  storageClass: 'Storage class',
  cheapestToKeepMediaReadsFail:
    'Cheapest to keep. Media reads fail as timeout until the objects are restored.',
  halfTheStoragePriceAndPer: (p0: string | number | null) =>
    `Half the storage price, and \$${p0} per GB read back.`,
  fullStoragePriceReadsComeBack: 'Full storage price. Reads come back at once.',
  lifecycle: 'Lifecycle',
  off: 'Off',
  d: (p0: string | number | null) => `${p0} d`,
  ofTheStoreIsOlderThan: (p0: string | number | null, p1: string | number | null) =>
    `${p0}% of the store is older than ${p1} days and moves one class cheaper. A read of an archived object fails.`,
  everyObjectKeepsTheClassAbove: 'Every object keeps the class above, however old it is.',
}
