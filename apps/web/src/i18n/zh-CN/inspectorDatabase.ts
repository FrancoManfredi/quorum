import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: '存储卷',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${arg(p0)} IOPS，消耗机器 Burn 的 ${arg(p1)} 倍。未命中缓冲区的读取和每次写入都要等待它。`,
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
  restoreDrillDH: (p0) => `恢复演练 · ${arg(p0)} 工时`,
}
