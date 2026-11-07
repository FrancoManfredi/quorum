import type { Messages } from '../messages.ts'

export const inspectorFf: Messages['inspectorFf'] = {
  rollout: 'ロールアウト',
  shipAFeatureFirstAFlag:
    'まず機能を出してください。フラグにはまだロールアウトするものがありません。',
  off: 'オフ',
  offNoUserHasTheFeature:
    'オフ：どのユーザーもその機能を持たないので、不正なデプロイでも誰も壊れません',
  aBadDeployOfItReaches: (p0) => `その不正なデプロイは最大${p0}%のユーザーに届きます`,
  flagsAreAShield: 'フラグは盾',
  aFeatureAt5OfUsers:
    'ユーザーの5%に届いている機能は、デプロイ戦略が何であれ、本来のトラフィックの最大5%までしか壊せません。オフにすれば、次の不正なデプロイで誰も壊れません。インシデントに必要なのはその1クリックです。',
  notBuiltTheHoldoutGroupThat:
    '未構築：機能の効果を測るホールドアウトグループと、オフにした機能がもう加えない負荷。',
  service: 'サービス',
  inTheBatch: 'バッチ内',
  behindAFlag: 'フラグの内側',
  badDeploy: '不正なデプロイ',
  burn: '支出',
  s: (p0) => `${p0}/s`,
  aBadDeployFails: (failing, service, features, ceiling) =>
    `不正なデプロイは、バッチが出した機能ごとにリクエストの${failing}%を失敗させ、フラグはそれを到達したユーザー割合まで削ります。${service}の直近のデプロイは${features}件の機能を出したので、上限は${ceiling}%です。壊れるのはそのサービスのトラフィックだけです。`,
  upToOfItsTraffic: (share) => `そのトラフィックの最大${share}%`,
}
