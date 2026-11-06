import { readFileSync } from 'node:fs'
import { Schema } from 'effect'
import { expect, test } from 'vitest'
import { COMPONENT_IDS, COMPONENTS, DOCK_OF } from '../src/catalog.ts'
import { node } from '../src/company.ts'
import { RULES } from '../src/rules.ts'
import { GameNode } from '../src/state.ts'

/*
 * The migration guard for "one file per Component": what a Component is must not move while its
 * code moves between files. `test/fixtures/components.json` holds what the catalog said before.
 */

const view = () => ({
  ids: COMPONENT_IDS,
  components: COMPONENTS,
  dock: DOCK_OF,
  ruleKeys: Object.keys(RULES),
  // The wire order of a Node's saved fields: the golden hashes were taken with it (hash.ts).
  wire: Object.fromEntries(
    COMPONENT_IDS.map((id) => [id, Object.keys(Schema.encodeSync(GameNode)(node(id, id, 0, 0)))]),
  ),
})

test('the catalog, the rules, and the saved fields are what they were', () => {
  const before = JSON.parse(
    readFileSync(new URL('fixtures/components.json', import.meta.url), 'utf8'),
  )
  expect(JSON.parse(JSON.stringify(view()))).toEqual(before)
})
