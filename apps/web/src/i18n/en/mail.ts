import {
  ADVICE,
  AWAY_FINANCE,
  AWAY_MONITORING,
  CHURN_LETTERS,
  CVE_LETTERS,
  EASY_MODE,
  EVENTS,
  HIRE,
  POSTMORTEM,
  REQUESTS,
  REWRITES,
  SPAM,
  STALL,
  TICKETS,
  type Written,
} from '../../game/copy/index.ts'

/** The values a letter quotes. */
export type LetterVars = Readonly<Record<string, string | number | null>>

/** One hand-written version of a letter. */
export type Letter = (vars: LetterVars) => Written

type Family = Readonly<Record<string, ReadonlyArray<unknown>>>

const prefixed = (prefix: string, family: Family): Record<string, ReadonlyArray<Letter>> =>
  Object.fromEntries(
    Object.entries(family).map(([id, letters]) => [
      `${prefix}${id}`,
      letters as unknown as ReadonlyArray<Letter>,
    ]),
  )

/**
 * Every letter the game can write, by the id a Mail records (`advice.workers`, `event.drawer`, ...). English
 * is the game's own copy; each language writes the same letters, one version for one.
 */
const letters: Readonly<Record<string, ReadonlyArray<Letter>>> = {
  ...prefixed('advice.', ADVICE),
  ...prefixed('event.', EVENTS),
  ...Object.fromEntries(
    SPAM.map((pitch) => [
      `spam.${pitch.sender}`,
      pitch.letters as unknown as ReadonlyArray<Letter>,
    ]),
  ),
  ...Object.fromEntries(
    REWRITES.map((rewrite) => [
      `rewrite.${rewrite.language}`,
      rewrite.letters as unknown as ReadonlyArray<Letter>,
    ]),
  ),
  cve: CVE_LETTERS as unknown as ReadonlyArray<Letter>,
  hire: HIRE as unknown as ReadonlyArray<Letter>,
  ticket: TICKETS as unknown as ReadonlyArray<Letter>,
  request: REQUESTS as unknown as ReadonlyArray<Letter>,
  churn: CHURN_LETTERS as unknown as ReadonlyArray<Letter>,
  postmortem: POSTMORTEM as unknown as ReadonlyArray<Letter>,
  'away.finance': AWAY_FINANCE as unknown as ReadonlyArray<Letter>,
  'away.monitoring': AWAY_MONITORING as unknown as ReadonlyArray<Letter>,
  stall: STALL as unknown as ReadonlyArray<Letter>,
  easy: EASY_MODE as unknown as ReadonlyArray<Letter>,
}

export const mail = {
  letters,
  /** A paragraph the game adds to a letter. */
  snippets: {
    patchTicket: (vars: LetterVars) =>
      `Ticket filed: ${vars['item']}, ${vars['cost']} DH, due in ${vars['due']}. Overdue, it turns red on the Team backlog; a minute later it is exploited.`,
    recruiterHint: (_vars: LetterVars) => 'P.S. One of your engineers looks ready to listen.',
    realDemo: (vars: LetterVars) => `P.S. This one is a real demo. It covers ${vars['research']}.`,
  },
}
