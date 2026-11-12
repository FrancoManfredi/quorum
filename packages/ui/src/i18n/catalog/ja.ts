import type { Catalog } from './en.ts'

export const catalog: Catalog = {
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
    'night-shift': { name: '夜勤', effect: '開発工数 +10%' },
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
    'b2b-saas': { name: 'B2B SaaS', summary: '夕方のピーク。既定のミックス' },
    'consumer-social': {
      name: 'コンシューマーSNS',
      summary: 'フィードと動画が中心。ユーザー2倍、1人あたりの価値は半分',
    },
    fintech: {
      name: 'フィンテック',
      summary: '営業時間。チェックアウトと書き込みが中心。金銭を扱う読み取りが古いと罰金',
    },
    streaming: {
      name: '動画配信',
      summary: '深夜のピーク。動画が中心。エグレスは3倍の費用',
    },
    'game-backend': {
      name: 'ゲームバックエンド',
      summary: '夜のピーク。リアルタイムがトラフィックの大半',
    },
    'ai-startup': {
      name: 'AIスタートアップ',
      summary: '平坦な需要。プロンプトとアップロードが中心。GPUは希少',
    },
    'e-commerce': {
      name: 'EC',
      summary: 'ページと検索が中心。毎月決まった日にセール',
    },
    'developer-platform': {
      name: '開発者プラットフォーム',
      summary: '平坦だがバースト的。API読み取りとWebhookが中心。素朴なリトライは禁止',
    },
    healthcare: {
      name: 'ヘルスケア',
      summary: '営業時間。書き込みと検索が中心。データは地域内に留まる',
    },
    'ad-tech': {
      name: 'アドテク',
      summary: '平坦で巨大。入札が中心。100 msを超えると稼げない',
    },
    government: {
      name: '公共調達',
      summary: '営業時間。ページと記録。JavaかC#のみ。発注に1日',
    },
    bootstrapped: {
      name: '自己資金',
      summary: 'ラウンドなし。既定のミックス。株式は100%のまま',
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
    jetzig: {
      name: 'Jetzig',
      blurb:
        'ファイルベースのルーティング、テンプレート、データベース、バックグラウンドジョブを一つの箱に。機能を素早く出荷できます。CPU1.3×、プロセスあたり25 MB、若いツールチェーン上で動作します。',
    },
    tokamak: {
      name: 'Tokamak',
      blurb:
        'http.zig上の依存性注入コンテナ。明示的な配線が調整と技術的負債を減らします。CPU1.05×、プロセスあたり5 MB、エコシステムは小さめです。',
    },
    servant: {
      name: 'Servant',
      blurb:
        'APIの型が契約になります。ルーティング、クライアント、ドキュメントがそこから導かれ、チームの調整とドリフトが減ります。CPU1.0×、プロセスあたり2 MB、型レベルの学習曲線があります。',
    },
    ihp: {
      name: 'IHP',
      blurb:
        'バッテリー同梱。コード生成、型安全なクエリビルダー、組み込みのジョブキューを備えます。CPU1.3×、プロセスあたり40 MBで機能を素早く出荷できますが、Nixベースのツールチェーンです。',
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
    'q-vector': { label: 'ベクトル検索' },
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
    change: { label: '変更' },
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
    },
    anycast: {
      term: 'エニーキャスト',
    },
    apdex: {
      term: 'Apdex',
    },
    'async-io': {
      term: '非同期I/O',
    },
    'at-least-once-delivery': {
      term: '少なくとも1回の配信',
    },
    autoscaling: {
      term: 'オートスケーリング',
    },
    'availability-zone': {
      term: 'アベイラビリティゾーン',
    },
    backpressure: {
      term: 'バックプレッシャー',
    },
    bcrypt: {
      term: 'Bcrypt',
    },
    'binary-rpc': {
      term: 'バイナリRPC',
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP（ボーダーゲートウェイプロトコル）',
    },
    'blast-radius': {
      term: 'ブラストラディウス',
    },
    'blue-green-deployment': {
      term: 'ブルーグリーンデプロイ',
    },
    'bot-management': {
      term: 'ボット管理',
    },
    'brookss-law': {
      term: 'ブルックスの法則',
    },
    bulkhead: {
      term: 'バルクヘッド',
    },
    'burn-rate': {
      term: 'バーンレート',
    },
    'bytecode-cache': {
      term: 'バイトコードキャッシュ',
    },
    'cache-hit-rate': {
      term: 'キャッシュヒット率',
    },
    'cache-stampede': {
      term: 'キャッシュスタンピード',
    },
    'cache-warming': {
      term: 'キャッシュウォーミング',
    },
    'cache-aside': {
      term: 'キャッシュアサイド',
    },
    'canary-deployment': {
      term: 'カナリアデプロイ',
    },
    'cascading-failure': {
      term: 'カスケード障害',
    },
    'cdc-change-data-capture': {
      term: 'CDC（変更データキャプチャ）',
    },
    'cdn-content-delivery-network': {
      term: 'CDN（コンテンツ配信ネットワーク）',
    },
    'chaos-engineering': {
      term: 'カオスエンジニアリング',
    },
    'circuit-breaker': {
      term: 'サーキットブレーカー',
    },
    'code-review': {
      term: 'コードレビュー',
    },
    'cold-start': {
      term: 'コールドスタート',
    },
    compression: {
      term: '圧縮',
    },
    'connection-pooling': {
      term: 'コネクションプーリング',
    },
    'consistent-hashing': {
      term: 'コンシステントハッシュ',
    },
    'container-orchestration': {
      term: 'コンテナオーケストレーション',
    },
    'continuous-batching': {
      term: 'continuous batching',
    },
    'continuous-delivery': {
      term: '継続的デリバリー',
    },
    'conways-law': {
      term: 'コンウェイの法則',
    },
    'credential-stuffing': {
      term: 'クレデンシャルスタッフィング',
    },
    'data-residency': {
      term: 'データレジデンシー',
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS（分散型サービス拒否攻撃）',
    },
    'dead-letter-queue': {
      term: 'デッドレターキュー',
    },
    denormalization: {
      term: '非正規化',
    },
    'dependency-scanning': {
      term: '依存関係スキャン',
    },
    'distributed-tracing': {
      term: '分散トレーシング',
    },
    'diurnal-traffic': {
      term: '日周トラフィック',
    },
    'dns-round-robin': {
      term: 'DNSラウンドロビン',
    },
    'dora-metrics': {
      term: 'DORAメトリクス',
    },
    downsampling: {
      term: 'ダウンサンプリング',
    },
    drift: {
      term: '構成ドリフト',
    },
    egress: {
      term: 'エグレス',
    },
    'edge-side-includes': {
      term: 'Edge Side Includes（ESI）',
    },
    'encryption-at-rest': {
      term: '保存データの暗号化',
    },
    'error-budget': {
      term: 'エラーバジェット',
    },
    'event-loop': {
      term: 'イベントループ',
    },
    'eventual-consistency': {
      term: '結果整合性',
    },
    'expand-and-contract': {
      term: 'Expand/Contractパターン',
    },
    'fallacies-of-distributed-computing': {
      term: '分散コンピューティングの誤謬',
    },
    'fan-out': {
      term: 'ファンアウト',
    },
    'fan-out-on-write': {
      term: '書き込み時のファンアウト',
    },
    'feature-flag': {
      term: 'フィーチャーフラグ',
    },
    'four-golden-signals': {
      term: '4つのゴールデンシグナル',
    },
    'gc-pause': {
      term: 'GCポーズ',
    },
    geodns: {
      term: 'GeoDNS',
    },
    'gil-global-interpreter-lock': {
      term: 'GIL（グローバルインタプリタロック）',
    },
    gitops: {
      term: 'GitOps',
    },
    'graceful-degradation': {
      term: 'グレースフルデグラデーション',
    },
    'green-threads': {
      term: 'グリーンスレッド',
    },
    'health-check': {
      term: 'ヘルスチェック',
    },
    'hedged-request': {
      term: 'ヘッジリクエスト',
    },
    'hot-key': {
      term: 'ホットキー',
    },
    'http-keep-alive': {
      term: 'HTTPキープアライブ',
    },
    'http2-and-http3': {
      term: 'HTTP/2とHTTP/3',
    },
    'iac-tool': {
      term: 'IaCツール',
    },
    idempotency: {
      term: '冪等性',
    },
    'inverted-index': {
      term: '転置インデックス',
    },
    'jit-warmup': {
      term: 'JITウォームアップ',
    },
    'leaderless-replication': {
      term: 'リーダーレスレプリケーション',
    },
    'leap-smearing': {
      term: 'リープスミアリング',
    },
    'littles-law': {
      term: 'リトルの法則',
    },
    'load-balancer': {
      term: 'ロードバランサー',
    },
    'load-shedding': {
      term: 'ロードシェディング',
    },
    'memory-leak': {
      term: 'メモリリーク',
    },
    'materialized-view': {
      term: 'マテリアライズドビュー',
    },
    'metastable-failure': {
      term: 'メタステーブル障害',
    },
    mirror: {
      term: 'ミラー',
    },
    'model-inference': {
      term: 'モデル推論',
    },
    'mttd-and-mtta': {
      term: 'MTTDとMTTA',
    },
    mttr: {
      term: 'MTTR',
    },
    'n1-query': {
      term: 'N+1クエリ',
    },
    'network-partition': {
      term: 'ネットワーク分断',
    },
    'node-drain': {
      term: 'ノードドレイン',
    },
    'object-storage': {
      term: 'オブジェクトストレージ',
    },
    observability: {
      term: '可観測性',
    },
    'oltp-and-olap': {
      term: 'OLTPとOLAP',
    },
    'on-call': {
      term: 'オンコール',
    },
    'operating-margin': {
      term: '営業利益率',
    },
    'percentile-p50-p95-p99': {
      term: 'パーセンタイル（p50、p95、p99）',
    },
    'point-in-time-recovery': {
      term: 'ポイントインタイムリカバリ',
    },
    'power-of-two-choices': {
      term: 'Power of two choices',
    },
    'pre-fork-worker-model': {
      term: 'プリフォークワーカーモデル',
    },
    'process-per-request': {
      term: 'リクエストごとのプロセス',
    },
    quantization: {
      term: '量子化',
    },
    quorum: {
      term: 'クォーラム',
    },
    raft: {
      term: 'Raft',
    },
    'rate-limiting': {
      term: 'レート制限',
    },
    'read-replica': {
      term: 'リードレプリカ',
    },
    'read-your-writes-consistency': {
      term: 'read-your-writes整合性',
    },
    'red-method': {
      term: 'REDメソッド',
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS（正規表現によるサービス拒否）',
    },
    'replication-lag': {
      term: 'レプリケーションラグ',
    },
    'retry-with-backoff-and-jitter': {
      term: 'バックオフとジッターを伴うリトライ',
    },
    'rpo-and-rto': {
      term: 'RPOとRTO',
    },
    'rule-of-40': {
      term: '40の法則',
    },
    runbook: {
      term: 'ランブック',
    },
    service: {
      term: 'サービス',
    },
    sharding: {
      term: 'シャーディング',
    },
    'shared-nothing': {
      term: 'シェアードナッシング',
    },
    'slo-sla-sli': {
      term: 'SLO・SLA・SLI',
    },
    'soc-2': {
      term: 'SOC 2',
    },
    'spot-instance': {
      term: 'スポットインスタンス',
    },
    'strangler-pattern': {
      term: 'ストラングラーパターン',
    },
    'synchronous-replication': {
      term: '同期レプリケーション',
    },
    'tail-at-scale': {
      term: 'The Tail at Scale',
    },
    'tech-debt': {
      term: '技術的負債',
    },
    'thread-pool': {
      term: 'スレッドプール',
    },
    'thundering-herd': {
      term: 'サンダリングハード',
    },
    'tiered-caching': {
      term: '階層キャッシュ',
    },
    timeout: {
      term: 'タイムアウト',
    },
    'tls-certificate': {
      term: 'TLS証明書',
    },
    'token-bucket': {
      term: 'トークンバケット',
    },
    'transactional-outbox': {
      term: 'トランザクショナルアウトボックス',
    },
    'use-method': {
      term: 'USEメソッド',
    },
    utilization: {
      term: '使用率',
    },
    'vertical-and-horizontal-scaling': {
      term: '垂直スケーリングと水平スケーリング',
    },
    'waf-web-application-firewall': {
      term: 'WAF（Webアプリケーションファイアウォール）',
    },
    'write-through-cache': {
      term: 'ライトスルーキャッシュ',
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
    'fw-jetzig': {
      name: 'Jetzig',
      blurb:
        'ファイルベースのルーティング、テンプレート、データベース、バックグラウンドジョブを一つの箱に。機能を素早く出荷できます。CPU1.3×、プロセスあたり25 MB、若いツールチェーン上で動作します。',
    },
    'fw-tokamak': {
      name: 'Tokamak',
      blurb:
        'http.zig上の依存性注入コンテナ。明示的な配線が調整と技術的負債を減らします。CPU1.05×、プロセスあたり5 MB、エコシステムは小さめです。',
    },
    'fw-servant': {
      name: 'Servant',
      blurb:
        'APIの型が契約になります。ルーティング、クライアント、ドキュメントがそこから導かれ、チームの調整とドリフトが減ります。CPU1.0×、プロセスあたり2 MB、型レベルの学習曲線があります。',
    },
    'fw-ihp': {
      name: 'IHP',
      blurb:
        'バッテリー同梱。コード生成、型安全なクエリビルダー、組み込みのジョブキューを備えます。CPU1.3×、プロセスあたり40 MBで機能を素早く出荷できますが、Nixベースのツールチェーンです。',
    },
    'build-cache': {
      name: 'ビルドキャッシュ',
      blurb: 'ビルド成果物と依存関係の共有キャッシュ。すべてのStackのビルドが25%速くなります。',
    },
    'dev-environment': {
      name: '再現可能な開発環境',
      blurb:
        '一つのコンテナがすべてのコンパイラとツールを固定します。新入社員は半分の立ち上がり時間で全力になります。',
    },
    'static-analysis': {
      name: '静的解析',
      blurb:
        'リンターと型チェッカーがすべての変更を出荷前に検査します。悪いデプロイが20%減ります。',
    },
    'formal-verification': {
      name: '形式検証',
      blurb:
        '証明とプロパティベーステストがテストの届かないバグを捕まえます。悪いデプロイが50%減る代わりに、機能ごとの開発時間が15%増えます。',
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
