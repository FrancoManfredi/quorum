import type { Messages } from '../messages.ts'

export const units: Messages['units'] = {
  ms: (value) => `${value} ms`,
  s: (value) => `${value} s`,
  min: (value) => `${value} min`,
  h: (value) => `${value} h`,
  d: (value) => `${value} j`,
  minShort: (value) => `${value} min`,
  hShort: (value) => `${value} h`,
  dShort: (value) => `${value} j`,
  devHours: (value) => `${value} DH`,
  perSecond: (value) => `${value}/s`,
  perHour: (value) => `${value}/h`,
  stalled: 'bloquée',
  errorRateAbove: (percent) => `Taux d’erreurs supérieur à ${percent} %`,
  p99Above: (multiple) => `p99 supérieur à ${multiple}× la cible d’Apdex`,
  queueOlderThan: (seconds) =>
    `La plus ancienne tâche d’une file attend depuis plus de ${seconds} s`,
  budgetBurningAbove: (multiple) => `Budget d’erreurs consommé à plus de ${multiple}×`,
  nodeAboveLoad: (percent) => `Un nœud au-dessus de ${percent} % de charge`,
}
