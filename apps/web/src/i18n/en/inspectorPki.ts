export const inspectorPki = {
  certificate: 'Certificate',
  aCertificateLastsCalendarDaysAnd: (p0: string | number | null, p1: string | number | null) =>
    `A certificate lasts ${p0} calendar days, and the sidecar renews it at ${p1}. Renewal is automatic while this Node runs.`,
  theFirstStepWithAManager: 'The first Step with a manager issues it.',
  expiredEveryBrowserRefusesTheSite:
    'Expired: every browser refuses the site until one is live again, or you press Renew.',
  daysLeft: (p0: string | number | null) => `${p0} days left.`,
  sellItOrLeaveItDown:
    'Sell it or leave it down past the expiry date and the certificate lapses: every Node that terminates TLS fails until one runs again. From Series C certificates last 45 days, so manual renewal gets harder.',
  secrets: 'Secrets',
  theKeysLiveHereNotIn:
    'The keys live here, not in the code. Secrets management research keeps them off a phishing page too.',
  lifetime: 'Lifetime',
  d: (p0: string | number | null) => `${p0} d`,
  expires: 'Expires',
  notIssuedYet: 'not issued yet',
  expired: 'expired',
  inD: (p0: string | number | null) => `in ${p0} d`,
  renewsAt: 'Renews at',
  burn: 'Burn',
  s: (p0: string | number | null) => `${p0}/s`,
}
