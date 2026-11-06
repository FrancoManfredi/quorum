import type { Messages } from '../messages.ts'

export const inspectorPki: Messages['inspectorPki'] = {
  certificate: '证书',
  aCertificateLastsCalendarDaysAnd: (p0, p1) =>
    `证书有效 ${p0} 个日历日，边车会在第 ${p1} 天续期。只要这个节点在运行，续期就是自动的。`,
  theFirstStepWithAManager: '第一个有管理器的模拟秒会签发证书。',
  expiredEveryBrowserRefusesTheSite:
    '已过期：在有节点重新运行或你点击“续期”之前，每个浏览器都会拒绝访问该网站。',
  daysLeft: (p0) => `还剩 ${p0} 天。`,
  sellItOrLeaveItDown:
    '卖掉它，或在到期日之后让它一直宕机，证书就会失效：每个终结 TLS 的节点都会失败，直到有一个重新运行。从 C 轮起证书有效期为 45 天，因此手动续期会更难。',
  secrets: '密钥',
  theKeysLiveHereNotIn: '密钥放在这里，而不在代码里。研究密钥管理后，它们还能避免被钓鱼页面窃取。',
  lifetime: '有效期',
  d: (p0) => `${p0} 天`,
  expires: '到期',
  notIssuedYet: '尚未签发',
  expired: '已过期',
  inD: (p0) => `${p0} 天后`,
  renewsAt: '续期于',
  burn: '支出',
  s: (p0) => `${p0}/秒`,
}
