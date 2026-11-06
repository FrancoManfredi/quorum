import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorPki: Messages['inspectorPki'] = {
  certificate: '证书',
  aCertificateLastsCalendarDaysAnd: (p0, p1) =>
    `A certificate lasts ${arg(p0)} calendar days, and the sidecar renews it at ${arg(p1)}. Renewal is automatic while this Node runs.`,
  theFirstStepWithAManager: '第一个有管理器的模拟秒会签发证书。',
  expiredEveryBrowserRefusesTheSite:
    'Expired: every browser refuses the site until one is live again, or you press Renew.',
  daysLeft: (p0) => `还剩 ${arg(p0)} 天。`,
  sellItOrLeaveItDown:
    'Sell it or leave it down past the expiry date and the certificate lapses: every Node that terminates TLS fails until one runs again. From Series C certificates last 45 days, so manual renewal gets harder.',
  secrets: '密钥',
  theKeysLiveHereNotIn:
    'The keys live here, not in the code. Secrets management research keeps them off a phishing page too.',
  lifetime: '有效期',
  d: (p0) => `${arg(p0)} 天`,
  expires: '到期',
  notIssuedYet: '尚未签发',
  expired: '已过期',
  inD: (p0) => `${arg(p0)} 天后`,
  renewsAt: '续期于',
  burn: '支出',
  s: (p0) => `${arg(p0)}/秒`,
}
