import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorPki: Messages['inspectorPki'] = {
  certificate: 'Certificat',
  aCertificateLastsCalendarDaysAnd: (p0, p1) =>
    `Un certificat dure ${arg(p0)} jours calendaires, et le proxy le renouvelle à ${arg(p1)}. Le renouvellement est automatique tant que ce nœud tourne.`,
  theFirstStepWithAManager: 'La première seconde avec un gestionnaire l’émet.',
  expiredEveryBrowserRefusesTheSite:
    'Expiré : chaque navigateur refuse le site jusqu’à ce qu’un gestionnaire tourne à nouveau, ou que vous cliquiez sur Renouveler.',
  daysLeft: (p0) => `${arg(p0)} jours restants.`,
  sellItOrLeaveItDown:
    'Vendez-le ou laissez-le éteint au-delà de la date d’expiration et le certificat tombe : chaque nœud qui termine TLS échoue jusqu’à ce qu’un gestionnaire tourne. À partir de la série C, les certificats durent 45 jours, donc le renouvellement manuel devient plus dur.',
  secrets: 'Secrets',
  theKeysLiveHereNotIn:
    'Les clés vivent ici, pas dans le code. La recherche Gestion des secrets les garde aussi hors d’une page d’hameçonnage.',
  lifetime: 'Durée de vie',
  d: (p0) => `${arg(p0)} j`,
  expires: 'Expire',
  notIssuedYet: 'pas encore émis',
  expired: 'expiré',
  inD: (p0) => `dans ${arg(p0)} j`,
  renewsAt: 'Renouvelé à',
  burn: 'Dépenses',
  s: (p0) => `${arg(p0)}/s`,
}
