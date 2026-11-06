import { STALE_AFTER_DEPLOY } from '../catalog.ts'
import { answered, blend, through } from '../distribution.ts'
import {
  type ComponentRule,
  cdnHitOf,
  each,
  noConnections,
  noProbe,
  relay,
  unlimited,
} from '../rule-kit.ts'

export const cdnRule: ComponentRule = {
  model: unlimited(8, 0),
  serve: (serve, node, rates, share) => {
    const { game } = serve.solver
    serve.setHits(cdnHitOf(node, 'page', game), 0)
    each(rates, share, (kind, processed) =>
      serve.route(kind, processed * (1 - cdnHitOf(node, kind, game))),
    )
  },
  // A hit is answered at the edge; a miss goes on to the origin.
  outcome: (answer, node, kind) => {
    const hit = cdnHitOf(node, kind, answer.game)
    if (hit <= 0) return relay(answer, node, kind)
    // Without a purge, pages cached before the deploy are served until their TTL passes.
    const old = kind === 'page' && answer.game.time < node.staleUntil ? STALE_AFTER_DEPLOY : 0
    const mixed = blend([
      [{ ...answered(0, 0), stale: old }, hit],
      [answer.downstream(kind), 1 - hit],
    ])
    return through(answer.ownHop(kind), mixed ? [[mixed, 1]] : [])
  },
  connections: noConnections,
  probe: noProbe,
}
