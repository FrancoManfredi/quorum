import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: '上限',
  edgeCache: '边缘缓存',
  inbound: '入站',
  s: (p0) => `${p0}/秒`,
  latency: '延迟',
  cPUCeiling: 'CPU 上限',
  stack: '技术栈',
  uses: '用量',
  standingBurn: '固定支出',
  aHandlerRunsIn: (memory, cpu) =>
    `处理程序在 ${memory} MB 的隔离环境中运行，每个请求最多可使用 ${cpu} 的 CPU。超过上限的请求会因超时而失败，因此占用大量 CPU 的类型应放在应用服务器上。`,
  thisStackCompilesToTheEdge:
    '此技术栈可编译到边缘：JavaScript、TypeScript、Rust 或 Go 编译为 WebAssembly。',
  cannotRunAtTheEdge: (stack) => `${stack} 无法在边缘运行。请把技术栈迁移到 Node.js、Rust 或 Go。`,
  aUserInItsRegion: (hop, hit) =>
    `其所在区域的用户 ${hop} 即可访问到它，因此这一跳止于该区域的边缘，而不是回到源站的往返。请在每个有用户需要的区域各放一个。运行中的边缘函数的键值缓存还能让 CDN 在边缘直接应答 ${hit}% 的读取。`,
  cannotRunHere: (stack) => `${stack} 无法在此运行`,
}
