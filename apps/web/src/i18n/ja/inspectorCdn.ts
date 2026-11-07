import type { Messages } from '../messages.ts'

export const inspectorCdn: Messages['inspectorCdn'] = {
  deploysAndKeys: 'デプロイとキー',
  keepUntilTheTTL: 'TTLまで保持',
  purgeOnDeploy: 'デプロイ時にパージ',
  aDeployEmptiesTheCacheThe:
    'デプロイでキャッシュが空になります。埋め直している間、ミスはオリジンが受けます。',
  afterADeployTheEdgeServes: 'デプロイ後、エッジはTTLが切れるまで一部の古いページを返します。',
  theKeyHoldsThePathThe:
    'キーにはパス・クエリ・Cookieが入ります。ユーザー間で共有されるものはありません。',
  aSmallerKeyLifts: (lift) =>
    `キーを小さくするとヒット率が${lift}%上がりますが、そのキーでキャッシュしたログイン済みページが別のユーザーに返る可能性があります。データ漏えいです。`,
}
