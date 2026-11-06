import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorMesh: Messages['inspectorMesh'] = {
  sidecars: '边车',
  linkAppServersOrWorkersInto: '把应用服务器或工作进程连接到它。目前还没有服务在网格下。',
  mutualTLSSitsOnEveryMember: '成员之间的每次调用都有双向 TLS。这是属性，不是数字。',
  perHop: '每跳',
  memberCPU: '成员 CPU',
  insight: '洞察',
  onItsLinks: (p0) => `在链路上 +${arg(p0)}`,
  platform: '平台',
  engineers: (p0) => `${arg(p0)} 名工程师`,
  burn: '支出',
  s: (p0) => `${arg(p0)}/秒`,
}
