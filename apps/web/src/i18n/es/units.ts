import type { Messages } from '../messages.ts'

/** Unidades y las frases que llevan un valor medido. Un valor es un número o un texto ya formateado. */
export const units: Messages['units'] = {
  ms: (value) => `${value} ms`,
  s: (value) => `${value} s`,
  min: (value) => `${value} min`,
  h: (value) => `${value} h`,
  d: (value) => `${value} d`,
  /** Las formas compactas de un intervalo: 30m, 6h, 7d. */
  minShort: (value) => `${value}m`,
  hShort: (value) => `${value}h`,
  dShort: (value) => `${value}d`,
  devHours: (value) => `${value} DH`,
  perSecond: (value) => `${value}/s`,
  perHour: (value) => `${value}/h`,
  stalled: 'atascada',
  errorRateAbove: (percent) => `Tasa de errores por encima del ${percent}%`,
  p99Above: (multiple) => `p99 por encima de ${multiple}× el objetivo de Apdex`,
  queueOlderThan: (seconds) => `La tarea más antigua de una Cola supera los ${seconds} s`,
  budgetBurningAbove: (multiple) => `Presupuesto de error consumiéndose a más de ${multiple}×`,
  nodeAboveLoad: (percent) => `Un Nodo por encima del ${percent}% de carga`,
}
