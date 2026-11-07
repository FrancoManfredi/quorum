import type { Messages } from '../messages.ts'

export const inspectorPki: Messages['inspectorPki'] = {
  certificate: '証明書',
  aCertificateLastsCalendarDaysAnd: (p0, p1) =>
    `証明書はカレンダー日で${p0}日持ち、サイドカーが${p1}で更新します。このノードが動いている間、更新は自動です。`,
  theFirstStepWithAManager: 'マネージャーが動いている最初のステップで発行されます。',
  expiredEveryBrowserRefusesTheSite:
    '期限切れ：ブラウザはどれもサイトを拒否します。マネージャーが再び動くか、更新を押すまで続きます。',
  daysLeft: (p0) => `残り${p0}日。`,
  sellItOrLeaveItDown:
    '売るか、期限を過ぎても止めたままにすると証明書は失効します。TLSを終端するすべてのノードが、マネージャーが再び動くまで失敗します。シリーズC以降、証明書は45日しか持たないので、手動更新は難しくなります。',
  secrets: 'シークレット',
  theKeysLiveHereNotIn:
    '鍵はコードではなくここにあります。シークレット管理のリサーチは、鍵をフィッシングページからも遠ざけます。',
  lifetime: '有効期間',
  d: (p0) => `${p0}日`,
  expires: '失効',
  notIssuedYet: '未発行',
  expired: '期限切れ',
  inD: (p0) => `${p0}日後`,
  renewsAt: '更新',
  burn: '支出',
  s: (p0) => `${p0}/s`,
}
