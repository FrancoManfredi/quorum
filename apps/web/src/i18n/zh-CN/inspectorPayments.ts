import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: '收款箱余额',
  drawerSize: '收款箱容量',
  spilled: '溢出损失',
  revenue: '收入',
  s: (p0) => `${arg(p0)}/秒`,
  subscriptions: '订阅',
  burn: '支出',
  salaries: '薪资',
}
