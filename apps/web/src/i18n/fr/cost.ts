import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (p0) => `${arg(p0)}/s`,
  burn: 'Dépenses',
  revenue: 'Revenus',
  margin: 'Marge',
  compute: 'Calcul',
  data: 'Données',
  storage: 'Stockage',
  egress: 'Trafic sortant',
  requests: 'Requêtes',
  observability: 'Observabilité',
  salaries: 'Salaires',
}
