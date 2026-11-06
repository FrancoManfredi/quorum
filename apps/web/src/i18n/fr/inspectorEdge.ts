import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: 'Plafonds',
  edgeCache: 'Cache de périphérie',
  inbound: 'Trafic entrant',
  s: (p0) => `${arg(p0)}/s`,
  latency: 'Latence',
  cPUCeiling: 'Plafond CPU',
  stack: 'Pile',
  uses: 'Usages',
  standingBurn: 'Dépenses fixes',
}
