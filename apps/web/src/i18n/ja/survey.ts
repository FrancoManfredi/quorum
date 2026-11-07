import type { Messages } from '../messages.ts'

export const survey: Messages['survey'] = {
  title: '手応えはどうでしたか？',
  note: '回答とこのエグジットは開発者に届きます。',
  issues: 'プレイ中に気になったことは？',
  likes: 'よかったところは？',
  send: '送信',
  sending: '送信中…',
  skip: 'スキップ',
  sent: 'ありがとうございます。回答を送信しました。',
  failed: (value) => `送信できませんでした。${value}`,
  offline: 'サーバーに接続できませんでした。もう一度お試しください。',
  empty: '少なくとも1つは回答を書いてください。',
  noExit: '報告するエグジットがありません。',
}
