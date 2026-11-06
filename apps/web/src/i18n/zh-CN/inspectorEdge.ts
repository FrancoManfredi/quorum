import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: '上限',
  edgeCache: '边缘缓存',
  inbound: '入站',
  s: (p0) => `${arg(p0)}/秒`,
  latency: '延迟',
  cPUCeiling: 'CPU 上限',
  stack: '技术栈',
  uses: '用量',
  standingBurn: '固定支出',
}
