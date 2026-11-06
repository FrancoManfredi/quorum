export const inspectorAnalytics = {
  sampleRate: 'Sample rate',
  moreSamplesMoreInsightMoreCPU:
    'More samples: more Insight, more CPU on sampled Nodes, more storage Burn',
  sampling: 'Sampling',
  s: (p0: string | number | null) => `${p0}/s`,
  kept: 'Kept',
  s2: (p0: string | number | null, p1: string | number | null) => `${p0} / ${p1}/s`,
  burn: 'Burn',
}
