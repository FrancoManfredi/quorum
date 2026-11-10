import type { Messages } from '../messages.ts'

export const inspectorAnalytics: Messages['inspectorAnalytics'] = {
  sampleRate: 'Tasa de muestreo',
  moreSamplesMoreInsightMoreCPU:
    'Más muestras: más conocimiento, más CPU en los nodos muestreados, más gasto de almacenamiento',
  sampling: 'Muestreo',
  s: (p0: string | number | null) => `${p0}/s`,
  kept: 'Conservadas',
  s2: (p0: string | number | null, p1: string | number | null) => `${p0} / ${p1}/s`,
  burn: 'Gasto',
}
