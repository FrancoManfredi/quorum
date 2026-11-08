import type { Messages } from '../messages.ts'

export const presence: Messages['presence'] = {
  opening: (what) => `正在打开${what}`,
  inspector: '检查器',
  research: '研究',
  team: '团队面板',
  dashboard: '仪表盘',
  playbooks: '运维手册',
  help: '帮助',
  dev: '试玩面板',
  inbox: '收件箱',
  cost: '成本',
  churn: '流失明细',
  mirror: '镜像',
  settings: '设置',
  menu: '菜单',
  room: '房间面板',
  exit: '退出界面',
  challenge: '挑战',
}
