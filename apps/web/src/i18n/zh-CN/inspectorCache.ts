import type { Messages } from '../messages.ts'

export const inspectorCache: Messages['inspectorCache'] = {
  cache: '缓存',
  aWriteReturnsFromTheCache: '写入由缓存返回，稍后才到达数据库。崩溃会丢失尚未刷盘的数据。',
  everyWriteGoesToTheCache: '每次写入同时进入缓存和数据库：更及时，写入更慢。',
  readsComeFromTheCacheWrites: '读取来自缓存，写入绕过缓存。未命中时可能把旧行存到 TTL 到期。',
  everyMiss: '每次未命中',
  coalesce: '合并请求',
  expireOnTheTTL: '按 TTL 过期',
  refreshEarly: '提前刷新',
  missOnExpiry: '过期即未命中',
  staleWhileRevalidating: '重新验证时返回旧值',
  coldStart: '冷启动',
  warmStart: '热启动',
}
