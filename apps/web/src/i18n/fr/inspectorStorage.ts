import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorStorage: Messages['inspectorStorage'] = {
  product: 'Produit',
  egressToTheInternetBillsPer:
    'La sortie vers Internet est facturée au Go, sauf si un CDN la sert.',
  storageClass: 'Classe de stockage',
  cheapestToKeepMediaReadsFail:
    'Le moins cher à conserver. Les lectures média échouent en timeout tant que les objets ne sont pas restaurés.',
  halfTheStoragePriceAndPer: (p0) => `Moitié du prix de stockage, et \$${arg(p0)} par Go relu.`,
  fullStoragePriceReadsComeBack: 'Prix de stockage complet. Les lectures reviennent aussitôt.',
  lifecycle: 'Cycle de vie',
  off: 'Désactivé',
  d: (p0) => `${arg(p0)} j`,
  ofTheStoreIsOlderThan: (p0, p1) =>
    `${arg(p0)} % du stock est plus ancien que ${arg(p1)} jours et passe une classe moins chère. La lecture d’un objet archivé échoue.`,
  everyObjectKeepsTheClassAbove: 'Chaque objet garde la classe ci-dessus, quel que soit son âge.',
}
