import type { Messages } from '../messages.ts'

export const inspectorServer: Messages['inspectorServer'] = {
  feeds: 'Reparto',
  pull: 'Pull',
  push: 'Push',
  collector: 'Colector',
  dropEvenly: 'Descartar por igual',
  shedLowValue: 'Descartar lo menos valioso',
  keepKinds: 'Mantener los tipos',
  dropDearest: 'Descartar los más caros',
  readsAnywhere: 'Leer en cualquier sitio',
  readYourWrites: 'Leer tus escrituras',
  overload: 'Sobrecarga',
}
