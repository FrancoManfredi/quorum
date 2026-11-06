import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { COMPONENT_IDS } from '../src/catalog.ts'

/*
 * The layout of "one file per Component": each id has a data file, `components/<id>.ts`, and a
 * rule file, `components/<id>.rule.ts`. The data file is imported by the catalog, so it must not
 * import anything that imports the catalog back (the solver, the lookups, the state): that is an
 * import cycle, and it crashes at load.
 */

const dir = new URL('../src/components/', import.meta.url)
const read = (name: string) => readFileSync(new URL(name, dir), 'utf8')
const importsOf = (text: string) =>
  [...text.matchAll(/^import (type )?[^']*from '([^']+)'/gm)].map(
    (match) => [Boolean(match[1]), match[2] ?? ''] as const,
  )

test('every Component has a data file and a rule file', () => {
  for (const id of COMPONENT_IDS) {
    expect(existsSync(new URL(`${id}.ts`, dir)), `${id}.ts`).toBe(true)
    expect(existsSync(new URL(`${id}.rule.ts`, dir)), `${id}.rule.ts`).toBe(true)
  }
  const files = readdirSync(dir).filter(
    (name) => !/^(define|defs|fields|index|rules)\.ts$/.test(name),
  )
  expect(files.length).toBe(COMPONENT_IDS.length * 2)
})

test('a data file imports only data: effect, the catalog, and types from the state', () => {
  for (const id of COMPONENT_IDS) {
    for (const [type, spec] of importsOf(read(`${id}.ts`))) {
      const allowed =
        spec === 'effect' ||
        spec.startsWith('../catalog') ||
        spec === './define.ts' ||
        (type && spec === '../state.ts')
      expect(allowed, `${id}.ts imports ${spec}`).toBe(true)
    }
  }
})

test('no Component imports another, except a Read Replica reusing the Database rule', () => {
  const names = new Set<string>(COMPONENT_IDS)
  for (const id of COMPONENT_IDS) {
    for (const file of [`${id}.ts`, `${id}.rule.ts`]) {
      for (const [, spec] of importsOf(read(file))) {
        const other = /^\.\/([a-z0-9]+)(\.rule)?\.ts$/.exec(spec)?.[1]
        if (!other || !names.has(other) || other === id) continue
        const own = other === 'database' && id === 'replica' && file === 'replica.rule.ts'
        expect(own, `${file} imports ${spec}`).toBe(true)
      }
    }
  }
})
