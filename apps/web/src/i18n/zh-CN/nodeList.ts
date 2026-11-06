import type { Messages } from '../messages.ts'

export const nodeList: Messages['nodeList'] = {
  nodes: '节点',
  s: (p0) => `${p0}/秒`,
  sizes: {
    nano: 'nano',
    micro: 'micro',
    small: '小型',
    medium: '中型',
    large: '大型',
    xlarge: '超大型',
    '2xlarge': '2xlarge',
    '4xlarge': '4xlarge',
    metal: 'metal',
    custom: '自定义',
  },
  sizeStep: (step) => `规格 ${step}`,
  noLoad: '无负载',
  down: '宕机',
}
