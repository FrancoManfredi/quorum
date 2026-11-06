import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const nodeList: Messages['nodeList'] = {
  nodes: '节点',
  s: (p0) => `${arg(p0)}/秒`,
}
