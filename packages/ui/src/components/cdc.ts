import { TowerControl } from 'lucide'
import { compact } from '../game/format.ts'
import { type ComponentView } from './shared.ts'

export const cdc: ComponentView = {
  icon: TowerControl,
  // It reads a Database and publishes to a Stream: one port each way. It has one size, so it has
  // no resize footer to click.
  layout: { rows: 4, inRow: 0, outRow: 3, footer: false },
  // It copies a Database's writes to an Event Stream: its lag is the stream's backlog.
  rows: ({ inbound, game, node, ledger, capacity, out }) => {
    const stream = game.nodes.find(
      (entry) =>
        entry.type === 'log' &&
        game.links.some((link) => link.from === node.id && link.to === entry.id),
    )
    const backlog = stream?.depth ?? 0
    const read = stream ? (ledger.nodes[stream.id]?.out.task ?? 0) : 0
    const behind = read > 0 ? backlog / read : 0
    return [
      { ...inbound, name: 'Changes' },
      capacity,
      {
        glyph: 'lag',
        name: 'Lag',
        value: stream ? (backlog < 1 ? 'none' : `${compact(Math.round(behind))} s`) : 'no stream',
        tone: stream === undefined ? 'warn' : behind > (stream.retain ?? 0) ? 'danger' : 'plain',
      },
      out,
    ]
  },
}
