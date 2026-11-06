import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: 'En caisse',
  drawerSize: 'Capacité de la caisse',
  spilled: 'Revenus perdus',
  revenue: 'Revenus',
  s: (p0) => `${arg(p0)}/s`,
  subscriptions: 'Abonnements',
  burn: 'Dépenses',
  salaries: 'Salaires',
}
