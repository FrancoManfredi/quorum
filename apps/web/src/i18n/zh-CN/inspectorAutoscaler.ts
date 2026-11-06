import type { Messages } from '../messages.ts'

export const inspectorAutoscaler: Messages['inspectorAutoscaler'] = {
  scaling: '扩缩容',
  load: '负载',
  requests: '请求',
  queueDepth: '队列深度',
  min: (p0) => `最少 ${p0}`,
  noMax: '无上限',
  max: (p0) => `最多 ${p0}`,
  onLoad: '按负载',
  aheadOfThePeak: '提前应对高峰',
  twoCalendarHoursBeforeTheDaily:
    '在每日高峰前两个日历小时，它增加高峰所需的副本，高峰到来时已经预热。',
  itReactsToTheLoadIt: '它只对当前负载作出反应。研究定时扩缩容即可提前为高峰准备。',
}
