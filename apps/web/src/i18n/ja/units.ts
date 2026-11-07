import type { Messages } from '../messages.ts'

export const units: Messages['units'] = {
  ms: (value) => `${value} ms`,
  s: (value) => `${value}秒`,
  min: (value) => `${value}分`,
  h: (value) => `${value}時間`,
  d: (value) => `${value}日`,
  minShort: (value) => `${value}分`,
  hShort: (value) => `${value}時間`,
  dShort: (value) => `${value}日`,
  devHours: (value) => `${value} DH`,
  perSecond: (value) => `${value}/s`,
  perHour: (value) => `${value}/h`,
  stalled: '停滞',
  errorRateAbove: (percent) => `エラー率が${percent}%を超えた`,
  p99Above: (multiple) => `p99がApdex目標の${multiple}倍を超えた`,
  queueOlderThan: (seconds) => `キューの最古タスクが${seconds}秒を超えた`,
  budgetBurningAbove: (multiple) => `エラーバジェットの消費が${multiple}倍を超えた`,
  nodeAboveLoad: (percent) => `ノードの負荷が${percent}%を超えた`,
}
