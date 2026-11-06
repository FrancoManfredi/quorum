import type { Messages } from '../messages.ts'

export const inspectorCdn: Messages['inspectorCdn'] = {
  deploysAndKeys: 'Déploiements et clés',
  keepUntilTheTTL: "Garder jusqu'au TTL",
  purgeOnDeploy: 'Purger au déploiement',
  aDeployEmptiesTheCacheThe:
    "Un déploiement vide le cache : l'origine reçoit les échecs pendant le remplissage.",
  afterADeployTheEdgeServes:
    "Après un déploiement, le bord sert une partie des anciennes pages jusqu'à la fin du TTL.",
  theKeyHoldsThePathThe:
    "La clé contient le chemin, la requête et les cookies : rien n'est partagé entre utilisateurs.",
}
