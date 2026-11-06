import type { Messages } from '../messages.ts'

export const inspectorFf: Messages['inspectorFf'] = {
  rollout: '逐步开放',
  shipAFeatureFirstAFlag: '先发布一项功能：开关暂时无物可开放。',
  off: '关闭',
  offNoUserHasTheFeature: '关闭：没有用户拥有该功能，糟糕的部署不会伤到任何人。',
  aBadDeployOfItReaches: (p0) => `糟糕的部署最多波及 ${p0}% 的用户`,
  flagsAreAShield: '开关是护盾',
  aFeatureAt5OfUsers:
    '无论部署策略如何，推送给 5% 用户的功能，最多只会破坏它本来流量的 5%。把它关掉，下一次糟糕的部署就不会影响任何人：这就是事故中需要的那一次点击。',
  notBuiltTheHoldoutGroupThat: '未构建：衡量功能提升效果的对照组，以及暗发布的功能不再增加的负载。',
  service: '服务',
  inTheBatch: '本批次',
  behindAFlag: '在开关之后',
  badDeploy: '部署出错',
  burn: '支出',
  s: (p0) => `${p0}/秒`,
  aBadDeployFails: (failing, service, features, ceiling) =>
    `一次糟糕的部署会让其批次中的每个功能导致 ${failing}% 的请求失败，而开关会把这个比例降到所触达用户的份额。${service} 的上次部署发布了 ${features} 个功能，因此上限是 ${ceiling}%。只有该服务的流量会出问题。`,
  upToOfItsTraffic: (share) => `最多占其流量的 ${share}%`,
}
