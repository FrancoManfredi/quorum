import type { Messages } from '../messages.ts'

export const inspectorEdge: Messages['inspectorEdge'] = {
  ceilings: 'Techos',
  edgeCache: 'Caché del edge',
  inbound: 'Entrada',
  s: (p0: string | number | null) => `${p0}/s`,
  latency: 'Latencia',
  cPUCeiling: 'Techo de CPU',
  stack: 'Stack',
  uses: 'Uso',
  standingBurn: 'Gasto base',
  aHandlerRunsIn: (memory: string | number, cpu: string | number) =>
    `Un handler corre en ${memory} MB de isolate y puede gastar ${cpu} de CPU por petición. Una petición por encima del techo falla como timeout, así que los tipos que consumen mucha CPU van en un servidor de aplicaciones.`,
  thisStackCompilesToTheEdge:
    'Este stack compila al edge: JavaScript, TypeScript, Rust o Go a WebAssembly.',
  cannotRunAtTheEdge: (stack: string) =>
    `${stack} no puede ejecutarse en el edge. Migra el stack a Node.js, Rust o Go.`,
  aUserInItsRegion: (hop: string | number, hit: string | number) =>
    `Un usuario en su región lo alcanza en ${hop}, así que el salto es el edge de la región y no un viaje de ida y vuelta al origen. Coloca uno en cada región cuyos usuarios lo necesiten. La caché clave-valor de una función edge activa también permite que un CDN responda el ${hit}% de las lecturas en el edge.`,
  cannotRunHere: (stack: string) => `${stack} no puede ejecutarse aquí`,
}
