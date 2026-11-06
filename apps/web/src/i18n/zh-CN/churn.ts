import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const churn: Messages['churn'] = {
  open: '打开',
  show: (p0) => `查看${arg(p0)}`,
  node: '节点',
  users: (p0) => `${arg(p0)} 位用户`,
  n1Day: (p0) => `1 天后：${arg(p0)}`,
  whyUsersLeave: '用户为何流失',
}
