import { SENDERS } from '../../game/copy/senders.ts'
import { copyOf } from '@quorum/ui/i18n/catalog-copy'

/** What each Sender signs under a letter: English is the Sender's own text. */
export const senders = copyOf(SENDERS, ['sign'], [])
