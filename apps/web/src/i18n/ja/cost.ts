import type { Messages } from '../messages.ts'

export const cost: Messages['cost'] = {
  s: (value) => `${value}/s`,
  burn: '支出',
  revenue: '売上',
  margin: '利益率',
  compute: 'コンピュート',
  data: 'データ',
  storage: 'ストレージ',
  egress: 'エグレス',
  requests: 'リクエスト',
  observability: '可観測性',
  salaries: '人件費',
  notes: {
    compute: 'アプリサーバー、ワーカー、エッジ、プラットフォームのノード',
    data: 'データベース、キャッシュ、プーラー、レプリカなど',
    storage: '保存しているGB数。1GBあたり1秒単位で課金されます',
    egress: 'オリジンとCDNから出ていくバイト数',
    thirdParty: '決済手数料、スキャン、トークン、メッセージ',
    requests: 'ゲートウェイ、サーバーレス関数、エッジ関数のリクエスト。使った分だけ課金されます',
    observability: 'アナリティクスのサンプリングと保持',
    salaries: 'エンジニア。言語とポリシーで決まります',
  },
  thirdParties: '外部サービス',
  cloudBill: 'クラウドの請求',
  billExplainer:
    '請求は時代のコスト指数に連動するので、会社が育つほど増えます。APIゲートウェイはリクエストごとに、サーバーレス関数はリクエストとGB秒ごとに、エッジ関数はリクエストごとに課金されます。リクエストの行は、それらが処理した分の合計です。',
}
