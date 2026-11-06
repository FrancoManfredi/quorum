import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const nodeList: Messages['nodeList'] = {
  nodes: 'Nœuds',
  s: (p0) => `${arg(p0)}/s`,
}
