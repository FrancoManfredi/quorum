import type { Messages } from '../messages.ts'

export const inspectorStorage: Messages['inspectorStorage'] = {
  product: 'Producto',
  egressToTheInternetBillsPer: 'El egress a internet se cobra por GB, a menos que un CDN lo sirva.',
  storageClass: 'Clase de almacenamiento',
  cheapestToKeepMediaReadsFail:
    'Lo más barato de mantener. Las lecturas de contenido multimedia fallan como timeout hasta que se restauran los objetos.',
  halfTheStoragePriceAndPer: (p0: string | number | null) =>
    `La mitad del precio de almacenamiento, y \$${p0} por GB leído.`,
  fullStoragePriceReadsComeBack:
    'Precio completo de almacenamiento. Las lecturas vuelven al instante.',
  lifecycle: 'Ciclo de vida',
  off: 'Desactivado',
  d: (p0: string | number | null) => `${p0} d`,
  ofTheStoreIsOlderThan: (p0: string | number | null, p1: string | number | null) =>
    `El ${p0}% del almacén tiene más de ${p1} días y pasa a una clase más barata. Una lectura de un objeto archivado falla.`,
  everyObjectKeepsTheClassAbove: 'Cada objeto mantiene la clase de arriba, por viejo que sea.',
  noEgressToTheInternet: (wait: string | number) =>
    `Sin egress a internet. Una lectura espera ${wait} más para su primer byte, a menos que haya un CDN en el tablero.`,
}
