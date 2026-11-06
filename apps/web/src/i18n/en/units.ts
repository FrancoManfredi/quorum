type Value = string | number

/** Units and the phrases that carry a measured value. A value is a number or text already formatted. */
export const units = {
  ms: (value: Value) => `${value} ms`,
  s: (value: Value) => `${value} s`,
  min: (value: Value) => `${value} min`,
  h: (value: Value) => `${value} h`,
  d: (value: Value) => `${value} d`,
  /** The compact forms on a time range: 30m, 6h, 7d. */
  minShort: (value: Value) => `${value}m`,
  hShort: (value: Value) => `${value}h`,
  dShort: (value: Value) => `${value}d`,
  devHours: (value: Value) => `${value} DH`,
  perSecond: (value: Value) => `${value}/s`,
  perHour: (value: Value) => `${value}/h`,
  stalled: 'stalled',
  errorRateAbove: (percent: Value) => `Error rate above ${percent}%`,
  p99Above: (multiple: Value) => `p99 above ${multiple}× the Apdex target`,
  queueOlderThan: (seconds: Value) => `A Queue's oldest task older than ${seconds} s`,
  budgetBurningAbove: (multiple: Value) => `Error budget burning above ${multiple}×`,
  nodeAboveLoad: (percent: Value) => `A Node above ${percent}% load`,
}
