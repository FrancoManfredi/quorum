import type { Messages } from '../messages.ts'

export const research: Messages['research'] = {
  researched: '研究済み',
  cost: (value) => `コスト · ${value}`,
  held: (value) => `${value} 保有`,
  s: (value) => `+${value}/s`,
  glossary: (value) => `用語集: ${value}`,
  studyQueue: '研究キュー',
  queue: 'キュー',
  moveUp: '上へ',
  moveDown: '下へ',
  reorder: (value) => `研究キューで${value}を並べ替える`,
  dragToReorder: 'ドラッグで並べ替え',
  cancel: 'キャンセル',
  startStudy: (value) => `研究を開始 · ${value}`,
  opensIn: (value) => `${value}後に解放`,
  studyAfter: (names) => `${names.join('、')}の後に研究`,
  studyAfterCount: (count) => `前提${count}件の後に研究`,
  studyNow: '今すぐ研究',
  studying: (value) => `研究中 · ${value}%`,
  openActionItemTheIncidentIt:
    '未完了のアクションアイテムです。リサーチするまで、これが防ぐインシデントの発生率は2倍になります。',
  everyStudyBehindItWaits: (value) => `${value} 後ろの研究はすべて足止めされます。`,
  stallsFirst: (name, reason) =>
    `${name}が先に停滞します。${reason} 後ろの研究はすべて足止めされます。`,
  atTheFrontOfTheQueue: (value) =>
    `${value} キューの先頭にあるので、後ろの研究はすべて足止めされます。`,
  requires: '前提',
  leadsTo: 'つながる先',
  research: 'リサーチ',
  closeEsc: '閉じる (Esc)',
}
