import type { Messages } from '../messages.ts'

export const pools: Messages['pools'] = {
  insightName: (p0: string | number | null) => `Conocimiento de ${p0}`,
}
