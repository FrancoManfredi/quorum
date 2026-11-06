import { Cog } from 'lucide'
import { FRAMEWORKS, RUNTIMES } from '@quorum/simulation/catalog'
import { type ComponentView } from './shared.ts'

export const worker: ComponentView = {
  icon: Cog,
  layout: { rows: 4, inRow: 0, outRow: 3, footer: true },
  rows: ({ node, inbound, capacity, out }) => {
    const runtime = RUNTIMES[node.runtime]
    const framework = node.framework === 'none' ? null : node.framework
    return [
      inbound,
      capacity,
      {
        glyph: 'stack',
        logo: runtime.language,
        name: runtime.name,
        value: framework ? FRAMEWORKS[framework].name : '—',
        ...(framework ? { valueLogo: framework } : { tone: 'muted' }),
      },
      out,
    ]
  },
}
