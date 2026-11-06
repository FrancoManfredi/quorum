import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const churn: Messages['churn'] = {
  open: 'Ouvrir',
  show: (p0) => `Afficher ${arg(p0)}`,
  node: 'Nœud',
  users: (p0) => `${arg(p0)} utilisateurs`,
  n1Day: (p0) => `Dans 1 jour : ${arg(p0)}`,
  whyUsersLeave: 'Pourquoi les utilisateurs partent',
}
