import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const inspectorShared: Messages['inspectorShared'] = {
  runtime: '运行时',
  proposed: '提议',
  researchToUnlock: (p0) => `研究${arg(p0)}以解锁`,
  poolSize: '池大小',
  fewerWorkers: '减少工作进程',
  moreWorkers: '增加工作进程',
  rAMFits: (p0) => `RAM 可容纳 ${arg(p0)}`,
  framework: '框架',
  processManager: '进程管理器',
  recycleWorkers: '回收 worker',
  off: '关闭',
  everyFewHours: '每隔数小时',
  pmMaxRequestsAndWorkerKillers:
    'pm.max_requests 和 worker 回收器会时不时重启每个进程。内存泄漏不会累积，每次重启都从冷状态开始。',
  compression: '压缩',
  service: '服务',
  engine: '引擎',
  connectionsPostgresForksAProcessFor: (p0) =>
    `${arg(p0)} 个连接：Postgres 为每个连接创建一个进程，MySQL 为每个连接分配一个线程。`,
  regions: '区域',
  one: '单个',
  spread: '分散',
  hotKeys: '热点键',
  oneShard: '单分片',
  split: '拆分',
}
