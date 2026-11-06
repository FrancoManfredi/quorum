import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: '请求',
  sOk: (p0, p1, p2) => `${p0}/秒 · ${p1} 成功${p2}`,
  errorsByCause: '按原因分类的错误',
  s: (p0) => `${p0}/秒`,
  users: '用户',
  market: '市场',
  apdexNow: '当前 Apdex',
  apdexLastHour: '过去一小时的 Apdex',
  velocity: '开发速度',
  percentileLine: (mean, p50, p95, p99) => `平均 ${mean} · p50 ${p50} · p95 ${p95} · p99 ${p99}`,
  causes: {
    dropped: '丢弃',
    stranded: '无路由',
    refused: '拒绝连接',
    down: '宕机',
    stale: '数据过期',
    oom: '内存耗尽',
    timeout: '超时',
    crash: '崩溃',
    blocked: '被拦截',
    upstream: '上游故障',
    throttled: '限流',
    duplicate: '重复扣款',
  },
}
