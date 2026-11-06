import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const research: Messages['research'] = {
  researched: '已研究',
  cost: (p0) => `成本 · ${arg(p0)}`,
  held: (p0) => `持有 ${arg(p0)}`,
  s: (p0) => `+${arg(p0)}/秒`,
  glossary: (p0) => `术语表：${arg(p0)}`,
  studyQueue: '研究队列',
  queue: '队列',
  moveUp: '上移',
  moveDown: '下移',
  cancel: '取消',
  startStudy: (p0) => `开始研究 · ${arg(p0)}`,
  opensIn: (p0) => `${arg(p0)}后开放`,
  needs: (p0) => `需要${arg(p0)}`,
  studyNow: '立即研究',
  studying: (p0) => `研究中 · ${arg(p0)}%`,
  openActionItemTheIncidentIt: '尚未完成的改进项。完成研究之前，相关故障的发生概率为两倍。',
  everyStudyBehindItWaits: (p0) => `${arg(p0)}排在它后面的研究都会等待。`,
  atTheFrontOfTheQueue: (p0) => `${arg(p0)}排到队首时，它会卡住后面的所有研究。`,
  requires: '需要',
  leadsTo: '后续研究',
  research: '研究',
  closeEsc: '关闭（Esc）',
}
