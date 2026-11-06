import type { Messages } from '../messages.ts'

export const inspectorServer: Messages['inspectorServer'] = {
  feeds: 'Fils d’actualité',
  pull: 'Récupération',
  push: 'Envoi direct',
  collector: 'Ramasse-miettes',
  dropEvenly: 'Rejet uniforme',
  shedLowValue: 'Rejeter les faibles valeurs',
  keepKinds: 'Garder les types',
  dropDearest: 'Couper les plus chers',
  readsAnywhere: 'Lecture sur toute réplique',
  readYourWrites: 'Lire ses propres écritures',
  overload: 'Surcharge',
}
