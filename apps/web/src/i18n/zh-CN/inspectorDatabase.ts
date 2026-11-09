import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: '存储卷',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${p0} IOPS，消耗机器 Burn 的 ${p1} 倍。未命中缓冲区的读取和每次写入都要等待它。`,
  topology: '拓扑',
  singlePrimary: '单主',
  sharded: '分片',
  multiLeader: '多主',
  topologySharded:
    '分片：每个数据库只保留它那部分行。尽量把事务放在同一分片内；跨分片事务可能在触及的任何分片上失败，报表则读取全部。',
  topologyMulti: '多主：每个数据库都保留全部行并接受写入。认证会丢弃冲突写入，先提交者胜出。',
  topologySingle: '单主：一个数据库负责写入，只读副本负责读取。第二个数据库需先选择拓扑。',
  leader: '主库',
  readReplicas: '只读副本',
  noReadReplicas: '没有。只读副本可在不增加主库负载的情况下分担读取。',
  secondDatabaseFollows: '在「数据」下放置第二个数据库，它会遵循此选择。',
  promote: '提升为主库',
  promoteNote:
    '副本成为主库，旧主库成为它的副本。异步副本仍有未发送的写入，提升会丢失它们；同步副本不会丢失。',
  shards: '分片',
  onePrimaryAReadReplicaIs: '单个主库：由只读副本分担读取。',
  shardKey: '分片键',
  reports: '报表',
  scanTheTable: '扫描整表',
  materializedView: '物化视图',
  halfTheScanCPUAndThe: '扫描 CPU 减半，数字与上次刷新一样陈旧。',
  everyReportScansTheTableItself: '每个报表都扫描整张表。研究物化视图即可存储一份。',
  retention: '保留',
  oldRowsMoveToCheapStorage: '旧行迁到廉价存储：账单下降，报表要等恢复。',
  oldRowsAreGoneTheBill: '旧行已删除：账单下降，报表要以三倍扫描成本重建数据。',
  everyRowStaysOnTheFast: '每一行都留在快速层并计费。',
  backups: '备份',
  noBackupALostTableIs: '没有备份：丢失的表就永久丢失。',
  aRestoreFailedThisBackupWould: '恢复失败：这份备份会丢失一切。请重新演练。',
  thisBackupRestoresDrillItAgain: '这份备份可以恢复。变更后请再次演练，或研究恢复演练。',
  restoreDrillDH: (p0) => `恢复演练 · ${p0} 工时`,
  theBusiestShardTakes: (hot, cross, cpu, scatter) =>
    `最繁忙的分片承担 ${hot}% 的写入。${cross}% 的事务跨分片，因此成本最多达 3 倍，并且可能在任何一个分片上失败。报表和搜索会触及每个分片：CPU +${cpu}%，延迟 +${scatter}。`,
  usersInOtherRegionsWait: (wait) => `其他区域的用户要多等 ${wait}。`,
  writesDivideAcross: (shards, devHours) =>
    `写入会分散到 ${shards} 个分片，每个分片都计费。更改分片数或分片键需要 ${devHours} 开发工时，并要复制一份数据，使卷的 IOPS 减半。`,
}
