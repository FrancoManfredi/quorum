import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: '执行',
  coldStart: '冷启动',
  bill: '账单',
  inbound: '入站',
  s: (p0) => `${arg(p0)}/秒`,
  uses: '用量',
  standingBurn: '固定支出',
}
