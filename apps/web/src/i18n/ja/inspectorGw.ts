import type { Messages } from '../messages.ts'

export const inspectorGw: Messages['inspectorGw'] = {
  rateLimit: 'レート制限',
  off: 'オフ',
  s: (p0) => `${p0}/s`,
  pastRequestsASecondTheyFail: (p0) =>
    `毎秒${p0}リクエストを超えると、レート制限として失敗します。`,
  noLimitEveryRequestGoesOn: '制限なし：すべてのリクエストがサービスへ進みます。',
  flatCap: '固定上限',
  tokenBucket: 'トークンバケット',
  aBurstOfUpToRequests: (p0) =>
    `最大${p0}リクエストのバーストは丸ごと通過し、平均は上限に収まります。`,
  everyStepOverTheLimitIs:
    '上限を超えたステップはその場で制限されます。トークンバケットにするにはレート制限を研究してください。',
  servicesCheck: 'サービス側で検証',
  authAtTheEdge: 'エッジでの認証',
  everyReadGoesOn: 'すべての読み取りがそのまま通る',
  requestCoalescing: 'リクエストの合流',
  identicalReadsInFlightAtOnce:
    '同時に飛んでいる同一の読み取りは1回の呼び出しにまとまります。ゲートウェイが混むほど多くまとめるので、スパイク時に流す量が減ります。',
  theGatewayValidatesEachToken: (validation, check) =>
    `ゲートウェイが各トークンを1度だけ検証し、そのコストは${validation}です。サービスは${check}のチェックを省きます。`,
  everyServiceValidatesTheToken: (check) =>
    `各サービスがトークンを自分で検証します：認証付きリクエストごとにCPUを${check}使います。`,
}
