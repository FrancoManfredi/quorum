import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (p0) => `${p0}/秒`,
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
  notes: {
    compute: '应用服务器、Worker、边缘和平台节点',
    data: '数据库、缓存、连接池、副本及其他',
    storage: '存储的 GB，按每 GB 每秒计价',
    egress: '源站和 CDN 的出站字节',
    thirdParty: '支付手续费、扫描、令牌和消息',
    requests: '网关、无服务器和边缘函数的请求，按使用量计价',
    observability: '分析采样与保留',
    salaries: '工程师，按语言和策略',
  },
  thirdParties: '第三方',
  cloudBill: '云账单',
  billExplainer:
    '账单随时代的成本指数变化，因此会随公司成长而上涨。网关按每次请求计费，无服务器函数的请求和 GB 秒以及边缘函数的请求也一样：“请求”这一行就是它们所服务的流量。',
}
