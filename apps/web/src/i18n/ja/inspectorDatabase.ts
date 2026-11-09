import type { Messages } from '../messages.ts'

export const inspectorDatabase: Messages['inspectorDatabase'] = {
  volume: 'ボリューム',
  iOPSAtTheBoxSBurn: (p0, p1) =>
    `${p0} IOPSで、ボックスの支出の${p1}倍。バッファキャッシュに当たらない読み取りと、すべての書き込みがそれを待ちます。`,
  topology: 'トポロジー',
  singlePrimary: '単一プライマリ',
  sharded: 'シャード',
  multiLeader: 'マルチリーダー',
  topologySharded:
    'シャード：各データベースが参照する行の一部を持ちます。トランザクションは可能な限り1つのシャード内に収め、シャードをまたぐものは触れたどのシャードでも失敗し、レポートは全部読みます。',
  topologyMulti:
    'マルチリーダー：すべてのデータベースが全行を持ち、書き込みを受け付けます。certificationが競合する書き込みを落とし、先にコミットしたものが勝ちます。',
  topologySingle:
    '単一プライマリ：書き込みは1つのデータベース、読み取りはリードレプリカが引き受けます。枠で囲むと、2つ以上のデータベースが1つのデータグループになります。',
  leader: 'プライマリ',
  dataGroup: 'データグループ',
  readReplicas: 'リードレプリカ',
  noReadReplicas: 'なし。このデータベースにリードレプリカをリンクすると、読み取りを引き受けます。',
  secondDatabaseFollows:
    'このデータベースを別のデータベースと枠で囲むとデータグループになります。グループは行を1つの方式で保持します。',
  promote: 'プライマリに昇格',
  promoteNote:
    'レプリカがプライマリになり、元のプライマリがそのレプリカになります。非同期レプリカは未送信の書き込みを保持しているため昇格では失われます。同期では失いません。',
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
