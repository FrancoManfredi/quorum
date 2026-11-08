import { CDC_CHANGES, CDC_RATE, CDC_MS, DATA_TEAM_LAG } from '../catalog.ts'
import { dataStaffed } from '../team.ts'
import { flatModel } from '../capacity.ts'
import { flatScale } from '../lookups.ts'
import { type ComponentRule, noConnections, noProbe, relay } from '../rule-kit.ts'

// It reads a Database's write log and publishes every change to an Event Stream (05 "CDC
// Connector"). The changes come in as a copy of the Database's writes, so it never takes the
// app's traffic; it hands them on as `task`, one change each.
export const cdcRule: ComponentRule = {
  model: (solver, node, arriving) =>
    flatModel(
      CDC_RATE * flatScale(node),
      arriving,
      // A Data team owns the pipelines, and a pipeline has half the lag with one (08 "Teams").
      { fixedMs: CDC_MS * (dataStaffed(solver.game) ? DATA_TEAM_LAG : 1), variableMs: 0.05 },
      solver.boost(node),
    ),
  serve: (serve, node, rates, share) => {
    let changes = 0
    for (const kind of CDC_CHANGES) changes += (rates[kind] ?? 0) * share
    if (changes > 0) serve.route('task', changes)
  },
  // The change waits for the connector's own hop and then for the stream: a consumer further
  // behind than the retention window loses the oldest changes, as a stale copy.
  outcome: (answer, node, kind) => relay(answer, node, kind),
  connections: noConnections,
  probe: noProbe,
}
