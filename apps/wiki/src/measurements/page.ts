import type { Html } from 'foldkit/html'
import { RPS_PER_USER } from '@quorum/simulation/catalog'
import { SNAPSHOT } from './snapshot.ts'
import type { Row } from './measure.ts'
import type { Lang } from '../i18n/lang.ts'
import {
  authored,
  headingsFor,
  link,
  page,
  section,
  table,
  titleOf,
  type H,
} from '../reference/shared.ts'

/*
 * The Measurements page. Its figures come from `snapshot.ts`, which `pnpm measurements` writes by
 * playing the bots in `packages/simulation/src/pacing.ts`, so no number here is typed by hand
 * (16 "What the checks cover"). The sections the bots cannot reach (replay timings, the interface,
 * the research calibration) stay in `content/design/measurements.md`, recorded by hand.
 */

const code = (value: string, h: H): Html => h.code([], [value])

const t = (name: string) => titleOf(name, name)

const valueOf = (rows: ReadonlyArray<Row>, label: string): string =>
  rows.find((row) => row.label === label)?.value ?? 'not measured'

/** The figure without the note that some seed missed it, for a sentence that explains it. */
const figureOf = (rows: ReadonlyArray<Row>, label: string): string =>
  valueOf(rows, label).split(',')[0] ?? ''

const rowTable = (rows: ReadonlyArray<Row>, headers: ReadonlyArray<string>, h: H): Html =>
  table(
    headers,
    rows.map((row) => ({ key: row.label, cells: [row.label, row.value] })),
    h,
    [1],
  )

/** The paragraphs that describe what the bot does, rather than what it measured. */
const behaviour = (h: H): ReadonlyArray<Html> => [
  h.p(
    [],
    [
      'The bot spends its Dev Hours on a fixed priority list: two Studies queued, no Spikes, and Features in catalog order. It places the fix a Design needs once the bottleneck names it. A player reads the Board better than that, so these times are an upper bound on the real ones.',
    ],
  ),
  h.p(
    [],
    [
      'In Series A the bot researches Multiple zones first, then spreads every App Server and Worker across zone B and gives every data Node a standby. Its autopilot ships Video, Chat, and Checkout, so media, rt, and buy reach a bot Company. It ships none of the Series B Features, so job, report, and ai do not arrive there, and the Sandboxes play them instead.',
    ],
  ),
  h.p(
    [],
    [
      'The bot spends its error budget several times over. A 99.9% week allows ten seconds of full outage, and its incidents do not spread the way the design intends. A slow query or a zone outage before Multiple zones takes a third of its users, and a Company that loses that many rarely recovers inside the next Era. Which seed survives Series A turns on a percent or two of load, so read the tables as the shape of the curve rather than a promise.',
    ],
  ),
]

/** Its prose is the design record, which stays English, and the page is one with it: every
    section heading and sentence below is written by hand in English, whatever language the wiki is in. */
