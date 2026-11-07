import type { Messages } from '../messages.ts'

export const pools: Messages['pools'] = {
  insightName: (value) => `${value}のインサイト`,
}
