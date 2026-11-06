import type { Messages } from '../messages.ts'

export const inspectorServer: Messages['inspectorServer'] = {
  feeds: '信息流',
  pull: '拉取',
  push: '推送',
  collector: '采集器',
  dropEvenly: '均匀丢弃',
  shedLowValue: '丢弃低价值流量',
  keepKinds: '保留类型',
  dropDearest: '先丢弃最贵的',
  readsAnywhere: '任意节点读取',
  readYourWrites: '读己之写',
  overload: '过载',
}
