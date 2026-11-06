import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const challenge: Messages['challenge'] = {
  cost: '成本',
  s: (p0) => `${arg(p0)}/秒`,
  tail: '尾延迟',
  complexity: '复杂度',
  margin: '利润率',
  devHours: '开发工时',
  errors: '错误',
  dH: (p0) => `${arg(p0)} 开发工时`,
  run: '运行',
  finish: '结束',
  rebuild: '重新搭建',
  result: '结果',
  challenges: '挑战',
  betterThanOfPlayers: (p0) => `超过 ${arg(p0)}% 的玩家`,
  passed: '通过',
  failed: '未通过',
  players: (p0) => `${arg(p0)} 名玩家`,
  provisional: '暂定结果',
  provisionalChecking: '暂定结果 · 验证中',
  verified: '已验证',
  notVerified: '未通过验证',
  provisionalOffline: '暂定结果 · 离线',
}
