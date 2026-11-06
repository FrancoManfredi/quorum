import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: 'Volume',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${arg(p0)} IOPS pour ${arg(p1)}× le Burn de la machine. Les lectures qui ratent le cache et chaque écriture l’attendent.`,
  shards: 'Shards',
  onePrimaryAReadReplicaIs:
    'Un seul primaire : c’est la réplique de lecture qui en retire les lectures.',
  shardKey: 'Clé de partition',
  reports: 'Rapports',
  scanTheTable: 'Balayer la table',
  materializedView: 'Vue matérialisée',
  halfTheScanCPUAndThe:
    'Moitié moins de CPU de balayage, et des chiffres aussi anciens que le dernier rafraîchissement.',
  everyReportScansTheTableItself:
    'Chaque rapport balaie la table elle-même. Recherchez Vues matérialisées pour en stocker une.',
  retention: 'Rétention',
  oldRowsMoveToCheapStorage:
    'Les vieilles lignes passent en stockage bon marché : la facture baisse et un rapport attend la restauration.',
  oldRowsAreGoneTheBill:
    'Les vieilles lignes ont disparu : la facture baisse et un rapport reconstruit ses chiffres pour trois fois le coût du balayage.',
  everyRowStaysOnTheFast: 'Chaque ligne reste sur le niveau rapide et se paie.',
  backups: 'Sauvegardes',
  noBackupALostTableIs: 'Aucune sauvegarde : une table perdue l’est pour de bon.',
  aRestoreFailedThisBackupWould:
    'Une restauration a échoué : cette sauvegarde perdrait tout. Refaites un exercice.',
  thisBackupRestoresDrillItAgain:
    'Cette sauvegarde se restaure. Refaites un exercice après un changement, ou recherchez Exercices de restauration.',
  restoreDrillDH: (p0) => `Exercice de restauration · ${arg(p0)} h dev`,
}
