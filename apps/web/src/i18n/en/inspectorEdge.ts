export const inspectorEdge = {
  ceilings: 'Ceilings',
  edgeCache: 'Edge cache',
  inbound: 'Inbound',
  s: (p0: string | number | null) => `${p0}/s`,
  latency: 'Latency',
  cPUCeiling: 'CPU ceiling',
  stack: 'Stack',
  uses: 'Uses',
  standingBurn: 'Standing Burn',
  aHandlerRunsIn: (memory: string | number, cpu: string | number) =>
    `A handler runs in ${memory} MB of isolate and may spend ${cpu} of CPU a request. A request past the ceiling fails as a timeout, so CPU-heavy kinds belong on an App Server.`,
  thisStackCompilesToTheEdge:
    'This Stack compiles to the edge: JavaScript, TypeScript, Rust or Go to WebAssembly.',
  cannotRunAtTheEdge: (stack: string) =>
    `${stack} cannot run at the edge. Migrate the Stack to Node.js, Rust or Go.`,
  aUserInItsRegion: (hop: string | number, hit: string | number) =>
    `A user in its region reaches it in ${hop}, so the hop is the region’s edge and not a round trip to the origin. Place one in each region whose users need it. A live Edge Function’s key-value cache also lets a CDN answer ${hit}% of reads at the edge.`,
  cannotRunHere: (stack: string) => `${stack} cannot run here`,
}
