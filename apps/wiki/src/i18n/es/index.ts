import type { Messages } from '../messages.ts'
import { chrome } from './chrome.ts'
import { islands } from './islands.ts'
import { options } from './options.ts'
import { reference } from './reference.ts'

/** The wiki's Spanish copy. Typed as `Messages`, the shape English defines, so a missing key fails typecheck. */
export const es: Messages = { ...chrome, islands, options, reference }
