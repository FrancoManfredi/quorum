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
  onItsLinks: (p0) => `+${p0} sur ses liens`,
  platform: 'Plateforme',
  engineers: (p0) => `${p0} ingénieurs`,
  burn: 'Dépenses',
  s: (p0) => `${p0}/s`,
  eachSidecarRetries: (insight, hop, overhead) =>
    `Chaque proxy réessaie et coupe les liens de son nœud, les surveille pour les connaissances (+${insight} %), ajoute ${hop} à chaque saut, et prend ${overhead} % du CPU de la machine. Les dépenses de chaque membre paient son proxy, et chaque maillage prend des heures de dev de la plateforme.`,
}
