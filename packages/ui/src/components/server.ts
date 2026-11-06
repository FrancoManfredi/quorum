import { Server } from 'lucide'
import { FRAMEWORKS, RUNTIMES } from '@quorum/simulation/catalog'
import { type ComponentView } from './shared.ts'

export const server: ComponentView = {
  icon: Server,
  layout: { rows: 5, inRow: 0, outRow: 4, footer: true },
  rows: ({ node, inbound, capacity, latency, out }) => {
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
      latency,
      out,
    ]
  },
}
