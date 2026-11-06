import { Schema } from 'effect'

/* ==========================================================================
   What a Mail says, as data. The Model keeps the English a letter was written
   with, and next to it which letter that was and the values it quotes, so the
   Inbox can write it again in the player's language. A save from before has
   only the English text, and shows that.
   ========================================================================== */

/** The values a letter quotes: names, numbers and short phrases, never a sentence. */
export const MailVars = Schema.Record(
  Schema.String,
  Schema.NullOr(Schema.Union([Schema.String, Schema.Finite])),
)
export type MailVars = typeof MailVars.Type

/** One hand-written letter: its id (`advice.workers`), which version of it, and its values. */
export const LetterRef = Schema.Struct({
  id: Schema.String,
  variant: Schema.Finite,
  vars: MailVars,
})
export type LetterRef = typeof LetterRef.Type

/** A paragraph the game adds to a letter, such as the ticket line of an advisory. */
export const Snippet = Schema.Struct({ id: Schema.String, vars: MailVars })
export type Snippet = typeof Snippet.Type

/** A letter with the paragraphs that come before and after it. */
export const MailMessage = Schema.Struct({
  letter: LetterRef,
  before: Schema.Array(Snippet),
  after: Schema.Array(Snippet),
})
export type MailMessage = typeof MailMessage.Type
