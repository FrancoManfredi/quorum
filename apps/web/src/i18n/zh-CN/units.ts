import type { Messages } from '../messages.ts'

export const units: Messages['units'] = {
  ms: (value) => `${value} ms`,
  s: (value) => `${value} 秒`,
  min: (value) => `${value} 分钟`,
  h: (value) => `${value} 小时`,
  d: (value) => `${value} 天`,
  minShort: (value) => `${value}分钟`,
  hShort: (value) => `${value}小时`,
  dShort: (value) => `${value}天`,
  devHours: (value) => `${value} 开发工时`,
  perSecond: (value) => `${value}/秒`,
  perHour: (value) => `${value}/小时`,
  stalled: '停滞',
  errorRateAbove: (percent) => `错误率高于 ${percent}%`,
  p99Above: (multiple) => `p99 高于 Apdex 目标的 ${multiple} 倍`,
  queueOlderThan: (seconds) => `队列中最旧的任务等待超过 ${seconds} 秒`,
  budgetBurningAbove: (multiple) => `错误预算消耗速度高于 ${multiple} 倍`,
  nodeAboveLoad: (percent) => `节点负载高于 ${percent}%`,
}
