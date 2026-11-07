import type { Messages } from '../messages.ts'

export const inspectorMesh: Messages['inspectorMesh'] = {
  sidecars: 'サイドカー',
  linkAppServersOrWorkersInto:
    'アプリサーバーかワーカーをリンクしてください。まだ何もメッシュの下にありません。',
  mutualTLSSitsOnEveryMember:
    '相互TLSがメンバー間のすべての呼び出しに乗ります。数字ではなく性質です。',
  perHop: 'ホップあたり',
  memberCPU: 'メンバーのCPU',
  insight: 'インサイト',
  onItsLinks: (p0) => `リンクで+${p0}`,
  platform: 'プラットフォーム',
  engineers: (p0) => `エンジニア${p0}人`,
  burn: '支出',
  s: (p0) => `${p0}/s`,
  eachSidecarRetries: (insight, hop, overhead) =>
    `各サイドカーはリトライし、自分のノードのリンクを遮断し、インサイトのために監視し（+${insight}%）、ホップごとに${hop}を足し、ボックスのCPUを${overhead}%使います。メンバーごとの支出がそのサイドカーを払い、メッシュごとにプラットフォームの開発時間がかかります。`,
}
