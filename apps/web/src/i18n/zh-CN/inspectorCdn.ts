import type { Messages } from '../messages.ts'

export const inspectorCdn: Messages['inspectorCdn'] = {
  deploysAndKeys: '部署与键',
  keepUntilTheTTL: '保留到 TTL',
  purgeOnDeploy: '部署时清除',
  aDeployEmptiesTheCacheThe: '部署会清空缓存:重新填充期间源站承接未命中。',
  afterADeployTheEdgeServes: '部署后,边缘节点会在 TTL 结束前继续返回部分旧页面。',
  theKeyHoldsThePathThe: '键包含路径、查询串和 Cookie:用户之间不共享任何内容。',
}
