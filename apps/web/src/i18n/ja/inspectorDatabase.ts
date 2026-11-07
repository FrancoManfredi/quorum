import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: 'ボリューム',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${p0} IOPSで、ボックスの支出の${p1}倍。バッファキャッシュに当たらない読み取りと、すべての書き込みがそれを待ちます。`,
  shards: 'シャード',
  onePrimaryAReadReplicaIs: 'プライマリは1つ。読み取りをそこから引き受けるのがリードレプリカです。',
  shardKey: 'シャードキー',
  reports: 'レポート',
  scanTheTable: 'テーブルをスキャン',
  materializedView: 'マテリアライズドビュー',
  halfTheScanCPUAndThe: 'スキャンのCPUは半分。ただし数字は最後の更新時点のままです。',
  everyReportScansTheTableItself:
    'どのレポートもテーブルそのものをスキャンします。1つ保存するにはマテリアライズドビューを研究してください。',
  retention: '保持',
  oldRowsMoveToCheapStorage:
    '古い行は安いストレージへ移ります。請求は下がり、レポートはリストアを待ちます。',
  oldRowsAreGoneTheBill:
    '古い行は消えます。請求は下がり、レポートはスキャンの3倍のコストで数字を作り直します。',
  everyRowStaysOnTheFast: 'すべての行が高速層に残り、その分課金されます。',
  backups: 'バックアップ',
  noBackupALostTableIs: 'バックアップなし。失ったテーブルは永久に失われます。',
  aRestoreFailedThisBackupWould:
    'リストアが失敗しました。このバックアップではすべてを失います。もう一度訓練してください。',
  thisBackupRestoresDrillItAgain:
    'このバックアップはリストアできます。変更したらもう一度訓練するか、リストア訓練を研究してください。',
  restoreDrillDH: (p0) => `リストア訓練 · ${p0} DH`,
  theBusiestShardTakes: (hot, cross, cpu, scatter) =>
    `最も忙しいシャードが書き込みの${hot}%を受けます。トランザクションの${cross}%はシャードをまたぐので、最大3倍のコストがかかり、どのシャードでも失敗しえます。レポートと検索はすべてのシャードに触れるので、CPU+${cpu}%、レイテンシ+${scatter}です。`,
  usersInOtherRegionsWait: (wait) => `ほかのリージョンのユーザーはさらに${wait}待ちます。`,
  writesDivideAcross: (shards, devHours) =>
    `書き込みは${shards}シャードに分かれ、それぞれに課金されます。数を変えるかキーを変えるには${devHours} DHと、ボリュームのIOPSを半分にするデータコピーが必要です。`,
}
