import type { en } from './en/index.ts'

/** The shape every language must have: English is the source, so a missing or extra key fails typecheck. */
export type Messages = typeof en
