import { expect, test } from 'vitest'
import { COMPONENT_IDS, COMPONENTS } from '@quorum/simulation/catalog'
import { COMPONENT_VIEWS } from './index.ts'

/*
 * A card draws an in port only when the Component can take a Link, and an out port only when it
 * can send one. The Database is the one exception: its out port ships the write log to a CDC.
 */
test('every card shows only the ports its Component can use', () => {
  for (const id of COMPONENT_IDS) {
    const def = COMPONENTS[id]
    const layout = COMPONENT_VIEWS[id].layout
    const takes = def.accepts.length > 0 || def.tap || def.mirror || def.control
    const sends = def.sends.length > 0 || id === 'database'
    expect(layout.inRow !== null, `${id} in`).toBe(takes)
    expect(layout.outRow !== null, `${id} out`).toBe(sends)
    if (layout.inRow !== null) expect(layout.inRow).toBeLessThan(layout.rows)
    if (layout.outRow !== null) expect(layout.outRow).toBeLessThan(layout.rows)
  }
})
