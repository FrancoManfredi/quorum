import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const tradeoff: Messages['tradeoff'] = {
  sixAxesNowAndWithThis: '六项指标：当前状态与此选项的对比',
  cancelEscape: '取消（Esc）',
  migrationDHAcrossAllAppServers: (p0) =>
    `迁移所有应用服务器需要 ${arg(p0)} DH。功能开发会减慢，逐步上线可能暴露错误。开始后，请在团队中管理工作并切换流量。`,
  confirmEnter: '确认（Enter）',
  startMigration: '开始迁移',
  confirm: '确认',
  cancel: '取消',
  runtime: '运行时',
  framework: '框架',
  instance: '实例',
  throughput: '吞吐量',
  tail: '尾延迟',
  memory: '内存',
  velocity: '开发速度',
  resilience: '韧性',
  operability: '可运维性',
  processPerRequest: '每个请求一个进程',
  sharedNothing: '无共享架构',
  coldStart: '冷启动',
  eventLoop: '事件循环',
  blastRadius: '影响范围',
  horizontalScaling: '水平扩展',
  techDebt: '技术债',
  n1Query: 'N+1 查询',
}
