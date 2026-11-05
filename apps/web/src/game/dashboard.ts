import { Schema } from 'effect'
import type { Update } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { REQUEST_KINDS } from '@quorum/simulation/catalog'
import { Region } from '@quorum/simulation/state'
import { AnnotationGroup, type Dashboard } from './model.ts'

/* The Dashboard panel's time range, crosshair, Postmortem, annotation groups, compare line,
   table view, and its Request kind and Region filters, folded into the parent with foldChild. */

export const DashboardMessage = defineMessageUnion({
  RangeChosen: { minutes: Schema.Finite },
  /** The crosshair moved onto a Sample, or off the chart. Sent on every pointer move. */
  Hovered: { index: Schema.NullOr(Schema.Finite) },
  /** A Postmortem row was chosen, or the one shown was chosen again. It reads the Game; it changes none. */
  PostmortemChosen: { id: Schema.NullOr(Schema.Finite) },
  /** A group of marks was hidden or shown, so a change in a Chart reads without its noise. */
  GroupToggled: { group: AnnotationGroup },
  /** Yesterday's line was drawn or taken away (12 "Controls"). */
  CompareToggled: {},
  /** Each Chart shows its values as a table, or its plot again (12 "Controls"). */
  TableToggled: {},
  /** A Request kind narrows every per-kind panel; null for all of them. */
  KindChosen: { kind: Schema.NullOr(Schema.Literals(REQUEST_KINDS)) },
  /** A Service narrows every per-kind panel to the kinds its Features touch; null for all of them. */
  ServiceChosen: { service: Schema.NullOr(Schema.String) },
  /** A region narrows every per-region panel; null for all of them. */
  RegionChosen: { region: Schema.NullOr(Region) },
})
export type DashboardMessage = typeof DashboardMessage.Type

export const updateDashboard = (
  dashboard: Dashboard,
  message: DashboardMessage,
): Update.Return<Dashboard, DashboardMessage> =>
  DashboardMessage.match<Update.Return<Dashboard, DashboardMessage>>(message, {
    RangeChosen: ({ minutes }) => ({ model: { ...dashboard, range: minutes, hover: null } }),
    Hovered: ({ index }) => ({ model: { ...dashboard, hover: index } }),
    PostmortemChosen: ({ id }) => ({
      model: { ...dashboard, postmortem: dashboard.postmortem === id ? null : id },
    }),
    GroupToggled: ({ group }) => ({
      model: {
        ...dashboard,
        groups: dashboard.groups.includes(group)
          ? dashboard.groups.filter((entry) => entry !== group)
          : [...dashboard.groups, group],
      },
    }),
    CompareToggled: () => ({ model: { ...dashboard, compare: !dashboard.compare } }),
    TableToggled: () => ({ model: { ...dashboard, table: !dashboard.table } }),
    KindChosen: ({ kind }) => ({ model: { ...dashboard, kind } }),
    ServiceChosen: ({ service }) => ({ model: { ...dashboard, service } }),
    RegionChosen: ({ region }) => ({ model: { ...dashboard, region } }),
  })
