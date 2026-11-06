import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorShared: Messages['inspectorShared'] = {
  runtime: 'Environnement d’exécution',
  proposed: 'Proposé',
  researchToUnlock: (p0) => `Recherchez ${arg(p0)} pour débloquer`,
  poolSize: 'Taille du pool',
  fewerWorkers: 'Moins de processus',
  moreWorkers: 'Plus de processus',
  rAMFits: (p0) => `La RAM accueille ${arg(p0)} processus`,
  framework: 'Framework',
  processManager: 'Gestionnaire de processus',
  recycleWorkers: 'Recycler les workers',
  off: 'Désactivé',
  everyFewHours: 'Toutes les quelques heures',
  pmMaxRequestsAndWorkerKillers:
    "pm.max_requests et les tueurs de workers redémarrent chaque processus de temps en temps. Une fuite ne s'accumule jamais, et chaque redémarrage repart à froid.",
  compression: 'Compression',
  service: 'Service',
  engine: 'Moteur',
  connectionsPostgresForksAProcessFor: (p0) =>
    `${arg(p0)} connexions : Postgres crée un processus par connexion, MySQL donne un thread à chacune.`,
  regions: 'Régions',
  one: 'Une',
  spread: 'Répartir',
  hotKeys: 'Clés très sollicitées',
  oneShard: 'Une partition',
  split: 'Diviser',
}
