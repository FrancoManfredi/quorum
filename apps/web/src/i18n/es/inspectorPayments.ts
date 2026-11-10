import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: 'En el cajón',
  drawerSize: 'Tamaño del cajón',
  spilled: 'Desbordado',
  revenue: 'Ingresos',
  s: (p0: string | number | null) => `${p0}/s`,
  subscriptions: 'Suscripciones',
  burn: 'Gasto',
  salaries: 'Salarios',
  provider: 'Proveedor',
  firstProvider: 'Primero',
  secondProvider: 'Segundo',
  aSecondProviderCharges: (extra: string | number) =>
    `Un segundo proveedor cobra un ${extra}% más por checkout y sigue sirviendo cuando el primero está caído.`,
  oneProviderTakesEveryCheckout:
    'Un solo proveedor se lleva todos los checkouts. Cuando está caído, los checkouts fallan hasta que vuelve.',
}
