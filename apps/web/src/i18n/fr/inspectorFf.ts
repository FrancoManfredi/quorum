import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorFf: Messages['inspectorFf'] = {
  rollout: 'Déploiement progressif',
  shipAFeatureFirstAFlag:
    'Livrez d’abord une fonctionnalité : un drapeau n’a encore rien à déployer.',
  off: 'Désactivé',
  offNoUserHasTheFeature:
    'Coupé : aucun utilisateur n’a la fonctionnalité, donc un mauvais déploiement ne casse personne.',
  aBadDeployOfItReaches: (p0) =>
    `Un mauvais déploiement l’atteint au plus chez ${arg(p0)} % des utilisateurs`,
  flagsAreAShield: 'Les drapeaux sont un bouclier',
  aFeatureAt5OfUsers:
    'Une fonctionnalité chez 5 % des utilisateurs ne peut casser au plus que 5 % du trafic qu’elle aurait, quelle que soit la stratégie. Coupez-la et le prochain mauvais déploiement ne casse personne : c’est le clic qu’un incident demande.',
  notBuiltTheHoldoutGroupThat:
    'Non construit : le groupe témoin qui mesure le gain d’une fonctionnalité, et la charge qu’une fonctionnalité éteinte n’ajoute plus.',
  service: 'Service',
  inTheBatch: 'Dans le lot',
  behindAFlag: 'Derrière un drapeau',
  badDeploy: 'Mauvais déploiement',
  burn: 'Dépenses',
  s: (p0) => `${arg(p0)}/s`,
}
