import type { Messages } from '../messages.ts'

export const inspectorCi: Messages['inspectorCi'] = {
  deployStrategy: '部署策略',
  deploysInMinABadDeploy: (p0, p1) => `部署耗时 ${p0} 分钟；糟糕的部署最多会让 ${p1} 的请求失败。`,
  deploysADayAtThisBuild: (p0) => `按此构建与策略，每天部署 ${p0} 次。`,
  deploys: '部署次数',
  deployTime: '部署耗时',
  min: (p0) => `${p0} 分钟`,
  blastRadius: '影响范围',
  upTo: (p0) => `最多 ${p0}`,
  burn: '支出',
  s: (p0) => `${p0}/秒`,
  perDay: (count) => `${count}/天`,
}
