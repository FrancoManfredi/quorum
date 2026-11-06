import type { Messages } from '../messages.ts'

export const inspectorCache: Messages['inspectorCache'] = {
  cache: 'Cache',
  aWriteReturnsFromTheCache:
    'Une écriture revient du cache et atteint la base plus tard. Un plantage perd ce qui n’a pas été vidé.',
  everyWriteGoesToTheCache:
    'Chaque écriture va au cache et à la base ensemble : plus frais, et une écriture plus longue.',
  readsComeFromTheCacheWrites:
    'Les lectures viennent du cache, les écritures le contournent. Un défaut peut y déposer une vieille ligne jusqu’au TTL.',
  everyMiss: 'Chaque défaut de cache',
  coalesce: 'Regrouper',
  expireOnTheTTL: 'Expire au TTL',
  refreshEarly: 'Rafraîchir tôt',
  missOnExpiry: "Échec à l'expiration",
  staleWhileRevalidating: 'Périmé pendant la revalidation',
  coldStart: 'Démarrage à froid',
  warmStart: 'Démarrage à chaud',
}
