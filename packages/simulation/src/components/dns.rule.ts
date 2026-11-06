import {
  type ComponentRule,
  noConnections,
  noProbe,
  passOn,
  relay,
  unlimited,
} from '../rule-kit.ts'

export const dnsRule: ComponentRule = {
  model: unlimited(0, 0),
  serve: passOn,
  outcome: relay,
  connections: noConnections,
  probe: noProbe,
}
