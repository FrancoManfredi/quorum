import * as Domain from '@alchemy.run/domain'
import * as DateTime from 'effect/DateTime'
import { Schema } from 'effect'
import {
  ERAS,
  EXITS,
  EXIT_IDS,
  MUTATORS,
  PERKS,
  PERK_IDS,
  VENTURES,
  type ExitId,
  type MutatorId,
  type VentureId,
} from '@quorum/simulation/catalog'
import { legacyOf } from '@quorum/simulation/exit'
import { legacyMultiplier } from '@quorum/simulation/founding'
import { SurveyId } from './ExitSurvey.id.ts'
import { AnswerGiven, RecordAnswer, SurveyRefused } from './RecordAnswer.command.ts'

/* The Exit survey (13 "Exit"): two answers, checked against the Exit they claim before they are kept. */

export const MAX_ANSWER_CHARS = 2_000

const isExitId = (id: string): id is ExitId => (EXIT_IDS as ReadonlyArray<string>).includes(id)
const isVenture = (id: string): id is VentureId => Object.hasOwn(VENTURES, id)
const isMutator = (id: string): id is MutatorId => Object.hasOwn(MUTATORS, id)
const isPerk = (id: string): boolean => Object.hasOwn(PERKS, id)

const refuse = (message: string) => new SurveyRefused({ message })

/** The first reason the answer is not a real Exit's, or null. */
const refusalOf = (cmd: RecordAnswer): string | null => {
  const exit = cmd.exit
  const id = exit.exit
  if (!isExitId(id)) return 'There is no such Exit.'
  // The IPO lists a Company that keeps playing, so it has no Exit to report on.
  if (EXITS[id].continues) return 'That Exit does not end a Company.'
  if (!Number.isInteger(exit.stage) || exit.stage < EXITS[id].stage || exit.stage > ERAS.length - 1)
    return 'That Exit does not match its Era.'
  if (![exit.time, exit.peak, exit.payout, exit.legacy].every((v) => Number.isFinite(v) && v >= 0))
    return 'The Exit figures are not valid.'
  const venture = exit.venture
  if (!isVenture(venture)) return 'There is no such Venture.'
  const mutators = exit.mutators.filter(isMutator)
  if (mutators.length !== exit.mutators.length) return 'There is no such Mutator.'
  const perks: Record<string, number> = {}
  for (const [perk, level] of Object.entries(exit.perks)) {
    if (!isPerk(perk) || !Number.isFinite(level) || level < 0) return 'The Founding is not valid.'
    perks[perk] = level
  }
  if (Object.keys(perks).length > PERK_IDS.length) return 'The Founding is not valid.'
  // Legacy is the payout's square root, so a row that claims more than that is not an Exit.
  if (exit.legacy > legacyOf(exit.payout, legacyMultiplier({ venture, mutators, perks })))
    return 'The Exit Legacy does not match its payout.'
  const issues = cmd.issues.trim()
  const likes = cmd.likes.trim()
  if (issues.length === 0 && likes.length === 0) return 'Write an answer to at least one question.'
  if (issues.length > MAX_ANSWER_CHARS || likes.length > MAX_ANSWER_CHARS)
    return 'An answer is too long.'
  return null
}

/** One device's answer for one Exit. A retry on a recorded survey records nothing: the first answer stays. */
export class ExitSurvey extends Domain.Aggregate('ExitSurvey', {
  id: SurveyId,
  state: Schema.Union([Schema.TaggedStruct('Unrecorded', {}), Schema.TaggedStruct('Recorded', {})]),
  initial: { _tag: 'Unrecorded' },
  commands: [RecordAnswer],
  decide: {
    RecordAnswer: (s, cmd, { now }) => {
      if (s._tag === 'Recorded') return []
      const refusal = refusalOf(cmd)
      if (refusal !== null) return refuse(refusal)
      const exit = cmd.exit
      return [
        new AnswerGiven({
          deviceId: cmd.deviceId,
          exitKey: cmd.exitKey,
          exitId: exit.exit,
          stage: exit.stage,
          time: exit.time,
          peak: exit.peak,
          payout: exit.payout,
          legacy: exit.legacy,
          venture: exit.venture,
          mutators: exit.mutators,
          issues: cmd.issues.trim(),
          likes: cmd.likes.trim(),
          locale: cmd.locale,
          at: DateTime.toEpochMillis(now),
        }),
      ]
    },
  },
  evolve: { AnswerGiven: () => ({ _tag: 'Recorded' as const }) },
}) {}
