import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (p0) => `${arg(p0)}/秒`,
  burn: '支出',
  revenue: '收入',
  margin: '利润率',
  compute: '计算',
  data: '数据',
  storage: '存储',
  egress: '出站流量',
  requests: '请求',
  observability: '可观测性',
  salaries: '薪资',
}
