import { COMPONENTS } from './catalog.ts'
import type { Game, GameNode } from './state.ts'

/** A Node's Component name and its ordinal, or 0 when the Design has one of its kind. */
export const nodeLabelOf = (
  game: Game,
  node: GameNode,
): Readonly<{ name: string; ordinal: number }> => {
  const name = COMPONENTS[node.type].name
  // Fixed Nodes are unique by design: Users per region and the Payments drawer.
  if (COMPONENTS[node.type].fixed) return { name, ordinal: 0 }
  const same = game.nodes.filter((entry) => entry.type === node.type)
  // A lone first Node keeps the clean name; a later Node keeps its number even
  // after its siblings are sold, so old notes and postmortems still resolve.
  if (same.length < 2 && node.ordinal <= 1) return { name, ordinal: 0 }
  const ordinal = node.ordinal > 0 ? node.ordinal : same.indexOf(node) + 1
  return { name, ordinal }
}

/** A Node's label, such as "App Server 3", or just its Component name when it is alone. */
export const nodeLabel = (game: Game, node: GameNode): string => {
  const label = nodeLabelOf(game, node)
  return label.ordinal > 0 ? `${label.name} ${label.ordinal}` : label.name
}

/** Each Node's ordinal to draw beside its card, or 0 when its kind is alone. */
export const nodeOrdinals = (game: Game): Readonly<Record<string, number>> =>
  Object.fromEntries(game.nodes.map((node) => [node.id, nodeLabelOf(game, node).ordinal] as const))

/** The next ordinal for a Component kind: the highest used so far, plus one. */
export const nextOrdinal = (game: Game, type: GameNode['type']): number => {
  const same = game.nodes.filter((node) => node.type === type)
  const highest = Math.max(0, ...same.map((node) => node.ordinal))
  return highest > 0 ? highest + 1 : same.length + 1
}

/**
 * Fills in ordinals for Nodes that do not have one yet. Old saves decode every
 * Node at 0, so the first load assigns 1..N by Component in the saved order.
 * Once assigned, a Node keeps its ordinal for the rest of the Company.
 */
export const normalizeOrdinals = (game: Game): Game => {
  const next = new Map<GameNode['type'], number>()
  let changed = false
  const nodes = game.nodes.map((node) => {
    const highest = next.get(node.type) ?? 0
    if (node.ordinal > 0) {
      if (node.ordinal > highest) next.set(node.type, node.ordinal)
      return node
    }
    const ordinal = highest + 1
    next.set(node.type, ordinal)
    changed = true
    return { ...node, ordinal }
  })
  return changed ? { ...game, nodes } : game
}
