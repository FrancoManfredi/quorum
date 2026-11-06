import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorUsers: Messages['inspectorUsers'] = {
  requests: '请求',
  sOk: (p0, p1, p2) => `${arg(p0)}/秒 · ${arg(p1)} 成功${arg(p2)}`,
  errorsByCause: '按原因分类的错误',
  s: (p0) => `${arg(p0)}/秒`,
  users: '用户',
  market: '市场',
  apdexNow: '当前 Apdex',
  apdexLastHour: '过去一小时的 Apdex',
  velocity: '开发速度',
}
