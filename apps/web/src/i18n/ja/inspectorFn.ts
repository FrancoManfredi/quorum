import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: '実行数',
  coldStart: 'コールドスタート',
  bill: '請求',
  inbound: '流入',
  s: (p0) => `${p0}/s`,
  uses: '用途',
  standingBurn: '固定支出',
  oneExecutionHoldsTheRequest: (cap) =>
    `1回の実行は、動いている間ずっとリクエストを保持し、同時に${cap}まで処理します。上限を超えるとプロバイダが制限し、リクエストはキューに積まれず破棄されます。`,
  inFlight: (used, total) => `${used} / ${total} 実行中`,
  aNewEnvironmentBoots: (coldStart) =>
    `新しい実行環境はコードが動く前に起動します。このスタックでは${coldStart}です。アイドルになると環境を失うので、細く続くトラフィックほど、安定したトラフィックより頻繁にその代償を払います。`,
  changeTheRuntime:
    'スタックのランタイムを変えて、コールドスタートとスループットを交換してください。',
  noBoxToPayFor: (perThousandRequests, perGbSecond, gigabytes) =>
    `支払うべきマシンはありません。アイドル中は何も動きません。利用ごとに1,000リクエストあたり${perThousandRequests}、GB秒あたり${perGbSecond}、1実行あたり${gigabytes} GBで、請求のリクエスト行に載ります。`,
  thisUse: (cost) => `この利用：${cost}/s`,
}
