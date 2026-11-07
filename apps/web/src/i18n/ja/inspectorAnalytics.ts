import type { Messages } from '../messages.ts'

export const inspectorAnalytics: Messages['inspectorAnalytics'] = {
  sampleRate: 'サンプル率',
  moreSamplesMoreInsightMoreCPU:
    'サンプルを増やすと、インサイトが増え、サンプリング対象ノードのCPUとストレージの支出も増えます。',
  sampling: 'サンプリング',
  s: (p0) => `${p0}/s`,
  kept: '保持',
  s2: (p0, p1) => `${p0} / ${p1}/s`,
  burn: '支出',
}
