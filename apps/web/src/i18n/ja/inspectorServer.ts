import type { Messages } from '../messages.ts'

export const inspectorServer: Messages['inspectorServer'] = {
  feeds: 'フィード',
  pull: 'プル',
  push: 'プッシュ',
  collector: 'コレクター',
  dropEvenly: '均等に落とす',
  shedLowValue: '価値の低いものから落とす',
  keepKinds: '種別を保つ',
  dropDearest: '最も高いものを落とす',
  readsAnywhere: 'どこでも読み取り',
  readYourWrites: '自分の書き込みを読む',
  overload: '過負荷',
}
