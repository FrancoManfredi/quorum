import { Story } from '@alchemy.run/domain/Story'
import { test } from 'vitest'
import { Effect, Layer } from 'effect'
import { Backend } from './Backend.model.ts'
import { ChallengeEntry } from './challenges/ChallengeEntry.aggregate.ts'
import { BestImproved, RecordResult } from './challenges/RecordResult.command.ts'
import { ExitSurvey } from './survey/ExitSurvey.aggregate.ts'
import { AnswerGiven, RecordAnswer, SurveyRefused } from './survey/RecordAnswer.command.ts'
import { ResultStore } from './challenges/store.ts'
import { SurveyStore } from './survey/store.ts'
import { BackendHandlers } from './Backend.model.ts'

const story = Story.make(Backend, {
  layer: BackendHandlers.pipe(
    Layer.provide(
      Layer.mergeAll(
        Layer.succeed(ResultStore, {
          record: () => Effect.succeed({ cost: 0, tail: 0, complexity: 0 }),
          percentiles: () => Effect.succeed({ cost: 0, tail: 0, complexity: 0 }),
          histogram: () => Effect.succeed({ players: 0, cost: [], tail: [], complexity: [] }),
        }),
        Layer.succeed(SurveyStore, { record: () => Effect.void }),
      ),
    ),
  ),
})

/** A story's clock starts here, and stamps every command. */
const STORY_START = Date.parse('2026-01-01T00:00:00Z')

const entry = ChallengeEntry.ref('v1:hello-world:device-0001')
const improved = (cost: number, tail: number, complexity: number) =>
  new BestImproved({
    challengeId: 'hello-world',
    simVersion: 'v1',
    deviceId: 'device-0001',
    score: { cost, tail, complexity },
    replay: 'QRP1:x',
    at: STORY_START,
  })
const result = (cost: number, tail: number, complexity: number) =>
  new RecordResult({
    challengeId: 'hello-world',
    simVersion: 'v1',
    deviceId: 'device-0001',
    score: { cost, tail, complexity },
    replay: 'QRP1:x',
  })

test('each axis keeps its own best, and a result that improves none records nothing', () =>
  Effect.runPromise(
    story(
      Story.when(entry, result(0.05, 90, 3)),
      Story.then(entry, improved(0.05, 90, 3)),
      Story.replied({ best: { cost: 0.05, tail: 90, complexity: 3 } }),
      // Cheaper but slower: only cost improves, and the best keeps the old tail.
      Story.when(entry, result(0.03, 600, 3)),
      Story.then(entry, improved(0.03, 600, 3)),
      Story.replied({ best: { cost: 0.03, tail: 90, complexity: 3 } }),
      // Worse on every axis: no event.
      Story.when(entry, result(0.09, 900, 5)),
      Story.then(entry),
      Story.replied({ best: { cost: 0.03, tail: 90, complexity: 3 } }),
    ).pipe(Effect.orDie),
  ))

const survey = ExitSurvey.ref('device-0001:acquisition:4:7200:200000:4000000:2')
const answer = (issues: string, legacy = 2) =>
  new RecordAnswer({
    deviceId: 'device-0001',
    exitKey: 'acquisition:4:7200:200000:4000000:2',
    locale: 'en',
    exit: {
      exit: 'acquisition',
      stage: 4,
      time: 7_200,
      peak: 200_000,
      payout: 4_000_000,
      legacy,
      venture: 'b2b-saas',
      mutators: [],
      perks: {},
    },
    issues,
    likes: '',
  })

test('a survey keeps the first answer, and refuses an Exit that is not real', () =>
  Effect.runPromise(
    story(
      Story.when(survey, answer('First.', 99)),
      Story.rejected(new SurveyRefused({ message: 'The Exit Legacy does not match its payout.' })),
      Story.when(survey, answer(' First. ')),
      Story.then(
        survey,
        new AnswerGiven({
          deviceId: 'device-0001',
          exitKey: 'acquisition:4:7200:200000:4000000:2',
          exitId: 'acquisition',
          stage: 4,
          time: 7_200,
          peak: 200_000,
          payout: 4_000_000,
          legacy: 2,
          venture: 'b2b-saas',
          mutators: [],
          issues: 'First.',
          likes: '',
          locale: 'en',
          at: STORY_START,
        }),
      ),
      Story.when(survey, answer('Second.')),
      Story.then(survey),
    ).pipe(Effect.orDie),
  ))
