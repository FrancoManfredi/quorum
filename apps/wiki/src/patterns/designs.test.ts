import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import { solveFlow } from '@quorum/simulation/solve'
import { boxOf, crowds } from '@quorum/ui/board/geometry'
import { DESIGNS } from './designs/index.ts'

/* The Patterns section's contract with the game: every Design is a Board the Simulation can solve, its
   settings are fields the game has, and a page places each one. */

const entries = Object.entries(DESIGNS)

test('every Design solves, links existing Nodes, and keeps its cards apart', () => {
  const bad: Array<string> = []
  for (const [id, design] of entries) {
    const nodes = design.game.nodes
    const ids = new Set(nodes.map((node) => node.id))
    for (const link of design.game.links)
      if (!ids.has(link.from) || !ids.has(link.to))
        bad.push(`${id}: link ${link.from} → ${link.to}`)
    for (const node of nodes)
      for (const other of nodes)
        if (node.id < other.id && crowds(boxOf(node), boxOf(other)))
          bad.push(`${id}: ${node.id} overlaps ${other.id}`)
    for (const node of design.nodes)
      for (const setting of node.settings)
        if (!(setting.field in (nodes.find((n) => n.id === node.id) ?? {})))
          bad.push(`${id}: ${node.id} has no field ${setting.field}`)
    for (const link of design.links)
      for (const setting of link.settings)
        if (!(setting.field in (design.game.links[0] ?? {})))
          bad.push(`${id}: link has no field ${setting.field}`)
    expect(Number.isFinite(solveFlow(design.game).apdex), id).toBe(true)
  }
  expect(bad).toEqual([])
})

test('every Design is placed on a Patterns page', () => {
  const dir = join(import.meta.dirname, '../../content/patterns')
  const text = readdirSync(dir)
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n')
  expect(entries.map(([id]) => id).filter((id) => !text.includes(`::Design{id="${id}"}`))).toEqual(
    [],
  )
})
