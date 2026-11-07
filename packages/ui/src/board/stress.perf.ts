import { bottleneckOf, solveFlow } from '@quorum/simulation/solve'
import { zoned } from '@quorum/simulation/lookups'
import type { Game } from '@quorum/simulation/state'
import { step } from '@quorum/simulation/step'
import { CARD_W, heightOf } from './geometry.ts'
import { routeLinks, type RoutedLink } from './routing.ts'
import { BIG_LINKS, STRESS_LINKS, bigBoard, bigNodes, stressBoard, stressNodes } from './stress.ts'
import { tidy } from './tidy.ts'

/*
 * The stress harness: what the stress boards cost outside of drawing. The big board
 * (61 Nodes, 279 Links) is a player's screenshot. Routing runs on every change to the
 * Design; a tick owes the time it took, so at 10× it steps ten sim seconds, and the
 * Bottleneck search runs once per sim second. After the timings it prints how Tidy lays
 * out each stress board: line hops where links cross, back links (a target not right of
 * its source), and the size of the result.
 *
 *   pnpm --filter @quorum/web stress
 *
 * Plain Node, not Vitest: Vitest's module runner puts a getter on every import, which
 * adds more to these hot loops than the code they measure. CI does not run it.
 */

const time = (name: string, run: () => void, samples = 30): void => {
  for (let index = 0; index < 3; index += 1) run()
  const times: Array<number> = []
  for (let index = 0; index < samples; index += 1) {
    const start = performance.now()
    run()
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  const at = (share: number) => (times[Math.floor(share * (times.length - 1))] as number).toFixed(2)
  console.log(`${name.padEnd(36)} median ${at(0.5).padStart(8)} ms   p90 ${at(0.9).padStart(8)} ms`)
}

const stress = stressNodes()
const nodes = bigNodes()
time('routeLinks, stress board (16 Nodes)', () => routeLinks(stress, STRESS_LINKS))
time('routeLinks, big board (61 Nodes)', () => routeLinks(nodes, BIG_LINKS), 10)

let game = bigBoard()
for (let index = 0; index < 50; index += 1) game = step(game, 0.1).game
const flow = solveFlow(game)
// A fresh Game object each time, so the per-Game cache does not answer.
time('solveFlow, big board', () => solveFlow({ ...game }))
time('step, big board', () => step({ ...game }, 0.1))
time('bottleneckOf, big board', () => bottleneckOf(game, flow), 10)

const tidied = (name: string, board: Game, links: ReadonlyArray<RoutedLink>): void => {
  const nodes = board.nodes.map((node) => ({ ...node, group: zoned(node) ? node.zone : 'all' }))
  time(`tidy, ${name}`, () => tidy(nodes, links, ['all', 'a', 'b', 'c']))
  const spots = tidy(nodes, links, ['all', 'a', 'b', 'c'])
  const placed = nodes.map((node) => ({ ...node, ...spots.get(node.id) }))
  const at = new Map(placed.map((node) => [node.id, node]))
  const hops = [...routeLinks(placed, links).values()].reduce(
    (sum, wire) => sum + wire.tunnels.length,
    0,
  )
  const back = links.filter((link) => at.get(link.to)!.x <= at.get(link.from)!.x).length
  const width =
    Math.max(...placed.map((node) => node.x + CARD_W)) - Math.min(...placed.map((node) => node.x))
  const height =
    Math.max(...placed.map((node) => node.y + heightOf(node.type))) -
    Math.min(...placed.map((node) => node.y))
  console.log(`${''.padEnd(36)} ${hops} line hops, ${back} back links, ${width} × ${height} px`)
}
tidied('stress board', stressBoard(), STRESS_LINKS)
tidied('big board', bigBoard(), BIG_LINKS)
