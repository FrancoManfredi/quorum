import type { ComponentId, IncidentId, RequestKind, ResearchId } from '@quorum/simulation/catalog'
import { company, link, node } from '@quorum/simulation/company'
import { heightOf } from '@quorum/ui/board/geometry'
import { normalizeOrdinals } from '@quorum/simulation/labels'
import type { Game, GameLink, GameNode } from '@quorum/simulation/state'

/* ==========================================================================
   A Pattern Design: a small Board a page draws on the game's own canvas.
   The Nodes' and Links' settings are written once, here, and the page's
   settings table is read back from the same objects, so the picture, the
   table and the Simulation cannot disagree.
   ========================================================================== */

/** One setting on a Node or Link: the field it sets, how the table names it, and why. */
export type Setting = Readonly<{
  field: string
  value: unknown
  label: string
  why: string
}>

export const set = <K extends keyof GameNode>(
  field: K,
  value: GameNode[K],
  label: string,
  why: string,
): Setting => ({ field, value, label, why })

export const setLink = <K extends keyof GameLink>(
  field: K,
  value: GameLink[K],
  label: string,
  why: string,
): Setting => ({ field, value, label, why })

export type NodeSpec = Readonly<{
  id: string
  type: ComponentId
  x: number
  y: number
  settings: ReadonlyArray<Setting>
}>

export type LinkSpec = Readonly<{
  from: string
  to: string
  settings: ReadonlyArray<Setting>
}>

/** A Node on the Board, at a column and row of the grid the cards sit on. */
export const at = (
  id: string,
  type: ComponentId,
  column: number,
  row: number,
  settings: ReadonlyArray<Setting> = [],
): NodeSpec => ({ id, type, x: column * 276, y: row * 220, settings })

export const wire = (
  from: string,
  to: string,
  settings: ReadonlyArray<Setting> = [],
): LinkSpec => ({ from, to, settings })

export type DesignDef = Readonly<{
  /** Users while the Design is solved. */
  users: number
  /** The Era index whose request mix the Design runs. */
  stage: number
  /** Research the Design owns, besides the starting three. */
  researched: ReadonlyArray<ResearchId>
  /**
   * The kinds Users send, by weight, instead of the Era's mix. A Design that has no Node for a
   * kind (no Payment Provider for `buy`) leaves it out, so its errors are the lesson's.
   */
  mix?: Partial<Record<RequestKind, number>>
  /** One sentence under the caption, for what a steady-state solve cannot show. */
  note?: string
  /** An incident running on a Node while the Design is solved, for a pattern that only matters then. */
  incident?: Readonly<{ kind: IncidentId; node: string }>
  nodes: ReadonlyArray<NodeSpec>
  links: ReadonlyArray<LinkSpec>
}>

export type Design = DesignDef & Readonly<{ game: Game }>

const SEED = 20_261_107

const fields = (settings: ReadonlyArray<Setting>): Record<string, unknown> =>
  Object.fromEntries(settings.map((entry) => [entry.field, entry.value]))

/** The Users Node sits in column 0, and every spec's own Nodes follow it. */
/** The grid the authored positions sit on, and the packed layout that replaces it. */
const GRID_X = 276
const COLUMN = 244
const GAP = 24

/**
 * Packs each column's Nodes top to bottom with a small gap, in their authored row order, and
 * centres the columns on one another, so a Design is as small as its cards allow.
 */
const packed = (nodes: ReadonlyArray<GameNode>): ReadonlyArray<GameNode> => {
  const columns = new Map<number, Array<GameNode>>()
  for (const entry of nodes) {
    const column = Math.round(entry.x / GRID_X)
    columns.set(column, [...(columns.get(column) ?? []), entry])
  }
  const stacks = [...columns.entries()].map(([column, members]) => {
    const ordered = members.toSorted((a, b) => a.y - b.y)
    const height = ordered.reduce((sum, entry) => sum + heightOf(entry.type) + GAP, -GAP)
    return { column, ordered, height }
  })
  const tallest = Math.max(...stacks.map((stack) => stack.height))
  const placed = new Map<string, GameNode>()
  for (const stack of stacks) {
    let y = (tallest - stack.height) / 2
    for (const entry of stack.ordered) {
      placed.set(entry.id, { ...entry, x: stack.column * COLUMN, y: Math.round(y) })
      y += heightOf(entry.type) + GAP
    }
  }
  return nodes.map((entry) => placed.get(entry.id) ?? entry)
}

export const design = (def: DesignDef): Design => ({
  ...def,
  game: normalizeOrdinals({
    ...company(SEED),
    sandbox: true,
    cash: 0,
    stage: def.stage,
    users: def.users,
    researched: ['stripe', 'logs', 'metrics', ...def.researched],
    nodes: packed([
      node('users', 'users', 0, 0),
      ...def.nodes.map((spec) =>
        node(spec.id, spec.type, spec.x, spec.y, fields(spec.settings) as Partial<GameNode>),
      ),
    ]),
    links: def.links.map((spec) => ({
      ...link(spec.from, spec.to),
      ...(fields(spec.settings) as Partial<GameLink>),
    })),
    nextId: 1,
    boxes: [],
    ...(def.mix ? { scenario: { mix: def.mix } } : {}),
    incident: def.incident
      ? {
          kind: def.incident.kind,
          remaining: 600,
          nodeId: def.incident.node,
          startedAt: 0,
          baseline: 0,
          usersAtStart: def.users,
          impaired: 0,
          lostRevenue: 0,
          failed: 0,
          phase: { _tag: 'Quiet' as const },
          severity: 3,
          magnitude: 3,
          zone: null,
          region: null,
          causedBy: null,
        }
      : null,
  }),
})
