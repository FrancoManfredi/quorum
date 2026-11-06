import { def } from './define.ts'

/**
 * Calendar days a TLS certificate lasts: 90 until Series C, then 45 (05 "Secrets and Certificates",
 * following the industry maximum as it shrinks).
 */
export const CERT_DAYS = 90
export const CERT_DAYS_SHORT = 45
/** The Era from which a Node's certificate is tracked: the one the Certificate expired incident starts in. */
export const CERT_FROM_STAGE = 2
/** The Era from which certificates last the shorter life: Series C. */
export const CERT_SHORT_FROM = 5
/**
 * Share of a certificate's life at which it renews itself. Let's Encrypt renews with a third of
 * the 90 days left, which is two thirds of the way through.
 */
export const CERT_RENEW = 2 / 3

// It holds the TLS certificates and renews them: without it live, they run out on the calendar,
// and every browser refuses the site (05 "Secrets and Certificates").
export const pkiDef = def({
  id: 'pki',
  code: 'pki',
  name: 'Secrets and Certificates',
  product: "Let's Encrypt",
  group: 'ops',
  blurb:
    'Holds the keys and renews the TLS certificates before they run out. Without it live, the certificate expires on the calendar and the site goes down.',
  cost: 80,
  burn: 0.005,
  latency: 0,
  accepts: [],
  maxOut: 0,
  unlock: 'cert-automation',
})
