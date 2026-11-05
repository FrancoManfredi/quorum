import { Result } from 'effect'
import { CHALLENGES, runChallenge } from '../src/challenges.ts'
import { referenceReplay } from '../src/fixtures/challenges.ts'
import { GOLDEN_STEPS, goldenGame, replay } from '../src/fixtures/golden.ts'
import { hashGame } from '../src/hash.ts'

/* What every engine computes for the cross-engine check (04 "Determinism and randomness"). */

export type Report = Readonly<{ golden: string; challenges: Readonly<Record<string, string>> }>

/** The end hash of the golden Company and of every Challenge's reference replay. */
export const report = (): Report => ({
  golden: hashGame(replay(goldenGame(), GOLDEN_STEPS)),
  challenges: Object.fromEntries(
    CHALLENGES.map((challenge) => {
      const result = runChallenge(challenge, referenceReplay(challenge))
      return [challenge.id, Result.isSuccess(result) ? result.success.hash : result.failure]
    }),
  ),
})
