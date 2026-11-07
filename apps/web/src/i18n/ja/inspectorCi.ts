import type { Messages } from '../messages.ts'

export const inspectorCi: Messages['inspectorCi'] = {
  deployStrategy: 'デプロイ戦略',
  deploysInMinABadDeploy: (p0, p1) =>
    `${p0}分でデプロイします。不正なデプロイは最大${p1}のリクエストを壊します。`,
  deploysADayAtThisBuild: (p0) => `このビルドと戦略なら1日${p0}回デプロイします。`,
  deploys: 'デプロイ',
  deployTime: 'デプロイ時間',
  min: (p0) => `${p0}分`,
  blastRadius: 'ブラストラディウス',
  upTo: (p0) => `最大${p0}`,
  burn: '支出',
  s: (p0) => `${p0}/s`,
  perDay: (count) => `${count}/日`,
}
