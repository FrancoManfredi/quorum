import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorMesh: Messages['inspectorMesh'] = {
  sidecars: 'Proxys',
  linkAppServersOrWorkersInto:
    'Reliez-lui des serveurs applicatifs ou des workers. Rien n’est encore sous le maillage.',
  mutualTLSSitsOnEveryMember:
    'Le TLS mutuel couvre chaque appel entre membres. C’est une propriété, pas un chiffre.',
  perHop: 'Par saut',
  memberCPU: 'CPU du membre',
  insight: 'Connaissances',
  onItsLinks: (p0) => `+${arg(p0)} sur ses liens`,
  platform: 'Plateforme',
  engineers: (p0) => `${arg(p0)} ingénieurs`,
  burn: 'Dépenses',
  s: (p0) => `${arg(p0)}/s`,
}
