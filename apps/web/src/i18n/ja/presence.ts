import type { Messages } from '../messages.ts'

export const presence: Messages['presence'] = {
  opening: (what) => `${what}を開いています`,
  inspector: 'インスペクタ',
  research: 'リサーチ',
  team: 'チームパネル',
  dashboard: 'ダッシュボード',
  playbooks: 'プレイブック',
  help: 'ヘルプ',
  dev: '開発者パネル',
  inbox: '受信箱',
  cost: 'コスト',
  churn: 'チャーン内訳',
  mirror: 'ミラー',
  settings: '設定',
  menu: 'メニュー',
  room: 'ルームパネル',
  exit: '終了画面',
  challenge: 'チャレンジ',
}
