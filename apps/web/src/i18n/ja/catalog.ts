import type { Messages } from '../messages.ts'

export const catalog: Messages['catalog'] = {
  achievements: {
    'hello-world': { name: 'ハローワールド', condition: '最初のリクエストをさばく' },
    'works-on-my-machine': { name: '私の環境では動く', condition: '不正なデプロイを出す' },
    'split-brain': { name: 'スプリットブレイン', condition: 'データベースを専用のノードに分ける' },
    'averages-lie': {
      name: '平均は嘘をつく',
      condition: 'p99が平均の5倍を超えているときにパーセンタイルを研究する',
    },
    'shared-nothing': {
      name: 'シェアードナッシング',
      condition: 'PHP-FPMのサーバーだけで、メモリのインシデントを起こさずシードへ到達する',
    },
    blocked: {
      name: 'ブロック',
      condition: '1つの種別のせいでp99が100 ms上がるNode.jsサービスを持つ',
    },
    'off-by-one-region': {
      name: 'リージョンが一つずれる',
      condition: '150 ms以上離れたリージョンからユーザーに応答する',
    },
    'littles-law': {
      name: 'リトルの法則',
      condition: 'データベースを直すことでアプリサーバーのボトルネックを解消する',
    },
    metastable: { name: 'メタステーブル', condition: 'リトライストームから復旧する' },
    'big-rewrite': {
      name: '大規模書き直し',
      condition: '1つの会社で全サービスを新しい言語へ移行する',
    },
    strangler: {
      name: 'ストラングラー',
      condition: '4段階のトラフィックでマイグレーションを終え、エラーを1%未満に抑える',
    },
    quorum: {
      name: 'クォーラム',
      condition: '3つのリージョンでR + W > Nのワイドカラムストアを動かす',
    },
    eventually: { name: 'いずれ整合', condition: '10億ユーザーでR = 1、W = 1の構成を動かす' },
    polyglot: { name: 'ポリグロット', condition: '本番で5つの言語を同時に動かす' },
    'zero-gc': { name: 'GCゼロ', condition: 'Rustのサービスを100,000 rpsで動かす' },
    'no-cache': { name: 'キャッシュなし', condition: 'キャッシュもCDNもなしでシリーズAへ到達する' },
    celebrity: {
      name: 'セレブリティ',
      condition: 'フォロワー1,000万人の投稿を、ホットキーのエラーなしでさばく',
    },
    'follow-the-sun': {
      name: '太陽を追う',
      condition: '4つのリージョンを、現地のピーク時にどのノードも70%以下でさばく',
    },
    'postgres-for-everything': {
      name: '全部Postgres',
      condition: 'PostgresのデータコンポーネントだけでシリーズBへ到達する',
    },
    'hug-of-death': { name: '抱擁死', condition: 'ユーザーを失わずに×10のスパイクを乗り切る' },
    'egress-shock': {
      name: 'エグレス衝撃',
      condition: 'エグレスが請求書で最大の項目になる',
    },
    'chaos-monkey': { name: 'カオスモンキー', condition: '100回のランダムな停止を乗り切る' },
    blameless: { name: '非難なし', condition: 'ポストモーテムを50本書く' },
    nines: { name: 'ナイン', condition: '99.99%を1週間保つ' },
    'five-nines': { name: 'ファイブナイン', condition: 'ファイブナインのチャレンジをクリアする' },
    monoglot: { name: 'モノグロット', condition: '1つの言語でIPOへ到達する' },
    'default-alive': { name: 'デフォルト生存', condition: 'ラウンドを一度も上げずにIPOへ到達する' },
    unicorn: { name: 'ユニコーン', condition: '評価額10億ドルに到達する' },
    decacorn: { name: 'デカコーン', condition: '評価額100億ドルに到達する' },
    'everyone-online': { name: '全員オンライン', condition: '60億ユーザーに到達する' },
    'warm-start': {
      name: 'ウォームスタート',
      condition: 'スパイク中にJVMサービスをスケールし、p99を悪化させない',
    },
    'rule-of-40': {
      name: '40の法則',
      condition: '上場企業として40の法則のスコア80に到達する',
    },
    'beat-and-raise': {
      name: 'ビート・アンド・レイズ',
      condition: 'ガイダンスを8四半期連続で上回る',
    },
    'serial-founder': { name: '連続起業家', condition: 'すべての事業でエグジットする' },
    'two-hard-things': {
      name: '二つの難題',
      condition: 'キャッシュで古い読み取りのインシデントを起こす',
    },
    'conways-law': {
      name: 'コンウェイの法則',
      condition: 'チームの数よりサービスが多くなり、それを直す',
    },
    fallacies: {
      name: '誤謬',
      condition: 'インシデントで分散コンピューティングの8つの誤謬をすべて経験する',
    },
    'thundering-herd': {
      name: 'サンダリングハード',
      condition: 'エラーなしで再接続ストームを乗り切る',
    },
    runbook: { name: 'ランブック', condition: 'プレイヤーが何もしないままインシデントが解決する' },
    finops: {
      name: 'FinOps',
      condition: 'リザーブド・オンデマンド・スポットのノードを同時に動かす',
    },
    'spot-the-difference': {
      name: 'まちがいさがし',
      condition: 'エラーなしでスポット回収を乗り切る',
    },
    'let-it-crash': {
      name: 'クラッシュに任せる',
      condition: 'Elixirのサービスが、失敗するリクエストなしに1,000回のクラッシュを生き延びる',
    },
  },
  backups: {
    none: { name: 'なし' },
    nightly: { name: '毎晩' },
    pitr: { name: 'PITR' },
  },
  buildGroups: {
    edge: { label: 'エッジ' },
    compute: { label: 'コンピュート' },
    data: { label: 'データ' },
    ops: { label: '運用' },
  },
  cacheKeys: {
    full: { name: 'パス・クエリ・Cookie' },
    query: { name: 'パスとクエリ' },
    path: { name: 'パスのみ' },
  },
  cacheStrategies: {
    aside: { name: 'キャッシュアサイド' },
    'read-through': { name: 'リードスルー' },
    'write-through': { name: 'ライトスルー' },
    'write-behind': { name: 'ライトビハインド' },
  },
  collectors: {
    g1: { label: 'G1' },
    parallel: { label: 'Parallel' },
    zgc: { label: 'ZGC' },
  },
  dbRetentions: {
    keep: { name: 'すべて保持' },
    archive: { name: '30日後にアーカイブ' },
    delete: { name: '30日後に削除' },
  },
  deployStrategies: {
    recreate: { name: '再作成' },
    rolling: { name: 'ローリング' },
    'blue-green': { name: 'ブルーグリーン' },
    canary: { name: 'カナリア' },
  },
  deviceInfo: {
    desktop: { name: 'デスクトップ' },
    mobile: { name: 'モバイル' },
    tablet: { name: 'タブレット' },
  },
  dockGroups: {
    edge: { label: 'エッジ' },
    compute: { label: 'コンピュート' },
    data: { label: 'データ' },
    messaging: { label: 'メッセージング' },
    platform: { label: 'プラットフォーム' },
    insight: { label: '可観測性' },
    managed: { label: 'マネージド' },
  },
  exits: {
    'acqui-hire': { name: 'アクハイア' },
    acquisition: { name: '買収' },
    ipo: { name: 'IPO' },
    'step-down': { name: '退任' },
  },
  families: {
    burstable: {
      name: 'バースト可能',
      blurb: '安い。アイドル中にCPUクレジットを貯め、使い切るとCPUが20%まで落ちます。',
    },
    general: { name: '汎用', blurb: '1 vCPU : 4 GB。' },
    compute: { name: 'コンピューティング', blurb: '1 vCPU : 2 GB。' },
    memory: { name: 'メモリ', blurb: '1 vCPU : 8 GB。' },
    arm: {
      name: 'ARM',
      blurb:
        '汎用ファミリーと同じ構成で20%安い。一部のランタイムとライブラリは移植に手間がかかります。',
    },
  },
  gpuModels: {
    small: { name: '小型 (3B)' },
    medium: { name: '中型 (7B)' },
    large: { name: '大型 (34B)' },
  },
  guided: {
    'out-of-credits': {
      name: 'クレジット切れ',
      objectives: [
        { goal: 'すべてのリクエストを90秒間さばいてください。' },
        { goal: '需要が4倍になります。Apdexを0.85以上に2分間保ってください。' },
        {
          goal: '夜間のトラフィックが元の水準に戻ります。Apdexを0.85以上に保ち、支出は$0.12/s以下にしてください。',
        },
      ],
    },
    'shared-box': {
      name: '相乗りボックス',
      objectives: [
        { goal: 'Apdexを0.85以上に90秒間保ってください。' },
        { goal: '需要が2倍になります。Apdexを0.9以上に保ち、支出は$0.16/s以下にしてください。' },
        {
          goal: '夜間のトラフィックが元の水準に戻ります。Apdexを0.9以上に保ち、支出は$0.11/s以下にしてください。',
        },
      ],
    },
    'second-server': {
      name: '2台目のサーバー',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: 'サーバーが1台落ちます。Apdexを0.85以上に2分間保ってください。' },
        {
          goal: '需要が2倍になります。もう1台落ちてもApdexを0.9以上に保ってください。',
        },
      ],
    },
    'connection-limit': {
      name: '接続上限',
      objectives: [
        { goal: 'すべてのリクエストを90秒間さばいてください。' },
        { goal: '需要が2倍になります。Apdexを0.9以上に2分間保ってください。' },
        {
          goal: 'デプロイで全プールが2倍になります。エラーを1%未満に抑えてください。',
        },
      ],
    },
    'event-loop-stall': {
      name: 'イベントループ停止',
      objectives: [
        { goal: 'p99を300 ms未満に2分間保ってください。' },
        {
          goal: 'パスワードのハッシュ化が4倍遅くなります。p99を600 ms未満に2分間保ってください。',
        },
      ],
    },
    'read-mostly': {
      name: '読み取り中心',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: '需要が2倍になります。Apdexを0.9以上に保ち、支出は$2.60/s以下にしてください。' },
        {
          goal: 'インデックスなしのクエリが出荷されます。その後2分間、Apdexを0.85以上に保ってください。',
        },
      ],
    },
    stampede: {
      name: 'スタンピード',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: 'キャッシュが再起動します。Apdexを0.85以上に2分間保ってください。' },
        {
          goal: '需要が50%増えます。キャッシュがまた再起動します。Apdexを0.85以上に保ち、支出は$8.00/s以下にしてください。',
        },
      ],
    },
    'slow-uploads': {
      name: '遅いアップロード',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: '需要が60%増えます。Apdexを0.9以上に保ち、支出は$6.00/s以下にしてください。' },
        {
          goal: 'あるタスクが永久に失敗します。キューを500タスク未満に2分間保ってください。',
        },
      ],
    },
    bots: {
      name: 'ボット',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: 'スクレイパーが来ます。Apdexを0.9以上に2分間保ってください。' },
        {
          goal: 'また来ました。Apdexを0.9以上に保ち、支出は$10.80/s以下にしてください。',
        },
      ],
    },
    'zone-outage': {
      name: 'ゾーン障害',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: 'ゾーンが1つ落ちます。Apdexを0.85以上に2分間保ってください。' },
        {
          goal: '需要が50%増えます。ゾーンがまた落ちます。Apdexを0.85以上に保ち、支出は$22.20/s以下にしてください。',
        },
      ],
    },
    'cold-start': {
      name: 'コールドスタート',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        { goal: '4倍のスパイクが来ます。Apdexを0.85以上に2分間保ってください。' },
        {
          goal: '夜間のトラフィックです。Apdexを0.9以上に保ち、支出は$17.40/s以下にしてください。',
        },
      ],
    },
    'stale-checkout': {
      name: '古いデータのチェックアウト',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        {
          goal: '書き込みが溜まります。2分間、すべてのチェックアウトを正しいまま保ってください。',
          watch: { label: 'チェックアウト' },
        },
        {
          goal: '需要が50%増え、書き込みも戻ってきます。その間もすべてのチェックアウトを正しいまま保ってください。',
          watch: { label: 'チェックアウト' },
        },
      ],
    },
    'gc-pauses': {
      name: 'GCポーズ',
      objectives: [
        {
          goal: 'API読み取りのp99を110 ms未満に90秒間保ってください。',
          watch: { label: '読み取りp99' },
        },
        {
          goal: 'ヒープが埋まります。API読み取りのp99を110 ms未満に2分間保ってください。',
          watch: { label: '読み取りp99' },
        },
        {
          goal: 'また埋まります。読み取りのp99を110 ms未満に保ち、支出は$93.20/s以下にしてください。',
          watch: { label: '読み取りp99' },
        },
      ],
    },
    'retry-storm': {
      name: 'リトライストーム',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        {
          goal: 'データベースが20秒間遅くなります。エラーを1%未満に戻し、2分間保ってください。',
        },
        {
          goal: 'また遅くなります。エラーを1%未満に戻し、支出$197.00/s以下で保ってください。',
        },
      ],
    },
    'analytics-primary': {
      name: 'プライマリでの分析',
      objectives: [
        { goal: 'Apdexを0.9以上に90秒間保ってください。' },
        {
          goal: '四半期末です。レポートが全テーブルをスキャンします。Apdexを0.85以上に2分間保ってください。',
        },
        {
          goal: '需要が50%増えます。Apdexを0.9以上に保ち、支出は$254.00/s以下にしてください。',
        },
      ],
    },
    'far-away': {
      name: '遠隔ユーザー',
      objectives: [
        { goal: 'すべてのリクエストを2分間さばいてください。' },
        {
          goal: 'ユーザーの半分は北米の外に住んでいます。API読み取りの平均を140 ms未満に2分間保ってください。',
          watch: { label: '読み取り平均' },
        },
      ],
    },
    'missed-write': {
      name: '書き込みの取りこぼし',
      objectives: [
        {
          goal: 'すべてのAPI読み取りに最新の書き込みが見えるようにし、2分間保ってください。',
          watch: { label: '最新の読み取り' },
        },
        {
          goal: 'レプリカが1台落ちます。読み取りを最新に保ち、エラーを1%未満に2分間抑えてください。',
          watch: { label: '最新の読み取り' },
        },
      ],
    },
    'hot-key': {
      name: 'ホットキー',
      objectives: [
        { goal: 'Apdexを0.9以上に2分間保ってください。' },
        { goal: '有名人が投稿します。Apdexを0.85以上に2分間保ってください。' },
      ],
    },
  },
  lbPolicies: {
    weighted: { label: '重み付き' },
    'round-robin': { label: 'ラウンドロビン' },
    'least-conn': { label: '最小接続数' },
    p2c: { label: '2択' },
    hash: { label: 'コンシステントハッシュ' },
  },
  logAcks: {
    '0': { name: '確認なし' },
    '1': { name: 'リーダー' },
    all: { name: '全レプリカ' },
  },
  mutators: {
    'chaos-monkey': {
      name: 'カオスモンキー',
      rule: 'シード以降はインスタンス障害が支配的になる',
    },
    'hn-front-page': {
      name: 'Hacker Newsのトップページ',
      rule: 'トラフィックスパイクが3倍の頻度で起きる',
    },
    'legacy-monolith': {
      name: 'レガシーモノリス',
      rule: '巨大なPHPコードベース。マイグレーションは×3、技術的負債は40%から始まる',
    },
    'one-region': {
      name: '単一リージョン縛り',
      rule: 'ホームリージョンの外にノードを置けない',
    },
    'no-caches': { name: 'キャッシュ禁止', rule: 'キャッシュもCDNもなし' },
    'tight-budget': { name: '厳しい予算', rule: '資金調達の額が半分になる' },
    'single-language': { name: '単一言語', rule: 'すべてのアプリサーバーがPHPで動く' },
    postgres: {
      name: '全部Postgres',
      rule: 'キャッシュ、ワイドカラムストア、合意形成データベース、データウェアハウスは使えない',
    },
    'strict-slo': { name: '厳格なSLO', rule: 'SLOが1段階高くなる' },
    'shared-tenancy': {
      name: '共用テナント',
      rule: 'ノイジーネイバーが全インスタンスのCPUを奪う',
    },
  },
  perks: {
    'angel-network': { name: 'エンジェルネットワーク', effect: '開始時の資金 ×2' },
    'alumni-network': { name: '卒業生ネットワーク', effect: 'プレシードでエンジニア +1' },
    'institutional-knowledge': {
      name: '組織の知識',
      effect: 'エグジット後もリサーチを1つ保持',
    },
    'pattern-recognition': { name: 'パターン認識', effect: 'インサイト +20%' },
    'founders-reputation': { name: '創業者の評判', effect: 'ユーザー成長 +10%' },
    'better-terms': { name: '有利な条件', effect: 'ラウンドごとの希薄化 −2ポイント' },
    'night-shift': { name: '夜勤', effect: 'オフライン上限 12時間、18時間、24時間' },
    'time-dilation': { name: '時間の歪み', effect: '20倍、続いて40倍の速度を解放' },
    playbooks: { name: 'プレイブック', effect: 'プレイブックスロット 2、5、10、25' },
    'war-stories': {
      name: '戦記',
      effect: '未完了のアクションアイテムが発生率を上げる幅が半分になる',
    },
    'head-start': {
      name: '先行スタート',
      effect: 'プレシード、続いてシード、シリーズAで開始',
    },
    autopilot: {
      name: 'オートパイロット',
      effect: 'ポリシー: 最も安い研究をキューに入れ、採用し、アプリサーバーの負荷を低く保つ',
    },
  },
  pmModes: {
    static: { label: '静的' },
    dynamic: { label: '動的' },
    ondemand: { label: 'オンデマンド' },
  },
  policies: {
    'move-fast': { label: '速度優先' },
    balanced: { label: 'バランス' },
    quality: { label: '品質優先' },
  },
  pricings: {
    'on-demand': {
      name: 'オンデマンド',
      blurb: '定価。ノードはいつでも外せます。',
    },
    reserved: {
      name: 'リザーブド',
      blurb: '0.6×、1週間のコミットメント。期間の途中で手放すと残りの支出を払うことになります。',
    },
    spot: {
      name: 'スポット',
      blurb: '0.3×。プロバイダは10秒の予告でノードを回収できます。',
    },
  },
  regionInfo: {
    na: { name: '北米', short: 'NA' },
    eu: { name: '欧州', short: 'EU' },
    apac: { name: 'アジア太平洋', short: 'APAC' },
    sa: { name: '南米', short: 'SA' },
  },
  shardKeys: {
    hash: { name: 'ユーザーIDのハッシュ' },
    range: { name: 'IDの範囲' },
    tenant: { name: 'テナント別' },
    region: { name: 'リージョン別' },
  },
  storageClasses: {
    standard: { name: '標準' },
    infrequent: { name: '低頻度アクセス' },
    archive: { name: 'アーカイブ' },
  },
  storageIops: {
    general: { name: '汎用' },
    provisioned: { name: 'プロビジョンドIOPS' },
  },
  tasks: {
    'add-index': {
      name: 'インデックスの追加',
      effect: 'スロークエリを終わらせ、クエリ形状を1つカバーする',
    },
    'eager-loading': {
      name: '一括読み込み',
      effect: 'ORMフレームワークがN+1クエリを送らなくなる',
    },
    'fix-leak': {
      name: 'メモリリークの修正',
      effect: '次の機能を出すまでリークしない',
    },
    'session-state': {
      name: 'セッション状態の廃止',
      effect: 'トランザクションプーリングでクエリが壊れなくなる',
    },
    refactor: { name: 'リファクタリング', effect: '技術的負債 −20ポイント' },
    'fix-bugs': {
      name: 'マイグレーションの不具合修正',
      effect: '新しいスタックでリクエストが失敗しなくなる',
    },
    'upgrade-cluster': {
      name: 'クラスターの更新',
      effect: 'すべてのKubernetesクラスターが四半期の間サポート対象のバージョンで動く',
    },
    runbook: {
      name: 'ランブックを書く',
      effect: '1種類のインシデントがプレイヤーの操作なしで自然に解決する',
    },
    'idempotency-keys': {
      name: '冪等キー',
      effect: 'リトライしたチェックアウトが二重に課金されない',
    },
    'off-loop': {
      name: 'イベントループ外へのCPU処理移動',
      effect: 'Node.jsとPython asyncがCPU負荷の高い種別をワーカースレッドへ回す',
    },
    'timeouts-retries': {
      name: 'タイムアウトとリトライの追加',
      effect:
        'アプリサーバーやワーカーから出るすべてのリンクに5秒のタイムアウトとバックオフ付きリトライが付く',
    },
    'graceful-shutdown': {
      name: 'グレースフルシャットダウン',
      effect: 'デプロイやスケールダウン時に、処理中のリクエストを失敗させずに完了させる',
    },
    'health-check': {
      name: 'ヘルスチェックエンドポイント',
      effect: 'ロードバランサーが詳細なヘルスチェックを実行できる',
    },
    'load-test': {
      name: '負荷試験',
      effect: 'すべてのノードを需要2倍の状態で1日表示する',
    },
  },
  vecIndexes: {
    exact: { name: '厳密' },
    hnsw: { name: 'HNSW' },
  },
  ventures: {
    'b2b-saas': { name: 'B2B SaaS', summary: '夕方のピーク' },
    'consumer-social': {
      name: 'コンシューマーSNS',
      summary: 'ユーザーは2倍、1人あたりの価値は半分。動画 +50%、バイラルのスパイクは2倍の頻度',
    },
    fintech: {
      name: 'フィンテック',
      summary: '営業時間。チェックアウト ×4、API書き込み +50%。金銭を扱う読み取りが古いと罰金',
    },
    streaming: {
      name: '動画配信',
      summary: '深夜のピーク。動画 ×4。エグレスは3倍の費用',
    },
    'game-backend': { name: 'ゲームバックエンド', summary: '夜のピーク。リアルタイム ×4' },
    'ai-startup': { name: 'AIスタートアップ', summary: '平坦な需要。AIプロンプト ×3' },
    'e-commerce': {
      name: 'EC',
      summary: 'チェックアウト ×2、検索 ×2。毎月決まった日にセール',
    },
    'developer-platform': {
      name: '開発者プラットフォーム',
      summary:
        '平坦だがバースト的。API読み取り ×2、Webhook ×3（シリーズC以降）。素朴なリトライは禁止',
    },
    healthcare: {
      name: 'ヘルスケア',
      summary: '営業時間。API書き込み +50%。シリーズA以降、データはホームリージョンに留まる',
    },
    'ad-tech': {
      name: 'アドテク',
      summary: '平坦で巨大。入札リクエスト ×10。100 msを超えたリクエストは何も稼がない',
    },
    government: {
      name: '公共調達',
      summary: '営業時間で締め切りスパイクあり。JavaかC#のみ。発注から納品まで1日',
    },
    bootstrapped: {
      name: '自己資金',
      summary: 'ラウンドなし。株式は100%のまま',
    },
  },
  challenges: {
    'hello-world': {
      name: 'ハローワールド',
      brief: '1台で20 rpsを$0.05/s未満でさばく。',
      inspiredBy: 'すべての最初のデプロイ',
    },
    'split-the-box': {
      name: 'ボックスを分ける',
      brief:
        'アプリとデータベースが同じボックスに載っている。100 rpsをさばき、p99を300 ms未満に保つ。',
      inspiredBy: 'ほとんどの会社が最初に踏むスケーリングの一歩',
    },
    slashdotted: {
      name: 'スラッシュドット',
      brief: '固定予算で3分間、トラフィック×10。',
      inspiredBy: 'スラッシュドット効果',
    },
    c10k: {
      name: 'C10k',
      brief: '10,000本の接続を開く。リクエストごとにプロセスを立てるサーバーはこれを拒否する。',
      inspiredBy: 'Dan KegelのC10k問題 (1999)',
    },
    'event-loop': {
      name: 'イベントループ',
      brief: 'Node.jsのみ。ログイン5%。p99を300 ms未満に。',
      inspiredBy: 'Node.jsの「イベントループを塞ぐな」',
    },
    'too-many-connections': {
      name: '接続が多すぎる',
      brief: 'アプリサーバー40台にPostgres 1台。接続の拒否ゼロ。',
      inspiredBy: 'PostgreSQLの接続上限',
    },
    shoestring: {
      name: 'Stack Overflow流の低予算構成',
      brief: 'ノード12台以下で800 rpsをさばく。',
      inspiredBy: 'Stack Overflowは少数のサーバーで巨大なトラフィックをさばいていた',
    },
    'n-plus-one': {
      name: 'N+1',
      brief: 'N+1クエリの出るRails。修正に12 DH。',
      inspiredBy: 'ORMの遅延読み込み',
    },
    'thirteen-engineers': {
      name: '13人のエンジニア',
      brief: 'Railsで400 rps。エンジニア13人に1日、つまり104 DH。',
      inspiredBy: 'Facebookが買収したときのInstagramは従業員13人だった (2012)',
    },
    'credential-stuffing': {
      name: 'クレデンシャルスタッフィング',
      brief: 'ボットが漏えいしたパスワードでログインを試す。本物のユーザーをログインさせ続ける。',
      inspiredBy: 'ログインエンドポイントへの一般的な攻撃',
    },
    'black-friday': {
      name: 'ブラックフライデー',
      brief: '5分の時点で需要が3倍になり、それが5分続く。支出はできるだけ抑える。',
      inspiredBy: '小売のピーク日',
    },
    'us-east-1': {
      name: 'us-east-1',
      brief: '5分の時点でゾーンが1つ落ちる。リクエストの99.9%を守る。',
      inspiredBy: 'AWS us-east-1で起きた複数の障害',
    },
    'exactly-once': {
      name: 'ちょうど1回',
      brief: '決済プロバイダが2回、2秒まで遅くなる。各チェックアウトの課金は1回だけ。',
      inspiredBy: '決済の冪等性',
    },
    'two-million-sockets': {
      name: '200万ソケット',
      brief: '200万本のチャット接続を開いたまま、できるだけ少ない金額で維持する。',
      inspiredBy: 'Phoenixは1台のサーバーで200万のWebSocket接続に到達した (2015)',
    },
    'pokemon-go': {
      name: 'Pokémon GO',
      brief: 'ローンチ当日、10分で需要が予測の50倍に達する。',
      inspiredBy: 'Pokémon GOのローンチ時のトラフィックは想定の約50倍に達した (2016)',
    },
    'healthcare-launch': {
      name: 'ヘルスケアのローンチ',
      brief: '2分の時点でローンチ。この設計には欠陥が多い。見つける。',
      inspiredBy: 'healthcare.govのローンチ (2013)',
    },
    'thundering-herd': {
      name: 'サンダリングハード',
      brief:
        '2分の時点でチャットサーバーが再起動する。24万のクライアントが一斉に再接続してログインする。',
      inspiredBy: '再接続ストーム',
    },
    'read-states': {
      name: 'リードステート',
      brief: 'ヒープが2回満杯になる。p99を90 ms未満に保つ。ランタイムは自由。',
      inspiredBy: 'DiscordはGCスパイクをなくすため、あるサービスをGoからRustへ移した (2020)',
    },
    'fail-whale': {
      name: 'フェイルホエール',
      brief: 'フィードをさばき、p99を200 ms未満に保つ。フォロワー1,000万人のアカウントもある。',
      inspiredBy: 'Twitterのタイムラインのスケーリング問題',
    },
    'reports-at-noon': {
      name: '正午のレポート',
      brief:
        '2分と5分の時点で、経理がプライマリでレポートを回す。中止はできない。チェックアウトを速いまま保つ。',
      inspiredBy: 'トランザクション用データベースへの分析クエリ',
    },
    'gpu-economics': {
      name: 'GPUの経済性',
      brief: 'すべてのAIプロンプトをさばき、売上の15%を利益率として残す。',
      inspiredBy: '自前の推論とホスト型APIの戦い',
    },
    metastable: {
      name: 'メタステーブル',
      brief: 'リトライストームが進行中。最小限の変更で復旧する。',
      inspiredBy: '分散システムのメタステーブル障害',
    },
    'regex-of-doom': {
      name: '破滅の正規表現',
      brief:
        '2分の時点で新しいWAFルールがすべてのWAFをCPU 100%に張り付かせる。サービスを復旧する。',
      inspiredBy: 'Cloudflareの障害、2019年7月2日',
    },
    'forty-three-seconds': {
      name: '43秒',
      brief: '2分の時点でリージョン間のリンクが切れる。リーダーを1つに保つ。',
      inspiredBy: 'GitHubのネットワーク分断、2018年10月21日',
    },
    'follow-the-sun': {
      name: '太陽を追う',
      brief: '4つのリージョンがそれぞれの夕方ピークを迎える1日。支出は$700/s未満。',
      inspiredBy: '世界各地の日次ピーク',
    },
    celebrity: {
      name: 'セレブリティ',
      brief: '2分の時点で有名人が投稿する。読み取りの30%が1つのキーに集中する。',
      inspiredBy: 'バズったアカウントによるホットキー',
    },
    'gone-from-the-internet': {
      name: 'インターネットから消える',
      brief: '2分の時点でルーティングが変わり、全リージョンがインターネットから消える。元に戻す。',
      inspiredBy: 'Facebookの障害、2021年10月4日',
    },
    'the-typo': {
      name: '打ち間違い',
      brief: '2分の時点で、サーバー1台を外すはずのコマンドが検索層ごと外してしまう。',
      inspiredBy: 'Amazon S3の障害、2017年2月28日',
    },
    'leap-second': {
      name: 'うるう秒',
      brief:
        '2分の時点でアジア太平洋の時計が1秒を繰り返す。そこのアプリサーバーはすべてCPU 100%で回り続ける。p99を380 ms未満に保つ。',
      inspiredBy: '2012年のうるう秒',
    },
    'rule-of-40': {
      name: '40の法則',
      brief:
        'このチャレンジの間にユーザーが25%増える。成長率と利益率の合計40を目指し、利益率15%を確保する。',
      inspiredBy: 'SaaSの40の法則',
    },
    'postgres-for-everything': {
      name: '全部Postgres',
      brief: 'Postgresだけをデータストアとして全種別をさばき、p99を800 ms未満に保つ。',
      inspiredBy: '「とりあえずPostgresでいい」という主張',
    },
    'five-nines': {
      name: 'ファイブナイン',
      brief:
        '4週間で、サーバー2台とリージョン1つが落ち、トラフィックが一度3倍になる。99.999%を守る。',
      inspiredBy: '99.999%の可用性目標',
    },
  },

  components: {
    users: {
      name: 'ユーザー',
      product: 'インターネット',
      blurb:
        'トラフィックが始まる場所。ドメインは1つのホストに解決されるので、ユーザーが取るリンクは1本だけです。',
    },
    payments: {
      name: '決済',
      product: '請求書',
      blurb: '売上がここで待っています。引き出しに入っているのはおよそ1分分です。',
    },
    analytics: {
      name: 'アナリティクス',
      product: 'OpenTelemetry',
      blurb:
        'どのノードでもリンクできます。そのトラフィックをサンプリングし、インサイトに変えます。',
    },
    server: {
      name: 'アプリサーバー',
      product: '仮想マシン',
      blurb: 'コードを動かします。リクエストに応答し、データベースへクエリを投げます。',
    },
    database: {
      name: 'データベース',
      product: 'PostgreSQL or MySQL',
      blurb:
        '唯一の正となるデータ。Postgresは接続ごとにプロセスをforkし、MySQLは接続ごとにスレッドを与えます。',
    },
    dns: {
      name: 'DNS',
      product: 'Route 53',
      blurb:
        '最大8ホストへのラウンドロビン。ヘルスチェックはなく、死んだホストも取り分を保ちます。',
    },
    lb: {
      name: 'ロードバランサー',
      product: 'NGINX',
      blurb: 'トラフィックをアプリサーバーに振り分け、死んだホストを次のヘルスチェックで外します。',
    },
    pooler: {
      name: 'コネクションプーラー',
      product: 'PgBouncer',
      blurb: '多数のアプリ接続が、20本のデータベース接続を共有します。',
    },
    cache: {
      name: 'キャッシュ',
      product: 'Redis',
      blurb:
        'ホットなデータが載っている間は、読み取りクエリをメモリから返します。書き込みは素通りし、キャッシュを無効化します。',
    },
    replica: {
      name: 'リードレプリカ',
      product: 'PostgreSQLレプリカ',
      blurb: '読み取りに答えます。書き込みには遅れるので、一部のAPI読み取りは古い値を返します。',
    },
    auth: {
      name: '認証プロバイダ',
      product: 'Auth0',
      blurb: 'パスワードのハッシュ化を肩代わりします。課金はユーザー単位です。',
    },
    search: {
      name: '検索エンジン',
      product: 'Elasticsearch',
      blurb: '検索クエリに答えます。サイズ1段ごとに毎秒400件。',
    },
    storage: {
      name: 'オブジェクトストレージ',
      product: 'Amazon S3',
      blurb:
        'アップロードされたファイルを保持します。上限はありません。保存した分だけ課金されます。',
    },
    doc: {
      name: 'ドキュメントストア',
      product: 'MongoDB, Firestore',
      blurb:
        '行ではなくドキュメントを保持します。結合もプールすべき接続もなく、読み書きは一律のレートで、クエリごとに専用のインデックスが要ります。',
    },
    queue: {
      name: 'キュー',
      product: 'RabbitMQ',
      blurb: '仕事を今引き受け、ワーカーが後でやります。ユーザーが待つのはエンキューまでです。',
    },
    worker: {
      name: 'ワーカー',
      product: 'Sidekiq',
      blurb:
        'キューから来たタスクでコードを動かします。ユーザーが待つことはありません。エクスポートが読むデータにリンクさせてください。',
    },
    log: {
      name: 'イベントストリーム',
      product: 'Apache Kafka',
      blurb:
        'キューではなくログです。イベントは読まれた後も残るので、コンシューマーは再生できます。コンシューマーはそれぞれ1パーティションを読み、自分のペースで遅れます。',
    },
    fn: {
      name: 'サーバーレス関数',
      product: 'AWS Lambda',
      blurb:
        'リクエストごとにコードを動かし、持つべき箱がありません。待機中はゼロ、起きればコールドスタート、同時実行は1,000です。',
    },
    cdn: {
      name: 'CDN',
      product: 'Cloudflare',
      blurb:
        'キャッシュできるページをユーザーの近くから返します。エッジからのエグレスは安く済みます。',
    },
    waf: {
      name: 'WAF',
      product: 'ModSecurity',
      blurb: 'ボットがアプリに届く前に止めます。本物のユーザーもいくらか巻き込みます。',
    },
    gw: {
      name: 'APIゲートウェイ',
      product: 'Kong',
      blurb:
        'API呼び出しをレート制限し、ルーティングします。レート上限を超えたリクエストはthrottled扱いで失敗し、課金はリクエスト単位です。',
    },
    ws: {
      name: 'リアルタイムハブ',
      product: 'Socket.IO',
      blurb:
        'リアルタイムのメッセージごとに接続を開いたまま保ちます。何本入るかはランタイム次第です。',
    },
    psp: {
      name: '決済プロバイダ',
      product: 'Stripe',
      blurb: 'チェックアウトのカードを課金します。1件あたり2.9%＋$0.30。',
    },
    autoscaler: {
      name: 'オートスケーラー',
      product: 'Auto Scalingグループ',
      blurb:
        'アプリサーバーやワーカーをリンクします。高負荷になればコピーを増やし、暇になれば減らします。',
    },
    ci: {
      name: 'CI/CDパイプライン',
      product: 'GitHub Actions',
      blurb:
        '待っているものを出荷します。デプロイ戦略が、デプロイにかかる時間、燃やす支出、そして不正なデプロイの深刻さを決めます。',
    },
    cluster: {
      name: 'Kubernetesクラスター',
      product: 'Kubernetes',
      blurb:
        'アプリサーバーやワーカーをリンクします。共有ノードに詰め込まれ、支出が15%減り、コピーは30秒で立ちます。',
    },
    warehouse: {
      name: 'データウェアハウス',
      product: 'BigQuery',
      blurb:
        'レポートのスキャンをカラム指向で返します。1件1.5秒、上限なし、スキャン量に応じた課金です。',
    },
    vec: {
      name: 'ベクトルインデックス',
      product: 'pgvector, Pinecone, Qdrant',
      blurb:
        'エンベディングの近傍探索に答えます。インデックスはメモリに載り、ここに届いたプロンプトはより多く稼ぎます。',
    },
    gpu: {
      name: 'GPUノード',
      product: 'NVIDIA上のvLLM',
      blurb: 'AIプロンプトを毎秒トークン数で処理します。サイズ1段ごとにGPUが倍になります。',
    },
    edge: {
      name: 'エッジ関数',
      product: 'Cloudflare Workers',
      blurb:
        '小さなハンドラーをユーザーの隣で動かします。5 ms、コールドスタートなし、箱ではなくCPU上限で動きます。',
    },
    llm: {
      name: 'LLM API',
      product: 'ホスト型モデル',
      blurb: 'GPUなしでAIプロンプトを処理します。トークン単位の課金で、レート制限があります。',
    },
    msgp: {
      name: 'プッシュプロバイダ',
      product: 'Amazon SNS',
      blurb: 'プッシュ通知とメールを送ります。メッセージ単価の課金で、毎秒10,000件。',
    },
    wide: {
      name: 'ワイドカラムストア',
      product: 'Apache Cassandra',
      blurb: '各キーをN個のノードに複製します。読み取りはR個に問い、書き込みはW個を待ちます。',
    },
    dsql: {
      name: '分散SQL',
      product: 'CockroachDB',
      blurb: 'Raft上のSQLです。書き込みはレプリカの過半数を待ちます。',
    },
    cdc: {
      name: 'CDCコネクター',
      product: 'Debezium',
      blurb:
        'データベースをリンクします。書き込みログから変更をすべて読み、イベントストリームへ流すので、アプリが二度書くことはありません。',
    },
    mesh: {
      name: 'サービスメッシュ',
      product: 'Istio',
      blurb:
        'アプリサーバーとワーカーをリンクします。各ノードの隣のサイドカーが呼び出しをリトライし、遮断し、監視します。ホップごとに+1 ms、CPUの5%を使います。',
    },
    ff: {
      name: 'フィーチャーフラグ',
      product: 'LaunchDarkly',
      blurb:
        'フィーチャーを5%、25%、50%、または全ユーザーへ展開し、ワンクリックで切れます。不正なデプロイの影響は、その機能を持つ割合だけです。',
    },
    pki: {
      name: 'シークレットと証明書',
      product: "Let's Encrypt",
      blurb:
        '鍵を保管し、TLS証明書を期限切れ前に更新します。これが動いていないと、証明書はカレンダーどおりに切れ、サイトは落ちます。',
    },
  },
  features: {
    'landing-page': { name: 'ランディングページ', effect: '市場+20%、ページビュー+10%' },
    'signup-flow': {
      name: 'サインアップフロー',
      effect: '成長+15%、書き込みが早く届く',
    },
    pagination: {
      name: 'ページネーション',
      effect: 'API読み取りの転送バイトが半分になる',
      hidden: 'インデックスのないクエリ形状が増える',
    },
    'password-login': {
      name: 'パスワードログイン',
      effect: 'ログインが届く。1件あたり80 msのCPU',
    },
    'paid-plans': {
      name: '有料プラン',
      effect: '書き込みの稼ぎが30%増、さらにサブスクリプション',
    },
    'email-digests': {
      name: 'メールダイジェスト',
      effect:
        '離脱−10%。ダイジェストはジョブのバーストで送られ、エクスポートが2倍、1件あたり400 msのCPUと50回の読み取り',
      hidden: '送信はジョブのバースト',
    },
    'search-filters': {
      name: '検索フィルター',
      effect: '検索の稼ぎが25%増',
      hidden: '検索クエリのコストが40%増',
    },
    'profile-photos': {
      name: 'プロフィール写真',
      effect: '成長+10%、アップロードが届く。1件あたり120 msのCPU',
    },
    'public-api': {
      name: '公開API',
      effect: '市場+25%、API読み取り+30%',
      hidden: 'ボット+50%',
    },
    'infinite-scroll': {
      name: '無限スクロール',
      effect: 'API読み取りの稼ぎが10%増え、ユーザーの送信も40%増える',
    },
    video: { name: '動画', effect: '市場+40%、動画が届く。1件あたり5 MB' },
    chat: {
      name: 'チャット',
      effect: '離脱−20%、リアルタイムのメッセージが接続を開いたまま保つ',
    },
    checkout: {
      name: 'チェックアウト',
      effect: 'チェックアウトが届く。1件$25、決済プロバイダ経由',
    },
    'notifications-center': {
      name: '通知センター',
      effect: '成長+10%、リアルタイム+20%',
    },
    'mobile-app': { name: 'モバイルアプリ', effect: '市場+60%、API読み取り+50%' },
    'data-export': {
      name: 'データエクスポート',
      effect: '書き込みの稼ぎが20%増。エクスポートが届く。1件あたり400 msのCPUと50回の読み取り',
    },
    dashboards: {
      name: 'ダッシュボード',
      effect: '市場+10%。レポートが届く。1件あたりテーブルスキャン1回',
    },
    'ai-assistant': {
      name: 'AIアシスタント',
      effect: 'AIプロンプトが届く。1件$24、GPUノードかLLM APIが処理',
    },
    recommendations: {
      name: 'レコメンド',
      effect: '動画+30%',
      hidden: 'エクスポート+30%。モデルはバッチで学習する',
    },
    'audit-log': {
      name: '監査ログ',
      effect: '市場+10%。エンタープライズが買える',
      hidden: '書き込みクエリのコストが20%増',
    },
    'activity-feed': {
      name: 'アクティビティフィード',
      effect:
        '市場+50%。フィードが届く。1件あたり読み取り20回、または書き込み時ファンアウトのタイムライン1本',
    },
    webhooks: {
      name: 'Webhook',
      effect: '市場+20%。Webhookが届く。顧客サーバーへの800 msの呼び出し',
    },
    'push-notifications': {
      name: 'プッシュ通知',
      effect: '成長+15%。通知が届く。プッシュプロバイダ経由',
      hidden: '離脱+5%。ユーザーが飽きる',
    },
    localization: { name: 'ローカライズ', effect: '北米以外で市場+40%' },
    'offline-mode': {
      name: 'オフラインモード',
      effect: '離脱−10%',
      hidden: '書き込み+10%。再接続時にデバイスが一斉に同期する',
    },
    'single-sign-on': {
      name: 'シングルサインオン',
      effect: '市場+10%。エンタープライズがSAMLでサインインする',
    },
    'data-residency': {
      name: 'データレジデンシー',
      effect: 'EU市場に必須。EUのデータはEUのリージョンに留まる',
    },
    'status-page': {
      name: 'ステータスページ',
      effect: '離脱−10%。対応中だとユーザーに見える',
    },
    'usage-pricing': {
      name: '従量課金',
      effect: 'エクスポート、書き込み、プロンプト、Webhookの稼ぎが15%増',
    },
  },
  frameworks: {
    none: {
      name: 'フレームワークなし',
      blurb: '動かすのは速く、機能を作るのは遅いです。',
    },
    laravel: {
      name: 'Laravel',
      blurb:
        '機能を速く出せて、バックグラウンド処理の開発工数が20%減ります。CPU1.8×（ワーカーモードでは1.1×）で、Eloquentは1回で足りる読み取りを3回投げます。',
    },
    rails: {
      name: 'Rails',
      blurb: '機能を速く出せて、ページビューの稼ぎが20%増えます。CPU1.5×で、N+1クエリが出ます。',
    },
    express: {
      name: 'Express',
      blurb:
        '最小限でどこにでもあります。CPU1.1×で、ミドルウェアの増殖により技術的負債が10%速く積み上がります。',
    },
    django: {
      name: 'Django',
      blurb:
        '機能を速く出せて、管理サイトのおかげで社内ツールの開発工数が30%減ります。CPU1.4×で、N+1クエリが出ます。',
    },
    symfony: {
      name: 'Symfony',
      blurb:
        '厳格な構造です。調整が30%減り、技術的負債の進行が30%遅くなります。CPU1.5×で、N+1クエリは出ません。',
    },
    sinatra: { name: 'Sinatra', blurb: '軽いです。CPU1.1×。' },
    flask: { name: 'Flask', blurb: '軽いです。CPU1.1×。' },
    gin: { name: 'Gin', blurb: '軽いルーターです。CPU1.05×。' },
    'spring-boot': {
      name: 'Spring Boot',
      blurb:
        '大人数のチーム向けの構造で、調整が30%減ります。CPU1.3×、メモリ200 MB増、起動は15秒遅くなります。',
    },
    aspnet: { name: 'ASP.NET Core', blurb: '速くて一通り揃っています。CPU1.05×。' },
    phoenix: { name: 'Phoenix', blurb: 'LiveViewのページの稼ぎが30%増えます。CPU1.1×。' },
    axum: { name: 'Axum', blurb: 'TokioとTowerの上に載っています。CPUの追加負荷はありません。' },
    actix: { name: 'Actix Web', blurb: 'ベンチマークでも最速級です。CPU0.95×。' },
    fastapi: {
      name: 'FastAPI',
      blurb:
        'Pydanticによる検証と、モデル連携に最も向いたエコシステム。`ai`リクエストの稼ぎが15%増えます。CPU1.15×で、ASGIサーバー上のみです。10 MB。',
    },
    fastify: {
      name: 'Fastify',
      blurb:
        'スキーマベースのシリアライズで、読み取りのCPUコストが20%減ります。自身のオーバーヘッドはありません。5 MB。',
    },
    nextjs: {
      name: 'Next.js',
      blurb:
        'サーバーサイドレンダリングとインクリメンタル静的再生成。ページの稼ぎが50%増える代わりにCPUは1.6×かかり、CDNがその40%を返せます。プロセスあたり30 MB。',
    },
    nestjs: {
      name: 'NestJS',
      blurb: '大人数のチーム向けの構造で、調整が30%減ります。CPU1.3×、プロセスあたり20 MB。',
    },
    fiber: {
      name: 'Fiber',
      blurb:
        'fasthttp上のExpress風API。CPUの追加負荷はなく、HTTP/2もありません。プロセスあたり5 MB。',
    },
    quarkus: {
      name: 'Quarkus',
      blurb:
        'ネイティブイメージ向けで、GraalVMビルドの所要時間が半分になります。CPU1.1×、プロセスあたり100 MB。',
    },
    hono: {
      name: 'Hono',
      blurb: 'Web標準の上の小さなルーター。CPUの追加負荷はありません。プロセスあたり2 MB。',
    },
    elysia: {
      name: 'Elysia',
      blurb:
        'Bun向けで、型がサーバーからクライアントまで検査されます。技術的負債の増加が15%遅くなります。CPUの追加負荷はありません。プロセスあたり5 MB。',
    },
    koa: {
      name: 'Koa',
      blurb: 'Expressの後継で、async関数の上に作られています。CPU1.05×、プロセスあたり5 MB。',
    },
    adonis: {
      name: 'AdonisJS',
      blurb:
        'Laravelの考え方をNode.jsに。機能を素早く出荷できます。CPU1.4×、プロセスあたり25 MB、Lucid ORMはN+1クエリを発生させます。',
    },
    codeigniter: {
      name: 'CodeIgniter',
      blurb: '邪魔をしない小さなPHPフレームワーク。CPU1.1×、プロセスあたり4 MB。',
    },
    sanic: {
      name: 'Sanic',
      blurb: '根本から非同期。CPU1.05×、プロセスあたり10 MB。',
    },
    rocket: {
      name: 'Rocket',
      blurb:
        '型安全なルーティングで定型コードが少なく、Rustで最も速く書けます。CPU1.05×、プロセスあたり3 MB。',
    },
  },
  incidents: {
    spike: {
      name: 'トラフィックスパイク',
      cause: '大手ニュースサイトにリンクされました。需要は3倍になりました。',
      prevention: '余剰キャパシティ、キャッシュ、アプリサーバーの増設です。',
    },
    instance: {
      name: 'インスタンス障害',
      cause: 'VMの下のホストが落ちました。',
      prevention:
        'ロードバランサーの後ろに2つ目のコピーを置きます。ロードバランサーは死んだホストを飛ばします。',
    },
    connections: {
      name: '接続枯渇',
      cause: 'デプロイで各コネクションプールが倍になり、Postgresが超過分を拒否しました。',
      prevention: 'コネクションプーラーを置くか、プールを小さくします。',
    },
    loop: {
      name: 'イベントループのブロック',
      cause:
        'パスワードハッシュのコストが10回から12回に上がりました。ログインあたりのCPUは4×です。',
      prevention:
        'libuvスレッドプール、認証プロバイダ、あるいはイベントループが1つだけではないランタイムです。',
    },
    leak: {
      name: 'メモリリーク',
      cause: '常駐プロセスがメモリを漏らし続け、カーネルに殺されました。',
      prevention:
        'サービスを再起動するか、PHPで動かします。PHPはリクエストごとにすべて解放します。',
    },
    'slow-query': {
      name: 'スロークエリ',
      cause:
        '新しい機能がインデックスのないクエリを出荷しました。読み取りのたびにテーブルを全走査します。',
      prevention:
        'クエリ分析が欠けているインデックスを見つけます。キャッシュが読み取りの大半をテーブルから遠ざけます。',
    },
    'bad-deploy': {
      name: '不正なデプロイ',
      cause: 'デプロイがバグを積みました。アプリサーバーへのリクエストが失敗します。',
      prevention: 'ロールバックできるパイプライン、自動テスト、そして小さめのデプロイです。',
    },
    'bot-surge': {
      name: 'ボット急増',
      cause: 'スクレイパーがサイトを見つけました。全トラフィックの半分がボットでした。',
      prevention: 'アプリサーバーの前にWAFを置きます。',
    },
    stuffing: {
      name: 'クレデンシャルスタッフィング',
      cause:
        'ボットが漏えいしたパスワードを試しました。ログインは20×になり、1件ごとにbcryptのハッシュです。',
      prevention: 'WAFがほとんどを止めます。残りは認証プロバイダがハッシュします。',
    },
    stampede: {
      name: 'キャッシュスタンピード',
      cause: 'キャッシュが空のまま再起動しました。すべてのミスが一斉にデータベースへ行きました。',
      prevention:
        'スタンピード対策がミスをまとめます。キャッシュウォーミングがトラフィックの前に埋めておきます。',
    },
    poison: {
      name: 'ポイズンメッセージ',
      cause:
        '必ず失敗するタスクが何度も戻ってきました。ワーカーがキューの代わりにリトライしました。',
      prevention: 'デッドレターキューが失敗するタスクを脇へどけます。',
    },
    ddos: {
      name: 'DDoS',
      cause: '攻撃者がエッジに通常の50倍のトラフィックを流しました。',
      prevention:
        'WAFを置き、始まったらUnder attackモードにします。キャッシュできる分はCDNが引き受けます。',
    },
    certificate: {
      name: '証明書の期限切れ',
      cause: 'TLS証明書が切れました。すべてのブラウザがサイトを拒否しました。',
      prevention: '証明書の自動化が期限前に更新します。',
    },
    'psp-outage': {
      name: '決済プロバイダ障害',
      cause: '決済プロバイダが落ちました。すべてのチェックアウトが失敗しました。',
      prevention:
        '手元でできることはありません。向こうの障害です。終わればチェックアウトは戻ります。',
    },
    zone: {
      name: 'ゾーン障害',
      cause: 'ゾーンが丸ごと落ちました。そこにあるノードはすべて灰色になりました。',
      prevention:
        '余剰キャパシティを持つ2つ目のゾーンにコピーを置き、データベースにはスタンバイを用意します。',
    },
    'disk-full': {
      name: 'ディスク満杯',
      cause: 'ログとWALがデータベースのディスクを埋めました。すべての書き込みが失敗しました。',
      prevention: 'ディスクのアラートで早く気づけます。ボリュームを拡張すれば終わります。',
    },
    'repl-lag': {
      name: 'レプリケーションラグ',
      cause:
        '書き込みのバーストでレプリカが数秒遅れました。書き込み直後の読み取りが古い値を返しました。',
      prevention: 'read-your-writesルーティングがその読み取りをプライマリへ送ります。',
    },
    'latency-regression': {
      name: 'レイテンシ悪化',
      cause:
        'デプロイが全リクエストに同期呼び出しを1つ足しました。応答は1回あたり150 ms遅くなります。',
      prevention: 'リクエスト経路のパーセンタイルとトレース、そしてp99を見張るカナリアです。',
    },
    'gc-storm': {
      name: 'GCポーズ連発',
      cause: 'ヒープが90%を超えました。コレクターが10リクエストに1つを止めました。',
      prevention: 'メモリを増やす、ZGC、またはGOGCのチューニングです。再起動すれば終わります。',
    },
    'retry-storm': {
      name: 'リトライストーム',
      cause:
        'データベースが20秒遅くなりました。呼び出し側が一斉にリトライし、そのリトライが過負荷を保ちました。',
      prevention: 'ジッター付きバックオフ、サーキットブレーカー、ロードシェディングです。',
    },
    'deadline-day': {
      name: '締め切り日',
      cause:
        '契約の締め切りが来ました。各代理店が一斉に成果物を送り、需要は通常の3倍になりました。',
      prevention: 'リザーブドキャパシティ、ロードシェディング、締め切り仕事用のキューです。',
    },
    'double-charge': {
      name: '二重課金',
      cause:
        '決済プロバイダが遅くなりました。課金がタイムアウトしてリトライされ、二重に請求された分が出ました。',
      prevention: '冪等キーです。終わらせるには課金リンクのリトライを止めます。',
    },
    'report-db': {
      name: 'レポートがデータベースを殺す',
      cause:
        '四半期末のレポートがプライマリの全テーブルをスキャンしました。あらゆる種類が遅くなりました。',
      prevention: 'データウェアハウスがスキャンをプライマリから引き取ります。',
    },
    'gpu-shortage': {
      name: 'GPU不足',
      cause: 'プロバイダがGPUノードを回収しました。今月はH100のキャパシティがありません。',
      prevention: 'GPUが足りないときはLLM APIがプロンプトを引き取ります。',
    },
    regex: {
      name: '正規表現バックトラッキング',
      cause:
        '新しいWAFルールが長い入力でバックトラックしました。すべてのWAFがCPU100%で回りました。',
      prevention: 'ルールはまずカナリアに出します。終わらせるにはルールを無効化します。',
    },
    region: {
      name: 'リージョン障害',
      cause: 'リージョンが丸ごと落ちました。そのボードが灰色になりました。',
      prevention: '2つ目のリージョン、そこへユーザーを送るGeoDNS、そして両方に住むデータです。',
    },
    partition: {
      name: 'ネットワーク分断',
      cause:
        'リージョン間の連絡が切れました。間の呼び出しはタイムアウトし、リーダー依存の書き込みが食い違いました。',
      prevention:
        '合意形成データベースがリーダーを1つに保ちます。終わらせるには古いリーダーをフェンスします。',
    },
    'hot-key': {
      name: 'ホットキー',
      cause: '有名人が投稿しました。読み取りの30%が1つのキーに集中し、そのシャードが飽和しました。',
      prevention: 'ホットキーをシャードに分散し、アプリサーバーでキャッシュします。',
    },
    bgp: {
      name: 'BGP設定ミス',
      cause:
        '経路変更が会社をインターネットから切り離しました。どのリージョンにも届きませんでした。',
      prevention: '経路変更をレビューします。終わらせるにはロールバックします。',
    },
    audit: {
      name: '監査指摘',
      cause: 'SOC 2の監査人が不足を見つけました。DR訓練がもう勘定に入りません。',
      prevention: 'セキュリティチームが、何かをリセットする前に指摘を直します。',
    },
    'dr-drill': {
      name: 'DR訓練',
      cause: '本番リージョンを計画的に落として、復旧を測ります。',
      prevention: '1時間以内に、書き込みを失わずに、あらゆる種類を別リージョンから提供します。',
    },
    breach: {
      name: '情報漏えい',
      cause: '公開された脆弱性が期限を過ぎても未修正のまま残り、誰かに使われました。',
      prevention: 'チケットが切れる前にパッチを当てます。チームのバックログに期限が出ます。',
    },
    'credential-leak': {
      name: '認証情報の漏えい',
      cause: 'フィッシングページが会社の認証情報を奪い、第三者に使われました。',
      prevention:
        'ロゴではなくドメインを読みます。メールをフィッシングとして報告すれば、そのボタンは消えます。',
    },
    'cluster-upgrade': {
      name: '強制クラスター更新',
      cause:
        'クラウドプロバイダがKubernetesクラスターをサポート終了のバージョンから更新しました。削除されたAPIを使うPodはクラッシュループしました。',
      prevention:
        '四半期に最低1回はクラスターを更新するか、プラットフォームチームに最新に保たせます。',
    },
    config: {
      name: '不正な設定投入',
      cause:
        '設定変更が全アプリサーバーとワーカーに一斉に届き、一緒に落ちました。GitOpsの一斉適用がすべてのミラーにも広がりました。',
      prevention: '終わらせるにはロールバックします。GitOpsの段階適用はまず1リージョンに留めます。',
    },
    'spot-reclaim': {
      name: 'スポット回収',
      cause:
        'プロバイダがキャパシティを必要としました。スポットノードを10秒の警告の後に回収しました。',
      prevention:
        '混成フリート、グレースフルシャットダウン、ロードバランサーの後ろのオンデマンドコピーです。',
    },
    'stale-read': {
      name: '古い読み取り',
      cause:
        'キャッシュがTTLを過ぎた値を返しました。書き込みの多いテーブルが無効化を追い越し、同じ行の読み取りが古いまま返りました。',
      prevention:
        'TTLを短くする、ライトスルーのキャッシュ、またはread-your-writesルーティングです。',
    },
    reconnect: {
      name: '再接続ストーム',
      cause: 'リアルタイムハブが再起動しました。全クライアントが同じ秒に再接続しました。',
      prevention: '再接続ジッターが波を散らし、クラスタリングが箱を1つ以上にしてくれます。',
    },
    'runaway-bill': {
      name: '請求の暴走',
      cause:
        'オートスケーラーが、さばくスパイクもないのに上限まで増えました。売上が増えないまま支出が上がりました。',
      prevention: 'オートスケーラーの上限を下げ、クラウドの請求を1行ずつ読みます。',
    },
    mtu: {
      name: 'MTU不一致',
      cause:
        '提携先のネットワークがより小さいパケットサイズを使っています。そのMTUより大きいアップロードは途中でタイムアウトします。',
      prevention:
        'パケットサイズをクランプするか、大きいアップロードを1つのネットワークに留めます。',
    },
    'hot-shard': {
      name: '大口テナントのホットシャード',
      cause:
        '最大のテナントのキーが1つのシャードに落ちました。その読み書きはCPUを3×食い、同じシャードの他のすべてがその後ろで待ちます。',
      prevention:
        'テナントをキーでシャードし、その読み取りをデータベース前段のキャッシュに置きます。',
    },
    'premiere-spike': {
      name: 'プレミア急増',
      cause: 'プレミアが公開されました。動画の需要は通常の4倍で、しかも同じ1分に集中しました。',
      prevention: 'CDNの階層キャッシュ、リザーブドキャパシティ、ロードシェディングです。',
    },
    'launch-day': {
      name: 'ローンチ当日',
      cause:
        'ゲームがローンチしました。リアルタイムメッセージは通常の6倍で、全クライアントが一斉に接続します。',
      prevention: 'ピークに合わせたリアルタイムハブ、再接続ジッター、ロードシェディングです。',
    },
    'flash-sale': {
      name: 'フラッシュセール',
      cause: 'フラッシュセールです。数分間、チェックアウトが通常の20倍になります。',
      prevention: 'チェックアウト処理用のキュー、オートスケーラー、ロードシェディングです。',
    },
    'jvm-warmup': {
      name: '高負荷下のJVMウォームアップ',
      cause:
        'オートスケーラーがスパイク中にJavaのアプリサーバーを足しましたが、新しいコピーは冷えたままで、最初の30秒は30%の速度しか出ませんでした。',
      prevention:
        'ロードバランサーのスロースタート、スケジュールスケーリング、そして温かい状態で起動するGraalVMネイティブイメージです。スロースタートなら新しいコピーは徐々にトラフィックを受けるので、冷えたまま応答することはありません。',
    },
    'migration-lock': {
      name: 'スキーママイグレーションのロック',
      cause:
        'マイグレーションが最大のテーブルにALTER TABLEを走らせました。コピーの間ずっとロックを握り、その間の書き込みはタイムアウトするまで後ろで待ちました。',
      prevention:
        'オンラインスキーママイグレーションなら、ロックを握らずに大きいテーブルを変更できます。',
    },
    'supply-chain': {
      name: 'サプライチェーン侵害',
      cause:
        '依存パッケージが悪意あるバージョンを公開し、デプロイがそれを入れました。パッケージはアプリサーバー内で動き、データを持ち出しました。',
      prevention:
        '依存関係スキャンが、ビルドが入れる前に公開されたバックドアを見つけます。Denoのパーミッションは、要らないものをパッケージに読ませません。',
    },
    'accidental-delete': {
      name: '誤削除',
      cause:
        'オペレーターがデータを消しました。テーブルが1つ消え、それを要るクエリはすべて失敗しました。',
      prevention:
        'ポイントインタイムリカバリで、削除の1分前までテーブルを戻せます。リストア訓練が、バックアップが戻ることを証明します。',
    },
    'operator-typo': {
      name: 'オペレーターの打ち間違い',
      cause:
        'ノードを1つ消すつもりのコマンドがコンポーネント全体に一致し、その大半のノードが巻き添えになりました。',
      prevention:
        '変更を適用する前のplanとレビューが、何が消えるかを見せます。打ち間違いはplanで止まります。',
    },
    'leap-second': {
      name: 'うるう秒と時刻ずれ',
      cause:
        'うるう秒が時計の1秒を繰り返しました。タイマーは二度発火し、リースは早く切れ、1リージョン内のリクエストとロックがタイムアウトしました。',
      prevention: 'リープスミアリングがその1秒を1日かけて配るので、どの時計も跳びません。',
    },
    'table-bloat': {
      name: 'テーブル肥大',
      cause:
        'PostgreSQLは更新された行の旧バージョンを、VACUUMが掃除するまで保持します。更新が掃除を追い越し、テーブルは死んだ行で埋まりました。読み書きのたびにCPUを余計に食います。',
      prevention:
        '保持ポリシーでテーブルを小さく保ちます。MySQLのエンジンには掃除すべき死んだ行がありません。',
    },
    'page-leak': {
      name: 'キャッシュページのリーク',
      cause:
        'CDNがログイン済みページを、Cookieを含めないキーでキャッシュし、あるユーザーのページを別のユーザーに返しました。',
      prevention:
        'Cookieを含むキャッシュキーにすれば、個人向けページが共有されることはありません。',
    },
    'stale-opcache': {
      name: 'OPcacheの陳腐化',
      cause:
        'OPcacheがvalidate_timestampsを切って動いており、デプロイがリセットしませんでした。PHPサーバーは新しいスキーマに対して古いコードを動かし続け、一部のリクエストが失敗しました。',
      prevention:
        'CI/CDパイプラインがデプロイごとにOPcacheをリセットします。手で消したいときは再起動します。',
    },
    'bun-compat': {
      name: 'ランタイム互換性',
      cause:
        'Node.jsで動くパッケージが、成熟度の低いBunでは動きません。それに触れたリクエストの一部が、パッケージを差し替えるまで失敗しました。',
      prevention:
        '自動テストがサービスを出荷先のランタイムで走らせ、デプロイより先にそのパッケージを見つけます。',
    },
    'gevent-compat': {
      name: 'ライブラリ非互換',
      cause:
        'geventが標準ライブラリをモンキーパッチし、1つのライブラリがそれに耐えられませんでした。その呼び出しがハブを塞ぎ、一部のリクエストが失敗しました。',
      prevention:
        '自動テストが出荷前にサービスをgevent上で動かし、どのライブラリが壊れるかを見せます。',
    },
    'split-brain': {
      name: 'スプリットブレイン',
      cause:
        'ネットワーク分断が分散Erlangクラスターを真っ二つにしました。両方の半分が自分のクライアントに応え続け、リアルタイムメッセージの半分はもう片方に届きませんでした。',
      prevention: 'カオス実験が、分断が起きる前に見つけます。再起動でクラスターは再び繋がります。',
    },
  },
  kinds: {
    page: { label: 'ページビュー' },
    read: { label: 'API読み取り' },
    write: { label: 'API書き込み' },
    login: { label: 'ログイン' },
    search: { label: '検索' },
    upload: { label: 'アップロード' },
    bot: { label: 'ボット' },
    media: { label: '動画' },
    rt: { label: 'リアルタイム' },
    buy: { label: 'チェックアウト' },
    job: { label: 'エクスポート' },
    report: { label: 'レポート' },
    ai: { label: 'AIプロンプト' },
    'q-read': { label: '読み取りクエリ' },
    'q-write': { label: '書き込みクエリ' },
    auth: { label: '認証呼び出し' },
    'q-search': { label: '検索クエリ' },
    'blob-put': { label: 'オブジェクト書き込み' },
    task: { label: 'タスク' },
    'blob-get': { label: 'オブジェクト読み取り' },
    'q-tx': { label: 'トランザクション' },
    charge: { label: '課金' },
    'q-scan': { label: 'スキャン' },
    infer: { label: '推論' },
    feed: { label: 'フィード' },
    hook: { label: 'Webhook' },
    push: { label: '通知送信' },
    bid: { label: '入札リクエスト' },
    notify: { label: 'プッシュ通知' },
    callout: { label: '顧客通話' },
    'k-write': { label: 'タイムライン書き込み' },
  },
  pools: {
    page: { label: 'ページビュー' },
    read: { label: 'API読み取り' },
    write: { label: 'API書き込み' },
    login: { label: 'ログイン' },
    search: { label: '検索' },
    upload: { label: 'アップロード' },
    bot: { label: 'ボット' },
    media: { label: '動画' },
    rt: { label: 'リアルタイム' },
    buy: { label: 'チェックアウト' },
    job: { label: 'エクスポート' },
    report: { label: 'レポート' },
    ai: { label: 'AIプロンプト' },
    feed: { label: 'フィード' },
    hook: { label: 'Webhook' },
    push: { label: '通知送信' },
    bid: { label: '入札リクエスト' },
    failure: { label: '失敗' },
  },
  runtimes: {
    mod_php: {
      name: 'Apache mod_php',
      blurb:
        'Apacheは処理中のリクエストごとにプロセスを立て、最大150まで。各プロセスがPHPを抱えるので、RAMは早く尽きます。',
    },
    php_fpm: {
      name: 'PHP-FPM',
      blurb:
        'NGINXの後ろに固定プールのPHPワーカー。待機中のリクエストはワーカーを1本占有します。シェアードナッシングなのでリークしません。',
    },
    php_worker: {
      name: 'PHPワーカーモード',
      blurb:
        'FrankenPHP、RoadRunner、Octaneなど。アプリは一度だけ起動するので、フレームワークのリクエストごとのオーバーヘッドが消えます。シェアードナッシングを失い、メモリリークと状態の混線が起きる可能性があります。',
    },
    swoole: {
      name: 'Swoole',
      blurb:
        'イベントループ上のコルーチン。Node.jsのような非同期I/Oで、リクエストごとのフレームワーク負荷もありません。ブロッキングする拡張はループを止めます。リアルタイム接続は1本20 KB。',
    },
    puma: {
      name: 'Puma',
      blurb:
        'コアごとに1プロセス、各5スレッド。スレッドは待ち時間を重ねられますが、GVLがCPUを1コアに縛ります。',
    },
    unicorn: {
      name: 'Unicorn',
      blurb:
        'スロットごとにRailsプロセス。単純で堅牢ですがメモリを食います。待機中のリクエストがプロセスを1つ丸ごと占有するので、リアルタイム接続は受け付けません。',
    },
    falcon: {
      name: 'Falcon',
      blurb:
        'ファイバーで、プロセスあたり多数のアイドル接続を保持します。ブロッキングするgemはループを止めます。接続あたり100 KB。',
    },
    node: {
      name: 'Node.js',
      blurb:
        'イベントループは1つ。待つのはタダですが、使うコアも1つで、遅いリクエスト1本が他をすべて止めます。',
    },
    node_cluster: {
      name: 'Node.jsクラスター',
      blurb:
        'コアごとにイベントループを1つ。全コアを使いますが、メモリと接続はコア数に比例して増えます。',
    },
    bun: {
      name: 'Bun',
      blurb:
        'より速いイベントループと即時起動。そのぶんNode.jsよりオートスケールもデプロイも得意です。60 MB、起動時間ゼロ。成熟度は低く、Node.jsで動くパッケージが壊れることもあります。',
    },
    deno: {
      name: 'Deno',
      blurb:
        'パーミッションがサプライチェーン攻撃の大半を止めます。代わりに機能開発は10%遅く、互換のあるパッケージも少なくなります。イベントループはNode.jsと同じです。',
    },
    gunicorn: {
      name: 'Gunicorn',
      blurb:
        '同期ワーカーのプールで、1本1リクエスト。PHP-FPMに似ていますが、ワーカーあたりのメモリが多くかかります。',
    },
    gevent: {
      name: 'Gunicorn + gevent',
      blurb:
        'グリーンスレッドでプロセスあたり多くのI/O待ちを抱えるので、遅いデータベースがワーカーを占有し続けません。モンキーパッチでライブラリが壊れることがあります。接続あたり30 KB。',
    },
    uvicorn: {
      name: 'Uvicorn ASGI',
      blurb:
        'Node.jsのように非同期ですが、CPUは遅いです。ブロッキング呼び出しがループを止めます。リアルタイム接続は設計どおり1本30 KB。',
    },
    python_ft: {
      name: 'フリースレッドCPython',
      blurb:
        '全コアで本当に並列なスレッド。スレッドあたり10%遅く、接続ごとにスレッドを立てるのは安くありません。対応が済んでいないC拡張は開発工数を食います。8スレッド、接続あたり100 KB。',
    },
    pypy: {
      name: 'PyPy',
      blurb:
        'JITウォームアップの後、純PythonのCPU性能はGunicornの3倍です。C拡張の対応が貧弱なのでMLエコシステムの恩恵はありません。ワーカーあたり200 MB。',
    },
    go: {
      name: 'Go net/http',
      blurb:
        '全コアでゴルーチン。待ちのコストはワーカーではなく数KB。ヒープが埋まるとGCがCPUを食います。',
    },
    fasthttp: {
      name: 'fasthttp',
      blurb:
        'net/httpより4分の1速く、機能開発は10%遅い。APIが標準でなく、動かないミドルウェアもあり、HTTP/2もありません。',
    },
    tomcat: {
      name: 'Tomcat',
      blurb:
        'JVM1つ、全コアで200スレッド。起動は30%の速度からで、30秒かけて温まります。待機中のリクエストはスレッドを1本占有します。',
    },
    java_virtual: {
      name: 'Java仮想スレッド',
      blurb:
        '待機がプラットフォームスレッドを占有しなくなったので、遅いデータベースはレイテンシを足すだけです。ネイティブ（JNI）呼び出しは今もキャリアをピン留めし、JVMは30秒かけて温まります。リアルタイム接続は1本10 KB。',
    },
    webflux: {
      name: 'Spring WebFlux',
      blurb:
        'プロセスごとに1つのループで非常に高い並行性です。ただし作るのもデバッグするのも20%遅い。ブロッキング呼び出しはループを止め、JVMはやはり温まる必要があります。400 MB。',
    },
    graal: {
      name: 'GraalVMネイティブイメージ',
      blurb:
        '100 ms未満で起動し、ウォームアップはありません。メモリはJVMの60%、速度は0.80×で、ビルドは3倍長くかかります。接続ごとにスレッドを立てるのはTomcatと同じ。サーバーレス関数に向きます。',
    },
    kestrel: {
      name: 'Kestrel',
      blurb:
        '全コアで.NETの非同期。待機がスレッドを占有しません。JITウォームアップはJVMより短くなります。',
    },
    native_aot: {
      name: 'Native AOT',
      blurb:
        'JITがないので最初から全速で起動し、さらに小さい。100 MB。速度は0.90×で、リフレクションを多用するライブラリには開発工数がかかります。',
    },
    beam: {
      name: 'BEAM',
      blurb:
        '全コアでプリエンプティブなプロセス。あるリクエストが別を止めることはなく、各プロセスが自分のGCをします。CPUは遅いです。',
    },
    tokio: {
      name: 'Tokio',
      blurb:
        '全コアで非同期タスク、GCなし、メモリも少ない。CPUを食うタスクはワーカースレッド1本を塞ぎます。',
    },
    zig: {
      name: 'Zigスレッドサーバー',
      blurb:
        '明示的なアロケーターを使うネイティブコードで、GCなし。64スレッドのサーバーは全コアを使いますが、待機中のリクエストがスレッドを1本占有します。永続状態はリークする可能性があります。',
    },
    warp: {
      name: 'Haskell（GHC + Warp）',
      blurb:
        'Warpが軽量なGHCスレッドをコアにまたがって回します。専門人材は生産的ですが、ビルドと採用は遅い。I/O待ちはOSスレッドを占有せず、共有ヒープのGCがポーズとCPUコストを足します。',
    },
  },

  glossary: {
    annotation: {
      term: 'アノテーション',
      definition:
        '時系列グラフ上で、デプロイや設定変更、インシデントといった出来事を示すマーカーです。グラフの動きに目に見える原因を与えます。',
      inGame:
        'ダッシュボードの各時系列は、5種類の出来事にラベル付きの縦線を引きます。設計変更（青、まだ取り消せる変更1件につき1本）、デプロイ（紫）、インシデント（赤）、リサーチ（緑）、会社イベント（ピンク）です。変数バーのグループごとのスイッチで隠せます。線を使って、グラフが動いたのが修正の後であって前ではないことを確かめてください。',
      links: [{ label: 'Grafanaドキュメント: 可視化にアノテーションを付ける' }],
      design: [{ label: 'ダッシュボードのアノテーション' }],
    },
    anycast: {
      term: 'エニーキャスト',
      definition:
        '異なる場所にある多数のサーバーが同じIPアドレスを告知し、インターネットのルーティング（BGP）が各ユーザーを最寄りのサーバーへ送る方式です。ユーザーは近くのサーバーにつながり、大量のトラフィックは全サーバーに分散します。',
      inGame:
        'エニーキャストは全リージョンで、ユーザーのホップから20 ms削ります。GeoDNSを先に必要とするシリーズCのリサーチです。GeoDNSは各リージョンのユーザーをそのリージョンへ、止まっていれば最寄りの稼働リージョンへ送ります。',
      links: [
        { label: 'Cloudflareラーニングセンター: Anycastとは？' },
        { label: 'RFC 4786: エニーキャストサービスの運用' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    apdex: {
      term: 'Apdex',
      definition:
        'Application Performance Index。レスポンスタイムに対するユーザー満足度を0から1で表すスコアです。目標値Tより速いリクエストは満足として満点、4Tまでは許容として半分、それより遅いものと失敗は0点になります。',
      inGame:
        'リクエスト種別ごとにTが決まっています。ページビューが400 ms、API読み取りが200 ms、ログインが800 msです。リクエストの価値にはApdexが掛かり、許容のリクエストは半分しか稼げません。Apdexが時代の目標を上回る間はユーザーが増え、下回ると離れていきます。目標はガレージの0.85から上場時の0.94まで上がります。',
      links: [
        { label: 'Wikipedia' },
        { label: 'New Relicドキュメント: Apdex' },
        { label: 'The Apdex Users Group' },
      ],
      design: [{ label: 'Apdexと売上' }],
    },
    'async-io': {
      term: '非同期I/O',
      definition:
        'ネットワークやディスクの操作を開始してから、完了を待つ間スレッドをブロックせず別の仕事を進めるやり方です。1本のスレッドで多数のリクエストを同時に走らせられます。Node.js、.NETのasync、RustのTokioはこの上に作られています。',
      inGame:
        'Node.js、Kestrel（C#）、Tokio（Rust）は、リクエストがデータベースを待つ間もワーカースロットを占有しないので、遅いクエリで処理能力を食いつぶしません。PHP-FPMやGunicornのワーカーは待ち時間の全体を占有します。非同期ランタイムはリアルタイム接続も数KBで保持します（Tokio 5 KB、Node.js 20 KB）が、PHPとGunicornは接続自体を拒否します。',
      links: [
        { label: 'Node.js: ブロッキングと非ブロッキング' },
        { label: 'Pythonドキュメント: asyncio' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: '並行モデル' }],
    },
    'at-least-once-delivery': {
      term: '少なくとも1回の配信',
      definition:
        '確認応答が返るまでメッセージや呼び出しを再送する配信保証です。何も失われませんが、同じメッセージが複数回届くことがあるため、コンシューマーは冪等でなければなりません。',
      inGame:
        'リトライした呼び出しは2回届くことがあります。二重課金インシデントでは課金がタイムアウトしてリトライし、冪等キーを研究するか課金リンクのリトライを止めるまで、一部の顧客が2回支払います。ポイズンメッセージインシデントでは、必ず失敗するタスクが戻り続け、ワーカーは時間の90%をそれに費やします。キューのデッドレターキューを有効にすれば防げ、メッセージを削除すれば終わります。',
      links: [
        { label: 'AWSドキュメント: SQSの少なくとも1回配信' },
        { label: 'RabbitMQ: コンシューマーの確認応答' },
        { label: 'RabbitMQ: 信頼性ガイド' },
      ],
      design: [{ label: '配信セマンティクス' }],
    },
    autoscaling: {
      term: 'オートスケーリング',
      definition:
        '容量が需要に追従するよう、マシンを自動で増減させる仕組みです。コントローラーがCPU使用率などのシグナルを監視して目標値と比べ、コピー数を変えます。新しい容量の起動には時間がかかるので、緩やかな負荷変動には追従できますが、急なスパイクには間に合いません。',
      inGame:
        'オートスケーラー（オートスケーリングのリサーチで解放）は、リンクしたアプリサーバーとワーカーのコピーを増減します。目標（CPUまたは負荷全体の40%、60%、80%）を超えたノードにはコピーが増え、上限は4、8、16、または無制限です。新しいコピーはコールドスタートし、VMなら180秒、Kubernetesクラスターなら30秒後に処理を始めます。負荷が目標の60%を下回ると1つ減らし、動けるのは30秒に1回までなので、急なトラフィックスパイクに備えて余剰を残してください。スケジュールスケーリングのリサーチを入れると、既知のピークに備えて計画します。事業のピーク時刻の2時間前にピーク時の負荷に合わせて拡張するので、ピークが来たときにはコピーが温まっています。',
      links: [
        { label: 'AWS: Amazon EC2 Auto Scalingとは？' },
        { label: 'Kubernetes: Horizontal Pod Autoscaling' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'availability-zone': {
      term: 'アベイラビリティゾーン',
      definition:
        'クラウドの1リージョン内にある、独立したデータセンター、またはデータセンター群です。独自の電力、冷却、ネットワークを持ちます。同じリージョンのゾーン同士は高速リンクを張れるほど近く、1つの障害で2つが同時に落ちないほど離れています。',
      inGame:
        'ゲーム内ではゾーンと呼びます。マルチゾーンのリサーチ後は、ゾーン対応の各ノードをa、b、cのいずれかに置き、データベース、プーラー、キャッシュ、検索エンジン、キューのいずれかには別ゾーンのスタンバイを置けます。支出は2倍です。ゾーン間の呼び出しは1 ms増え、エグレスが双方向に$0.01/GBかかります。ゾーン障害はそのゾーンの全ノードを落としますが、スタンバイが約20秒で引き継ぎ、別ゾーンのコピーは処理を続けます。',
      links: [
        { label: 'AWS: リージョンとゾーン' },
        { label: 'AWSビルダーズライブラリ: アベイラビリティゾーンによる静的安定性' },
        { label: 'Google Cloud: リージョンとゾーン' },
      ],
      design: [],
    },
    backpressure: {
      term: 'バックプレッシャー',
      definition:
        '遅いコンシューマーが生産者に減速や停止を伝えるシグナルです。バッファやキューが際限なく伸びるのを防ぎます。これがないと、バックログはメモリかレイテンシが尽きるまで増え続けます。',
      inGame:
        'バックプレッシャーに最も近いのがキューの最大長です。超えるとキューは新しいタスクを断り、それを送ったアップロードやエクスポートが失敗します。上限がなければ、ワーカーがタスクを処理する速さより到着が速い間、キューの深さは増え続けます。新しいタスクはバックログの後ろで待ち、ユーザーは結果ができた時点でアップロードやエクスポートを評価するので、アップロードで40秒、エクスポートで4分を超えると不満になります。ワーカーを増やすか、サイズを上げて深さを下げてください。',
      links: [
        { label: 'AWSビルダーズライブラリ: 手に負えないキューのバックログを避ける' },
        { label: 'Node.js: ストリームのバックプレッシャー' },
      ],
      design: [{ label: 'キュー' }],
    },
    bcrypt: {
      term: 'Bcrypt',
      definition:
        '1999年のパスワードハッシュ関数で、Blowfish暗号を基にしています。ソルトが組み込まれ、コストは調整できます。コストを1段上げるごとに計算量が倍になるので、ハードウェアが速くなっても保存したハッシュは破りにくいままです。同じ遅さが、ログインのたびにサーバーのCPUを消費します。',
      inGame:
        'ログイン1回のハッシュにCPUを80 ms使い、ランタイムが速くても短くなりません。イベントループのブロックインシデントではコストが10ラウンドから12ラウンドになり、ログインあたりのCPUが4倍になります。クレデンシャルスタッフィングでは、ボットが20倍のログインを送ってきます。認証プロバイダ（マネージドID）は、ユーザーごとの料金でハッシュをアプリサーバーの外へ出します。',
      links: [
        { label: 'ProvosとMazieres: 将来に適応できるパスワード方式 (USENIX 1999)' },
        { label: 'OWASP: パスワード保存チートシート' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'リクエスト種別' }],
    },
    'binary-rpc': {
      term: 'バイナリRPC',
      definition:
        'メッセージをバイナリ形式で符号化するリモートプロシージャコールです。たとえばgRPC上のProtocol Buffersで、JSONのようなテキストは使いません。ペイロードは小さく、パースも安く済みますが、両側が同じスキーマに合意する必要があります。',
      inGame:
        'サービス間バイナリRPCのリサーチは、アプリサーバーやワーカーがバックエンド呼び出しのたびにシリアライズへ使うCPUを半分にします（0.02参照msから0.01）。呼び出し元のノードのCPUゲージに表れるので、CPUを使い切っていた設計でも同じ台数でより多くさばけます。',
      links: [{ label: 'gRPCドキュメント: gRPCの概要' }],
      design: [{ label: 'パフォーマンスのリサーチ' }],
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP（ボーダーゲートウェイプロトコル）',
      definition:
        'インターネット上のネットワーク同士が、どのIPアドレスに到達できるかを伝え合うプロトコルです。あるネットワークが誤って経路を撤回すると、サーバーが動いていても他のインターネットからは見つけられなくなります。',
      inGame:
        'BGP設定ミスインシデントはシリーズCから始まります。経路の変更で会社がインターネットから消え、全リージョンでユーザーからのリクエストが最大60秒、ダウンとして失敗します。防げるリサーチはなく、ディレクターが選ぶ頻度もわずかです。インシデントの「ロールバック」で即座に終わります。',
      links: [
        { label: 'Cloudflareラーニングセンター: BGPとは？' },
        { label: 'RFC 4271: BGP-4' },
        { label: 'Meta Engineering: 10月4日の障害の詳細' },
      ],
      design: [],
    },
    'blast-radius': {
      term: 'ブラストラディウス',
      definition:
        '1つの障害が及ぶ範囲で、システム、ユーザー、トラフィックのどれだけを占めるかです。ゾーンやセル、小さなデプロイといった障害の隔離が、ブラストラディウスを小さく保ちます。',
      inGame:
        'ゾーン障害はそのゾーンの全ノードを落とします。マルチゾーンならコピーを3つのゾーンに分散でき、データノードには数秒で引き継ぐスタンバイを置けます。不正なデプロイは、出荷した項目1つにつきアプリサーバーのリクエストの8%、最大40%を失敗させます。小さく出せば壊れる範囲も小さく、壊れるのは出荷したサービスのトラフィックだけです。Node.jsでは遅いリクエスト1つがイベントループ上の全リクエストを止めますが、BEAMはリクエストごとに切り離します。',
      links: [
        { label: 'AWS Well-Architected: 障害の隔離を使う' },
        { label: 'AWSホワイトペーパー: セルベースアーキテクチャ' },
      ],
      design: [{ label: '言語プロファイル' }, { label: 'CI/CDパイプライン' }],
    },
    'blue-green-deployment': {
      term: 'ブルーグリーンデプロイ',
      definition:
        '同一の本番環境を2つ用意するリリース方法です。新しいバージョンを待機中の環境にデプロイし、全トラフィックを一度に切り替えます。失敗すれば戻せるので、ロールバックは速いです。',
      inGame:
        'CI/CDパイプラインはデプロイ戦略としてブルーグリーンを選べます。新しいフリートが立ち上がって検査される間も古いフリートが処理を続けるので、不正なデプロイで壊れるアプリサーバーのリクエストは最大10%です。デプロイには7分かかり、パイプラインの支出は2倍請求されます。',
      links: [
        { label: 'Martin Fowler: BlueGreenDeployment' },
        { label: 'AWSホワイトペーパー: ブルー/グリーンデプロイ' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'CI/CDパイプライン' }],
    },
    'bot-management': {
      term: 'ボット管理',
      definition:
        '自動化されたトラフィックと人を見分け、それぞれの扱いをすることです。疑わしいクライアントにはチャレンジを出し、レート制限をかけ、あるいはブロックします。ルールに当たったものを一律で失敗させるのではありません。',
      inGame:
        'ボット管理のリサーチはWAFの誤検知を半分にし、ブロック率はそのまま保ちます。疑わしいクライアントにはチャレンジが出るので、誤って検知された実ユーザーもページを開けます。ボットは通過しても売上を生まず、容量は消費するので、止める第一の場所はやはりWAFです。',
      links: [{ label: 'Cloudflareラーニングセンター: ボット管理とは？' }],
      design: [{ label: 'WAF' }],
    },
    'brookss-law': {
      term: 'ブルックスの法則',
      definition:
        '「遅れているソフトウェアプロジェクトに人員を追加すると、さらに遅れる」。Fred Brooksが1975年の著書The Mythical Man-Monthで示した法則です。新しい人は立ち上がりに時間がかかり、コミュニケーションの経路は人数より速く増えます。',
      inGame:
        'チームは大きくなるほど出力が落ちます。実効サイズはn / (1 + 0.08(n − 1) + 0.0004·n(n − 1))で、8人は約5人分、およそ48人を超えると遅くなります。採用したばかりの人は最初の1週間、30%しか働けません。ペナルティはチーム内で数えるので、最大4チームに人を分けると効きます。Symfonyはこれを30%下げます。',
      links: [{ label: 'Wikipedia: ブルックスの法則' }, { label: 'Wikipedia: 人月の神話' }],
      design: [{ label: 'チームの調整' }],
    },
    bulkhead: {
      term: 'バルクヘッド',
      definition:
        '1つの依存先が使える、呼び出し元の容量（スレッド、コネクション、スロットなど）の上限です。その依存先が遅くなっても埋まるのは自分の取り分だけなので、他の依存先への呼び出しは動き続けます。名前は、船体を区画に分ける隔壁に由来します。',
      inGame:
        'バルクヘッドのリサーチは各リンクにスイッチを追加します。バルクヘッドを有効にしたリンクは呼び出しを1,000 msまで走らせ、超えると呼び出し元は諦めてスロットを解放し、リクエストは`timeout`で失敗します。遅い依存先が全スロットを埋めることはありません。上限は同時呼び出し数ではなく時間ですが、負荷が一定なら同じことです（リトルの法則）。これがないと、応答が返るかリンクのタイムアウト（既定は30秒）まで、呼び出しが呼び出し元のスロットを占有します。',
      links: [
        { label: 'Azureアーキテクチャセンター: バルクヘッドパターン' },
        { label: 'Wikipedia: バルクヘッド (隔壁)' },
      ],
      design: [{ label: 'リンク設定' }],
    },
    'burn-rate': {
      term: 'バーンレート',
      definition:
        'SLOに対して、サービスがエラーバジェットをどれだけ速く使っているかです。バーンレート1ならSLOの期間でちょうど全部を使い切り、10ならその10分の1の期間で使い切ります。チームは個々のエラーではなく、高いバーンレートでオンコールを呼び出します。',
      inGame:
        'SLOダッシュボードを研究すると、ダッシュボード（D）にエラーバジェットのバーンレートが時系列で描かれます。失敗率を、SLOが許す失敗の割合で割った値です。1×と10×に線が引かれ、10×を超えると週の終わりを待たずにエラーバジェットは尽きます。原因を直すか、線が1×を下回るまでデプロイを遅らせてください。',
      links: [{ label: 'Google SREワークブック: SLOでのアラート' }],
      design: [{ label: 'ダッシュボードのグラフ' }],
    },
    'bytecode-cache': {
      term: 'バイトコードキャッシュ',
      definition:
        'スクリプトのコンパイル済みの形を保持し、実行のたびにインタプリタがソースをパースしてコンパイルし直さないようにするキャッシュです。PHPのOPcacheはプリコンパイル済みバイトコードを共有メモリに置き、Pythonも同じ理由で.pycファイルを書きます。',
      inGame:
        'PHPはOPcache（PHP-FPMの後）を研究するまで、リクエストのたびに全スクリプトをコンパイルします。OPcacheはPHPのアプリサーバーのCPU速度を2.5倍にします。再起動したPHPのマシンはしばらくOPcacheなしで動き、温まるにつれて2.5倍に達します。',
      links: [
        { label: 'PHPマニュアル: OPcache' },
        { label: 'PEP 3147: PYCリポジトリディレクトリ' },
      ],
      design: [],
    },
    'cache-hit-rate': {
      term: 'キャッシュヒット率',
      definition:
        'ルックアップのうち、後ろの遅いシステムに聞かずキャッシュ自身のコピーで答えた割合です。ミスはオリジンかデータベースへ行きます。ヒット率のわずかな変化がオリジンの負荷を大きく変えます。90%から80%に下がれば、ミスは2倍です。',
      inGame:
        'キャッシュやCDNのノードはカードにヒット率を表示します。キャッシュのヒット率は、メモリをホットデータで割った値（ユーザーあたり約200 KB）の平方根に、TTL係数（10秒で60%、60秒で85%、1時間で97%）、最大50%の書き込みペナルティ、キャッシュの温まり具合を掛けたものです。CDNは300秒のTTLでページの70%、メディアの75%に応答し、60秒で0.8倍、1時間で1.2倍、上限は95%です。メモリを増やすかTTLを延ばせば率は上がりますが、TTLを延ばすほど古い読み取りが増えます。',
      links: [
        { label: 'Cloudflare: キャッシュヒット率とは？' },
        { label: 'AWS: キャッシュのベストプラクティス' },
        { label: 'AWSビルダーズライブラリ: キャッシュの課題と戦略' },
      ],
      design: [],
    },
    'cache-stampede': {
      term: 'キャッシュスタンピード',
      definition:
        '同じキャッシュデータを多くのリクエストが同時に外し、そろってデータベースへ行くことです。キャッシュの再起動や期限切れの直後に起きます。余分な負荷でデータベースが遅くなりすぎ、キャッシュが二度と埋まらないこともあります。',
      inGame:
        'キャッシュスタンピードのインシデントでは、キャッシュが空で再起動し、すべてのミスが一斉にデータベースへ行きます。データベースの使用率が90%以上になるとリフィルがタイムアウトし、キャッシュは冷えたままです。スタンピード対策を入れると、冷えたキャッシュが追加のミスをデータベースへ送るのは25%だけで済み、キャッシュウォーミングを入れると再起動後は80%温まった状態で戻ります。',
      links: [
        { label: 'Wikipedia' },
        { label: 'Nishtalaほか: Scaling Memcache at Facebook (NSDI 2013)' },
      ],
      design: [
        { label: 'キャッシュスタンピード' },
        { label: 'キャッシュスタンピードのインシデント' },
      ],
    },
    'cache-warming': {
      term: 'キャッシュウォーミング',
      definition:
        'キャッシュがトラフィックを受ける前に、来そうなデータで埋めておくことです。最初のリクエストが揃ってミスにならないようにします。チームは再起動やデプロイの後、新しいキャッシュノードを足したときに、スナップショットを読み込むか直近のキーを流し直して温めます。',
      inGame:
        '再起動したキャッシュは冷えた状態で戻るので、ミスはすべてデータベースへ行きます。Redisはデータの半分を自分で読み直し、Memcachedは何も読み直しません。キャッシュウォーミングのリサーチ後は、キャッシュのカードでウォーミングを有効にでき、再起動やキャッシュスタンピードの後も80%温まった状態で戻ります。残ったミスは、先に研究するスタンピード対策が処理します。',
      links: [
        { label: 'Netflix TechBlog: キャッシュウォーミング' },
        { label: 'Redisドキュメント: 永続化' },
      ],
      design: [],
    },
    'cache-aside': {
      term: 'キャッシュアサイド',
      definition:
        'アプリケーションがまずキャッシュを見るキャッシュのパターンです。ミスならデータベースを読んで結果をキャッシュに入れ、書き込みならデータベースを更新してキャッシュのエントリを無効化します。',
      inGame:
        'キャッシュは自分が持つ読み取りクエリに答え、ミスはデータベースへ送ります。ヒット率は√(メモリ / ホットデータ) × TTL係数 × 温まり具合で、ホットデータはユーザーあたり約200 KBです。書き込みは通過して無効化するので、書き込みの多い構成ではヒット率が下がります。TTLを延ばす（10秒、60秒、1時間）とヒットは増えますが、古い読み取りが増えます。',
      links: [
        { label: 'Azureアーキテクチャセンター: キャッシュアサイドパターン' },
        { label: 'AWS: キャッシュのベストプラクティス' },
      ],
      design: [{ label: 'キャッシュ戦略' }],
    },
    'canary-deployment': {
      term: 'カナリアデプロイ',
      definition:
        'まず少量のトラフィックを新しいバージョンへ送り、エラーとレイテンシを旧バージョンと比べるリリース方法です。カナリアが健全ならロールアウトを続け、そうでなければほとんどのユーザーが見る前に戻します。',
      inGame:
        'CI/CDパイプラインはデプロイ戦略としてカナリアを選べます。デプロイはまずトラフィックの5%を新しいバージョンへ送るので、ロールバックするまでに壊れるアプリサーバーのリクエストは最大5%です。最も遅い戦略で、1回のデプロイに10分かかり、パイプラインの支出は1.5倍請求されます。',
      links: [
        { label: 'Martin Fowler: CanaryRelease' },
        { label: 'Google SREワークブック: カナリアリリース' },
      ],
      design: [{ label: 'CI/CDパイプライン' }],
    },
    'cascading-failure': {
      term: 'カスケード障害',
      definition:
        '障害がシステムの一部から別の部分へ飛び移る現象です。遅くなった、あるいは壊れたコンポーネントが呼び出し元を過負荷にし、そのリトライとキューがさらに呼び出し元を過負荷にします。最初の障害が引き金で、後の障害が小さなインシデントを長いインシデントに変えます。',
      inGame:
        'シリーズAから、誰も対応しないインシデントは終わるときに別のインシデントを起こすことがあり、2つ目は1つ目を原因として記録します。放置したスロークエリはリトライストームを、リトライストームは接続枯渇を、メモリリークはGCポーズ連発を呼びます。2つ目が始まるのは、設計がそれに弱いときだけです。オンコールの通知が連鎖を名指しし、ポストモーテムのカードが何に続いたかを示します。インシデントを確認するだけでも連鎖は止まり、連鎖は1ホップで終わります。',
      links: [
        { label: 'AWS: 安全で人手を介さないデプロイの自動化' },
        { label: 'Google SREブック: カスケード障害' },
      ],
      design: [{ label: 'インシデントの連鎖' }],
    },
    'cdc-change-data-capture': {
      term: 'CDC（変更データキャプチャ）',
      definition:
        'データベースの変更ログ（PostgreSQLのWALなど）を読み、挿入・更新・削除を1件ずつイベントとして発行することです。データウェアハウスや検索インデックスといった他のシステムが、ソースに問い合わせずに同期を保てます。',
      inGame:
        'CDCコネクターはシリーズBの変更データキャプチャで解放され、データベースの変更をイベントストリームへ複製します。データベースをコネクターに、コネクターをストリームにリンクしてください。書き込みログからすべての書き込みを読み、変更を毎秒20,000件のイベントとして流すので、アプリが二重に書かなくても検索エンジンやデータウェアハウスがデータベースに追随します。書き込みが複製を待たないため、レイテンシではなくラグが増えます。',
      links: [
        { label: 'Wikipedia' },
        { label: 'PostgreSQLドキュメント: 論理デコードの概念' },
        { label: 'Debeziumドキュメント' },
      ],
      design: [{ label: 'CDCコネクター' }],
    },
    'cdn-content-delivery-network': {
      term: 'CDN（コンテンツ配信ネットワーク）',
      definition:
        '多くの拠点にキャッシュサーバーを置き、ユーザーの近くにコンテンツのコピーを抱えるネットワークです。最寄りのエッジが答えられるリクエストはオリジンに届かないので、速く、オリジンにもコストがかかりません。',
      inGame:
        'CDNコンポーネントはコンテンツ配信のリサーチで解放され、リクエストがアプリサーバーに届く前にエッジで答えます。既定の300秒TTLではページの70%、メディアの75%に応答します。TTLを60秒にすると20%下がり、3,600秒にすると20%上がって最大95%です。エッジのエグレスは$0.02/GBで、アプリサーバーからは$0.09/GBです。階層キャッシュを入れるとメディアのヒット率が92%になります。',
      links: [{ label: 'Cloudflareラーニングセンター: CDNとは？' }, { label: 'MDN: CDN' }],
      design: [],
    },
    'chaos-engineering': {
      term: 'カオスエンジニアリング',
      definition:
        '制御された形でわざと障害を注入し、システムが実際にどう振る舞うかを確かめる手法です。ノードを落とす、レイテンシを足す、依存先を切る。弱点に関する推測が、測定値になります。',
      inGame:
        'カオスエンジニアリングのリサーチは、チームパネルにカオスのスイッチを追加します。オンの間、設計の中で最も弱いノードが120秒ごとに10秒間、呼び出しの20%を失敗させ、会社は実験から毎秒1件の失敗インサイトを得ます。スイッチには次に実験が当たるノードが表示されます。注入された`refused`エラーは、実際の障害と並んでダッシュボードのエラー行に出ます。',
      links: [{ label: 'カオスエンジニアリングの原則' }],
      design: [{ label: '信頼性のリサーチ' }],
    },
    'circuit-breaker': {
      term: 'サーキットブレーカー',
      definition:
        '呼び出しの経路に置いて失敗を見張るスイッチです。失敗が多すぎると開き、しばらく新しい呼び出しを即座に失敗させます。呼び出し元は待たなくなり、苦しんでいるサービスは回復できます。その後、少数の呼び出しを通して復旧したかを試します。',
      inGame:
        'サーキットブレーカーのリサーチ後は、リンクごとにブレーカーを有効にできます。リンクの呼び出しの半分以上が失敗すると5秒間開き、何も送らないので呼び出しはすぐに拒否として失敗します。その後閉じて再試行します。ブレーカーはリトライストームへの3つの対策の1つです。',
      links: [
        { label: 'Martin Fowler: CircuitBreaker' },
        { label: 'Azureアーキテクチャセンター: サーキットブレーカーパターン' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'リンク設定' }, { label: 'リトライストーム' }],
    },
    'code-review': {
      term: 'コードレビュー',
      definition:
        '変更がマージされる前に別のエンジニアが読み、欠陥を見つけ、コードの一貫性を保ち、知識を共有するプラクティスです。現代のコードレビューは軽量で、小さな変更をツール上で見るのが普通です。',
      inGame:
        'コードレビューのリサーチは、デプロイがバグを出荷する確率を20%下げ、自動テスト（30%）による削減と重なります。出荷前の各機能のタイルには、隠れたコスト（「書き込みクエリごとに20%余計にかかります」など）も表示されます。技術的負債は不正なデプロイの確率を上げるので、負債が増えるほどレビューが効きます。',
      links: [
        { label: 'Googleのエンジニアリングプラクティス: コードレビュー' },
        { label: '現代のコードレビュー: Googleでのケーススタディ' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'cold-start': {
      term: 'コールドスタート',
      definition:
        '新しいプロセス、コンテナ、関数インスタンスが起動するときの遅れと、最初の遅いリクエストのことです。全速力に達するまでに、起動し、コードとデータを読み込み、キャッシュを埋めるかホットなコードをJITコンパイルする必要があります。',
      inGame:
        '新しい、あるいは再起動したアプリサーバーは起動してから温まります。Java（Tomcat）のコピーは30%の速度で始まり、全速力まで30秒かかりますが、Goは最初から全速力です。オートスケーラーの新しいコピーは、VMなら180秒、Kubernetesクラスターなら30秒後に処理を始めます。再起動したキャッシュはMemcachedなら空、Redisなら半分温まった状態で戻り、冷えたデータベースはクエリに最大2倍のCPUを使います。サーバーレス関数は待機中に環境を保たないので、間が空いた後のリクエストはコールドスタートになり、RustやGoで50 ms、JVMでは最大2,000 msかかります。',
      links: [
        { label: 'AWS Lambdaドキュメント: 実行環境のライフサイクル' },
        { label: 'Wikipedia: コールドスタート (コンピューティング)' },
      ],
      design: [{ label: 'サーバーレス関数' }, { label: 'ランタイムの挙動' }],
    },
    compression: {
      term: '圧縮',
      definition:
        'レスポンスをネットワークに流す前に、より少ないバイト数へ符号化することです。gzipやBrotliが代表例で、クライアントが復号します。帯域と転送時間を節約し、両端でCPUを使います。',
      inGame:
        '圧縮のリサーチで、アプリサーバーごとにgzipを有効にできます。ページ、読み取り、検索、レポート、フィード、ボットのレスポンスはサイズが30%になり、その代わりCPUが10%増えます。小さくなったレスポンスは早く届き、マシンのネットワークカードをあまり使わず、オリジンのエグレスも減ります。アップロードやメディアなど他の種別はサイズが変わりません。',
      links: [{ label: 'MDN: HTTPでの圧縮' }, { label: 'RFC 1952: GZIPファイル形式' }],
      design: [],
    },
    'connection-pooling': {
      term: 'コネクションプーリング',
      definition:
        'データベースへの接続をまとめて開いたままにし、クライアントごと、リクエストごとに開く代わりに共有することです。接続の確立にかかる時間を節約し、データベースを接続数上限の下に保てます。',
      inGame:
        'データベースは100接続を受け付け、それ以上は拒否します。アプリサーバーのプロセスはそれぞれ自分のプールを持ち、PHPやGunicornのワーカーは1本、Pumaのプロセスは5本、Node.jsやGoは10本です。トランザクションモードのコネクションプーラーはサーバー接続20本を全体で共有しますが、コードのセッション状態を直すまでプール経由のクエリの5%が失敗します。接続枯渇インシデントでは、すべてのプールが2倍になります。',
      links: [
        { label: 'PgBouncer: 機能とプーリングモード' },
        { label: 'PostgreSQLドキュメント: 接続 (max_connections)' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'コネクションプーラー' }],
    },
    'consistent-hashing': {
      term: 'コンシステントハッシュ',
      definition:
        'キーをハッシュリング上でサーバーに割り当てる方法で、サーバーを1台足しても抜いても、移動するのはおよそ1/nのキーで済みます。Kargerらが1997年にWebキャッシュ向けに発表し、AmazonのDynamoやApache Cassandraがデータ配置に使っています。',
      inGame:
        'ロードバランシングアルゴリズムのリサーチ後、ロードバランサーはコンシステントハッシュで分散できます。各ターゲットは負荷にかかわらずキーを等分に受け持ち、抜けたターゲットは自分のキーだけを移します。ワイドカラムストアは各キーをN個のレプリカに置き、ホットキーインシデントでは1つのキーのシャードが飽和します。',
      links: [
        { label: 'Kargerほか: コンシステントハッシュとランダムツリー (STOC 1997)' },
        { label: 'DeCandiaほか: Dynamo (SOSP 2007)' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'ロードバランサー' }],
    },
    'container-orchestration': {
      term: 'コンテナオーケストレーション',
      definition:
        '共有されたマシンのプールにコンテナを配置し、落ちたら再起動し、増減させるソフトウェアです。Kubernetesが代表例です。多くのワークロードを共有ノードに詰めるとマシンはよく使えますが、隣同士が互いを遅くすることもあります。',
      inGame:
        'コンテナオーケストレーションのリサーチでKubernetesクラスターが解放されます。リンクしたアプリサーバーとワーカーはPodとして動きます。支出は15%安くなり、オートスケーラーはコピーを180秒ではなく30秒で追加し、不正なデプロイは最初の4分の1のPodで止まり、ホストが落ちたPodは30秒で戻ります。プラットフォームチームが運用しない限り、クラスターごとにエンジニア0.5人分の開発工数がかかります。サポート切れのバージョンを四半期放置すると、強制アップグレードでPodのリクエストの30%が落ちる恐れがあります。Podが混むほどノイズの多い隣人の影響が強まり、リクエストの0.5%から2%に10 msを足します。',
      links: [
        { label: 'Kubernetes: 概要' },
        { label: 'Kubernetes: Podとコンテナのリソース管理' },
        { label: 'BorgによるGoogleの大規模クラスタ管理' },
      ],
      design: [],
    },
    'continuous-batching': {
      term: 'continuous batching',
      definition:
        '言語モデルを提供するときの手法です。バッチ全体が終わるのを待たず、空きが出た時点で新しいリクエストを実行中のバッチに足します。スループットが上がり、最初のトークンまでの待ち時間は短いままです。',
      inGame:
        'continuous batchingのリサーチは、GPUノードにバッチ8とバッチ32を追加します。毎秒のプロンプト数が1.6×と2.2×になり、最初のトークンまでの時間は変わりません。これがないと、大きなバッチでもスループットは上がりますが、その待ち時間に150 msか500 msが加わります。',
      links: [{ label: 'vLLMドキュメント: continuous batching' }],
      design: [{ label: 'GPUノード' }],
    },
    'continuous-delivery': {
      term: '継続的デリバリー',
      definition:
        'ソフトウェアを、いつでも安全にリリースできる状態に保つ実践です。ビルド、テスト、デプロイを自動化したパイプラインがそれを支えます。リリースは小さく、頻繁に、そして巻き戻しやすくなります。',
      inGame:
        '継続的デリバリーのリサーチがないと、デプロイは手作業で30分かかります。リサーチ後はパイプラインなら5分でデプロイできるので、ビルドと15分の確認を含めても8時間の勤務日により多くのデプロイが収まります。不正なデプロイをロールバックできるようにもなり、インシデントが終わってそのフィーチャーが次のデプロイの順番に戻ります。CI/CDパイプラインも解放されます。1つ置くと、そのデプロイ戦略がデプロイ時間と、不正なデプロイが壊す範囲の上限を決めます。',
      links: [
        { label: 'Martin Fowler: 継続的デリバリー' },
        { label: 'DORA: 継続的デリバリー' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'conways-law': {
      term: 'コンウェイの法則',
      definition:
        '「システムを設計する組織は、必ず、その組織のコミュニケーション構造を写し取った設計しか作れない」——メルヴィン・コンウェイが1968年の論文に書いた言葉です。ほとんど会話しないチームどうしが作る部分は、間のインターフェースが狭くなりがちです。',
      inGame:
        'プレシードから最大4つのチームを作れます。各チームはそれぞれ独自のポリシーと調整コストを持ち、大きな集団を分割するほど合計の開発工数(DH)は増えます。チームより多くのサービスを持つことが、コンウェイの法則の実績が示すミスマッチです。サービスごとにチームを持たせてください。サービスのオーナーはそのバックログを進め、壊れたときには呼び出されます。',
      links: [
        { label: 'Mel Conway: コンウェイの法則' },
        { label: 'Martin Fowler: ConwaysLaw' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'サービスと所有チーム' }],
    },
    'credential-stuffing': {
      term: 'クレデンシャルスタッフィング',
      definition:
        '他のサイトから漏えいしたユーザー名とパスワードの組を、ボットがログインフォームに試す攻撃です。多くの人がパスワードを使い回しているので成立します。1回の試行は、サイト側に遅いパスワードハッシュの計算を強います。',
      inGame:
        'クレデンシャルスタッフィングのインシデントは、シードから、会社がログインを提供していると発生します。ボットは通常の19倍のログインを送り、1件ごとにアプリサーバーがbcryptのハッシュを丸ごと1回計算するので、CPUが飽和します。WAFがその大半を遮断します。既定のパラノイアレベル2で80%です。認証プロバイダが通したログインをハッシュ化するので、ログイン1件あたりアプリサーバーのCPUは約2 msで済みます。',
      links: [
        { label: 'OWASP: クレデンシャルスタッフィング' },
        { label: 'OWASPチートシート: クレデンシャルスタッフィング対策' },
        { label: 'Cloudflare Learning Center: クレデンシャルスタッフィングとは' },
      ],
      design: [],
    },
    'data-residency': {
      term: 'データレジデンシー',
      definition:
        '法律や契約による規則で、特定のデータを特定の国やリージョンの中で保存し、処理しなければならないというものです。たとえばEUのGDPRは、個人データをEUの外へ移すことを制限しています。',
      inGame:
        'データレジデンシーは、プレIPOのIPOチェックリストの項目です。データレジデンシー管理とGeoDNSを獲得し、EUのユーザーノードが稼働していれば条件を満たします。そのノードが到達するデータノードはすべて、EUリージョンにあるか、複数リージョンに分散させたワイドカラムストアか分散SQLノードでなければなりません。EUの経路を最後まで作り、データを域内に保ってください。',
      links: [
        { label: 'Cloudflare Learning Center: データローカライゼーションとは' },
        { label: 'Wikipedia: データ主権' },
      ],
      design: [],
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS（分散型サービス拒否攻撃）',
      definition:
        '多くの場合ボットネットである多数のマシンから、一度に大量のトラフィックを送りつけ、正規のユーザーを通れなくする攻撃です。防御はエッジで不要な通信を絞り、負荷を多くの拠点に散らします。',
      inGame:
        'DDoSのインシデントはシードから発生します。最大60秒のあいだ、通常の50倍の需要がボットのトラフィックとして加わります。WAFはパラノイアレベルに応じてボットを遮断します。アンダーアタックモードをオンにすると99%を遮断できますが、正規ユーザーの1%を失い、レイテンシが40 ms増えます。WAFを動かしていると、ディレクターがDDoSを選ぶ頻度は下がります。',
      links: [
        { label: 'Cloudflare Learning Center: DDoS攻撃とは' },
        { label: 'CISA: サービス拒否攻撃を理解する' },
        { label: 'Cloudflareドキュメント: アンダーアタックモード' },
      ],
      design: [],
    },
    'dead-letter-queue': {
      term: 'デッドレターキュー',
      definition:
        'コンシューマーが処理できなかったメッセージを、決められた回数の試行失敗のあとに保持しておく別のキューです。1つの壊れたメッセージがキュー全体を詰まらせないようにし、人が中身を見たり再実行したりできるよう残します。',
      inGame:
        'キューのカードには「失敗したタスク」の設定があります。永久にリトライするか、1、3、10、25回でデッドレターキューへ送るかです。失敗した試行は30秒後に戻ってきてワーカーで再び実行され、全試行に失敗したタスクは失われます。ポイズンメッセージのインシデントは、永久にリトライするキューにしか起きません。必ず失敗するタスクが戻り続け、ワーカーはその処理に時間の90%を使うからです。デッドレターキューをオンにすればキューは無敵になり、メッセージを削除すればインシデントは終わります。',
      links: [
        { label: 'AWS: Amazon SQSでのデッドレターキューの使用' },
        { label: 'RabbitMQ: デッドレターエクスチェンジ' },
        { label: 'Enterprise Integration Patterns: Dead Letter Channel' },
      ],
      design: [],
    },
    denormalization: {
      term: '非正規化',
      definition:
        '同じ事実を複数の場所に持たせたり、結合済みのコピーを保持したりして、読み取りのたびに結合や計算をしなくて済むようにすることです。読み取りは安くなり、そのぶん書き込みはすべてのコピーを更新しなければなりません。',
      inGame:
        '非正規化のリサーチは、データベースの読み取り1回あたりのCPUを30%減らし、書き込みは20%増やします(10)。読み取りが多い設計では得になり、書き込みが多い設計では損になります。プレイヤーがトレードオフのカードを取る前に、そのプレビューが見せるのはこの取引です。',
      links: [{ label: 'Wikipedia: 非正規化' }],
      design: [{ label: 'パフォーマンスのトラック' }],
    },
    'dependency-scanning': {
      term: '依存関係スキャン',
      definition:
        'プロジェクトが使っているサードパーティのライブラリを、既知の脆弱性のデータベースと突き合わせる自動チェックです。通常はビルドパイプラインで走り、更新が必要なバージョンに印を付けます。',
      inGame:
        '依存関係スキャンはシリーズAのセキュリティのリサーチで、継続的デリバリーが必要です。公開されたバックドアを、ビルドがそれをインストールする前に見つけます。サプライチェーン侵害のインシデントが見つける弱点も小さくします。さらにSOC 2プログラムの3つの前提条件の1つでもあり、残りは全通信のTLS化と保存データの暗号化です。IPOチェックリストはSOC 2を必要とします。',
      links: [
        { label: 'OWASP Top 10: 脆弱で古いコンポーネント' },
        { label: 'OWASP Dependency-Check' },
        { label: 'GitHubドキュメント: Dependabotアラートについて' },
      ],
      design: [],
    },
    'distributed-tracing': {
      term: '分散トレーシング',
      definition:
        '1つのリクエストが通るすべてのサービスを追いかけることです。各ホップは開始時刻と終了時刻を持つスパンを記録し、同じトレースIDを共有するスパンは1つのトレースにまとまります。トレースを見れば、時間がどこで消えているか、どの依存先が遅いかが分かります。',
      inGame:
        '分散トレーシングのリサーチ（パーセンタイルの後）は、リクエスト種別ごとの時間をノード単位で、ダッシュボードのサービス表とウォーターフォールとして表示します。アナリティクスのノードは、そこにリンクしたノードのトラフィックをサンプリングし、インサイトに変えます。パーセンタイルはp50、p95、p99を示し、ボードがボトルネックを示します。',
      links: [{ label: 'Dapper: Googleのトレーシング基盤' }, { label: 'OpenTelemetry: トレース' }],
      design: [],
    },
    'diurnal-traffic': {
      term: '日周トラフィック',
      definition:
        '人が起きて活動している時間に合わせて、需要が毎日上がって下がることです。消費者向けサービスは夕方にピークを迎え、早朝が最も静かなことが多いです。容量計画は日次のピークを賄う必要があり、谷の時間帯はメンテナンスの安全な窓になります。',
      inGame:
        '需要はカレンダー上で日周期に従います。既定では20:00に平均の1.45×でピークになり、08:00に0.55×まで下がります。事業はそれぞれ独自のカーブを持ち、たとえばフィンテックは14:00にピークとなり±60%で振れます。リージョンを増やすと、各リージョンはそれぞれの現地時間の20:00にピークを迎えます。1シミュレーション秒がカレンダーの1分なので、1日は1×で24分です。夕方のピークに合わせてサイズを決めるか、オートスケーラーにカーブを追わせてください。',
      links: [
        { label: 'USENIX 1997: クライアントトレースの日周期' },
        { label: 'AWS: EC2 Auto Scalingの予測スケーリング' },
      ],
      design: [],
    },
    'dns-round-robin': {
      term: 'DNSラウンドロビン',
      definition:
        'DNSによる負荷分散です。1つの名前が複数のIPアドレスを返し、サーバーがその順序を回すことでクライアントが各ホストに散らばります。DNSはホストが生きているかを知らず、クライアントはレコードのTTLのあいだ応答をキャッシュします。',
      inGame:
        'DNSラウンドロビンのリサーチでDNSコンポーネントが解放され、ユーザーを最大8台のホストに均等に振り分けます。ヘルスチェックがないと、死んだホストも取り分を保ち、そのリクエストは失敗します。ヘルスチェックのリサーチ後は、TTLが切れた時点でDNSが死んだホストを外します。30秒、300秒、3,600秒です。ロードバランサーは次のヘルスチェックで、より早く気づきます。',
      links: [
        { label: 'Cloudflare Learning Center: ラウンドロビンDNSとは' },
        { label: 'RFC 1794: 負荷分散のためのDNSサポート' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'dora-metrics': {
      term: 'DORAメトリクス',
      definition:
        'DORAの研究プログラムが示す、ソフトウェアデリバリーの5つの指標です。変更リードタイム、デプロイ頻度、デプロイ失敗からの復旧時間、変更失敗率、手戻り率。最初の3つがスループット、後の2つが不安定さを表します。',
      inGame:
        'そのうち2つがプレイを動かします。デプロイ頻度は、1日の勤務時間480分を（ビルド＋デプロイ＋15分の確認）で割った数が上限で、チームのポリシーにより16、8、4で頭打ちになります。継続的デリバリーはデプロイを30分から5分に縮めます。各デプロイには10%の基礎確率でバグが混入します。速度優先と技術的負債がこれを上げ、自動テスト(−30%)とコードレビュー(−20%)が下げます。結果はデプロイのカードに出ます。',
      links: [
        { label: 'DORA: ソフトウェアデリバリーのパフォーマンス指標' },
        { label: 'DORA: DORAメトリクスの歴史' },
      ],
      design: [{ label: 'デプロイ頻度' }],
    },
    downsampling: {
      term: 'ダウンサンプリング',
      definition:
        '古いメトリクスを、秒ごとではなく5分ごとや1時間ごとといった粗い解像度で保存することです。長期間のデータを安く保持でき、描画も速くなります。粗い点はそれぞれ、置き換えた点の最小、最大、合計、件数を保持します。',
      inGame:
        'ダッシュボードは、1時間と6時間の範囲では1分のサンプルを、1日と7日では15分のブロック（7日間保持）を、30日では1時間のブロック（30日間保持）を読みます。各グラフはブロックを平均として描きます。p99の線だけは、各ブロックの最悪の1分を描きます。平均ではスパイクが隠れるからです。',
      links: [
        { label: 'Thanosドキュメント: Compactorとダウンサンプリング' },
        { label: 'Prometheusドキュメント: ストレージ' },
        { label: 'Wikipedia: ダウンサンプリング' },
      ],
      design: [{ label: 'ダッシュボードの時間範囲' }],
    },
    drift: {
      term: '構成ドリフト',
      definition:
        'TerraformやPulumiのようなツールが最後にデプロイしたインフラと、いま動いているものとの差です。ドリフトは、クラウドのコンソールでのサイズ変更のようにツールの外でなされた変更と、まだ適用していないコードの変更から生まれます。',
      inGame:
        'ミラーは2通りにドリフトします。ソースのリージョンが変わったのに追いついていない場合と、ミラーを直接変えた手動変更がある場合です。適用すると、ミラーはソースに戻り、プランが見ている手動変更は取り消されます。Terraformのプランは手動変更をすべて一度に見ます。PulumiとAlchemyは記録した状態と突き合わせるので、手動変更はリフレッシュかドリフト確認の後にしか現れません。正しい地域差は上書きとして残してください。',
      links: [
        {
          label: 'Terraformチュートリアル: refresh-onlyモードでTerraformの状態を同期する',
        },
        { label: 'Pulumiドキュメント: ドリフトの検出と解消' },
        { label: 'Alchemyドキュメント: ドリフト' },
      ],
      design: [{ label: 'ミラーを同期させ続ける' }],
    },
    egress: {
      term: 'エグレス',
      definition:
        'クラウドプロバイダのネットワークから外へ、インターネットや別のゾーン、別のリージョンへ出ていくデータです。プロバイダはGB単位で課金しますが、入ってくるデータはたいてい無料です。',
      inGame:
        'シード以降、支出にはエグレスが含まれます。アプリサーバーがユーザーへ送る分が1 GBあたり$0.09、CDNがエッジで返すページが1 GBあたり$0.02です。ゾーン間の呼び出しは片道1 GBあたり$0.01、リージョン間は1 GBあたり$0.02かかります。時代のコスト指数がこれらすべてに掛かります。圧縮はCPUを10%増やすかわりに、ページと読み取りの応答を70%小さくします。',
      links: [
        { label: 'Cloudflare Learning Center: データエグレス料金とは' },
        { label: 'AWS Architecture Blog: データ転送のコスト' },
      ],
      design: [{ label: 'エグレス' }],
    },
    'edge-side-includes': {
      term: 'Edge Side Includes（ESI）',
      definition:
        'エッジがページの共通部分を保持し、ユーザーごとの断片だけを組み立てるキャッシュ手法です。ログイン済みのページでも、大半をキャッシュから返せます。',
      inGame:
        'Edge Side Includesのリサーチは、CDNの`page`ヒット率を70%から90%へ20ポイント上げます(10)。エッジがログイン済みページの外枠をキャッシュするからです。TTLは今も掛け算で効き、ヒット率の上限は95%のままです。',
      links: [{ label: 'Fastlyドキュメント: Edge Side Includes' }],
      design: [{ label: 'CDN' }],
    },
    'encryption-at-rest': {
      term: '保存データの暗号化',
      definition:
        'ディスク、データベースファイル、バックアップなど保存されているデータを暗号化し、記憶媒体を手に入れただけでは鍵なしに読めないようにすることです。盗まれたディスクや漏れたバックアップには効きますが、稼働中のシステムに問い合わせできる攻撃者には効きません。',
      inGame:
        '保存データの暗号化はシリーズBのセキュリティのリサーチです。トラフィック、コスト、インシデントに直接の効果はありません。SOC 2プログラムの3つの前提条件の1つで、残りは全通信のTLS化と依存関係スキャンです。IPOチェックリストはSOC 2を必要とします。',
      links: [
        { label: 'Google Cloud: 既定の保存時暗号化' },
        { label: 'OWASPチートシート: 暗号化ストレージ' },
        { label: 'PostgreSQLドキュメント: 暗号化オプション' },
      ],
      design: [],
    },
    'error-budget': {
      term: 'エラーバジェット',
      definition:
        'SLOが一定の期間に許す失敗の量です。SLOが99.9%なら、リクエストの0.1%まで失敗できます。チームはこれをリスクに、たとえばリリースを速めることに使い、使い切ったら速度を落として信頼性を直します。',
      inGame:
        'シリーズAから、ゲームは直近のカレンダー1週間の失敗リクエストを、その時代のSLO（シリーズAで99.9%、上場時は最大99.99%）と突き合わせて数えます。ボットとWAFの遮断は数えません。エラーバジェットのリサーチ後は、バジェットが半分以上残っているとチームの速度が10%上がり、使い切ると速度が半分になります。SLOダッシュボードはバジェットをHUDに出し、そのバーンレートをダッシュボードに描きます。',
      links: [
        { label: 'Google SRE本: リスクを受け入れる' },
        { label: 'Google SREワークブック: エラーバジェットポリシー' },
      ],
      design: [{ label: 'SLOとエラーバジェット' }],
    },
    'event-loop': {
      term: 'イベントループ',
      definition:
        'I/Oイベントを待ち、そのコールバックを1つずつ実行する単一のスレッドです。待機中の接続を安くたくさんさばけますが、長くCPUを使うコールバックは、そのループ上の他のすべてのリクエストを止めます。',
      inGame:
        'Node.jsはイベントループを1つ動かして1コアを使い、Node.jsクラスターはコアごとに1つのループを動かします。ログイン時の80 msのパスワードハッシュのようなCPUの重いリクエストは、後ろに並んだリクエストを止め、その停止はp99に乗ります。イベントループのブロックのインシデントでは、ログイン1回のCPUが4倍になります。libuvスレッドプールのリサーチか認証プロバイダが、ハッシュをループの外へ出します。',
      links: [
        { label: 'Node.js: Node.jsのイベントループ' },
        { label: 'Node.js: イベントループをブロックしない' },
        { label: 'MDN: JavaScriptの実行モデル' },
      ],
      design: [{ label: 'イベントループとブロッキング' }],
    },
    'eventual-consistency': {
      term: '結果整合性',
      definition:
        '書き込みの後しばらくのあいだ、レプリカが古いデータを返してよいという整合性モデルです。新しい書き込みが入らなければ、すべてのレプリカは同じ最新の値に収束します。',
      inGame:
        'リードレプリカは書き込みに遅れるので、読み取りの最大15%が古い値を返し、レプリケーションラグのインシデントでは最大50%になります。R + WがNを超えないワイドカラムストアも、古い読み取りを返します。古い読み取りはAPI読み取りを失敗させ、自分の書き込みを読むチェックアウトも失敗させます。read-your-writesルーティングが、そうした読み取りをプライマリへ送ります。',
      links: [
        { label: 'Werner Vogels: Eventually Consistent（ACM Queue）' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'ワイドカラムストア' }],
    },
    'expand-and-contract': {
      term: 'Expand/Contractパターン',
      definition:
        'テーブルをロックせずにスキーマを変える方法です。新しいカラムやテーブルを足し、両方に書き、埋め戻し、読み取りを切り替えてから古いほうを落とします。どの段階も後方互換なので、古いコードと新しいコードが並んで動けます。',
      inGame:
        'Expand/Contractパターンのリサーチは、スキーママイグレーションのロックのインシデントを完全になくします。オンラインスキーママイグレーションだけでもインシデントは約8分の1の頻度になり、Expand/Contractなら起こりません。どちらもDHを使います。リレーショナルデータベースでは、クエリの形を増やすフィーチャーに、オンラインなら10%、Expand/Contractなら25%、DHが余分にかかります。',
      links: [{ label: 'Martin Fowler: Parallel change' }],
      design: [{ label: 'スキーママイグレーション' }],
    },
    'fallacies-of-distributed-computing': {
      term: '分散コンピューティングの誤謬',
      definition:
        '分散システムに不慣れなプログラマーがよくしてしまう8つの誤った前提です。Sun MicrosystemsのL. Peter Deutschらがまとめました。ネットワークは信頼できる、レイテンシはゼロ、帯域は無限、ネットワークは安全、トポロジーは変わらない、管理者は1人、転送コストはゼロ、ネットワークは均質。',
      inGame:
        'いくつものインシデントとコストが、この前提を壊します。ネットワーク分断のインシデントでは、分断が直るか古いリーダーを締め出すまで、リージョン間の呼び出しはタイムアウトします。別ゾーンへの呼び出しは1 msを足し、往復でエグレスがかかり、別リージョンへの呼び出しはラウンドトリップを払います。タイムアウトとリトライを研究するまで、すべてのリンクは応答を30秒待ちます。',
      links: [
        { label: 'Wikipedia' },
        { label: 'Rotem-Gal-Oz: 分散コンピューティングの誤謬を解説(PDF)' },
      ],
      design: [{ label: '実績' }],
    },
    'fan-out': {
      term: 'ファンアウト',
      definition:
        '1つのリクエストが、他のサービスやデータストアへの多数の呼び出しに分かれることです。待つ呼び出しが多いほど、そのうち1つが遅い確率が上がるので、広いファンアウトはテールレイテンシと負荷を押し上げます。',
      inGame:
        'ページビューは読み取りクエリを2回出し、ORMフレームワーク（Laravel、Rails、Django）はEager loadingをするまで、1回で済むところを3回読みます。アクティビティフィードのフィーチャーはフィードを追加します。Pullならフィード1つが読み取り20回です。書き込み時のファンアウトならフィード1つは読み取り1回で済みますが、書き込みのたびにフォロワー20人のタイムラインを埋めます。ハイブリッドファンアウトはそれを読み取り2回とタイムライン書き込み10回に減らします。',
      links: [
        { label: 'Dean and Barroso: The Tail at Scale（CACM 2013）' },
        { label: 'Wikipedia: ファンアウト（ソフトウェア）' },
      ],
      design: [{ label: 'ファンアウト' }],
    },
    'fan-out-on-write': {
      term: '書き込み時のファンアウト',
      definition:
        '投稿が書かれた時点で各ユーザーのフィードを組み立てることです。投稿はフォロワー全員のタイムラインにコピーされるので、フィードの読み取りは安い1回の参照で済みます。仕事が読み取りから書き込みへ移り、フォロワーが多いアカウントでは高くつきます。多くのシステムはハイブリッドで、普通のアカウントはPush、有名人は読み取り時にPullします。',
      inGame:
        'シリーズCから、アクティビティフィードのフィーチャーがフィード種別を追加し、各アプリサーバーのカードでフィードをPullにするかPushにするかを選べます。Pullではフィードが投稿を20件読みます。Pushではフィードは計算済みのタイムラインを1回読むだけですが、書き込みのたびにタイムライン書き込みが20回発生します。ハイブリッドファンアウトのリサーチはそれを書き込み10回とフィードあたり読み取り2回に減らし、キャッシュやワイドカラムストアがホットキーをシャードに分けられるようにします。',
      links: [
        { label: 'InfoQ: Timelines at Scale（Twitter）' },
        { label: 'High Scalability: Twitterが使うアーキテクチャ' },
      ],
      design: [],
    },
    'feature-flag': {
      term: 'フィーチャーフラグ',
      definition:
        'コードの中にあり、実行時に制御できるスイッチで、新しいデプロイなしにフィーチャーをオン・オフできます。チームはフラグを使って、一部のユーザーにだけ出したり、試したり、壊れたときにすぐ切ったりします。',
      inGame:
        'フィーチャーフラグのリサーチは、フィーチャーフラグのコンポーネントを解放します。デプロイのバッチに入る各フィーチャーにはロールアウトがあります。ダーク、5%、25%、50%、全ユーザーです。不正なデプロイは、バッチ内のフィーチャー1つにつきアプリサーバーのリクエストの8%を失敗させ、フラグはそのフィーチャーの取り分をロールアウトまでに抑えます。5%のフィーチャーなら、デプロイ戦略が何であれ、壊すのは最大でも本来の5%です。オフにする1クリックが被害を止めます。フィーチャーの効果と追加される負荷は露出に従います。ロールアウトに、そのフィーチャーを採用したユーザーの割合を掛けたものです。ダークのフィーチャーは何も稼がず、50%のフィーチャーは採用が進めば半分のユーザーに届きます。A/Bテストは、ロールアウトが除外しているユーザーと比べて効果を測ります。',
      links: [
        { label: 'Martin Fowlerのサイト: フィーチャートグル（Pete Hodgson）' },
        { label: 'OpenFeature: フィーチャーフラグとは' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: 'フィーチャーフラグ' }],
    },
    'four-golden-signals': {
      term: '4つのゴールデンシグナル',
      definition:
        'レイテンシ、トラフィック、エラー、飽和度。Google SRE本が、ユーザー向けシステムでまず見るべき4つの指標として挙げたものです。4つしか測れないなら、この4つを測るべきです。',
      inGame:
        'ダッシュボード(D)はメトリクスのリサーチ後に開きます。ゴールデンシグナルの行は、トラフィック（需要に対する処理量）、レイテンシ（平均、パーセンタイルがあればp99も）、エラー（構造化ログがあれば）を描きます。下の飽和度の行は各ノードがどれだけ埋まっているかを示し、上の統計が高負荷ノードを示します。',
      links: [
        { label: 'Google SRE本: 分散システムの監視' },
        { label: 'Grafanaドキュメント: ダッシュボードのベストプラクティス' },
      ],
      design: [{ label: 'ダッシュボードのシグナル' }],
    },
    'gc-pause': {
      term: 'GCポーズ',
      definition:
        'ガベージコレクタが、使われなくなったメモリを見つけて解放するためにアプリケーションを止めたり遅らせたりする時間です。ポーズは一部のリクエストにしか当たらないので、平均よりもテールレイテンシ、たとえばp99に出ます。',
      inGame:
        'アプリサーバーのヒープが70%を超えると、コレクターは最大2%のリクエストを止めます。JavaはG1で30 ms、Parallelで150 ms、ZGCで1 ms止まり、ZGCはスループットの10%とメモリの15%を余分に食います。Goは1 msしか止まりませんが、CPUを最大25%多く使います。Go GCチューニングはそれをメモリと引き換えにします。GCポーズ連発のインシデントではヒープがさらに埋まり、5倍のリクエストが止まります。',
      links: [
        { label: 'Go: Goのガベージコレクタガイド' },
        { label: 'OpenJDK Wiki: ZGC' },
        { label: 'Oracle: Java GCチューニングガイド' },
      ],
      design: [{ label: 'ランタイムの挙動' }],
    },
    geodns: {
      term: 'GeoDNS',
      definition:
        'ユーザーがどこにいるかで答えを変えるDNSです。各ユーザーは近くのデータセンターやリージョンに解決されます。多くのプロバイダは、ヘルスチェックに失敗したリージョンを飛ばすこともできます。',
      inGame:
        'GeoDNSはマルチリージョンが必要なシリーズCのリサーチです。これがないと、どの大陸のユーザーも本拠地のリージョンから入り、2回のラウンドトリップを払います。たとえば欧州から北米へは150 msです。これがあれば、各リージョンのユーザーは自分のリージョンのユーザーノードから入り、リージョン障害のあいだは最も近い稼働中のノードから入ります。データレジデンシーのチェックリスト項目もGeoDNSを必要とします。',
      links: [
        { label: 'Amazon Route 53: 地理位置情報ルーティング' },
        { label: 'Amazon Route 53: レイテンシに基づくルーティング' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'gil-global-interpreter-lock': {
      term: 'GIL（グローバルインタプリタロック）',
      definition:
        'CPythonの既定ビルドにおけるロックで、CRubyではGVLと呼ばれます。インタプリタのコードを同時に1つのスレッドしか実行できないようにします。I/Oを待つあいだはスレッドが重なり合えますが、1プロセス内のCPU処理は並列にはなりません。CPython 3.13は、GILなしのフリースレッドビルドを任意で追加しました(PEP 703)。',
      inGame:
        'RubyのPumaは全コアを使うためにコアごとに1プロセスを動かす必要があり、各プロセスは5スレッド、180 MBです。PythonのGunicornは同期ワーカーのプールを動かし、1ワーカーが1リクエスト、120 MBで、プールの大きさは自分で設定します。GoやJavaのようにGILのないランタイムは、全コアで1プロセスを動かします。',
      links: [
        { label: 'Pythonドキュメント: 用語集（グローバルインタプリタロック）' },
        { label: 'PEP 703: GILを任意にする' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: '並行モデル' }],
    },
    gitops: {
      term: 'GitOps',
      definition:
        '望ましい状態を宣言的なコードとしてGitに置き、Argo CDやFluxのようなエージェントがそれを取得して、稼働中のシステムを一致させ続けるインフラ運用のやり方です。OpenGitOpsは4つの原則を挙げています。宣言的であること、バージョン管理され不変であること、自動で取得されること、継続的に調整されること。',
      inGame:
        'GitOpsはInfrastructure as Codeの後のシリーズCのリサーチです。ソースの変更を各ミラーに個別に適用するので、ミラーが遅れなくなります。どのIaCツールでも次の同期で手動変更を取り消します。Argo CDのセルフヒールをオンにしたときと同じで、リージョンを調整する手段は上書きだけになります。一括同期はArgo CDの既定のポーリングと同じく、カレンダー時間で3分以内に同期します。段階的同期は変更をまず60分間ソースに留めます。一括同期はドリフトと引き換えにブラストラディウスを取ります。不正な設定投入がすべてのミラーに同時に届きます。',
      links: [
        { label: 'OpenGitOps: GitOpsの原則' },
        { label: 'Argo CDドキュメント: 自動同期ポリシー' },
        { label: 'Fluxドキュメント: 主要な概念' },
      ],
      design: [{ label: 'GitOps' }],
    },
    'graceful-degradation': {
      term: 'グレースフルデグラデーション',
      definition:
        '容量を超えたときに、すべてを失敗させるのではなく、高コストで任意の部分を止めて、サービスの重要な部分を動かし続けることです。ページは読み込まれ、レポートは待ちます。',
      inGame:
        'グレースフルデグラデーションのリサーチは、アプリサーバーにスイッチを追加します。飽和したノードは、いちばん高コストなリクエスト種別から先に落とします。読み取りより先にエクスポートとアップロードです。安い種別はレイテンシを保ちます(10)。優先度付きロードシェディングは逆の順序で、価値の低い種別から落とします。ページより先にボットと入札です。',
      links: [{ label: 'Google SRE本: 過負荷への対処' }],
      design: [{ label: '信頼性のトラック' }],
    },
    'green-threads': {
      term: 'グリーンスレッド',
      definition:
        'OSではなく言語のランタイムがスケジュールする軽量スレッドです。Goroutine、Javaの仮想スレッド、Erlangのプロセスが例です。1つあたり数KBしかかからないので、1台のサーバーで何千もの待機を同時に抱えられます。',
      inGame:
        'GoとElixirのBEAMは全コアでグリーンスレッドを動かし、待機中のリクエストはワーカーの枠を取りません。開いているリアルタイム接続1本あたり、Goは10 KB、BEAMは5 KBで、Tomcat上のJavaスレッドの1 MBと比べられます。BEAMはプリエンプティブなのでリクエストどうしが止め合いませんが、CPUはGoの半分以下の速さです。',
      links: [
        { label: 'A Tour of Go: Goroutine' },
        { label: 'JEP 444: 仮想スレッド' },
        { label: 'Wikipedia' },
      ],
      design: [{ label: '並行モデル' }],
    },
    'health-check': {
      term: 'ヘルスチェック',
      definition:
        '状態を返すエンドポイントへのHTTPリクエストのような、定期的なプローブで、サーバーがトラフィックを受けるべきかを決めます。浅いチェックはサーバーだけを試し、深いチェックは依存先、たとえばデータベースも試します。',
      inGame:
        'ロードバランサーはアプリサーバーを10秒ごとに調べ、死んだサーバーへの送信を次のチェックで止めます。ヘルスチェックのリサーチは2秒と30秒の間隔と、データベースが落ちているか過負荷のアプリサーバーも外す深いチェックを追加します。DNSがTTLの切れ目で死んだホストを外せるようにもなり、これがないとDNSはそのホストへ取り分を送り続けます。チェックは、ヘルスチェックエンドポイントのタスクが終わってから機能します。',
      links: [
        { label: "AWS Builders' Library: ヘルスチェックの実装" },
        { label: 'Kubernetesドキュメント: Liveness・Readiness・Startupプローブ' },
      ],
      design: [{ label: 'ロードバランサー' }],
    },
    'hedged-request': {
      term: 'ヘッジリクエスト',
      definition:
        '最初のリクエストが想定より遅いとき、たとえば95パーセンタイルのレイテンシを超えたときに、同じリクエストの2通目を別のレプリカへ送り、先に返ってきたほうを使います。少しの追加負荷でテールレイテンシを削れます。',
      inGame:
        'ヘッジリクエストのリサーチで、各リンクにヘッジのスイッチが付きます。ヘッジを有効にしたリンクはすべての呼び出しの2通目を送り、ユーザーは速いほうの応答を待つので、平均は半分になりp99も下がります。呼ばれる側の呼び出しは10%増え、それはリンクのレートに出ます。パーセンタイルのリサーチで、テールが前後でどう変わったかを見られます。ワイドカラムストアのクォーラム読み取りも同じ仕組みで、N個のレプリカのうち速いほうのR個だけを待ちます。',
      links: [
        { label: 'Dean and Barroso: The Tail at Scale (CACM 2013)' },
        { label: 'gRPCドキュメント: リクエストヘッジング' },
      ],
      design: [{ label: '進行' }],
    },
    'hot-key': {
      term: 'ホットキー',
      definition:
        '読み取りや書き込みのごく大きな割合が集中する1つのキーです。有名人のプロフィールなどが典型です。そのキーを持つシャードやサーバーだけが飽和し、ほかは遊んでいるだけなので、サーバーを増やしても効きません。',
      inGame:
        'ホットキーのインシデント（シリーズC）では、混んでいるキャッシュかワイドカラムストアへの読み取りの30%が1つのキーに集中します。そのノードの容量は0.3 × サイズ段数 + 0.7で割られるので、サイズ4のノードはおよそ半分しか出せません。ハイブリッドファンアウトのリサーチで、キャッシュかワイドカラムストアのキー分割をオンにできます。分割すればホットキーが散り、失っていた容量は戻ります。',
      links: [
        { label: 'AWSドキュメント: DynamoDBでワークロードを分散するパーティションキーの設計' },
        { label: 'AWSドキュメント: DynamoDBの書き込みシャーディング' },
        { label: 'Redisドキュメント: redis-cli --hotkeys' },
      ],
      design: [{ label: 'パーティショニング' }],
    },
    'http-keep-alive': {
      term: 'HTTPキープアライブ',
      definition:
        '1つのTCP接続を使い回して複数のHTTPリクエストを送り、毎回新しい接続を開かないようにします。2回目以降のリクエストでは、接続のハンドシェイク（HTTPSならTLSのハンドシェイクも）を省けます。',
      inGame:
        'ノード間の内部呼び出しは、0.5 msのホップに1 msのTCPハンドシェイクが加わります。接続の再利用のリサーチでハンドシェイクがなくなり、内部呼び出しは0.5 msになります。複数のノードをまたぐリクエストは、ホップごとに1 msを節約します。',
      links: [
        { label: 'MDN: HTTP/1.xの接続管理' },
        { label: 'RFC 9112: HTTP/1.1の接続管理' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'http2-and-http3': {
      term: 'HTTP/2とHTTP/3',
      definition:
        'HTTPの新しい版です。HTTP/2は1本のTCP接続で多数のリクエストを同時に送ります。HTTP/3はUDP上のQUICで動き、トランスポートとTLSのハンドシェイクを1回にまとめ、パケットが1つ落ちてもすべてのストリームが止まることはありません。',
      inGame:
        'HTTP/3のリサーチは、別の大陸のリージョンまで届くのにユーザーが払うラウンドトリップを20%削ります。北米から配信される欧州のユーザーは150 msではなく120 ms待ちます。シリーズCのリサーチ項目で、前提にHTTP/2のリサーチが要ります。HTTP/2のリサーチはページビューでユーザーのホップを15%削ります。',
      links: [
        { label: 'MDN: HTTPの進化' },
        { label: 'Cloudflare Learning Center: HTTP/3とは何か' },
        { label: 'RFC 9114: HTTP/3' },
      ],
      design: [],
    },
    'iac-tool': {
      term: 'IaCツール',
      definition:
        'インフラをコードとして記述し、それを適用するツールです。コードと記録された状態を比べ、計画を表示し、差分を適用します。TerraformはHCLを、PulumiとAlchemyはTypeScriptのような汎用言語を使います。どのツールも、デプロイした内容を状態ファイルに持ちます。',
      inGame:
        'Infrastructure as Codeのリサーチでは、Terraform、Pulumi、Alchemyのどれかを選びます。3つともすべてのコンポーネントを構築でき、リージョンごとに任意の値を設定できます。違いは、計画が手作業の変更をどう見つけるかで、各ツールの既定の流れに従います。Terraformは計画のたびに実状態を読み直すので計画は完全ですが、適用のたびにその読み直しを待ちます。Pulumiはリフレッシュするまで記録された状態に対して計画します。Alchemyも記録された状態に対して計画しますが、ドリフトを確認すれば実状態が読め、修復すればソースの変更を取り込まずに手作業の変更が戻ります。別のツールに移ると、同期はカレンダー1日止まります。',
      links: [
        { label: 'Terraformドキュメント: Terraformとは何か' },
        { label: 'Pulumiドキュメント: Infrastructure as Code' },
        { label: 'Alchemyドキュメント: プロバイダ' },
        { label: 'Wikipedia: Infrastructure as Code' },
      ],
      design: [{ label: 'IaCツール' }],
    },
    idempotency: {
      term: '冪等性',
      definition:
        '同じ操作を2回しても1回と同じ結果になることを冪等といいます。読み取りは本質的に冪等ですが、カードの課金や注文はそうではありません。冪等キーはクライアントがリクエストに添えて送る一意なIDで、サーバーは再試行を見分け、もう一度処理する代わりに最初の結果を返せます。',
      inGame:
        'チェックアウトは決済プロバイダに課金を送ります。二重課金のインシデントではプロバイダが約1.5秒遅くなり、課金のリンクがタイムアウトします。そのあとの再試行が、1回目ですでに課金したカードにもう一度課金するので、そのチェックアウトは重複として失敗します。冪等キーのリサーチ（前提にチェックアウト）を行い、冪等キーのタスクを片付ければ、再試行した課金が二重に課金されることはありません。それがなければ、課金リンクのリトライをなしにしてインシデントを終わらせてください。',
      links: [
        { label: "AWS Builders' Library: 冪等なAPIで安全にリトライする" },
        { label: 'Stripe API: 冪等なリクエスト' },
        { label: 'RFC 9110: 冪等なメソッド' },
      ],
      design: [{ label: '決済プロバイダ' }],
    },
    'inverted-index': {
      term: '転置インデックス',
      definition:
        '各単語から、その単語を含む文書の一覧へ対応づけるインデックスです。本の巻末の索引と同じ仕組みです。LuceneやElasticsearchのような全文検索エンジンが使い、PostgreSQLではGINインデックスとして使えます。検索はすべての行を走査する代わりに、短いいくつかのリストを読むだけで済みます。',
      inGame:
        '検索エンジンがないと、データベース自身が検索クエリに答え、1回の検索に80 msのCPUを使います。通常の読み取りの10倍です。全文検索のリサーチで検索エンジンが解放され、サイズ段数あたり毎秒400件の検索に約15 msで答えます。アプリサーバーにつなげば、検索がデータベースを圧迫しなくなります。',
      links: [
        { label: 'Stanford IR book: 転置インデックスの構築' },
        { label: 'PostgreSQLドキュメント: GINインデックス' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'jit-warmup': {
      term: 'JITウォームアップ',
      definition:
        'ジャストインタイム（JIT）コンパイラは、プログラムの実行中によく通るコードを最適化した機械語に変換します。ホットパスをプロファイルしてコンパイルし終えるまで、新しいプロセスは最高速度を下回って動くので、最初の数秒から数分が遅くなります。JVMと.NETはこの方式でウォームアップし、段階コンパイルやAOTプロファイルがその時間を縮めます。',
      inGame:
        'ランタイムごとに起動時の速度とウォームアップ時間があり、コールドのアプリサーバーは最初の数秒だけ遅く動きます。Tomcat（Java）のアプリサーバーはCPU速度30%で起動し、30秒で全速になります。Kestrel（C#）は60%、Node.jsは80%から15秒かけて、Go、BEAM、Tokioは最初から全速です。再起動、サイズ変更、スタックの変更、オートスケーラーの新しいコピーはどれもコールドで始まるので、容量はピークの前に足してください。PHPは代わりにOPcacheを温め、キャッシュが埋まるにつれてCPU速度1×から2.5×まで上がります。',
      links: [
        { label: 'OpenJDK JEP 515: AOT方式のメソッドプロファイリング' },
        { label: 'Microsoft: OpenJDKの段階コンパイルの仕組み' },
        { label: 'Wikipedia: JITコンパイル' },
      ],
      design: [{ label: 'ランタイムの挙動' }],
    },
    'leaderless-replication': {
      term: 'リーダーレスレプリケーション',
      definition:
        '単一のリーダーを置かないレプリケーションです。クライアントは各書き込みを複数のレプリカへ送り、複数のレプリカから読み、クォーラムで決着します。AmazonのDynamoがこの設計を広め、Cassandraが採用しています。一部のレプリカが落ちても書き込みを続けられますが、R + W > Nでないと古い値を読むことがあります。',
      inGame:
        'リーダーレスレプリケーションのリサーチ（シャーディングの後）でワイドカラムストアが解放されます。各キーはN個のレプリカ（1〜5、既定3）に載り、読み取りはそのうちR個に問い合わせ、書き込みはW個を待ちます（RとWの既定はどちらも1）。R + W > Nならどの読み取りも最新の書き込みを見ますが、それ未満だと古い値が返ることがあります。書き込みはレプリカ操作N回、読み取りはR回かかり、サイズ段数あたり毎秒30,000回が上限です。インスタンス障害でレプリカが1つ落ちると、全レプリカを必要とするクォーラムは失敗します。',
      links: [
        { label: 'Dynamo: Amazonの高可用キーバリューストア' },
        { label: 'Apache Cassandraドキュメント: Dynamo' },
      ],
      design: [],
    },
    'leap-smearing': {
      term: 'リープスミアリング',
      definition:
        'うるう秒への対処法です。サーバーは余分な1秒を長い期間、たいていは丸1日に薄く広げるので、時計はごくわずかに遅れ、決して飛びません。GoogleとAmazonは自社の時計でこうしています。厄介なのは時刻の飛びで、同じ秒が2度あるとタイマーが2回発火し、リースが早く切れます。',
      inGame:
        '「うるう秒と時刻ずれ」のインシデントは、1つのリージョンの全ノードの応答を1,000 ms遅らせ、応答の10%をタイムアウトさせます。ノードを再起動するか、60秒たてば収まります。リープスミアリング（シリーズC）は、その時刻の飛びを起こさないためのリサーチです。うるう秒チャレンジでは、同じ出来事をリージョン単位のアプリサーバー障害として体験します。',
      links: [
        { label: 'Google: Leap Smear' },
        { label: 'Cloudflare: リープスミアリングの方法と理由' },
      ],
      design: [{ label: '6種類のインシデント' }],
    },
    'littles-law': {
      term: 'リトルの法則',
      definition:
        '安定した系では、中にある件数の平均（L）は、到着率の平均（λ）に、各件数が中で過ごす時間の平均（W）を掛けたものに等しくなります。L = λWです。John Littleが1961年に証明し、到着のパターンや処理の順序によらず成り立ちます。サーバーなら、処理中のリクエスト数 = 毎秒のリクエスト数 × 1リクエストにかかる秒数です。',
      inGame:
        'リクエストごとにワーカーやスレッドを占有するアプリサーバーには、決まった数のスロットがあります。各リクエストは、自分のCPU時間と、待っているデータベース呼び出しの分だけスロットを握ります。使用中のスロット = 到着率 × その時間なので、各リクエストがデータベースで10倍待つようになると、ワーカー5つのPHP-FPMプールが処理できるリクエストは最大10分の1になります。遅い呼び出しを直すか、ワーカーやスレッドを増やすか、スロットを持たずに待てるランタイム（Node.js、Go、Kestrel、BEAM、Tokio）へ移してください。',
      links: [
        { label: 'Little (1961): 待ち行列の公式L = λWの証明' },
        { label: 'Wikipedia: リトルの法則' },
      ],
      design: [{ label: 'ノード間のレイテンシ結合' }],
    },
    'load-balancer': {
      term: 'ロードバランサー',
      definition:
        '届いたリクエストを複数のバックエンドサーバーに分散し、ヘルスチェックに落ちたバックエンドには送らなくなるサーバーです。1つのアドレスの裏にサーバーを足せるようにし、どのサーバーが各リクエストを受けるかを決めます。',
      inGame:
        'ロードバランシングのリサーチでロードバランサーが解放され、サイズ段数あたり毎秒2,000件のリクエストを1 msの追加で処理します。既定では各アプリサーバーの容量に応じてトラフィックを分けます。死んだホストは次のヘルスチェックで外れ、既定では10秒ごとに行います。DNSラウンドロビンは死んだホストにも送り続けます。ロードバランシングアルゴリズムのリサーチで最小接続数と2択が加わり、ヘルスチェックのリサーチで2秒ごとまたは30秒ごとの確認にできます。L4ロードバランシングのリサーチはノードをレイヤー4に切り替えます。毎秒20,000件、ホップ0.2 ms、支出は0.6倍になります。HTTPを読まないので、種類ごとのルーティングもリトライもありません。',
      links: [
        { label: 'Cloudflare: ロードバランシングとは何か' },
        { label: 'Google SRE book: データセンターのロードバランシング' },
        { label: 'NGINX: nginxをHTTPロードバランサーとして使う' },
      ],
      design: [],
    },
    'load-shedding': {
      term: 'ロードシェディング',
      definition:
        'サーバーが過負荷のとき、一部のリクエストをわざと断ることで、残したリクエストが全部タイムアウトする代わりに間に合うようにします。よいシェディングは、処理が資源を使う前の早い段階で断り、重要度の低いものや安いものから落とします。',
      inGame:
        '優先度付きロードシェディングのリサーチで、アプリサーバーのロードシェディングをオンにできます。負荷が90%を超えると、リクエストの種類ごと落とし、価値の低い順（ボット、次にリアルタイム、次にページビュー以降）に、負荷が90%に戻るまで続けます。おかげで$25のチェックアウトが過負荷でも通ります。落としたリクエストはエラーとして数えられエラーバジェットを消費しますが、残したリクエストは速いままです。',
      links: [
        { label: "AWS Builders' Library: ロードシェディングで過負荷を避ける" },
        { label: 'Google SRE book: 過負荷への対処' },
        { label: 'Google SRE book: カスケード障害への対処' },
      ],
      design: [{ label: 'インシデント緩和の道具箱' }],
    },
    'memory-leak': {
      term: 'メモリリーク',
      definition:
        '長く動くプロセスが確保したまま使わなくなったメモリです。そのためメモリ使用量は稼働時間とともに増えます。GCのある言語では、たいていは誤って到達可能なまま残ったオブジェクトが漏れで、増える一方のキャッシュや、誰も外さないリスナーなどです。スワップやGCでプロセスは遅くなり、メモリが尽きるとOSに殺されます。',
      inGame:
        'メモリリークのインシデントは、リクエストの間もプロセスを残すランタイム（Apache mod_phpとPHP-FPM以外のすべて）のアプリサーバーを襲います。毎秒RAMの2.5%を食っていきます。RAMの100%を超えるとスワップして遅くなり、125%でカーネルに殺されてコールドから再起動します。サーバーを再起動してメモリを解放するか、メモリリークの修正タスク（15 DH）を出してください。次の機能を出荷するまで漏れが止まります。',
      links: [
        { label: 'Wikipedia: メモリリーク' },
        { label: 'Node.js Learn: メモリ診断' },
        { label: 'Oracle Javaドキュメント: メモリリークのトラブルシューティング' },
      ],
      design: [{ label: 'ランタイムの挙動' }],
    },
    'materialized-view': {
      term: 'マテリアライズドビュー',
      definition:
        'クエリの結果を保存しておき、ディスクに置いて定期的に更新するものです。レポートはテーブルを走査せずに答えを読むだけで済みます。速い代わりに、鮮度は最後の更新までです。',
      inGame:
        'マテリアライズドビューのリサーチで、データベースのカードにビューが加わります。レポートは保存されたビューを走査するのでCPUは半分（10）で済みますが、レポートの答えの5%は最後の更新より前の古い内容です。データウェアハウスのデータベース側の双子で、同じ安い走査を、2つ目のシステムなしで手に入ります。',
      links: [{ label: 'PostgreSQLドキュメント: マテリアライズドビュー' }],
      design: [{ label: 'データウェアハウスとビュー' }],
    },
    'metastable-failure': {
      term: 'メタステーブル障害',
      definition:
        'きっかけが消えたあとも自分を維持し続ける障害です。短い遅延がシステムを悪い状態に押し込み、たいていはリトライのフィードバックループが負荷を容量以上に保つので、誰かが負荷を切るまで落ちたままになります。Bronsonらが2021年にこの種の障害を名付けました。',
      inGame:
        'リトライストームのインシデントは、データベースの容量を20秒間30%まで落とします。すぐにリトライするリンクは、失敗する割合をfとすると、1呼び出しあたり最大1 + f + f² + f³回の呼び出しを送ります。その失敗の割合は次のステップにも持ち越され、データベースは受けきれない分をキューに積むので、インシデントはその滞留がはけるまで終わりません。バックオフとジッター、サーキットブレーカー、優先度付きロードシェディングは、どれもこのループを断ちます。データベースへ向けた素朴なリトライは、バックオフに比べてこのインシデントの発生率を6倍にします。',
      links: [
        { label: 'Bronson et al. (HotOS 2021): 分散システムにおけるメタステーブル障害' },
        { label: 'Huang et al. (OSDI 2022): 実環境で起きるメタステーブル障害' },
        { label: 'Marc Brooker: メタスタビリティと分散システム' },
      ],
      design: [{ label: 'リトライストーム' }],
    },
    mirror: {
      term: 'ミラー',
      definition:
        '同じインフラのコードを別のリージョンで動かすことです。Terraformのモジュールをリージョンごとに1回適用する、CloudFormationのStackSetを使う、といった形です。サーバーは簡単に複製できます。データはそうはいきません。複製ごとに、書き込みをどこへ送るかを決める必要があります。',
      inGame:
        'Infrastructure as Codeのリサーチのあとは、リージョンのタブの横にあるミラーのボタンで、あるリージョンのノードとリンクを別のリージョンへ複製できます。データベースごとに、リードレプリカ、自前のプライマリ、ソースを呼ぶ、のどれかを選びます。オブジェクトストレージは、複製するかソースを呼ぶかです。適用するとすぐに支払いが発生し、新しいノードはビルド時間のあとコールドで現れます。そのリージョンのユーザーにリンクが付くのは、計画が反映されてからです。ミラーはソースとつながったままなのでドリフトしえますが、GitOpsが勝手に同期を保ちます。',
      links: [
        { label: 'Terraformドキュメント: モジュールの概要' },
        { label: 'AWSドキュメント: CloudFormation StackSetの使い方' },
      ],
      design: [{ label: 'リージョンのミラー' }],
    },
    'model-inference': {
      term: 'モデル推論',
      definition:
        '学習済みの機械学習モデルを動かして答えを出すことで、学習とは対になります。大規模言語モデルではGPUが答えをトークン単位で生成するので、コストと速度は毎秒のトークン数と最初のトークンまでの時間で測ります。GPUを借りて自分でモデルを提供するか、ホスト型APIにトークン単位で払うかです。',
      inGame:
        'AIプロンプトのリクエストは、400トークンのプロンプトを1つ推論ノードへ送ります。LLM API（ホスト型モデルのリサーチ）はGPUを必要としません。1,000トークンあたり$2.50で、最初のトークンまで600 ms、利用枠ごとに毎秒100件を超えるプロンプトは制限されます。GPUノード（モデルサービングのリサーチ）は最初のトークンまで300 msで、T4なら毎秒200トークン、A100なら900、H100なら2,000を生成します。支出は暇でも忙しくても同じなので、H100がLLM APIより安いのは、稼働率がおよそ3分の2以上のときだけです。',
      links: [
        { label: 'Cloudflare: AI推論と学習の違い' },
        { label: 'vLLMドキュメント' },
        { label: 'PagedAttentionの論文 (vLLM)' },
      ],
      design: [],
    },
    'mttd-and-mtta': {
      term: 'MTTDとMTTA',
      definition:
        'MTTD（平均検知時間）は、障害が始まってからそれを示すシグナルが上がるまでの平均時間です。MTTA（平均一次応答時間）は、そのシグナルから誰かがインシデントを引き取るまでの平均時間です。GoogleのSRE本がMTTRと並べて両方を数えるのは、直すのは速いのに気づくのが遅いチームは、結局遅いからです。',
      inGame:
        'どのインシデントも、最初のシグナルが届いたシミュレーション秒と、プレイヤーが最初に動いたシミュレーション秒を記録し、ポストモーテムにMTTRと並べてMTTDとMTTAを出します。アラートがあればシグナルはページャーで、ルールのしきい値を超えたステップに鳴ります。アラートがなければシグナルはボードで、リクエストの1%超が失敗した最初の秒です。オンコールはページが届いてからカレンダー5分で応答し、それがローテーションの保つMTTAです。オンコールがなければ、プレイヤーの最初の操作が一次応答になります。',
      links: [
        { label: 'Google SRE book: オンコールであること' },
        { label: 'Wikipedia: 平均復旧時間' },
      ],
      design: [{ label: 'インシデントのループ' }],
    },
    mttr: {
      term: 'MTTR',
      definition:
        'MTTR（平均復旧時間）は、障害が始まってからサービスが再び動くまでの平均時間です。チームが問題を見つけ、診断し、直す速さを表します。DORAはより狭い定義、失敗したデプロイの復旧時間を測ります。',
      inGame:
        'どのインシデントも、MTTRを示すポストモーテムで終わります。MTTRは、リクエストの1%超が失敗していたカレンダー上の分数です。ポストモーテムには、その前段のMTTDとMTTAも出ます。エンジニアを1人載せたSREチームは、継続時間、つまりMTTRを40%縮めます。折り返し時点でユーザーに被害が出ていた時間が半分を超えたインシデントは、深刻度が1段上がり、1.5倍長く続きます。MTTRを抑えるには素早く動くことです。やられたノードを再起動する、交換する、ドレインする、フェイルオーバーする。そしてポストモーテムのアクションアイテムを研究してください。',
      links: [
        { label: 'Wikipedia: 平均復旧時間' },
        { label: 'DORA: ソフトウェアデリバリーのパフォーマンス指標' },
      ],
      design: [{ label: 'インシデントのループ' }],
    },
    'n1-query': {
      term: 'N+1クエリ',
      definition:
        '一覧を1本のクエリで読み、そのあと各項目の関連データのために項目ごとにもう1本クエリを投げます。N件ならN + 1本です。ORMの遅延読み込みがこれを起こし、余分なクエリは普通に見えるコードの裏に隠れます。Eager loadingなら関連する行を1、2本のクエリでまとめて取れます。',
      inGame:
        'Laravel、Rails、DjangoのORMは、1本で済むところを3本の読み取りクエリで送ります。ページビューとAPI読み取りが対象です。するとページビュー1回でデータベースは2回ではなく6回の読み取りをこなし、データベースのCPUとアプリサーバーの待ち時間が増えます。Eager loadingのリサーチを行い、一括読み込みのタスク（10 DH）を出して余分なクエリをなくしてください。Symfonyと軽量なフレームワークはそもそも作りません。',
      links: [
        { label: 'Railsガイド: 関連のEager loading' },
        { label: 'Djangoドキュメント: select_related' },
        { label: 'Laravelドキュメント: Eager loading' },
      ],
      design: [{ label: 'フレームワークの挙動' }],
    },
    'network-partition': {
      term: 'ネットワーク分断',
      definition:
        'システムを、互いにたどり着けないノードの集まりに分断するネットワーク障害です。分かれた側はそれぞれ動き続けます。分断のあいだ、分散システムは可用性を取るか一貫性を取るかを選ばなければなりません（CAP定理）。',
      inGame:
        'ネットワーク分断のインシデントは、シリーズCでリンクがリージョンをまたぐと発生しえます。最大45秒、リージョン間の呼び出しはすべてタイムアウトします。ただしユーザーからの呼び出しと、CDNのようなグローバルなコンポーネントへの呼び出しは除きます。リーダーに基づく書き込みも分岐します。「リーダーを遮断」を押せば終わります。分散SQLのノードはRaftのリーダーを1つ保つので、このインシデントは起きにくくなります。',
      links: [
        { label: 'ACM Queue: ネットワークは信頼できる' },
        { label: 'InfoQ: CAP定理から12年' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'node-drain': {
      term: 'ノードドレイン',
      definition:
        'サーバーをわざとローテーションから外すことです。新しい仕事を送るのをやめ、すでに抱えているリクエストやジョブを終わらせてから、停止するか更新します。ロードバランサーのコネクションドレインも、Kubernetesの`kubectl drain`もこのやり方です。忙しいサーバーをそのまま殺すと、やっていた仕事は失われます。',
      inGame:
        'ヘルスチェックのリサーチで、ノードのカードにドレインのボタンが付きます。ノードはすぐに新しいトラフィックを受けなくなり、その分は経路上のほかのノードへ回ります。抱えているものは終わらせます。キューの滞留はワーカーに渡ります。10シミュレーション秒後、空になってローテーションに戻ります。インシデントにやられているノードをドレインすると、そのインシデントは10秒のドレイン期間に縮みます。負荷を引き受けられるコピーがほかにないノードでは、そこへ送られたリクエストがすべて行き場を失います。',
      links: [
        { label: 'Kubernetesドキュメント: ノードを安全にドレインする' },
        { label: 'NGINXドキュメント: リバースプロキシ' },
        { label: 'AWSドキュメント: ターゲットグループの登録解除遅延' },
      ],
      design: [{ label: 'インシデント緩和の道具箱' }],
    },
    'object-storage': {
      term: 'オブジェクトストレージ',
      definition:
        'ファイルをフラットな名前空間のオブジェクトとして保存するストレージです。各オブジェクトはキー、データ、メタデータを持ち、HTTP APIで読み書きします。Amazon S3のようなサービスはほぼ無制限にスケールし、保存したバイト数と転送したバイト数で課金されます。データベースが苦手とするアップロード、画像、動画、バックアップに向いています。',
      inGame:
        'オブジェクトストレージがないと、データベースがアップロードを行として持ち、2 MBのオブジェクト書き込み1回に60 msのCPUを使います。オブジェクトストレージのリサーチでオブジェクトストレージが解放され、アップロードもファイル読み取りも容量の上限なく、40 msのレイテンシで受けます。支出は保存したGBごとにS3 Standardの価格で増えるので、ユーザーがアップロードするほど請求は上がり続けます。',
      links: [
        { label: 'AWS: Amazon S3とは何か' },
        { label: 'Cloudflare: オブジェクトストレージとは何か' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    observability: {
      term: '可観測性',
      definition:
        'システムが発するデータ、ふつうはログ、メトリクス、トレースから、そのシステムが何をしているかをどれだけ理解できるかです。可観測性が高ければ、新しいコードを出さずに、障害についての新しい問いに答えられます。',
      inGame:
        '可観測性のリサーチで、シミュレーションが出す数字をより多く見られます。構造化ログはエラーを原因別に分け、メトリクスは各ノードに履歴のグラフを足し、パーセンタイルはp50、p95、p99を表示し、アラートはエラー、p99、飽和のいずれかがしきい値を超えたときにページャーのバナーを出します。アナリティクスのノードは、つないだノードのトラフィックを1%から100%までサンプリングし、インサイトに変えます。Apdexが下がるほど各サンプルから学べることが増え、最大で2倍になります。サンプリング率を上げるほどCPUと支出がかかります。メトリクスはダッシュボード（D）も開き、設計の推移をグラフにします。',
      links: [
        { label: 'OpenTelemetry: 可観測性の手引き' },
        { label: 'Google SRE book: 分散システムの監視' },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'oltp-and-olap': {
      term: 'OLTPとOLAP',
      definition:
        'オンライントランザクション処理（OLTP）は、注文やログインのように、現在の行に対する小さく速い読み書きを大量にこなします。オンライン分析処理（OLAP）は、レポートのように、履歴に対する大きな走査と集計を少しだけ行います。OLTPのデータベースは行ごとにまとめて保存し、OLAPのエンジンはふつう列ごとにまとめて保存するので、走査は必要な列だけを読みます。',
      inGame:
        'レポートのリクエストはスキャンのクエリを送ります。データベースではスキャンが大量のCPUを使い、バッファキャッシュを追い出すので、ほかの読み取りはディスクへ回り、書き込みは待たされます。「レポートがデータベースを殺す」のインシデントのあいだは、スキャン1回のコストが10倍になります。データウェアハウス（データウェアハウスのリサーチ）はスキャンをプライマリから引き取ります。スキャン1回は1.5秒で、データウェアハウスに容量の上限はなく、1回あたり$0.02に時代のコスト指数を掛けた額がかかります。',
      links: [
        { label: 'AWS: OLTPとOLAPの違い' },
        { label: 'Wikipedia: オンライン分析処理' },
        { label: 'Wikipedia: オンライントランザクション処理' },
      ],
      design: [{ label: 'データウェアハウス' }],
    },
    'on-call': {
      term: 'オンコール',
      definition:
        '就業時間外にページャーを持ち、アラートに応じるエンジニアのローテーションです。ページは、たまたまダッシュボードを見ていた人ではなく、当番の人に届きます。よいローテーションは静かで、範囲が限られ、睡眠で支払われます。',
      inGame:
        'オンコールローテーションのリサーチ（シリーズA、アラートの後）で、チームがページャーを持ちます。ローテーションは最初のシグナルからカレンダー5分でインシデントに応答するので、プレイヤーが離れていてもMTTAは短く、ポストモーテムにも出ます。これがないと、ページはプレイヤーの最初のクリックを待ちます。ページはすべて、やられたサービスの持ち主であるチームのエンジニアに加算され、1件ごとに気分を少しずつ削ります。長い四半期のオンコールは、エンジニアが休暇や昇給、あるいは辞表を口にする理由のひとつです。',
      links: [
        { label: 'Google SRE book: オンコールであること' },
        { label: 'PagerDuty: オンコールローテーションとは何か' },
      ],
      design: [{ label: 'インシデントのループ' }],
    },
    'operating-margin': {
      term: '営業利益率',
      definition:
        '営業利益を売上に対する割合で表したものです。(売上 − 営業費用) / 売上。営業費用にはホスティング、人件費、手数料が入ります。売上の1ドルあたり、商売を回すために払ったあとでどれだけ残るかが分かります。',
      inGame:
        '利益率は(売上 − 支出) / 売上です。支出はクラウドの請求に人件費、エグレス、外部サービスの手数料を足したものです。売上がなければ−100%になります。利益率に年間のユーザー成長率を足したものが40の法則で、これが評価額の倍数を決めます。4 + 0.15 × 40の法則で、2から30までです。上場の時代には、四半期ごとに10%、20%、30%の利益率ガイダンスを設定します。上回れば倍数が上がり、下回れば下がります。',
      links: [{ label: 'Investopedia: 営業利益率' }, { label: 'Wikipedia' }],
      design: [],
    },
    'percentile-p50-p95-p99': {
      term: 'パーセンタイル（p50、p95、p99）',
      definition:
        '測定値のうち、ある割合がその下に入る値です。p50（中央値）のレイテンシは、ふつうのリクエストが経験する値です。p99は99%のリクエストが下回る、つまり100件に1件がそれより遅いレイテンシです。平均は遅い外れ値を隠すので、SLOやアラートは高いパーセンタイルを使うのが普通です。',
      inGame:
        'パーセンタイルのリサーチの前は、HUDに平均レイテンシが出ます。後はHUDにp99が出て、リクエストの種類ごとにp50、p95、p99が出ます。イベントループの停止やGCポーズはリクエストの約2%に当たるので、平均とp95がほとんど動かないままp99だけが上がります。アラートがあれば、ある種類のp99がApdex目標の4倍を30秒（既定のしきい値）超え続けたときに、レイテンシのルールがページを鳴らします。ダッシュボードのレイテンシのグラフはp99を平均の隣に描くので、平均がどれだけ隠しているかが分かります。',
      links: [
        { label: 'Google SRE book: サービスレベル目標' },
        { label: 'Wikipedia: パーセンタイル' },
      ],
      design: [{ label: 'パーセンタイル' }],
    },
    'point-in-time-recovery': {
      term: 'ポイントインタイムリカバリ',
      definition:
        'データベースを、選んだ時点の状態そのものに戻すことです。基底バックアップを読み込み、そのあと書き込み先行ログ（WAL）をその時刻まで再生します。ログは継続的に保管されるので、失うのは直近数分の書き込みだけで、丸1日分ではありません。',
      inGame:
        'ポイントインタイムリカバリのリサーチで、データベースのカードにバックアップの設定が付きます。なし、毎晩、PITRです。毎晩のスナップショットは最大でカレンダー1日分の書き込みを失い、データベースの支出が5%増えます。PITRはカレンダーで約2分しか失わず、支出は15%増えます。IPOチェックリストのDR訓練はこのRPOを読み、5分未満のときだけ通ります。別のリージョンのレプリカがすでにデータを持っている場合は別です。',
      links: [
        { label: 'PostgreSQLドキュメント: 継続的アーカイブとPITR' },
        { label: 'AWS: RDSインスタンスを指定時刻に復元する' },
      ],
      design: [],
    },
    'power-of-two-choices': {
      term: 'Power of two choices',
      definition:
        'ロードバランシングの手法です。2台のサーバーを無作為に選び、負荷の低いほうへリクエストを送ります。Mitzenmacherは、無作為な選択が2つあれば負荷の分散が1つのときより指数的によくなることを示しました。バランサーは全サーバーの負荷を正確に共有した見方を持つ必要がありません。NGINXではrandom two least_connとして使えます。',
      inGame:
        'ロードバランシングアルゴリズムのリサーチで、ロードバランサーが2択を使えます。グローバルな状態を持たないので、ロードバランサー自体が1.5倍のトラフィックをさばけます。代償は、各サーバーの負荷にかかわらずトラフィックの10%が均等に分かれることです。最小接続数は現在の容量どおりに完全に分けますが、容量のボーナスはありません。',
      links: [
        { label: 'Mitzenmacher (2001): 無作為な負荷分散における2択の力' },
        { label: 'NGINXドキュメント: upstreamモジュール（random）' },
      ],
      design: [{ label: 'ロードバランサーのポリシー' }],
    },
    'pre-fork-worker-model': {
      term: 'プリフォークワーカーモデル',
      definition:
        'マスタープロセスがあらかじめ決まった数のワーカープロセスを起動しておき、各ワーカーが同時に1つのリクエストを処理するサーバー設計です。Apache prefork、PHP-FPM、Gunicornがこの方式です。リクエストの分離はよいのですが、ワーカーごとにメモリがかかり、待っているリクエストはワーカーを占有します。',
      inGame:
        'PHP-FPMとPythonのGunicornは、アプリサーバーのカードで1から400まで設定できるワーカーのプールを動かします。PHP-FPMは5で始まります。各ワーカーは1つのリクエストを受けるので、遅いデータベース呼び出しでプールが埋まります。ワーカーごとにRAMも食う（Gunicornでは120 MB）ので、大きなプールはスワップしえます。PHP-FPMの静的モードはプール全体を常駐させます。動的モードとオンデマンドモードはメモリを節約しますが、リクエストの2%または10%がforkのために20 msまたは50 ms待ちます。',
      links: [
        { label: 'Gunicornドキュメント: 設計' },
        { label: 'Apache HTTP Server: prefork MPM' },
        { label: 'PHPマニュアル: FPMの設定' },
      ],
      design: [],
    },
    'process-per-request': {
      term: 'リクエストごとのプロセス',
      definition:
        '処理中の各リクエストが、終わるまでワーカープロセスを1つ丸ごと占有するサーバーモデルです。Apache preforkのmod_php、PHP-FPM、Gunicornのsyncワーカーがこの形です。リクエストの分離はよいのですが、待っているリクエストもプロセスとそのメモリを握るので、同時に動けるリクエスト数はプールの大きさとRAMで頭打ちになります。',
      inGame:
        '最初のランタイムであるApache mod_phpは、処理中のリクエストごとにプロセスを動かし、最大150までです。プロセスはPHPを内蔵するので1つ60 MBかかり、RAMは早く尽きます。PHP-FPMとGunicornは自分で大きさを決める固定プールを動かし、PHP-FPMはワーカー5つで始まります。リクエストはデータベースを待つ間ワーカーを握り、マシンに対して大きすぎるプールはカーネルに殺されるまでスワップします。プロセスごとに自分のデータベース接続も持つので、大きなプールはPostgresの100接続の上限に当たります。',
      links: [
        { label: 'Apache HTTP Server: MPM prefork' },
        { label: 'PHPマニュアル: FastCGIプロセスマネージャー（FPM）' },
        { label: 'Gunicornドキュメント: 設計' },
      ],
      design: [{ label: '並行モデル' }],
    },
    quantization: {
      term: '量子化',
      definition:
        'モデルの重みをより低い精度で保存することです。16ビットの浮動小数の代わりに8ビットや4ビットの整数にするなどで、メモリを節約して計算を速くし、その代わり答えの質が少し落ちます。',
      inGame:
        '量子化のリサーチで、GPUノードにFP16、INT8、INT4が加わります。INT8は2倍、INT4は3倍のトークンをさばけますが、答え1つの価値は5%または15%下がります。GPUがボトルネックで、答えが少しぐらい悪くてもよいときに効きます。',
      links: [{ label: 'Hugging Faceドキュメント: 量子化' }],
      design: [{ label: 'GPUノードと精度' }],
    },
    quorum: {
      term: 'クォーラム',
      definition:
        '読み取りや書き込みが完了とみなされるまでに応答が必要なレプリカ数。N個のレプリカ、読み取りクォーラムR、書き込みクォーラムWがあるとき、R + W > Nなら、どの読み取りも最新の書き込みを持つレプリカを少なくとも1つは問い合わせることになる。ただしこれは線形化可能ではない。並行する書き込み、失敗した書き込み、緩いクォーラムは、依然として古い値を返しうる。',
      inGame:
        'ワイドカラムストアは各キーをN個(1〜5)のレプリカに保持し、読み取りが問い合わせるレプリカ数Rと、書き込みが待つレプリカ数Wを設定する。R + W > Nなら、読み取りが最新の書き込みを取りこぼすことはない。弱いクォーラムはレプリカ操作が少なく、より早く応答が返るが、古い値を返す読み取りが出る。全レプリカを要求するクォーラムは、レプリカが1つ失われただけで失敗する。強いクォーラムでも、チェックアウトの2%は古いデータで、1%は二重になる。',
      links: [
        {
          label: 'Apache Cassandraドキュメント: 調整可能な一貫性',
        },
        { label: 'DeCandiaら (2007): Dynamo' },
        { label: 'Wikipedia: クォーラム（分散コンピューティング）' },
      ],
      design: [{ label: 'ワイドカラムストア' }],
    },
    raft: {
      term: 'Raft',
      definition:
        'サーバー群の上で同一の複製ログを保つ合意アルゴリズム。選出されたリーダーが各エントリを追記し、過半数が保存した時点でコミットする。これにより、少数が故障してもグループは動き続け、2つの異なる値がコミットされることはない。OngaroとOusterhoutが2014年に、Paxosより理解しやすいものとして設計し、etcdやCockroachDBが採用している。',
      inGame:
        '分散SQLはSQLをRaft上で実行する。合意形成データベースのリサーチ（同期レプリケーションが必要）で解放される。各書き込みは、それがまたがるリージョンの過半数への往復を待ち、読み取りはリースホルダーに問い合わせて書き込みの4分の1のコストで済む。サイズ1で毎秒6,000トランザクションを処理する。ネットワーク分断が起きてもリーダーを1つ保つので、そのインシデントの発生率は4分の1になる。',
      links: [
        { label: 'Raft合意アルゴリズム' },
        {
          label: 'OngaroとOusterhout (2014): 理解しやすい合意アルゴリズムを求めて',
        },
        { label: 'CockroachDBドキュメント: レプリケーション層' },
      ],
      design: [{ label: '分散SQL' }],
    },
    'rate-limiting': {
      term: 'レート制限',
      definition:
        '一定期間にクライアントが送れるリクエスト数に上限を設け、超えた分を拒否する仕組み。多くの場合HTTP 429 Too Many Requestsを返す。サービスを悪用、スクレイパー、1つの騒がしいクライアントから守り、プロバイダが容量を公平に配分できるようにする。代表的なアルゴリズムはトークンバケット、リーキーバケット、固定窓とスライディング窓。',
      inGame:
        'LLM APIはクライアント側で制限をかけてくる。利用ティアごとに毎秒100プロンプトまでで、それを超えるとプロンプトは即座にスロットルされて失敗する。APIゲートウェイも同じ考え方を自分のサービスに適用する。毎秒あたりのリクエスト数の上限を選ぶと、超えたリクエストはスロットルされて失敗する。上限はノード全体で1つで、ユーザーごとやAPIキーごとのバケットではない。レート制限のリサーチを取ると、上限はステップごとに補充され、200リクエスト分を余分に保持するトークンバケットになる。収まるバーストはそのまま通る。悪質なトラフィックを止めるなら、代わりにWAFがルールでボットをブロックする。パラノイア2でボットの80%をブロックし、実ユーザーも0.5%巻き込む。',
      links: [
        {
          label: 'Cloudflareラーニングセンター: レート制限とは',
        },
        { label: 'MDN: 429 Too Many Requests' },
        { label: 'RFC 6585: 追加のHTTPステータスコード' },
      ],
      design: [{ label: 'APIゲートウェイ' }],
    },
    'read-replica': {
      term: 'リードレプリカ',
      definition:
        'プライマリの書き込みに追随し、読み取り専用のクエリに応答するデータベースの複製。これでプライマリから読み取り負荷を外せる。レプリケーションは通常非同期なので、レプリカは遅れることがあり、少し古いデータを返す。',
      inGame:
        'リードレプリカのリサーチでリードレプリカが解放される。データベースと同じように動くが、応答するのは読み取りクエリ(q-read)だけ。遅延は20 msに、毎秒の書き込み1件あたり2 msを加えたもので、読み取りの最大15%が古いデータになる。レプリケーションラグのインシデントが起きると、遅延は10倍になる。read-your-writesルーティングは、書き込みに続く読み取りをプライマリへ送る。別リージョンのレプリカは、ホームリージョンが落ちたときに失うデータ量も抑える。',
      links: [
        { label: 'AWS: Amazon RDSのリードレプリカ' },
        { label: 'PostgreSQLドキュメント: ホットスタンバイ' },
      ],
      design: [],
    },
    'read-your-writes-consistency': {
      term: 'read-your-writes整合性',
      definition:
        'セッション保証のひとつ。クライアントが書き込んだ後、そのクライアント自身の後続の読み取りは、その書き込みかそれ以降の値を見る。他のクライアントにはまだ古いデータが見えていてもよい。読み取りがプライマリより遅れたレプリカへ向かうときに問題になる。よくある対処は、書き込み直後の短い間、そのユーザーの読み取りをプライマリへ送ること。Terryらが1994年に定義した。',
      inGame:
        'リサーチしたうえでアプリサーバーのread-your-writesルーティングをオンにすると、チェックアウトの読み取りはプライマリへ行くので、古いデータを返すことはない。それ以外の古い読み取りは80%減る。オフのままだとリードレプリカはプライマリから遅れ、古い読み取りはAPI読み取りや、自分の書き込みを読むチェックアウトを失敗させる。このオプションはレプリケーションラグのインシデントの発生率も大きく下げる（重みは2ではなく0.3）。',
      links: [
        { label: 'Jepsen: read-your-writes' },
        {
          label: 'Terryら (1994): 弱い整合性の複製データにおけるセッション保証',
        },
      ],
      design: [{ label: 'リードレプリカ' }],
    },
    'red-method': {
      term: 'REDメソッド',
      definition:
        'サービスごとのRate、Errors、Duration。どれだけのリクエストを受けたか、どれだけ失敗したか、どれだけ時間がかかったかを見る。ユーザーが体感するものを測るので、アラートはこれを見張る。Tom Wilkieが、Googleの4つのゴールデンシグナルのサービス単位版として名付けた。',
      inGame:
        'ダッシュボード(D)のサービス行が、各サービスのレート、エラー、期間を出す。ダッシュボードはメトリクスのリサーチで開く。そのゴールデンシグナル行は、システム全体のトラフィックとレイテンシ、そして構造化ログがあればエラーを時系列で描くので、ユーザーがいつ苦しみ始めたかはその行で見る。',
      links: [
        { label: 'Grafana Labs: REDメソッド' },
        { label: 'Google SRE本: 分散システムの監視' },
      ],
      design: [{ label: 'ダッシュボードの行とグラフ' }],
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS（正規表現によるサービス拒否）',
      definition:
        '細工された入力により、バックトラックする正規表現エンジンが指数的、あるいは非常に長い時間を費やしてしまうサービス拒否攻撃。まずいパターンが1つあるだけで、リクエストごとにCPUコアを1つ占有できる。',
      inGame:
        '正規表現バックトラッキングのインシデントは、WAFを動かしているとシリーズBから始まりうる。新しいWAFルールが長い入力でバックトラックするので、各WAFは容量の10%しか残らず、そこを通るトラフィックは失敗するかキューに溜まる。WAFの「ルールを無効化」を押せば即座に終わる。実際のシステムでは、ルールのカナリアロールアウトが、全サーバーに届く前にこれを捕まえる。',
      links: [
        { label: 'OWASP: 正規表現によるサービス拒否（ReDoS）' },
        {
          label: 'Cloudflareブログ: 2019年7月2日の障害の詳細',
        },
        { label: 'Wikipedia' },
      ],
      design: [],
    },
    'replication-lag': {
      term: 'レプリケーションラグ',
      definition:
        'プライマリデータベースで書き込みがコミットしてから、その書き込みがレプリカに現れるまでの遅れ。非同期レプリカはプライマリのログを後追いで適用するので、ラグは書き込み量、レプリカ上の長時間クエリ、ネットワーク遅延で大きくなる。遅れたレプリカからの読み取りは古いデータを返す。',
      inGame:
        'リードレプリカは20 msに、毎秒の書き込み1件あたり2 msを加えた分だけ遅れ、古いデータになる読み取りの割合はその遅延の秒数に等しく、最大15%までになる。レプリケーションラグのインシデントは遅延を10倍にし、古い読み取りは最大50%になる。古い読み取りはAPI読み取りとチェックアウトを失敗させるが、ページビューは受け入れる。read-your-writesルーティングは影響を受ける読み取りをプライマリへ送る。',
      links: [
        { label: 'PostgreSQLドキュメント: ホットスタンバイ' },
        { label: 'Amazon RDSドキュメント: リードレプリカの利用' },
      ],
      design: [{ label: 'リードレプリカ' }],
    },
    'retry-with-backoff-and-jitter': {
      term: 'バックオフとジッターを伴うリトライ',
      definition:
        '失敗した呼び出しを、試行ごとに伸びる待ち時間（指数バックオフ）とランダムなばらつき（ジッター）を入れて再試行すること。一緒に失敗したクライアントが一緒に再試行しないようにする。リトライ予算や上限は、リトライが追加してよい呼び出し数を制限するので、すでに苦しんでいるサービスにリトライが負荷を掛け増しにすることはない。',
      inGame:
        'タイムアウトとリトライのリサーチがあれば、各リンクのタイムアウトを1秒、5秒、30秒から選び、リトライをオンにできる。素朴なリトライは一斉に、最大3回まで発火するので、割合fで失敗する呼び出し先は1呼び出しあたり1 + f + f² + f³回の呼び出しを受ける。バックオフとジッターはリトライごとに約200 ms待ち、追加呼び出しを最大10%までに抑えるので、リトライストームは小さく収まる。リサーチがない場合、各リンクは30秒待つだけで、リトライはしない。',
      links: [
        {
          label: "AWS Builders' Library: タイムアウト、リトライ、ジッター付きバックオフ",
        },
        { label: 'AWSアーキテクチャブログ: 指数バックオフとジッター' },
        { label: 'Google SRE本: カスケード障害への対処' },
      ],
      design: [{ label: 'リトライ' }],
    },
    'rpo-and-rto': {
      term: 'RPOとRTO',
      definition:
        '目標復旧時点（RPO）は、災害時に失ってよいデータの新しさを、障害発生時点から遡った時間で測ったもの。目標復旧時間（RTO）は、サービスが再び動き出すまでに停止していられる最長の時間。この2つで、システムに必要なバックアップ、レプリケーション、待機系の容量が決まる。',
      inGame:
        'データベースのバックアップがRPOを決める。バックアップなしならすべて失い、毎晩ならカレンダー時間で最大1,440分を失い、PITR（ポイントインタイムリカバリのリサーチ）なら2分で済む。別リージョンのリードレプリカはそれをそのレプリカのラグまで下げ、分散したワイドカラムストアや分散SQLは何も失わない。IPOチェックリストのDR訓練はホームリージョンを落とす。合格するのは、カレンダー時間で60分以内にエラーが1%未満に下がり（RTO）、RPOが5分未満のときだけ。',
      links: [
        {
          label: 'AWSホワイトペーパー: ワークロードの災害復旧（RPOとRTO）',
        },
        {
          label: 'PostgreSQLドキュメント: 継続的アーカイブとポイントインタイムリカバリ',
        },
      ],
      design: [{ label: 'マルチリージョンのデータ' }, { label: 'IPOチェックリストとDR訓練' }],
    },
    'rule-of-40': {
      term: '40の法則',
      definition:
        'SaaS企業向けの経験則。年間売上成長率と利益率を、どちらもパーセントで足した値が少なくとも40であるべき、というもの。急成長して赤字の企業と、成長は遅いが黒字の企業を1つの数字で比べられる。投資家は40を超える企業に、より高い評価倍率を払うことが多い。',
      inGame:
        '評価額は年間売上に、40の法則のスコアから決まる倍率を掛けたもの。4 + 0.15 × スコアで、2〜30に収め、負のスコアは0として数える。スコアは直近のカレンダー1週間のユーザー成長を年率換算したものに利益率を足した値で、利益率は（売上 − 支出）/ 売上。40以上はIPOチェックリストの項目なので、上場前に支出を削るか、もっと速く成長すること。',
      links: [{ label: 'Wikipedia: 40の法則' }, { label: 'McKinsey: SaaSと40の法則' }],
      design: [{ label: '評価額' }],
    },
    runbook: {
      term: 'ランブック',
      definition:
        '特定のアラートが鳴ったときに何をすべきかを書いた、短くて試された文書。どの確認を走らせ、どのコマンドを実行し、いつエスカレーションするか。システムが自分で実行できるランブックは自動化であり、人が午前3時に読むランブックも書く価値はある。',
      inGame:
        'ランブックのリサーチ（シリーズA、オンコールの後）と、エンジニアを1人擁するSREチームで、「ランブックを書く」(10 DH)が解放される。対象はチームがすでに手作業で終わらせたインシデント種別1つ。書いてしまえば、その種別は最初のステップで自動的に解決する。ポストモーテムはそれを自動として記録する。Kubernetesクラスターがポッドを再スケジュールする場合や、スタンバイがフェイルオーバーする場合と同じ扱いで、ランブックの実績はその記録を読む。',
      links: [
        { label: 'Google SRE本: ポストモーテム文化' },
        { label: 'PagerDuty: ランブックとは' },
      ],
      design: [{ label: 'ランブック' }],
    },
    service: {
      term: 'サービス',
      definition:
        '独自のデプロイパイプラインを持ち、1つのチームが所有するコードベース。モノリスをサービスに分割すると、各チームが自分たちでリリースし、スケールできる。代わりにサービス間のネットワークホップと、サービスをまたいで伝わる障害を抱える。',
      inGame:
        '会社は最初、1つのサービス、つまりモノリスで始まり、他のどのサービスも名指さない機能はすべてそこに残る。サービスの境界のリサーチ（シリーズB）は、稼働中の機能を名前と所有チームを持つ新しいサービスへ切り出し、移動したコード分のDHの0.3倍を払う。所有者はそのサービスのバックログを積み、壊れたら呼び出され、不正なデプロイはそれを出したサービスだけを壊す。1つのデータベースに2つのサービスが乗ると、調整のペナルティが半分増える。つまり、サービスが自分のデータベースノードを持たない限り、kに1.5が掛かる。',
      links: [
        { label: 'Martin Fowler: MonolithFirst' },
        { label: 'Martin Fowler: マイクロサービス' },
        { label: 'microservices.io: モノリシックアーキテクチャ' },
      ],
      design: [{ label: 'サービス' }],
    },
    sharding: {
      term: 'シャーディング',
      definition:
        '1つのデータセットを、ユーザーIDのハッシュなどのキーで複数のデータベース（シャード）に分けること。各シャードはデータの一部だけを保存し、提供する。書き込みとストレージを1台のマシンの先へ広げられるが、シャードをまたぐクエリは全シャードに問い合わせる必要があり、1つのホットキーが、他のシャードが遊んでいる間に自分のシャードを圧迫しうる。',
      inGame:
        'シャーディングのリサーチは、データベースをキーで1、2、4、8個のシャードに分割し、リーダーレスレプリケーションも解放する。各シャードはマシン1台分増えるので、その分の課金があり、書き込みはシャードに分かれる。2シャードなら2倍の書き込みに応える。読み取りはキーを持つシャード1つにだけ問い合わせる。だからこそ、プライマリから読み取りを外すのはリードレプリカの役目になる。シャードをまたぐトランザクションはレイテンシが3倍になる。シャードキー（ハッシュ、範囲、テナント、リージョン）はカードで選ぶ。シャード数の変更は再シャーディングで、データベースが保持する1 GBごとにDHとカレンダー時間がかかる。ホットキーのインシデントはキャッシュかワイドカラムストアに当たり、読み取りの30%が同じキーを要求するので、ノードの容量はおよそ1 / (0.3 × サイズ段数 + 0.7)まで落ちる。ハイブリッドファンアウトがあれば、そうしたキーを分割できる。',
      links: [
        {
          label: 'Wikipedia: シャード（データベースアーキテクチャ）',
        },
        { label: 'MongoDBドキュメント: シャーディング' },
        { label: 'AWS: データベースシャーディングとは' },
      ],
      design: [{ label: 'パーティショニング' }],
    },
    'shared-nothing': {
      term: 'シェアードナッシング',
      definition:
        'ノード、あるいはリクエストが、メモリもディスクも共有せず、ネットワーク越しにだけ協調するアーキテクチャ。それぞれが独立して故障し、再起動し、スケールできる。Michael Stonebrakerが1986年にデータベース向けに主張した。PHPはリクエスト単位でこの考え方を適用する。各リクエストはきれいなプロセス状態から始まり、終わるとすべてを解放する。',
      inGame:
        'Apache mod_phpとPHP-FPMはシェアードナッシングで、各リクエストの後にメモリをすべて解放するので、メモリリークのインシデントは彼らには当たらない。ほかのランタイムはすべてプロセスをリクエストをまたいで保持するので、リクエストごとのセットアップは避けられるが、リークしうる。代償は速度で、PHPはGoのCPU速度の0.15倍、OPcacheを入れても0.375倍しか出ない。',
      links: [
        { label: 'Stonebraker (1986): シェアードナッシングの擁護' },
        {
          label: 'Wikipedia: シェアードナッシングアーキテクチャ',
        },
      ],
      design: [{ label: 'ランタイムの挙動' }],
    },
    'slo-sla-sli': {
      term: 'SLO・SLA・SLI',
      definition:
        'SLI（サービスレベル指標）は、成功したリクエストの割合のように、サービスの振る舞いを測ったもの。SLO（サービスレベル目標）は、30日間で99.9%のように、ある期間におけるSLIの目標。SLA（サービスレベル契約）は顧客との契約で、約束した水準を割ったときのサービス・クレジットなどの結果を定める。通常は社内のSLOより緩い。',
      inGame:
        'SLIは可用性で、直近のカレンダー1週間のユーザーリクエストのうち、ボットとWAFのブロックを除いて応答した割合を指す。SLOは時代ごとに決まり、ガレージの99%から上場の99.99%まで。シリーズA以降は、それが許す失敗がエラーバジェットになる。SLOダッシュボードがそのバジェットをHUDに載せ、IPOチェックリストは99.95%を要求する。B2B SaaSはシリーズBからSLAを結び、それは時代の目標より1段上。1週間がそれを下回っている間、エンタープライズ営業が顧客にクレジットを返す。サブスクリプション売上の10%相当。',
      links: [
        { label: 'Google SRE本: サービスレベル目標' },
        { label: 'Google SREワークブック: SLOの実装' },
        { label: 'Google Cloudブログ: SLI、SLA、SLO' },
      ],
      design: [{ label: 'SLOとエラーバジェット' }],
    },
    'soc-2': {
      term: 'SOC 2',
      definition:
        'AICPAの監査フレームワーク。独立した監査人が、サービス組織のセキュリティ、可用性、処理の完全性、機密性、プライバシーに関する統制について報告する。エンタープライズ顧客はSOC 2レポートを求めることが多い。',
      inGame:
        'SOC 2はプレIPOのIPOチェックリストの項目。SOC 2プログラムのリサーチが必要で、それには全通信のTLS化、保存データの暗号化、依存関係スキャンが要る。さらにエンジニアを擁するセキュリティチームが要る。そのチームがないと、監査指摘のインシデントが合格したDR訓練を振り出しに戻すことがある。',
      links: [{ label: 'AICPA: システムと組織の統制（SOC）' }, { label: 'Wikipedia' }],
      design: [],
    },
    'spot-instance': {
      term: 'スポットインスタンス',
      definition:
        '大幅な割引で売られる予備のクラウド容量。オンデマンド価格から最大90%引きで、プロバイダが必要になったらいつでも取り戻せる。AWSは2分前の中断通知を出す。スポットはステートレスで障害に強い処理、たとえばバッチジョブや、余剰容量のあるロードバランサーの後ろのサーバーに向き、単一のデータベースには向かない。',
      inGame:
        'スポット料金ではノードがオンデマンド価格の0.3倍で動くが、プロバイダが回収できる。スポット回収のインシデントはシミュレーション時間で10秒前から警告し、その後ノードを落とす。警告中にノードをオンデマンドへ切り替えれば取り消せる。リザーブドのノードは0.6倍で、カレンダー時間で1週間持つ。GPU不足のインシデントは別で、プロバイダがGPUノードを回収する。H100から先に取られ、LLM APIをフォールバックにすると発生率は4分の1になる。',
      links: [
        { label: 'AWS EC2ドキュメント: スポットインスタンス' },
        {
          label: 'AWS EC2ドキュメント: スポットインスタンスの中断通知',
        },
        { label: 'Google Cloudドキュメント: スポットVM' },
      ],
      design: [{ label: '料金モデル' }],
    },
    'strangler-pattern': {
      term: 'ストラングラーパターン',
      definition:
        'レガシーシステムを少しずつ置き換えること。前にルーティング層を置き、トラフィックや機能の割合を新しいシステムへ段階的に移し、誰も使わなくなったら古い方を引退させる。Martin Fowlerが、木に絡みついて最終的に置き換えるつる植物、ストラングラーフィグから名付けた。大がかりで危険な一括書き換えを避けられる。',
      inGame:
        '会社でサービスのスタックを変えると、両方のバージョンを動かしつつアプリサーバーを4段階で移すマイグレーションが始まる。5%、25%、50%、そして100%のトラフィック。各段階はマイグレーションのDHのうちのその分(10%、20%、30%、40%)を払う。新しいスタック上のリクエストは、マイグレーションの不具合修正を出荷するまで3%の確率で失敗する。マイグレーション中のサービスの機能は半分の速さで進む。',
      links: [
        { label: 'Martin Fowler: ストラングラーフィグ' },
        {
          label: 'Azure Architecture Center: ストラングラーフィグパターン',
        },
        {
          label: 'AWS Prescriptive Guidance: ストラングラーフィグパターン',
        },
      ],
      design: [{ label: 'マイグレーション' }],
    },
    'synchronous-replication': {
      term: '同期レプリケーション',
      definition:
        '少なくとも1つのレプリカが保存した後にだけ、プライマリが書き込みを確定するレプリケーション。プライマリが故障しても、確認済みの書き込みは失われない。代わりに各書き込みはレプリカへの往復を待つ。',
      inGame:
        '同期レプリケーションのリサーチは、各リードレプリカにスイッチを追加する。オンにすると、各書き込みがそのレプリカを待つので、レプリカが遅れることはなく、代わりに各書き込みが往復分を払う。このリサーチは合意形成データベースも解放し、分散SQLは書き込みごとにレプリカの過半数を待つので、リージョンをまたぐ書き込みは往復を払う。スタンバイを持つデータベースは、ゾーンが落ちても数秒でフェイルオーバーする。',
      links: [
        {
          label:
            'PostgreSQLドキュメント: ログシッピングのスタンバイサーバー（同期レプリケーション）',
        },
        { label: 'PostgreSQLドキュメント: レプリケーション設定' },
        {
          label: 'Wikipedia: レプリケーション（コンピューティング）',
        },
      ],
      design: [],
    },
    'tail-at-scale': {
      term: 'The Tail at Scale',
      definition:
        '1つのリクエストが多数のサーバーにファンアウトしたり、多数の応答を待ったりすると、最も遅い応答がそのレイテンシを決める。そのため、各サーバーではまれな遅延が、リクエスト全体ではよく起きるようになる。100台のサーバーがそれぞれ1%の確率で遅いと、63%のリクエストが少なくとも1つの遅い応答に当たる。DeanとBarrosoが2013年に、ヘッジリクエストなどの対策とともに記述した。',
      inGame:
        'リクエストは経路上の各ノードのテールイベントを集める。独立した2つの確率aとbは1 − (1 − a)(1 − b)に合成されるので、時々詰まるノードが長く連なると、p99はどのノード単体よりも悪くなる。ワイドカラムストアの読み取りは、N個のレプリカのうちR番目に速い応答を待ち、R = Nでは最も遅いものを待つ。パーセンタイルのリサーチを取ると、これが現れるp99が見える。',
      links: [
        { label: 'DeanとBarroso (2013): The Tail at Scale' },
        { label: 'The Tail at Scale (PDF)' },
        {
          label: 'Communications of the ACM: The Tail at Scale',
        },
      ],
      design: [{ label: 'パーセンタイル' }],
    },
    'tech-debt': {
      term: '技術的負債',
      definition:
        'コードの中の近道と古くなった設計で、その後の変更をより遅く、より危険にするもの。ローンの利子のように、チームがリファクタリングで返済するまで効き続ける。Ward Cunninghamが1992年にこの比喩を生んだ。負債の一部は早く出荷するための意図的なトレードオフで、そのコストは以後のあらゆる変更に上乗せされる手間として現れる。',
      inGame:
        '各サービスは技術的負債の割合を持つ。機能を出荷するたびに、速度優先なら6ポイント、バランスなら3ポイント、品質優先なら1ポイント増える。フレームワークなしならさらに1、インシデント中に出荷したタスクは2。急いだ項目は、プールが支払った項目コスト1つ分ごとに2ポイント増える。負債は開発速度を最大半分まで落とし、不正なデプロイの確率を最大3倍にし、あらゆるインシデントの発生率を上げる。リファクタリングのタスク(10 DH)で20ポイント減り、品質優先ポリシーは自然にいくらか返済する。',
      links: [{ label: 'Martin Fowler: 技術的負債' }, { label: 'Wikipedia: 技術的負債' }],
      design: [{ label: '技術的負債' }],
    },
    'thread-pool': {
      term: 'スレッドプール',
      definition:
        '共有のキューから仕事を取り出す、固定数のスレッド。タスクごとにスレッドを作るコストを払わずに済む。リクエストごとにスレッドを立てるサーバーでは、プールのサイズが同時に実行できるリクエスト数を決め、I/Oを待つリクエストもスレッドを占有し続ける。',
      inGame:
        'JavaのTomcatは1つのJVMで200スレッドを動かし、RubyのPumaはプロセスあたり5スレッドを動かす。待っているリクエストはそれぞれスレッドを占有するので、遅いデータベース呼び出しがプールを埋めうる。Node.jsでは、libuvスレッドプールのリサーチがパスワードハッシュをイベントループの外へ移すので、ログインが他のリクエストを止めなくなる。RustのTokioは非同期タスクをワーカースレッドのプールで動かすので、CPUを食うタスクはそのうち1つを塞ぐだけだ。',
      links: [
        { label: 'Wikipedia' },
        {
          label: 'Node.js: イベントループ（とワーカープール）をブロックしない',
        },
        { label: 'Apache Tomcat: Executor（スレッドプール）' },
      ],
      design: [],
    },
    'thundering-herd': {
      term: 'サンダリングハード',
      definition:
        '多くのクライアントやプロセスが同じ瞬間に目を覚まして動き出すこと。再起動の後、キャッシュの期限切れの後、共有タイマーの発火時などに起き、負荷が合わさって共有リソースを潰す。対策は群れを散らすこと。ジッター、リクエストの合流、段階的な再起動。',
      inGame:
        'キャッシュスタンピードのインシデントはキャッシュを空で再起動し、ミスはすべて一斉にデータベースへ行く。データベースが90%以上で動いている間、再充填はタイムアウトし、キャッシュは冷えたままになる。スタンピード対策を入れると、冷えたキャッシュは追加ミスの25%だけを送り、残りは1回の取得を待つ。キャッシュウォーミングはキャッシュを80%温まった状態に戻す。素朴なリトライも群れで、全呼び出し元が同時に再試行する。バックオフとジッターがそれを散らす。',
      links: [
        { label: 'Wikipedia: サンダリングハード問題' },
        { label: 'AWSアーキテクチャブログ: 指数バックオフとジッター' },
      ],
      design: [{ label: 'リアルタイムハブの再接続' }],
    },
    'tiered-caching': {
      term: '階層キャッシュ',
      definition:
        'エッジ拠点がオリジンの前に、より少ない数のリージョナルまたは上位層のキャッシュへ問い合わせるCDN構成。エッジ同士が上位層の中身を共有するのでヒット率が上がり、オリジンに届くリクエストが減る。',
      inGame:
        '階層キャッシュのリサーチ（コンテンツ配信の後）を取ると、コンテンツ配信のエッジはオリジンの前にリージョン層へ問い合わせる。これで、既定のTTLでCDNが応答するメディアリクエストの割合が75%から92%に上がる。CDNが応答した動画はアプリサーバーを動かさず、より安いエッジのエグレス料金で課金される。',
      links: [
        { label: 'Cloudflareドキュメント: 階層キャッシュ' },
        { label: 'AWS: CloudFront Origin Shield' },
      ],
      design: [],
    },
    timeout: {
      term: 'タイムアウト',
      definition:
        '呼び出し元が応答を待ってから諦めるまでの最長時間。タイムアウトは呼び出し元のスレッドや接続を解放するので、遅い依存先がいつまでも掴んだままにはできない。ただし短すぎるタイムアウトは、成功したはずの呼び出しを失敗させる。',
      inGame:
        'リンクは応答を30秒待つ。タイムアウトとリトライのリサーチを取ると、各リンクのタイムアウトを1秒、5秒、30秒から設定できる。呼び出し元が枠を保持するのはタイムアウトまでなので、短いタイムアウトは遅いデータベースがアプリサーバーの枠を埋め尽くすのを防ぎ、超えた呼び出しはタイムアウトとして失敗する。タイムアウトしてリトライされた課金は、冪等キーを持つまで二重に課金されうる。',
      links: [
        {
          label: "AWS Builders' Library: タイムアウト、リトライ、ジッター付きバックオフ",
        },
        { label: 'Google SRE本: カスケード障害への対処' },
      ],
      design: [],
    },
    'tls-certificate': {
      term: 'TLS証明書',
      definition:
        "ドメイン名と公開鍵を結びつける署名済みのファイルで、認証局が発行する。ブラウザはHTTPS接続を開く前にこれを検証し、期限が切れていればそのサイトを拒否する。証明書の寿命は短いので、チームはACMEやLet's Encryptなどで自動更新する。",
      inGame:
        '証明書の自動化のリサーチで「シークレットと証明書」が解放される。TLSを終端する各ノード（ロードバランサー、CDN、WAF、APIゲートウェイ、リアルタイムハブ、エッジ関数）は自前の証明書を持ち、有効期間はカレンダー時間で90日、シリーズC以降は45日。マネージャーが動いている間は、最初のステップで各証明書を発行し、寿命の3分の2で更新する。動いているマネージャーがないと、証明書は1つずつ切れていく。期限切れの証明書を持つノードを通るリクエストはすべて停止として失敗し、証明書の期限切れのインシデントが始まる。マネージャーが再び動くか、プレイヤーが「更新」を押すまで続く。',
      links: [
        {
          label: 'Cloudflareラーニングセンター: SSL証明書とは',
        },
        {
          label: "Let's Encrypt: 証明書の有効期間を45日に短縮",
        },
        { label: "Let's Encrypt: FAQ" },
      ],
      design: [],
    },
    'token-bucket': {
      term: 'トークンバケット',
      definition:
        'レート制限のアルゴリズム。バケットは最大B個のトークンを保持し、固定レートrで補充される。各リクエストはトークンを1つ取り、空のバケットに当たったリクエストは待つか拒否される。長期的な平均をrに保ちながら、最大Bまでの短いバーストを許す。',
      inGame:
        'バースト可能なノードはCPUクレジットのトークンバケットで動く。vCPUの20%未満しか使っていない間にクレジットを貯め、vCPUあたり最大100コア秒まで蓄え、その基準を超えて動くときに使う。バケットが空になるとCPUは20%まで落ちるので、一日中全開のバースト可能マシンは詰まる。その代わり、価格は汎用マシンの0.4倍。APIゲートウェイのレート制限のリサーチは同じバケットを与える。上限の上に200リクエストのバースト。',
      links: [
        { label: 'Wikipedia: トークンバケット' },
        {
          label: 'AWS EC2ドキュメント: バースト可能パフォーマンスインスタンスの主要概念',
        },
      ],
      design: [{ label: 'APIゲートウェイ' }],
    },
    'transactional-outbox': {
      term: 'トランザクショナルアウトボックス',
      definition:
        'データベースの更新とイベントの発行を、どちらも失わずに行う方法。サービスは変更とアウトボックスの行を同じデータベーストランザクションで書き込み、別のリレーがアウトボックスを読んで各イベントをメッセージブローカーへ少なくとも1回発行する。データベースのコミットが成功して発行が失敗する、あるいはその逆という二重書き込みの問題を避けられる。',
      inGame:
        'シリーズB以降、アプリの二重書き込みはときどき発行を取りこぼすので、検索エンジンの答えの0.5%が古くなる。トランザクショナルアウトボックスのリサーチはその割合をゼロにする。データベースのログから変更を読むCDCコネクターも同じだ。どちらもキューは変えない。キューに繋いだアプリサーバーは遅いリクエストの非同期部分をワーカーに渡し、ユーザーはキューに入るまでしか待たない。',
      links: [
        { label: 'microservices.io: トランザクショナルアウトボックス' },
        {
          label: 'AWS Prescriptive Guidance: トランザクショナルアウトボックスパターン',
        },
        { label: 'Debeziumドキュメント: アウトボックスイベントルーター' },
      ],
      design: [{ label: 'コピーの同期を保つ' }],
    },
    'use-method': {
      term: 'USEメソッド',
      definition:
        '各リソースの使用率、飽和、エラー。CPU、メモリ、コネクションプールなど。症状ではなく原因を測る。100%で仕事が待っているリソースが、ボトルネックの候補だ。Brendan Greggがパフォーマンス分析のチェックリストとしてまとめた。',
      inGame:
        'ダッシュボードの飽和行が、各ノードの使用率を棒ゲージ、状態タイムライン、表で見せるので、どのノードが先に埋まったか分かる。継続的プロファイリングと合わせたリソース行が、制限しているリソースを名指す。ボードでは、各ノードカードの負荷バーが同じ使用率をライブで示す。',
      links: [{ label: 'Brendan Gregg: USEメソッド' }],
      design: [{ label: 'ダッシュボードの行とグラフ' }],
    },
    utilization: {
      term: '使用率',
      definition:
        'ある期間にリソースの容量のうち使われた割合。投入された仕事を容量で割ったもの。使用率が100%に近づくほど待ち時間は急に伸びる。単純なM/M/1の待ち行列では待ち時間はρ / (1 − ρ)に比例するので、稼働率が50%から90%に上がると待ち時間は9倍になる。',
      inGame:
        '各ノードは使用率を示す。投入された仕事を、CPU、スロット、メモリ、接続、ネットワークのうち最も厳しい制限の容量で割ったもの。待ち時間はρ / (1 − ρ)で伸びる。ノードは70%で警告し、90%で危険を示し、100%を超えた分は捨てる。ボトルネック探索は60%を超えるノードだけを重く見て、オートスケーラーは40%、60%、80%を目標にする。ダッシュボードの飽和行は各ノードをゲージと24時間のタイムラインで示し、同じ70%と90%の線を引く。',
      links: [{ label: 'Brendan Gregg: USEメソッド' }, { label: 'Wikipedia: M/M/1待ち行列' }],
      design: [{ label: '容量、使用率、待ち行列' }],
    },
    'vertical-and-horizontal-scaling': {
      term: '垂直スケーリングと水平スケーリング',
      definition:
        '垂直スケーリング（スケールアップ）は、より多くのCPUとメモリを持つ大きなマシンへワークロードを移すこと。水平スケーリング（スケールアウト）は、マシンを増やして仕事を分けること。スケールアップは単純だが上限があり、たいてい再起動を伴う。スケールアウトはロードバランサーとステートレスなサーバーを必要とするが、固い上限がなく、1台失っても生き残る。',
      inGame:
        'サイズ指定したノードのリサイズは、nano(0.5 vCPU)からmetal(96 vCPU)まで1段ずつ動かす。各段でvCPUとRAMが倍になるが、ノードは再起動し、コールドで戻る。コアを増やしても使えないソフトウェアもある。Node.jsは1コアで1つのイベントループを回し、Redisは1スレッドで応答する。スケールアウトするには、DNSやロードバランサーの後ろにアプリサーバーを増やす。コピー1つあたりの設置コストは25%増しになる。オートスケーラーにコピーを増やさせる手もあり、VMなら180秒、Kubernetesクラスターなら30秒かかる。インスタンスファミリーも効く。ARMインスタンスのリサーチは、汎用と同じvCPUとRAMで0.8倍の価格、CPU速度0.95倍のファミリーを追加する。',
      links: [
        {
          label: 'Azure Architecture Center: スケールアウトを前提に設計する',
        },
        {
          label: 'Wikipedia: スケーラビリティ（水平と垂直）',
        },
      ],
      design: [{ label: '垂直と水平' }],
    },
    'waf-web-application-firewall': {
      term: 'WAF（Webアプリケーションファイアウォール）',
      definition:
        'Webアプリケーションの手前でHTTPリクエストを検査し、攻撃やボットのルールに一致するものをブロックするフィルター。ルールセットを厳しくするほど攻撃を多く捕まえるが、実ユーザーも誤って多くブロックする（誤検知）。',
      inGame:
        'WebアプリケーションファイアウォールのリサーチでWAFコンポーネントが解放される。パラノイアレベルが、ブロックするボットの割合と、誤ってブロックする実ユーザーの割合を決める。レベル1はボットの60%とユーザーの0.1%、レベル2（既定）は80%と0.5%、レベル3は92%と2%、レベル4は98%と6%。高いレベルほどリクエストあたりのCPUコストが上がり、レベル1の最大4倍になる。ボット管理のリサーチは疑わしいクライアントをブロックせずにチャレンジを出し、誤検知を半分にしつつブロック率を保つ。Under attackモードでは、WAFがボットの99%とユーザーの1%をブロックし、40 msを追加する。',
      links: [
        { label: 'Cloudflareラーニングセンター: WAFとは' },
        { label: 'OWASP CRS: パラノイアレベル' },
        { label: 'OWASP: Webアプリケーションファイアウォール' },
      ],
      design: [],
    },
    'write-through-cache': {
      term: 'ライトスルーキャッシュ',
      definition:
        'すべての書き込みをキャッシュとデータベースの両方へ同時に送るキャッシュ方針。そのため、そこを通して書かれたキーについては、キャッシュは常に最新の値を持つ。読み取りはヒットしやすく、それらのキーについて古い値を返さない。ただし書き込みは遅くなり、読まれないかもしれないデータでキャッシュが埋まる。一般的な代替はキャッシュアサイドとライトビハインド。',
      inGame:
        'ライトスルーは、キャッシュ戦略のリサーチ後に選べるキャッシュの戦略の1つ。書き込みはキャッシュとデータベースの両方へ同時に行くので、そこを通して書いたキーについてキャッシュが古いヒットを返すことはなく、書き込みごとに0.5 ms余計にかかる。キャッシュアサイドでは書き込み時にキーを無効化するので、ヒット率は書き込み割合の2倍ぶん、最大で半分まで下がる。無効化の合間には古いヒットもあり、TTLが10秒から1時間に伸びるにつれて、書き込み割合1単位あたり0.5%から10%になる。',
      links: [
        { label: 'Amazon ElastiCacheドキュメント: キャッシュ戦略' },
        {
          label: 'Wikipedia: キャッシュの書き込みポリシー',
        },
      ],
      design: [{ label: 'キャッシュ戦略' }],
    },
  },
  eras: [
    {
      name: 'ガレージ',
      question: '箱1つでどこまで行けるか。',
      arrivals: 'ページビューとAPI読み取り。',
    },
    {
      name: 'プレシード',
      question: 'データベースがボトルネックになると何が起きるか。',
      arrivals: '書き込みがデータベースを奪い合う。採用が始まる。インシデントが始まる。',
    },
    {
      name: 'シード',
      question: 'アプリサーバー1種類ですべての種別をさばけなくなると何が起きるか。',
      arrivals: '検索、アップロード、ボット。キュー、ワーカー、CDN、WAF。',
    },
    {
      name: 'シリーズA',
      question: 'ゾーンがまるごと落ちると何が起きるか。',
      arrivals:
        '動画、チャット、チェックアウト、入札。ゾーン、オートスケーリング、エラーバジェット。',
    },
    {
      name: 'シリーズB',
      question:
        'アナリティクスとAIが、チェックアウト向けに作られたデータベースを共有すると何が起きるか。',
      arrivals:
        'エクスポート、レポート、AIプロンプト。ウェアハウス、GPU、リトライ、サーキットブレーカー。',
    },
    {
      name: 'シリーズC',
      question: 'ユーザーが4つの大陸に住んでいると何が起きるか。',
      arrivals: 'フィード、Webhook、プッシュ通知。リージョン、GeoDNS、クォーラム、合意形成。',
    },
    {
      name: 'プレIPO',
      question: '会社が上場の準備を終えたと証明できるか。',
      arrivals: 'IPOチェックリスト。信頼性、SOC 2、DR訓練、データレジデンシー、40の法則。',
    },
    {
      name: '上場',
      question: '四半期ごとにガイダンスを上回れるか。',
      arrivals: '四半期、ガイダンス、市場の倍数。ゲームは終わらない。',
    },
  ],
  research: {
    stripe: {
      name: 'Stripe Billing',
      blurb: '決済は勝手に集まる。',
    },
    'dns-rr': {
      name: 'DNSラウンドロビン',
      blurb: 'DNSを解放。ユーザーを最大8台のホストに分散する。',
    },
    'load-balancing': {
      name: 'ロードバランシング',
      blurb: 'ロードバランサーを解放。容量で振り分け、死んだホストは飛ばす。',
    },
    'health-checks': {
      name: 'ヘルスチェック',
      blurb: 'DNSが死んだホストにユーザーを送らなくなる。',
    },
    'auth-provider': {
      name: 'マネージドID',
      blurb: '認証プロバイダを解放。ログインがCPUを食わなくなる。',
    },
    caching: {
      name: 'キャッシュ',
      blurb: 'Redisを解放。ほとんどの読み取りクエリがデータベースに届かない。',
    },
    pooling: {
      name: 'コネクションプーリング',
      blurb: 'PgBouncerを解放。アプリの接続が少数のデータベース接続を共有する。',
    },
    replication: {
      name: 'リードレプリカ',
      blurb: 'リードレプリカを解放。',
    },
    'eager-loading': {
      name: 'Eager loading',
      blurb: 'N+1クエリを修正。ORMフレームワークの読み取りクエリが3回ではなく1回になる。',
    },
    'query-analysis': {
      name: 'クエリ分析',
      blurb:
        'EXPLAINがインデックスのないクエリを見つける。インデックスはデータベースのカードから追加する。',
    },
    logs: {
      name: '構造化ログ',
      blurb: 'エラーを原因別に分ける。stranded、dropped、refused、down、stale、oom。',
    },
    metrics: {
      name: 'メトリクス',
      blurb: 'すべてのノードの履歴グラフ。',
    },
    percentiles: {
      name: 'パーセンタイル',
      blurb: '平均の隣にp50、p95、p99。平均がどれだけ隠しているかが見える。',
    },
    alerting: {
      name: 'アラート',
      blurb: 'エラー、p99、飽和がしきい値を超えたらページャーのバナー。',
    },
    funnels: {
      name: 'ファネル分析',
      blurb: 'サインアップの離脱箇所が見えて、直せる。ユーザー成長 +10%。',
    },
    'php-fpm': {
      name: 'PHP-FPM',
      blurb: 'Apacheのプロセスではなくワーカープール。プールサイズは自分で決める。',
    },
    opcache: {
      name: 'OPcache',
      blurb: 'PHPがリクエストごとにスクリプトをコンパイルしなくなる。CPU速度2.5×。',
    },
    'lang-ruby': {
      name: 'Ruby',
      blurb:
        'コアごとに1プロセス、それぞれ5スレッド。スレッドが待ちを重ね、GVLがCPUを1コアに留める。',
    },
    'lang-node': {
      name: 'Node.js',
      blurb:
        'イベントループは1つ。待ちは無料だが、使うコアも1つ。遅いリクエスト1つで他がすべて止まる。',
    },
    'lang-python': {
      name: 'Python',
      blurb:
        '同期ワーカーのプール。1ワーカーが1リクエスト。ワーカーあたりのメモリが増えたPHP-FPM。',
    },
    'node-cluster': {
      name: 'Node.jsクラスターモード',
      blurb: 'コアごとに1つのイベントループ。全コアを使うが、メモリと接続はコア数だけ増える。',
    },
    'libuv-pool': {
      name: 'libuvスレッドプール',
      blurb:
        'パスワードハッシュがイベントループの外に出て、ログインが他のリクエストを止めなくなる。',
    },
    'fw-laravel': {
      name: 'Laravel',
      blurb:
        '機能を速く出せる。バックグラウンド処理の開発工数 −20%。CPU 1.8×（ワーカーモードでは1.1×）で、Eloquentは1回で済む読み取りクエリを3回出す。',
    },
    'fw-rails': {
      name: 'Rails',
      blurb: '機能を速く出せる。ページビューの売上 +20%。CPU 1.5×とN+1クエリ。',
    },
    'fw-express': {
      name: 'Express',
      blurb: '最小限でどこにでもある。CPU 1.1×、ミドルウェアの乱立で技術的負債が10%速く増える。',
    },
    'fw-django': {
      name: 'Django',
      blurb:
        '機能を速く出せる。管理サイトがあるので社内ツールの開発工数 −30%。CPU 1.4×とN+1クエリ。',
    },
    'fw-symfony': {
      name: 'Symfony',
      blurb: '厳格な構造。調整 −30%、技術的負債の増え方は30%遅い。CPU 1.5×、N+1クエリなし。',
    },
    'fw-sinatra': {
      name: 'Sinatra',
      blurb: '軽い。CPU 1.1×。',
    },
    'fw-flask': {
      name: 'Flask',
      blurb: '軽い。CPU 1.1×。',
    },
    keepalive: {
      name: '接続の再利用',
      blurb: 'キープアライブ。内部呼び出しがTCPハンドシェイクを省き、1回あたり1 ms。',
    },
    gzip: {
      name: '圧縮',
      blurb: 'Gzip。ページビューとAPI読み取りの応答が70%小さくなり、CPUは10%増える。',
    },
    timeouts: {
      name: 'タイムアウトとリトライ',
      blurb: '各呼び出しのタイムアウトを1秒、5秒、30秒に設定し、失敗した呼び出しをリトライする。',
    },
    'lb-algorithms': {
      name: 'ロードバランシングアルゴリズム',
      blurb: '最小接続数とPower of two choices。',
    },
    ci: {
      name: '継続的デリバリー',
      blurb:
        'パイプラインのデプロイが30分ではなく5分になり、失敗したデプロイをロールバックできる。再作成とローリングも付いてくる。',
    },
    'blue-green': {
      name: 'ブルーグリーンデプロイ',
      blurb:
        'ブルーグリーン。新しいバージョンが古い隣に立ち上がるので、失敗したデプロイで壊れるのはリクエストの10%。',
    },
    canary: {
      name: 'カナリアデプロイ',
      blurb:
        'カナリア。トラフィックの5%が先に新バージョンに当たる。ブラストラディウスは最小、デプロイは最遅。',
    },
    'code-review': {
      name: 'コードレビュー',
      blurb: '機能の隠れたコストを出荷前に示す。デプロイ失敗 −20%。',
    },
    'testing-culture': {
      name: '自動テスト',
      blurb: 'パイプラインがデプロイ前にテストを回す。デプロイ失敗 −30%。',
    },
    'full-text-search': {
      name: '全文検索',
      blurb: '検索エンジンを解放。Postgresが検索を答えなくなる。',
    },
    'object-storage': {
      name: 'オブジェクトストレージ',
      blurb: 'オブジェクトストレージを解放。アップロードがPostgresに溜まらなくなる。',
    },
    'cache-strategies': {
      name: 'キャッシュ戦略',
      blurb: 'リードスルー、ライトスルー、ライトビハインド。負荷も書き込みもキャッシュが持つ。',
    },
    'lifecycle-rules': {
      name: 'ストレージライフサイクルルール',
      blurb: '古いオブジェクトは勝手に安いストレージクラスへ移る。',
    },
    retention: {
      name: '保持ポリシー',
      blurb:
        'データベースが古い行をアーカイブするか削除する。ストレージは安く、レポートは遅くなる。',
    },
    cdn: {
      name: 'コンテンツ配信',
      blurb: 'CDNを解放。ページがエッジで返り、エグレスが安くなる。',
    },
    waf: {
      name: 'Webアプリケーションファイアウォール',
      blurb: 'WAFを解放。ボットを止める。ついでに本物のユーザーも少し止める。',
    },
    'api-gateway': {
      name: 'APIゲートウェイ',
      blurb: 'APIゲートウェイを解放。すべてのAPI呼び出しをレート制限する1つの入口。',
    },
    websockets: {
      name: 'WebSocket',
      blurb: 'リアルタイムハブを解放。リアルタイムのメッセージに必要な接続を保持し続ける。',
    },
    'background-jobs': {
      name: 'バックグラウンドジョブ',
      blurb: 'ワーカーを解放。リクエストの経路から外れて自分のコードが動く。',
    },
    queues: {
      name: 'メッセージキュー',
      blurb: 'キューを解放。アプリサーバーが遅い処理をワーカーに渡す。',
    },
    'stampede-protection': {
      name: 'スタンピード対策',
      blurb: '空のキャッシュがミスをまとめるので、温まる間もデータベースが持ちこたえる。',
    },
    'cache-warming': {
      name: 'キャッシュウォーミング',
      blurb: '再起動から戻ったキャッシュはほぼ温まっている。',
    },
    'lang-go': {
      name: 'Go',
      blurb:
        '全コアでゴルーチン。待つコストはワーカー1本ではなく数KB。ヒープが埋まるとGCがCPUを取る。',
    },
    'lang-java': {
      name: 'Java',
      blurb:
        'JVMは1つ、全コアで200スレッド。速度30%で起動し、30秒かけて温まる。待つリクエストはそれぞれスレッドを占有する。',
    },
    'lang-csharp': {
      name: 'C#',
      blurb: '全コアで.NETのasync。待ちはスレッドを占有しない。JITのウォームアップはJVMより短い。',
    },
    'fw-gin': {
      name: 'Gin',
      blurb: '軽いルーター。CPU 1.05×。',
    },
    'fw-spring-boot': {
      name: 'Spring Boot',
      blurb: '大きなチーム向けの構造。調整 −30%。CPU 1.3×、メモリ +200 MB、起動は15秒遅い。',
    },
    'fw-aspnet': {
      name: 'ASP.NET Core',
      blurb: '速くて完備。CPU 1.05×。',
    },
    tracing: {
      name: '分散トレーシング',
      blurb: 'リクエスト種別ごとの時間をノード単位で。各種別の一番遅いホップを名指しする。',
    },
    'trace-search': {
      name: 'トレース検索',
      blurb: '研究が25%速くなる。',
    },
    notebooks: {
      name: 'ノートブック',
      blurb: '研究が25%速くなる。',
    },
    'cert-automation': {
      name: '証明書の自動化',
      blurb: '証明書が期限切れの前に自ら更新される。',
    },
    'lang-elixir': {
      name: 'Elixir',
      blurb:
        '全コアでプリエンプティブなプロセス。リクエストが他のリクエストを止めず、プロセスごとにGCが動く。CPUは遅い。',
    },
    'lang-rust': {
      name: 'Rust',
      blurb:
        '全コアでasyncタスク、GCなし、メモリはわずか。CPU負荷の高いタスクはワーカースレッドを1つ塞ぐ。',
    },
    'lang-zig': {
      name: 'Zig',
      blurb:
        '明示的なアロケータとGCなしのネイティブコード。64スレッドのサーバーは全コアを使うが、待つリクエストはそれぞれスレッドを占有する。永続状態はリークしうる。',
    },
    'lang-haskell': {
      name: 'Haskell',
      blurb:
        'Warpが軽量なGHCスレッドを全コアで回す。生産性の高い専門家が採れるが、ビルドと採用は遅い。I/Oの待ちはOSスレッドを占有せず、共有ヒープのGCがポーズとCPUコストを足す。',
    },
    'fw-phoenix': {
      name: 'Phoenix',
      blurb: 'LiveViewのページは売上 +30%。CPU 1.1×。',
    },
    checkout: {
      name: 'チェックアウト',
      blurb: '決済プロバイダとチェックアウト機能を解放。',
    },
    'tiered-caching': {
      name: '階層キャッシュ',
      blurb: 'CDNのエッジがオリジンより先にリージョンの階層に聞く。動画の92%がエッジから出る。',
    },
    'multi-az': {
      name: 'マルチゾーン',
      blurb: 'ノードを3つのゾーンに置き、データ系のノードには別ゾーンの待機系を持たせる。',
    },
    autoscaling: {
      name: 'オートスケーリング',
      blurb: 'オートスケーラーを解放。アプリサーバーやワーカーのコピーが負荷に追従する。',
    },
    containers: {
      name: 'コンテナオーケストレーション',
      blurb: 'Kubernetesクラスターを解放。支出 −15%、スケールは30秒。',
    },
    serverless: {
      name: 'サーバーレス',
      blurb: 'サーバーレス関数を解放。リクエストごとに自分のコードが動き、箱代はかからない。',
    },
    'reserved-instances': {
      name: 'リザーブドインスタンス',
      blurb: 'リザーブド料金。カレンダー1週間のコミットで0.6×。',
    },
    'spot-instances': {
      name: 'スポットインスタンス',
      blurb: 'スポット料金。プロバイダがノードを回収するまで0.3×。',
    },
    'slo-dashboards': {
      name: 'SLOダッシュボード',
      blurb: 'エラーバジェットをHUDに。',
    },
    'error-budgets': {
      name: 'エラーバジェット',
      blurb: '予算が残っていればチームが10%速くなる。使い切ると機能の出荷が半分の速度になる。',
    },
    'backoff-jitter': {
      name: 'バックオフとジッター',
      blurb: 'リトライが待って散らばる。増える呼び出しは10%まで。',
    },
    'circuit-breakers': {
      name: 'サーキットブレーカー',
      blurb: '呼び出しの半分が失敗すると、リンクは5秒間呼び出しを止めてから試し直す。',
    },
    'load-shedding': {
      name: '優先度付きロードシェディング',
      blurb: '飽和したアプリサーバーは価値の低い種別から落とす。',
    },
    'idempotency-keys': {
      name: '冪等キー',
      blurb: 'リトライした課金が二重に課金されることはない。',
    },
    'ryw-routing': {
      name: 'read-your-writesルーティング',
      blurb: '書き込み直後の読み取りをアプリサーバーがプライマリへ送れる。',
    },
    'gogc-tuning': {
      name: 'Go GCチューニング',
      blurb: 'GOGC 50、100、200。メモリを減らしてGCのCPUを増やすか、その逆か。',
    },
    'fw-axum': {
      name: 'Axum',
      blurb: 'TokioとTowerの上に載っている。CPUの上乗せなし。',
    },
    'fw-actix': {
      name: 'Actix Web',
      blurb: 'ベンチマークで最速級。CPU 0.95×。',
    },
    zgc: {
      name: 'ZGC',
      blurb:
        'Javaのポーズが30 msではなく1 ms。代わりにスループットを10%手放し、メモリを15%多く使う。',
    },
    'data-warehouse': {
      name: 'データウェアハウス',
      blurb: 'データウェアハウスを解放。レポートがプライマリをスキャンしなくなる。',
    },
    'event-streaming': {
      name: 'イベントストリーミング',
      blurb:
        'イベントストリームを解放。メッセージを保持するログなので、コンシューマーが再生できる。',
    },
    embeddings: {
      name: 'エンベディング',
      blurb:
        'ベクトルインデックスを解放。AIの回答は自分のドキュメントを使い、Pythonのボーナスも残る。',
    },
    'hosted-models': {
      name: 'ホスト型モデル',
      blurb: 'LLM APIを解放。GPUなしでAIプロンプトを処理し、トークン単位で払う。',
    },
    'model-serving': {
      name: 'モデルサービング',
      blurb: 'GPUノードを解放。回り続けていれば、AIプロンプトのトークン単価が下がる。',
    },
    pitr: {
      name: 'ポイントインタイムリカバリ',
      blurb: 'データベースのバックアップ。夜間スナップショット、またはRPO数分のWALアーカイブ。',
    },
    'tls-everywhere': {
      name: '全通信のTLS化',
      blurb: '内部のリンクをすべて暗号化する。SOC 2に必須。',
    },
    http2: {
      name: 'HTTP/2',
      blurb: '1つの接続が多数のリクエストを運ぶ。ページビューのユーザーホップ −15%。',
    },
    'sync-replication': {
      name: '同期レプリケーション',
      blurb: '書き込みがレプリカを待つ。合意形成に必須。',
    },
    'restore-drills': {
      name: 'リストア訓練',
      blurb: 'バックアップが試されるので、いざという時にリストアが効く。',
    },
    'dependency-scanning': {
      name: '依存関係スキャン',
      blurb: 'ビルドのたびにライブラリの既知の穴を調べる。SOC 2に必須。',
    },
    sharding: {
      name: 'シャーディング',
      blurb: 'データをキーでノードに振り分ける。',
    },
    'encryption-at-rest': {
      name: '保存データの暗号化',
      blurb: 'ディスクとバックアップが暗号化される。SOC 2に必須。',
    },
    'multi-region': {
      name: 'マルチリージョン',
      blurb: '別の大陸にリージョンを開く。リージョンごとにタブが1つ。',
    },
    'geo-dns': {
      name: 'GeoDNS',
      blurb: 'ユーザーは自分のリージョンへ、なければ生きている最寄りへ。',
    },
    'infra-as-code': {
      name: 'Infrastructure as Code',
      blurb: 'IaCツールを選ぶ。リージョンを別リージョンにミラーし、プランを適用して同期を保つ。',
    },
    gitops: {
      name: 'GitOps',
      blurb: 'ミラーが自分で同期する。一括でも段階的でも。',
    },
    anycast: {
      name: 'エニーキャスト',
      blurb: 'どこでもユーザーホップ −20 ms。',
    },
    'document-db': {
      name: 'ドキュメントデータベース',
      blurb: 'ドキュメントストアを解放。スキーママイグレーションはなく、joinもない。',
    },
    'edge-compute': {
      name: 'エッジコンピューティング',
      blurb: 'エッジ関数を解放。ユーザーの隣で動く小さなハンドラー。',
    },
    http3: {
      name: 'HTTP/3',
      blurb: '遠いユーザーのユーザーホップ −20%。',
    },
    notifications: {
      name: '通知',
      blurb: 'プッシュプロバイダを解放。',
    },
    'hybrid-fanout': {
      name: 'ハイブリッドファンアウト',
      blurb: '普通のアカウントにはプッシュ、有名人にはプル。キャッシュがホットキーを分割する。',
    },
    leaderless: {
      name: 'リーダーレスレプリケーション',
      blurb: 'クォーラムを調整できるワイドカラムストアを解放。',
    },
    consensus: {
      name: '合意形成データベース',
      blurb: '分散SQLを解放。',
    },
    'dr-drills': {
      name: '災害復旧訓練',
      blurb: 'IPOチェックリスト用のDR訓練を回す。',
    },
    soc2: {
      name: 'SOC 2プログラム',
      blurb: 'IPOチェックリストの項目。',
    },
    'gdpr-residency': {
      name: 'データレジデンシー管理',
      blurb: 'IPOチェックリストの項目。EUのユーザーはEUのリージョンから配信する。',
    },
    'security-team': {
      name: 'セキュリティチーム',
      blurb: 'IPOチェックリストの項目。監査の指摘は、何かがリセットされる前に直る。',
    },
    'investor-relations': {
      name: '投資家対応',
      blurb: '評価額の倍数 +2。',
    },
    'guidance-modeling': {
      name: 'ガイダンスモデリング',
      blurb: '各ガイダンス水準を上回る確率が見える。',
    },
    'php-jit': {
      name: 'PHP JIT',
      blurb:
        'PHP 8のJIT。Web系の種別でCPU 1.05×、CPU負荷の高い種別で1.6×。ページビューとAPI読み取りにはほとんど効かない。',
    },
    'worker-threads': {
      name: 'Node.jsワーカースレッド',
      blurb:
        '4つのワーカースレッド（40 MB）のプールが、CPU負荷の高い種別をイベントループから外す。',
    },
    yjit: {
      name: 'YJIT',
      blurb: 'RubyのJIT。CPU仕事1.3×、メモリは20%増。',
    },
    gevent: {
      name: 'gevent',
      blurb:
        'グリーンスレッドがプロセスあたり多くのI/O待ちを抱えるので、遅いデータベースがワーカーを占有しなくなる。モンキーパッチはライブラリを壊しうる。接続1本あたり30 KB。',
    },
    asgi: {
      name: 'ASGI + Uvicorn',
      blurb:
        'Node.jsと同じasyncで、CPUは遅い。ブロッキング呼び出しがループを止める。リアルタイム接続は設計どおり1本30 KBで保持できる。',
    },
    'php-worker-mode': {
      name: 'PHPワーカーモード',
      blurb:
        'FrankenPHP、RoadRunner、Octane。アプリは1回だけ起動するので、フレームワークのリクエストごとのオーバーヘッドが消える。シェアードナッシングを失い、メモリリークと状態の混線が起こりうる。',
    },
    swoole: {
      name: 'Swoole',
      blurb:
        'イベントループ上のコルーチン、Node.jsのような非同期I/O、リクエストごとのフレームワークのオーバーヘッドなし。ブロッキング拡張がループを止める。リアルタイム接続は1本20 KBで保持できる。',
    },
    bun: {
      name: 'Bun',
      blurb:
        'より速いイベントループと即時起動。だからNode.jsよりオートスケールもデプロイも上手い。60 MBで起動時間なし。成熟度は低く、Node.jsで動くパッケージが壊れることもある。',
    },
    deno: {
      name: 'Deno',
      blurb:
        'パーミッションがサプライチェーン攻撃のほとんどを防ぐ。代わりに機能開発は10%遅く、互換パッケージは少ない。イベントループはNode.jsと同じ。',
    },
    falcon: {
      name: 'Falcon',
      blurb:
        'ファイバーがプロセスあたり多くのアイドル接続を抱える。ブロックするgemはループを止める。接続1本あたり100 KB。',
    },
    pypy: {
      name: 'PyPy',
      blurb:
        'JITウォームアップ後、純PythonのCPUはGunicornの3倍。C拡張の対応が弱く、MLエコシステムのボーナスは得られない。ワーカーあたり200 MB。',
    },
    'virtual-threads': {
      name: 'Java仮想スレッド',
      blurb:
        '待ちがプラットフォームスレッドを占有しなくなり、遅いデータベースはレイテンシを足すだけになる。ネイティブ（JNI）呼び出しはキャリアを固定したままで、JVMは相変わらず30秒かけて温まる。リアルタイム接続は1本10 KB。',
    },
    webflux: {
      name: 'Spring WebFlux',
      blurb:
        'プロセスあたり1つのループで非常に高い並行性。ただし開発とデバッグは20%遅い。ブロッキング呼び出しがループを止め、JVMは相変わらずウォームアップする。400 MB。',
    },
    fasthttp: {
      name: 'fasthttp',
      blurb:
        'net/httpより25%速いが、機能開発は10%遅い。APIは標準ではなく、一部のミドルウェアは動かず、HTTP/2もない。',
    },
    'spawn-blocking': {
      name: 'Tokioブロッキングプール',
      blurb:
        'CPU負荷の高い種別がブロッキングプールに移り、Tokioのタスクがワーカースレッドを止めなくなる。',
    },
    'graal-native': {
      name: 'GraalVMネイティブイメージ',
      blurb:
        '100 ms未満で、ウォームアップなしに起動する。メモリはJVMの60%、速度は0.80×、ビルドは3倍長い。Tomcatのように接続ごとに1スレッド。サーバーレス関数に向く。',
    },
    'native-aot': {
      name: '.NET Native AOT',
      blurb:
        'JITがないので最初から全速で起動し、より小さい。100 MB。速度は0.90×で、リフレクションの多いライブラリには開発工数がかかる。',
    },
    'distributed-erlang': {
      name: '分散Erlang',
      blurb:
        'BEAMのリアルタイムハブが標準のpub/subだけでクラスタを組む。別のバックボーンは要らない。分断が起きると脳が割れる。',
    },
    nifs: {
      name: 'NIF',
      blurb:
        'ネイティブコードでElixirのCPU負荷の高い種別が3×速くなる。NIFはプリエンプトされず、1つのクラッシュがVMごと持っていく。',
    },
    jemalloc: {
      name: 'jemalloc',
      blurb: '長時間動くRustサービスで断片化が減る。CPU 1.05×、起動時のメモリは5%増。',
    },
    'free-threading': {
      name: 'フリースレッドPython',
      blurb:
        '全コアで本当に並列なスレッド。スレッドあたり10%遅く、接続ごとにスレッドを立てるのは安くない。対応していないC拡張は開発工数がかかる。8スレッド、接続1本あたり100 KB。',
    },
    'fw-fastapi': {
      name: 'FastAPI',
      blurb:
        'Pydanticによる検証と、モデルをつなぐのに最良のエコシステム。AIプロンプトの売上 +15%。CPU 1.15×、ASGIサーバーでしか動かない。10 MB。',
    },
    'fw-fastify': {
      name: 'Fastify',
      blurb: 'スキーマベースのシリアライズ。読み取りのCPU −20%。自身のオーバーヘッドはなし。5 MB。',
    },
    'fw-nextjs': {
      name: 'Next.js',
      blurb:
        'サーバーレンダリングとインクリメンタル静的再生成。ページの売上 +50%、CPUはその1.6×、そのうち40%はCDNが返せる。プロセスあたり30 MB。',
    },
    'fw-nestjs': {
      name: 'NestJS',
      blurb: '大きなチーム向けの構造。調整 −30%。CPU 1.3×、プロセスあたり20 MB。',
    },
    'fw-fiber': {
      name: 'Fiber',
      blurb: 'fasthttpの上のExpress風API。CPUの上乗せはなく、HTTP/2もない。5 MB。',
    },
    'fw-quarkus': {
      name: 'Quarkus',
      blurb:
        'ネイティブイメージ向けに作られている。GraalVMのビルドが半分の時間で済む。CPU 1.1×、プロセスあたり100 MB。',
    },
    'fw-hono': {
      name: 'Hono',
      blurb: 'Web標準の上の小さなルーター。CPUの追加負荷はありません。プロセスあたり2 MB。',
    },
    'fw-elysia': {
      name: 'Elysia',
      blurb:
        'Bun向けで、型がサーバーからクライアントまで検査されます。技術的負債の増加が15%遅くなります。CPUの追加負荷はありません。プロセスあたり5 MB。',
    },
    'fw-koa': {
      name: 'Koa',
      blurb: 'Expressの後継で、async関数の上に作られています。CPU1.05×、プロセスあたり5 MB。',
    },
    'fw-adonis': {
      name: 'AdonisJS',
      blurb:
        'Laravelの考え方をNode.jsに。機能を素早く出荷できます。CPU1.4×、プロセスあたり25 MB、Lucid ORMはN+1クエリを発生させます。',
    },
    'fw-codeigniter': {
      name: 'CodeIgniter',
      blurb: '邪魔をしない小さなPHPフレームワーク。CPU1.1×、プロセスあたり4 MB。',
    },
    'fw-sanic': {
      name: 'Sanic',
      blurb: '根本から非同期。CPU1.05×、プロセスあたり10 MB。',
    },
    'fw-rocket': {
      name: 'Rocket',
      blurb:
        '型安全なルーティングで定型コードが少なく、Rustで最も速く書けます。CPU1.05×、プロセスあたり3 MB。',
    },
    cdc: {
      name: '変更データキャプチャ',
      blurb: 'CDCコネクターを解放。コピーが書き込みログを追い、二度目の書き込みなしで済む。',
    },
    'service-boundaries': {
      name: 'サービスの境界',
      blurb:
        'サービスを分割する。自前のチーム、自前のデプロイ、自前のブラストラディウスを持つ新しいコードベースになる。',
    },
    'service-mesh': {
      name: 'サービスメッシュ',
      blurb:
        'サービスメッシュを解放。すべてのリンクにリトライ、サーキットブレーカー、メトリクスが付く。',
    },
    'feature-flags': {
      name: 'フィーチャーフラグ',
      blurb:
        'フィーチャーフラグを解放。機能が一部のユーザーだけに届き、失敗したデプロイも一緒に届く。',
    },
    'secrets-management': {
      name: 'シークレット管理',
      blurb: '鍵は保管庫に置かれ、フィッシングページが盗むものはなくなる。',
    },
    'spam-filter': {
      name: 'スパムフィルター',
      blurb:
        '受信箱にフィルターが付き、スパムを専用フォルダに分ける。たまに本物の手紙も一緒に分ける。',
    },
    'on-call': {
      name: 'オンコールローテーション',
      blurb: 'ローテーションがページに応答するので、インシデントは数分で認知される。',
    },
    runbooks: {
      name: 'ランブック',
      blurb: 'チームが経験したインシデント種別のランブックを書くと、その種別は自然に解決する。',
    },
    'sre-team': {
      name: 'SREチーム',
      blurb: 'SREチームを解放。MTTR −40%、未完了のアクションアイテムの重みが半分になる。',
    },
    'enterprise-sales': {
      name: 'エンタープライズ営業',
      blurb: 'SLAを結ぶ。可用性を1週間守れなければ顧客にクレジットを返す。',
    },
    'online-migrations': {
      name: 'オンラインスキーママイグレーション',
      blurb: '大きなテーブルをロックせずに変更するので、マイグレーション中も書き込みが流れ続ける。',
    },
    'leap-smearing': {
      name: 'リープスミアリング',
      blurb: 'うるう秒を1日じゅうに薄く広げ、時計が飛ばず、リースが早く切れることもない。',
    },
    'ab-testing': {
      name: 'A/Bテスト',
      blurb: 'フラグで除外したユーザーと比べて機能のリフトを信頼区間つきで測る。',
    },
    'hiring-pipeline': {
      name: '採用パイプライン',
      blurb: 'リクルーターがパイプラインを温めておくので、採用にかかる期間が30%短くなる。',
    },
    'trunk-based': {
      name: 'トランクベース開発',
      blurb: '小さな変更が1日に何度も1本のブランチに入り、チームの出荷回数が50%増える。',
    },
    'platform-team': {
      name: 'プラットフォームチーム',
      blurb:
        'プラットフォームチームを解放。クラスターとパイプラインを回し、デプロイ時間を半減させる。',
    },
    'data-team': {
      name: 'データチーム',
      blurb:
        'データチームを解放。レポートとAI機能のコストが30%減り、パイプラインの遅れも半分になる。',
    },
    'l4-lb': {
      name: 'L4ロードバランシング',
      blurb:
        'ロードバランサーがHTTPを読まずにTCPを転送する。スループットは10倍、ホップは5分の1、しかも安い。ただし種別ごとのルーティングもリトライもない。',
    },
    'rate-limiting': {
      name: 'レート制限',
      blurb:
        'ゲートウェイのトークンバケット。バケット分のバーストは丸ごと通り、長期的な平均は制限に収まる。',
    },
    esi: {
      name: 'Edge Side Includes',
      blurb:
        'CDNがログイン後のページの共通部分をキャッシュし、個人向けの部分はエッジで埋める。ページビューのヒットが20%増える。',
    },
    'bot-management': {
      name: 'ボット管理',
      blurb:
        '怪しいクライアントを問答無用で止めず、チャレンジを出すWAF。同じだけボットを止め、本物のユーザーをボットと間違えにくい。',
    },
    'scheduled-scaling': {
      name: 'スケジュールスケーリング',
      blurb:
        'オートスケーラーが毎日の既知のピークの前にコピーを増やすので、ピークが来た時には温まっている。',
    },
    'arm-instances': {
      name: 'ARMインスタンス',
      blurb: 'ARMインスタンスファミリーを解放。汎用と同じvCPUとRAMが0.8×の価格で。',
    },
    quantization: {
      name: '量子化',
      blurb: 'GPUノードがINT8かINT4の重みで動く。速くて小さく、答えの価値は5%か15%下がる。',
    },
    'continuous-batching': {
      name: 'continuous batching',
      blurb:
        'GPUノードが届いた順にプロンプトをバッチにまとめるので、バッチを大きくしても最初のトークンまでの時間は増えずにスループットが上がる。',
    },
    bulkheads: {
      name: 'バルクヘッド',
      blurb:
        'リンクが、1つの依存先に渡す呼び出し元の枠に上限をかける。遅い依存先は自分の呼び出しを落とし、残りは動き続ける。',
    },
    'graceful-degradation': {
      name: 'グレースフルデグラデーション',
      blurb:
        '飽和したアプリサーバーが高コストな種別から順に切るので、安い種別はレイテンシを保ち、高い種別は早く失敗する。',
    },
    'hedged-requests': {
      name: 'ヘッジリクエスト',
      blurb:
        'リンクがp95を超えた呼び出しの2通目を送り、速い方の答えを残す。テールが縮み、呼ばれる側は呼び出しが10%増える。',
    },
    'chaos-engineering': {
      name: 'カオスエンジニアリング',
      blurb:
        '定期的な実験が一番弱いノードを数秒落とし、そのノードを名指しする。失敗インサイトが手に入り、設計が生き延びることが示せる。',
    },
    denormalization: {
      name: '非正規化',
      blurb: 'データベースが結合済みのコピーを持つ。読み取りのCPU −30%、書き込みは1回ごとに+20%。',
    },
    precompute: {
      name: 'マテリアライズドビュー',
      blurb:
        'データベースが保存したビューからレポートを返す。スキャンのCPUは半分、数字はリフレッシュした時点のもの。',
    },
    'binary-rpc': {
      name: 'サービス間バイナリRPC',
      blurb:
        'サービスが呼び出しをテキストではなくバイナリでシリアライズする。バックエンド呼び出しのシリアライズCPUが半分になる。',
    },
    outbox: {
      name: 'トランザクショナルアウトボックス',
      blurb:
        '書き込みとそのイベントが同じトランザクションに収まり、リレーが配信する。配信に失敗してもコピーがずれない。',
    },
    'expand-contract': {
      name: 'Expand/Contract',
      blurb:
        'スキーマ変更が新しい形を足し、バックフィルし、古い形を落とす。テーブルロックを取らないので、マイグレーションが書き込みを止めることはない。',
    },
    profiling: {
      name: '継続的プロファイリング',
      blurb: '各ノードを制限しているリソースを名指しする。CPU、ワーカー、メモリ、接続、ディスク。',
    },
    'tail-sampling': {
      name: 'テールベースサンプリング',
      blurb: '遅いトレースと失敗したトレースを残す。失敗インサイトが2倍。',
    },
    rum: {
      name: 'リアルユーザーモニタリング',
      blurb: 'ユーザー側から見たレイテンシをデバイス別に。デスクトップ、モバイル、タブレット。',
    },
    'anomaly-detection': {
      name: '異常検知',
      blurb: '明日のピークトラフィックを予測し、インシデントがピークになる前に警告する。',
    },
    'credential-protection': {
      name: 'クレデンシャルスタッフィング対策',
      blurb: 'クレデンシャルスタッフィングのボットの波を、ログインに届く前にほとんど止める。',
    },
    'pen-testing': {
      name: 'ペネトレーションテスト',
      blurb: 'カレンダーで1週間ごとに、設計の一番弱いインシデント種別を明かす。',
    },
    rightsizing: {
      name: 'ライトサイジングレポート',
      blurb: 'ピーク時に使用率30%未満のノードに印を付けるので、大きすぎる箱が見つけやすい。',
    },
    'egress-optimization': {
      name: 'エグレス最適化',
      blurb: 'R2の価格設定のオブジェクトストレージ。インターネットへのエグレスはかからない。',
    },
    'unit-economics': {
      name: 'ユニットエコノミクス',
      blurb: '処理したリクエスト1件あたりのコストを、リクエスト種別ごとに。',
    },
    'cost-allocation': {
      name: 'コスト配賦',
      blurb: 'サービスごと、チームごとのコスト。各サービスが持つノードから算出する。',
    },
    'savings-plans': {
      name: 'Savings Plans',
      blurb:
        'すべてのコンピュートノードの支出が20%引き。オンデマンドでも対象で、ノードごとのコミットは不要。',
    },
  },
  researchTracks: {
    infrastructure: { label: 'インフラ' },
    data: { label: 'データ' },
    reliability: { label: '信頼性' },
    observability: { label: '可観測性' },
    performance: { label: 'パフォーマンス' },
    runtimes: { label: 'ランタイム' },
    frameworks: { label: 'フレームワーク' },
    security: { label: 'セキュリティ' },
    product: { label: 'プロダクト' },
    cost: { label: 'コスト' },
  },
}
