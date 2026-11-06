import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: 'Volume',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${p0} IOPS pour ${p1}× le Burn de la machine. Les lectures qui ratent le cache et chaque écriture l’attendent.`,
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
  restoreDrillDH: (p0) => `Exercice de restauration · ${p0} h dev`,
  theBusiestShardTakes: (hot, cross, cpu, scatter) =>
    `Le shard le plus chargé reçoit ${hot} % des écritures. ${cross} % des transactions couvrent plusieurs shards : elles coûtent jusqu’à 3× et peuvent échouer sur n’importe quel shard. Les rapports et les recherches touchent chaque shard : +${cpu} % de CPU et +${scatter}.`,
  usersInOtherRegionsWait: (wait) => `Les utilisateurs d’autres régions attendent ${wait} de plus.`,
  writesDivideAcross: (shards, devHours) =>
    `Les écritures se répartissent sur ${shards} shards, et chacun coûte. Changer le nombre ou la clé demande ${devHours} heures de dev et une copie des données qui divise par deux les IOPS du volume.`,
}
