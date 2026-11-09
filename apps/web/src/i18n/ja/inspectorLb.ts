import type { Messages } from '../messages.ts'

export const inspectorLb: Messages['inspectorLb'] = {
  variant: '方式',
  forwardsTCPTenTimesTheThroughput:
    'TCPを転送します。スループットは10倍、0.2 ms、しかも安い。HTTPを読まないので、呼び出しをリトライできません。',
  readsHTTPRetriesAndChecksHealth:
    'HTTPを読みます。リトライし、ヘルスチェックします。スループットは低く、ホップは長くなります。',
  policy: 'ポリシー',
  sessions: 'セッション',
  balanced: 'バランス',
  sticky: 'スティッキー',
  everyRequestGoesWhereTheAlgorithm: 'すべてのリクエストはアルゴリズムが決めた先へ行きます。',
  off: 'オフ',
  on: 'オン',
  healthChecks: 'ヘルスチェック',
  s: (p0) => `${p0}秒`,
  shallow: '簡易',
  deep: '詳細',
  stickyHolds:
    'ユーザーは最初に到達したターゲットに留まります。最も古いコピーが最も多くのユーザーを抱え、落ちたターゲットはセッションも連れていきます。一方で、プロセス内キャッシュとリアルタイムのクライアントは温かいままです。',
  slowStart: 'スロースタート',
  slowStartOn:
    '新しいコピーは徐々にトラフィックを受けます。だからコールドのJavaコピーがコールドの速度で答えることはありません。',
  slowStartOff: '新しいコピーはいきなり全取り分を受けます。',
}
