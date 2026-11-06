import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: '收款箱余额',
  drawerSize: '收款箱容量',
  spilled: '溢出损失',
  revenue: '收入',
  s: (p0) => `${p0}/秒`,
  subscriptions: '订阅',
  burn: '支出',
  salaries: '薪资',
  provider: '服务商',
  firstProvider: '第一家',
  secondProvider: '第二家',
  aSecondProviderCharges: (extra) =>
    `第二家服务商每笔结账多收 ${extra}%，并且在第一家宕机时继续提供服务。`,
  oneProviderTakesEveryCheckout:
    '只有一家服务商处理每笔结账。它宕机时，结账会一直失败，直到它恢复。',
}
