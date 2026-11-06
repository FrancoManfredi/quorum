import type { Messages } from '../messages.ts'

export const inspectorAnalytics: Messages['inspectorAnalytics'] = {
  sampleRate: 'Taux d’échantillonnage',
  moreSamplesMoreInsightMoreCPU:
    "Plus d'échantillons : plus d'connaissances, plus de CPU sur les nœuds échantillonnés, plus de dépenses de stockage",
  sampling: 'Échantillonnage',
  s: (p0) => `${p0}/s`,
  kept: 'Conservés',
  s2: (p0, p1) => `${p0} / ${p1}/s`,
  burn: 'Dépenses',
}
