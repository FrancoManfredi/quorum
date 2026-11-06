import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorGw: Messages['inspectorGw'] = {
  rateLimit: 'Limite de débit',
  off: 'Désactivé',
  s: (p0) => `${arg(p0)}/s`,
  pastRequestsASecondTheyFail: (p0) =>
    `Au-delà de ${arg(p0)} requêtes par seconde, elles échouent en throttled.`,
  noLimitEveryRequestGoesOn: 'Aucune limite : chaque requête passe aux services.',
  flatCap: 'Plafond fixe',
  tokenBucket: 'Seau à jetons',
  aBurstOfUpToRequests: (p0) =>
    `Une rafale jusqu’à ${arg(p0)} requêtes passe entière, et la moyenne reste au plafond.`,
  everyStepOverTheLimitIs:
    'Chaque pas au-delà du plafond est limité immédiatement. Recherchez Limitation de débit pour un seau à jetons.',
  servicesCheck: 'Les services vérifient',
  authAtTheEdge: 'Authentification en périphérie',
  everyReadGoesOn: 'Chaque lecture continue',
  requestCoalescing: 'Demande de fusion',
  identicalReadsInFlightAtOnce:
    'Les lectures identiques en vol en même temps deviennent un seul appel. Plus la passerelle est occupée, plus elle fusionne : un pic envoie donc moins en aval.',
}
