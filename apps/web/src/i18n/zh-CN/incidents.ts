import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const incidents: Messages['incidents'] = {
  ignored: '已忽略',
  s: (p0) => `${arg(p0)} 秒`,
  rollBack: '回滚',
  researchToRollBack: (p0) => `研究${arg(p0)}后可回滚`,
  file: '归档',
  actionItem: (p0) => `待办事项：${arg(p0)}`,
  fileAndLeaveTheActionItem: '归档并保留待办项：此故障的发生概率仍为两倍',
  showDetails: '查看详情',
  users: '用户',
  revenue: '收入',
}
