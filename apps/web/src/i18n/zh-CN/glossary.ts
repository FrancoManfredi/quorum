import type { Messages } from '../messages.ts'

export const glossary: Messages['glossary'] = {
  category: '分类',
  all: '全部',
  met: '已达成',
  inTheGame: '游戏中的含义',
  related: '相关',
  learnMore: '了解更多',
  glossary: '术语表',
  ofTermsMet: (p0, p1) => `已接触 ${p0}/${p1} 个术语`,
  searchTheGlossary: '搜索术语表',
  terms: '术语',
  noMatches: '没有匹配项',
  performance: '性能',
  reliability: '可靠性',
  observability: '可观测性',
  data: '数据',
  runtimes: '运行时',
  network: '网络',
  security: '安全',
  delivery: '交付',
  team: '团队',
  business: '业务',
  cveDefinition: (score, components) => `评分 ${score}，满分 10 分。影响 ${components}。`,
  cveInGame: (cost, minutes) =>
    `安全邮件会点名它并开出补丁工单：${cost}，披露后 ${minutes} 分钟内到期。逾期后它会在团队待办中变红，再过一分钟就会被利用。`,
}
