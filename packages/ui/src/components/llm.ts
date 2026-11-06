import { Sparkles } from 'lucide'
import { type ComponentView } from './shared.ts'

export const llm: ComponentView = {
  icon: Sparkles,
  layout: { rows: 3, inRow: 0, outRow: null, footer: true },
  rows: ({ inbound, capacity, latency }) => {
    return [{ ...inbound, name: 'Prompts' }, capacity, latency]
  },
}
