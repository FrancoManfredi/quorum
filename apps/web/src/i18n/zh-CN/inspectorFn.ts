import type { Messages } from '../messages.ts'

export const inspectorFn: Messages['inspectorFn'] = {
  executions: '执行',
  coldStart: '冷启动',
  bill: '账单',
  inbound: '入站',
  s: (p0) => `${p0}/秒`,
  uses: '用量',
  standingBurn: '固定支出',
  oneExecutionHoldsTheRequest: (cap) =>
    `一次执行会在运行期间一直占用请求，同一时间最多 ${cap} 个。超过上限后服务商会限流：请求会被丢弃，而不是排队。`,
  inFlight: (used, total) => `${used} / ${total} 正在执行`,
  aNewEnvironmentBoots: (coldStart) =>
    `代码运行前会先启动新的执行环境：此技术栈需要 ${coldStart}。空闲的函数会失去它的环境，因此零星流量比稳定流量更频繁地付出这笔代价。`,
  changeTheRuntime: '在技术栈中更换运行时，可用冷启动换取吞吐量。',
  noBoxToPayFor: (perThousandRequests, perGbSecond, gigabytes) =>
    `没有需要付费的主机：空闲时什么都不运行。每次使用按每 1,000 次请求 ${perThousandRequests} 加每 GB 秒 ${perGbSecond} 计费，每次执行占用 ${gigabytes} GB，计入账单的“请求”项。`,
  thisUse: (cost) => `本次用量：${cost}/秒`,
}
