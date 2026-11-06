import { certNodes } from '../lookups.ts'
import { failed } from '../distribution.ts'
import {
  type ComponentRule,
  noConnections,
  noProbe,
  passOn,
  relay,
  unlimited,
} from '../rule-kit.ts'

export const usersRule: ComponentRule = {
  model: unlimited(30, 0),
  serve: passOn,
  // An expired certificate: every browser refuses the site until it is renewed.
  outcome: (answer, node, kind) =>
    (answer.game.incident?.kind === 'certificate' && certNodes(answer.game).length === 0) ||
    answer.game.incident?.kind === 'bgp'
      ? failed('down')
      : relay(answer, node, kind),
  connections: noConnections,
  probe: noProbe,
}
