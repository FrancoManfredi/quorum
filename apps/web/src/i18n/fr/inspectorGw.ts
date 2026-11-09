import type { Messages } from '../messages.ts'

export const inspectorGw: Messages['inspectorGw'] = {
  routes: 'Routes',
  rateLimit: 'Limite de débit',
  off: 'Désactivé',
  s: (p0) => `${p0}/s`,
  pastRequestsASecondTheyFail: (p0) =>
    `Au-delà de ${p0} requêtes par seconde, elles échouent en throttled.`,
  noLimitEveryRequestGoesOn: 'Aucune limite : chaque requête passe aux services.',
  flatCap: 'Plafond fixe',
  tokenBucket: 'Seau à jetons',
  aBurstOfUpToRequests: (p0) =>
    `Une rafale jusqu’à ${p0} requêtes passe entière, et la moyenne reste au plafond.`,
  everyStepOverTheLimitIs:
    'Chaque pas au-delà du plafond est limité immédiatement. Recherchez Limitation de débit pour un seau à jetons.',
  servicesCheck: 'Les services vérifient',
  authAtTheEdge: 'Authentification en périphérie',
  everyReadGoesOn: 'Chaque lecture continue',
  requestCoalescing: 'Demande de fusion',
  identicalReadsInFlightAtOnce:
    'Les lectures identiques en vol en même temps deviennent un seul appel. Plus la passerelle est occupée, plus elle fusionne : un pic envoie donc moins en aval.',
  theGatewayValidatesEachToken: (validation, check) =>
    `La passerelle valide chaque jeton une seule fois, en ${validation}, et les services sautent la vérification de ${check}.`,
  everyServiceValidatesTheToken: (check) =>
    `Chaque service valide lui-même le jeton : ${check} de CPU à chaque requête authentifiée.`,
}
