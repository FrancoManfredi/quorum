import type { Messages } from '../messages.ts'

export const inspectorPayments: Messages['inspectorPayments'] = {
  inTheDrawer: '引き出しの中',
  drawerSize: '引き出しの容量',
  spilled: 'あふれ',
  revenue: '売上',
  s: (p0) => `${p0}/s`,
  subscriptions: 'サブスクリプション',
  burn: '支出',
  salaries: '人件費',
  provider: 'プロバイダ',
  firstProvider: '1つ目',
  secondProvider: '2つ目',
  aSecondProviderCharges: (extra) =>
    `2つ目のプロバイダはチェックアウトあたり${extra}%高く、1つ目が落ちている間も提供を続けます。`,
  oneProviderTakesEveryCheckout:
    '1つのプロバイダがすべてのチェックアウトを処理します。落ちると戻るまでチェックアウトは失敗します。',
}
