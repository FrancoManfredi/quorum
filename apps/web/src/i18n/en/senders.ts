import { SENDERS } from '../../game/copy/senders.ts'
import { copyOf } from '../catalog-copy.ts'

/** What each Sender signs under a letter: English is the Sender's own text. */
export const senders = copyOf(SENDERS, ['sign'], [])
