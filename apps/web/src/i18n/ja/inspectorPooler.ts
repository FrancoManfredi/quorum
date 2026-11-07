import type { Messages } from '../messages.ts'

export const inspectorPooler: Messages['inspectorPooler'] = {
  poolingMode: 'プーリングモード',
  session: 'セッション',
  transaction: 'トランザクション',
  statement: 'ステートメント',
  oneServerConnectionPerStatementA:
    'ステートメントごとに1つのサーバー接続。複数ステートメントにまたがるトランザクションは失敗します。',
  oneServerConnectionPerClientBarely:
    'クライアントごとに1つのサーバー接続。プーラーなしとほとんど変わりません。',
  oneServerConnectionPerActiveTransaction:
    'アクティブなトランザクションごとに1つのサーバー接続。セッション状態が壊れます。',
}
