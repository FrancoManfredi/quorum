import type { Messages } from '../messages.ts'

export const inspectorAutoscaler: Messages['inspectorAutoscaler'] = {
  scaling: 'スケーリング',
  load: '負荷',
  requests: 'リクエスト',
  queueDepth: 'キュー長',
  min: (p0) => `最小 ${p0}`,
  noMax: '最大なし',
  max: (p0) => `最大 ${p0}`,
  onLoad: '負荷に応じて',
  aheadOfThePeak: 'ピークを見越して',
  twoCalendarHoursBeforeTheDaily:
    '日次ピークの2カレンダー時間前に、そのピークが必要とするコピーを追加します。ピークが来たときには温まっています。',
  itReactsToTheLoadIt:
    '目に見える負荷に反応します。ピークに先回りするにはスケジュールスケーリングを研究してください。',
}
