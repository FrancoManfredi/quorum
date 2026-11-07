import type { Messages } from '../messages.ts'

export const incidents: Messages['incidents'] = {
  ignored: '無視',
  s: (value) => `${value}秒`,
  rollBack: 'ロールバック',
  researchToRollBack: (value) => `ロールバックには${value}のリサーチが必要`,
  file: '起票',
  actionItem: (value) => `アクションアイテム: ${value}`,
  fileAndLeaveTheActionItem:
    '起票してアクションアイテムを未完了のままにする。このインシデントの発生率は2倍のままです',
  showDetails: '詳細を表示',
  users: 'ユーザー',
  revenue: '売上',
  after: '経過',
  leftAlone: '放置',
  followedLeftAlone: (incident) => `${incident}の後、そのまま放置しました。`,
  renew: '更新',
  fenceLeader: 'リーダーを遮断',
  cancelMigration: 'マイグレーションを中止',
  pinAndRedeploy: '固定して再デプロイ',
  restore: 'リストア',
  restartNodes: 'ノードを再起動',
  moveLogin: 'ログインを移す',
  failOver: 'フェイルオーバー',
  restart: '再起動',
  restartHub: 'ハブを再起動',
  throttleConnects: '接続を制限',
}
