import type { Messages } from '../messages.ts'

export const inspectorStorage: Messages['inspectorStorage'] = {
  product: 'Produit',
  egressToTheInternetBillsPer:
    'La sortie vers Internet est facturée au Go, sauf si un CDN la sert.',
  storageClass: 'Classe de stockage',
  cheapestToKeepMediaReadsFail:
    'Le moins cher à conserver. Les lectures média échouent en timeout tant que les objets ne sont pas restaurés.',
  halfTheStoragePriceAndPer: (p0) => `Moitié du prix de stockage, et \$${p0} par Go relu.`,
  fullStoragePriceReadsComeBack: 'Prix de stockage complet. Les lectures reviennent aussitôt.',
  lifecycle: 'Cycle de vie',
  off: 'Désactivé',
  d: (p0) => `${p0} j`,
  ofTheStoreIsOlderThan: (p0, p1) =>
    `${p0} % du stock est plus ancien que ${p1} jours et passe une classe moins chère. La lecture d’un objet archivé échoue.`,
  everyObjectKeepsTheClassAbove: 'Chaque objet garde la classe ci-dessus, quel que soit son âge.',
  noEgressToTheInternet: (wait) =>
    `Aucune sortie vers Internet. Une lecture attend ${wait} de plus pour son premier octet, sauf si un CDN est sur le plateau.`,
}
