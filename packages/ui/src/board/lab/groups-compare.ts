import { BIG_LINKS, STRESS_LINKS, bigBoard, stressBoard } from '../stress.ts'
import { groupedLayout } from './groups.ts'
import { measure, nodesOf } from './measure.ts'
import { layout } from './pipeline.ts'
import { roleLayout } from './roles.ts'
for (const [name, board, links] of [
  ['stress', stressBoard(), STRESS_LINKS],
  ['big', bigBoard(), BIG_LINKS],
] as const) {
  const nodes = nodesOf(board)
  const variants = [
    ['current', () => layout(nodes, links, ['all', 'a', 'b', 'c'], { name: 'current' })],
    [
      'flat-zone',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'flat-zone',
          bands: 'flat',
          initial: 'zone',
        }),
    ],
    [
      'clusters-columns',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters',
          bands: 'clusters-columns',
        }),
    ],
    [
      'clusters-dynamic',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters-dynamic',
          bands: 'clusters-columns',
          lanes: 'dynamic',
        }),
    ],
    [
      'clusters-type',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters-type',
          bands: 'clusters-columns',
          initial: 'type',
        }),
    ],
    [
      'clusters-bridge',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters-bridge',
          bands: 'clusters-columns',
          lanes: 'bridge',
        }),
    ],
    [
      'clusters-bridge-type',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters-bridge-type',
          bands: 'clusters-columns',
          lanes: 'bridge',
          initial: 'type',
        }),
    ],
    [
      'clusters-dyn-type',
      () =>
        layout(nodes, links, ['all', 'a', 'b', 'c'], {
          name: 'clusters-dyn-type',
          bands: 'clusters-columns',
          lanes: 'dynamic',
          initial: 'type',
        }),
    ],
    ['grouped', () => groupedLayout(nodes, links)],
    ['roles', () => roleLayout(nodes, links)],
  ] as const
  for (const [label, run] of variants) {
    const spots = run()
    const m = measure(nodes, links, spots)
    console.log(
      `${name.padEnd(6)} ${label.padEnd(17)} crossings ${String(m.crossings).padStart(5)} hops ${String(m.hops).padStart(5)} back ${String(m.back).padStart(3)} ${m.width}×${m.height} area ${Math.round((m.width * m.height) / 1000)}k detour ${m.detour} moved ${m.moved}`,
    )
  }
}