export const measurementsPage = (l: Lang) => {
  const text = authored(l, '/design/measurements')
  return page(l, {
    path: '/design/measurements',
    title: 'Measurements',
    summary: `Balance figures the bots take against the build, taken at Simulation version ${SNAPSHOT.version}.`,
    section: 'design',
    order: 21,
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...headingsFor(
        [
          'How these are taken',
          'Challenge pace',
          'Live pace',
          'Seed',
          'Series A and Series B',
          'Series C to Public',
          'Exit and Legacy',
        ].map(t),
      ),
      ...text.headings,
    ],
    text: [
      SNAPSHOT.pacing.map((row) => `${row.label} ${row.value}`).join(' '),
      SNAPSHOT.live.map((row) => `${row.label} ${row.value}`).join(' '),
      SNAPSHOT.seed.map((row) => `${row.label} ${row.value}`).join(' '),
      SNAPSHOT.series.map((row) => `${row.label} ${row.value}`).join(' '),
      SNAPSHOT.reach,
      text.text,
    ].join(' '),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          section(
            t('How these are taken'),
            [
              h.p(
                [],
                [
                  'Every figure on this page comes from playing the Balanced bot against the Simulation in ',
                  code('packages/simulation/src/pacing.ts', h),
                  `, with each user sending ${RPS_PER_USER} requests a second and the seeds the Simulation itself uses. `,
                  `The tables were taken at Simulation version ${SNAPSHOT.version} on ${SNAPSHOT.takenOn}, by `,
                  code('pnpm measurements', h),
                  '. A change that moves pacing changes the tables, and the page is generated again with it.',
                ],
              ),
              h.p(
                [],
                [
                  'Read a row as the time a milestone happened on the seeds the section names. A milestone no seed reached inside the run shows as never, which is a fact about the bot, not about the game.',
                ],
              ),
            ],
            h,
          ),
          section(
            t('Challenge pace'),
            [
              h.p(
                [],
                [
                  'The Balanced bot at the Challenge pace (',
                  code('CHALLENGE_TUNING', h),
                  '), seeds 1 to 5, until 90 sim minutes. Times are sim minutes.',
                ],
              ),
              rowTable(SNAPSHOT.pacing, ['Milestone', 'Measured'], h),
              h.p(
                [],
                [
                  'The M2 gate asks for Seed on every seed (',
                  link('/design/17-scope-and-roadmap#milestones', 'Scope and roadmap', h),
                  ') and ',
                  code('pacing.test.ts', h),
                  ' holds it. Nothing else in this table has a target.',
                ],
              ),
            ],
            h,
          ),
          section(
            t('Live pace'),
            [
              h.p(
                [],
                [
                  'The same bot at the live tuning (',
                  code('LIVE_TUNING', h),
                  '), seeds 1 and 3, until 130 sim minutes. The live pace doubles growth and shortens the incident gap, so it reaches Seed sooner and recovers more often in the Eras after it.',
                ],
              ),
              rowTable(SNAPSHOT.live, ['Era', 'Measured'], h),
            ],
            h,
          ),
          section(
            t('Seed'),
            [
              h.p(
                [],
                [
                  'The Balanced bot at the Challenge pace, seeds 1 and 3, to Series A. Seed length is the time between the two raises.',
                ],
              ),
              rowTable(SNAPSHOT.seed, ['Milestone', 'Measured'], h),
              h.p(
                [],
                [
                  `Seed length is ${figureOf(SNAPSHOT.seed, 'Seed length')} sim minutes, and growth sets most of it: from 5,000 to 25,000 users against a 35,000 market at g = 0.0016 takes 28 minutes on its own. The Team's Features raise growth and the market, which is what buys the bot room to build them.`,
                ],
              ),
              h.p(
                [],
                [
                  'The autopilot builds Features in catalog order, so Profile photos, which gates uploads, arrives late in Seed or in Series A. Until it ships the Company sends no uploads, and the Queue and Worker branch that takes them off the App Servers waits for it. The Seed Sandboxes play that branch instead.',
                ],
              ),
            ],
            h,
          ),
          section(
            t('Series A and Series B'),
            [
              h.p(
                [],
                ['The Balanced bot at the Challenge pace, seeds 1 and 3, until 130 sim minutes.'],
              ),
              rowTable(SNAPSHOT.series, ['Milestone', 'Measured'], h),
              h.p(
                [],
                [
                  'Series A leaves at 150,000 users and Series B at 1,000,000 (',
                  link('/design/10-progression#eras', 'Progression', h),
                  `). The deepest run holds ${SNAPSHOT.reach} users at 130 minutes, so the table says whether a seed raised Series B inside the window, not how long the Era takes on its own schedule.`,
                ],
              ),
              ...behaviour(h),
            ],
            h,
          ),
          section(
            t('Series C to Public'),
            [
              h.p(
                [],
                [
                  `No recorded run reaches Series C. The bot ends at 130 sim minutes holding ${SNAPSHOT.reach} users, against the 10,000,000 that Series C asks for. `,
                  code('sandbox.test.ts', h),
                  ' plays the Series C to Public mechanics on built Designs, and no bot plays to the IPO, so no IPO time is recorded. ',
                  link('/design/16-balancing#what-the-checks-cover', 'What the checks cover', h),
                  ' lists the checks.',
                ],
              ),
            ],
            h,
          ),
          section(
            t('Exit and Legacy'),
            [
              h.p(
                [],
                [
                  'A second Company on the same seed, with Angel network 1, Pattern recognition 1, and Founder\u2019s reputation 1 (10 Legacy), against the first Company, both played by the Balanced bot. Sim minutes.',
                ],
              ),
              table(
                ['Seed', 'First: Pre-seed', 'First: Seed', 'Second: Pre-seed', 'Second: Seed'],
                SNAPSHOT.legacy.map((row) => ({
                  key: row.seed,
                  cells: [
                    row.seed,
                    row.first.preseed,
                    row.first.seed,
                    row.second.preseed,
                    row.second.seed,
                  ],
                })),
                h,
                [1, 2, 3, 4],
              ),
              h.p(
                [],
                [
                  'The M7 exit check, a second Company that reaches its Exit in 3 to 6 hours, is not measured: the Balanced bot does not reach Public.',
                ],
              ),
            ],
            h,
          ),
          ...(text.view ? [text.view(model, h)] : []),
        ],
      ),
  })
}
