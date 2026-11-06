import { def } from '../define.ts'

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
