import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: 'En caisse',
  drawerSize: 'Capacité de la caisse',
  spilled: 'Revenus perdus',
  revenue: 'Revenus',
  s: (p0) => `${p0}/s`,
  subscriptions: 'Abonnements',
  burn: 'Dépenses',
  salaries: 'Salaires',
  provider: 'Fournisseur',
  firstProvider: 'Premier',
  secondProvider: 'Second',
  aSecondProviderCharges: (extra) =>
    `Un second fournisseur facture ${extra} % de plus par paiement et continue de servir quand le premier est en panne.`,
  oneProviderTakesEveryCheckout:
    'Un seul fournisseur prend chaque paiement. Quand il est en panne, les paiements échouent jusqu’à son retour.',
}
