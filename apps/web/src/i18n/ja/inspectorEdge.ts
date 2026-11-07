import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: '上限',
  edgeCache: 'エッジキャッシュ',
  inbound: '流入',
  s: (p0) => `${p0}/s`,
  latency: 'レイテンシ',
  cPUCeiling: 'CPU上限',
  stack: 'スタック',
  uses: '用途',
  standingBurn: '固定支出',
  aHandlerRunsIn: (memory, cpu) =>
    `ハンドラーは${memory} MBのアイソレートで動き、1リクエストあたり${cpu}のCPUを使えます。上限を超えたリクエストはタイムアウトで失敗するので、CPUを食う種別はアプリサーバーに向きます。`,
  thisStackCompilesToTheEdge:
    'このスタックはエッジ向けにコンパイルされます。JavaScript、TypeScript、Rust、GoをWebAssemblyへ。',
  cannotRunAtTheEdge: (stack) =>
    `${stack}はエッジでは動きません。スタックをNode.js、Rust、Goへ移してください。`,
  aUserInItsRegion: (hop, hit) =>
    `そのリージョンのユーザーは${hop}で到達します。ホップはリージョンのエッジまでで、オリジンへの往復はありません。必要とするリージョンごとに1つ置いてください。稼働中のエッジ関数のキーバリューキャッシュがあれば、CDNが読み取りの${hit}%をエッジで返せます。`,
  cannotRunHere: (stack) => `${stack}はここでは動きません`,
}
