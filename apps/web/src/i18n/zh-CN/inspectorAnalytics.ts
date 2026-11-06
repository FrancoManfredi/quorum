import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorAnalytics: Messages['inspectorAnalytics'] = {
  sampleRate: '采样率',
  moreSamplesMoreInsightMoreCPU: '采样越多：洞察越多，被采样节点的 CPU 占用越高，存储支出也越高',
  sampling: '采样',
  s: (p0) => `${arg(p0)}/秒`,
  kept: '保留',
  s2: (p0, p1) => `${arg(p0)} / ${arg(p1)}/秒`,
  burn: '支出',
}
