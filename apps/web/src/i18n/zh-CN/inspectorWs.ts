import type { Messages } from '../messages.ts'

export const inspectorWs: Messages['inspectorWs'] = {
  runtime: '运行时',
  holdsNoConnectionsPickARuntime: (p0) => `${p0} 无法保持连接。请选择可保持连接的运行时。`,
  holdsAboutConnections: (p0) => `约可保持 ${p0} 个连接。`,
  clients: '客户端',
  noPresence: '无在线状态',
  presence: '在线状态',
  reconnectAtOnce: '立即重连',
  backoffWithJitter: '带抖动的退避',
  oneBox: '单台主机',
  clustered: '集群',
  boxesShareAPubSubBackbone: '各主机共享 pub/sub 总线，因此每个档位都会增加容量。',
  oneBoxTakesEveryConnectionLarger: '单台主机承担所有连接：更大的档位只增加成本，不增加容量。',
  connections: '连接数',
  messages: '消息',
  s: (p0) => `${p0}/秒`,
  latency: '延迟',
  dropped: '已丢弃',
  burn: '支出',
}
