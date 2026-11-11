import type { Messages } from '../messages.ts'

export const levers: Messages['levers'] = {
  label: 'プロダクトレバー',
  step: (step, max) => (step <= 0 ? 'レバーなし' : `ステップ ${step}/${max}`),
  share: (share) => `トラフィックの ${share}`,
  count: (step, max) => `${step}/${max}`,
  titleLow: (name) => `${name}のインサイトが足りません`,
  titleRaise: (name) => `${name}を増やしましょう`,
  titleFaster: (name) => `${name}のインサイトが早く貯まります`,
  low: (name, earn, draw) =>
    `${name}は毎秒 ${earn} のインサイトしか得られず、この研究は毎秒 ${draw} を必要とします。${name}のトラフィックを増やすと早く貯まります。`,
  raise: (name) => `${name}がこの研究の費用を支えます。増やせばインサイトが早く貯まります。`,
  faster: (name, share) =>
    `${name}はトラフィックの ${share} を占めるので、インサイトが早く貯まります。`,
  reaches: (share, percent) =>
    `トラフィックの ${share} に到達し、ユーザー成長が ${percent}% 低下します。`,
  cost: (percent) => `ユーザー成長が ${percent}% 低下します。`,
  buildStep: (step, dh) => `ステップ ${step} を構築 · ${dh} DH`,
  setStep: (step) => `ステップ ${step} を設定`,
  removeStep: '削除',
  remove: (dh) => `削除 · ${dh} DH 返還`,
  takeOff: 'ステップを外す',
  set: 'レバーを設定',
  item: (kind) => `${kind}レバー`,
  queued: (kind) => `${kind}レバーのステップをキューに追加`,
  removed: (kind) => `${kind}レバーのステップを削除`,
  pinned: 'チャレンジはミックスを固定します。',
  noLever: (kind) => `${kind} にプロダクトレバーはありません。`,
  opens: (kind, step, era) => `${kind}レバーのステップ ${step} は ${era} で開きます。`,
  onBacklog: (kind) => `${kind}レバーのステップはすでにキューにあります。`,
  capped: (venture, kind) => `${venture} は ${kind} レバーを最初のステップに制限します。`,
  lastStep: (kind) => `${kind}レバーは最後のステップです。`,
  notServed: (kind) => `会社は ${kind} を提供していません。`,
  alreadyOff: (kind) => `${kind}レバーはすでにオフです。`,
  onBacklogRemove: (kind) => `${kind}レバーのステップがキューにあります。`,
}
