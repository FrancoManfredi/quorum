import type { Messages } from '../messages.ts'

export const inspectorGw: Messages['inspectorGw'] = {
  routes: '路由',
  rateLimit: '速率限制',
  off: '关闭',
  s: (p0) => `${p0}/秒`,
  pastRequestsASecondTheyFail: (p0) => `超过每秒 ${p0} 个请求后，它们以 throttled 失败。`,
  noLimitEveryRequestGoesOn: '无限制：每个请求都会发往服务。',
  flatCap: '固定上限',
  tokenBucket: '令牌桶',
  aBurstOfUpToRequests: (p0) => `最多 ${p0} 个请求的突发整体放行，平均值保持在限额。`,
  everyStepOverTheLimitIs: '每一步超出上限都立即限流。研究限流即可使用令牌桶。',
  servicesCheck: '由服务校验',
  authAtTheEdge: '边缘认证',
  everyReadGoesOn: '每次读取都继续转发',
  requestCoalescing: '请求合并',
  identicalReadsInFlightAtOnce:
    '同时在途的相同读取合并为一次调用。网关越忙合并越多，因此流量高峰向后端发送得更少。',
  theGatewayValidatesEachToken: (validation, check) =>
    `网关只验证一次令牌，耗时 ${validation}，各服务跳过 ${check} 的验证。`,
  everyServiceValidatesTheToken: (check) =>
    `每个服务都自行验证令牌：每个已认证请求消耗 ${check} 的 CPU。`,
}
