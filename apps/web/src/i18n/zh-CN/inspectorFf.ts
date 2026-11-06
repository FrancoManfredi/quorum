import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorFf: Messages['inspectorFf'] = {
  rollout: '逐步开放',
  shipAFeatureFirstAFlag: '先发布一项功能：开关暂时无物可开放。',
  off: '关闭',
  offNoUserHasTheFeature: '关闭：没有用户拥有该功能，糟糕的部署不会伤到任何人。',
  aBadDeployOfItReaches: (p0) => `糟糕的部署最多波及 ${arg(p0)}% 的用户`,
  flagsAreAShield: '开关是护盾',
  aFeatureAt5OfUsers:
    'A Feature at 5% of users can break at most 5% of the traffic it would have, whatever the deploy strategy. Turn it Off and the next bad deploy of it breaks nobody: that is the one click an incident needs.',
  notBuiltTheHoldoutGroupThat:
    'Not built: the holdout group that measures a Feature’s lift, and the load a dark Feature no longer adds.',
  service: '服务',
  inTheBatch: '本批次',
  behindAFlag: '在开关之后',
  badDeploy: '部署出错',
  burn: '支出',
  s: (p0) => `${arg(p0)}/秒`,
}
