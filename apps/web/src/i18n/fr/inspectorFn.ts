import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: 'Exécutions',
  coldStart: 'Démarrage à froid',
  bill: 'Facture',
  inbound: 'Trafic entrant',
  s: (p0) => `${arg(p0)}/s`,
  uses: 'Usages',
  standingBurn: 'Dépenses fixes',
}
