import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const pools: Messages['pools'] = {
  insightName: (p0) => `${arg(p0)} connaissances`,
}
