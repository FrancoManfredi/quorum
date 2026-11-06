import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const challenge: Messages['challenge'] = {
  cost: 'Coût',
  s: (p0) => `${arg(p0)}/s`,
  tail: 'Latence p99',
  complexity: 'Complexité',
  margin: 'Marge',
  devHours: 'Heures de développement',
  errors: 'Erreurs',
  dH: (p0) => `${arg(p0)} DH`,
  run: 'Lancer',
  finish: 'Terminer',
  rebuild: 'Reconstruire',
  result: 'Résultat',
  challenges: 'Défis',
  betterThanOfPlayers: (p0) => `Mieux que ${arg(p0)}% des joueurs`,
  passed: 'Réussi',
  failed: 'Échec',
  players: (p0) => `${arg(p0)} joueurs`,
  provisional: 'Provisoire',
  provisionalChecking: 'Provisoire · vérification',
  verified: 'Vérifié',
  notVerified: 'Non vérifié',
  provisionalOffline: 'Provisoire · hors ligne',
}
