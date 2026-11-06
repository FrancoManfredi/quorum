import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: '变体',
  forwardsTCPTenTimesTheThroughput:
    '转发 TCP：吞吐量十倍、0.2 毫秒，价格更低。它不解析 HTTP，因此无法按类型路由，也无法重试。',
  readsHTTPRoutesByKindRetries: '解析 HTTP：可按类型路由、重试并做健康检查。吞吐量较低，跳转更长。',
  policy: '策略',
  sessions: '会话',
  balanced: '均衡',
  sticky: '粘性',
  everyRequestGoesWhereTheAlgorithm: '每个请求都按算法分配的目标走。',
  off: '关闭',
  on: '开启',
  healthChecks: '健康检查',
  s: (p0) => `${p0} 秒`,
  shallow: '浅层',
  deep: '深层',
  routes: '路由',
  stickyHolds:
    '用户会一直停留在最初访问的目标上。最老的副本承载的用户最多，目标宕机会带走它的会话，而进程内缓存和实时客户端会保持热状态。',
  slowStart: '慢启动',
  slowStartOn: '新副本逐步接收流量，因此冷启动的 Java 副本不会以冷启动速度响应。',
  slowStartOff: '新副本会一次性承担它的全部份额。',
}
