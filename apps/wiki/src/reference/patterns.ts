import { quadrantBadge } from '../components/quadrant.ts'
import type { Page } from '../page.ts'
import { navOf } from '../pages.ts'
import { cardGrid, headingsFor, hubCard, link, page, paragraph, section } from './shared.ts'

/* The Patterns hub: every page of the section, under its group, as cards. The pages themselves
   are authored (content/patterns); this page only lists them, so a new page appears here by its
   `group` and `order`. */

/** The groups in reading order, with what a reader comes to each for. */
export const PATTERN_GROUPS: ReadonlyArray<Readonly<{ name: string; blurb: string }>> = [
  {
    name: 'Foundations',
    blurb: 'The vocabulary the rest leans on: latency, availability, CAP and the tail.',
  },
  {
    name: 'Stack ladder',
    blurb: 'Build a system one rung at a time, from a single box to several regions.',
  },
  { name: 'Scaling reads and compute', blurb: 'Caches, replicas, load balancers and autoscaling.' },
  {
    name: 'Scaling data',
    blurb: 'Sharding, replication, quorums and the stores that fit each shape.',
  },
  { name: 'Messaging and async', blurb: 'Queues, streams and the guarantees between them.' },
  { name: 'Resilience', blurb: 'Timeouts, retries, breakers and the other ways to fail small.' },
  { name: 'Deploys and change', blurb: 'Ship and migrate without taking the system down.' },
  {
    name: 'Operate and observe',
    blurb: 'See the system, set targets, and plan for the day it breaks.',
  },
  {
    name: 'Security and edge',
    blurb: 'The front door, encryption, secrets and where data may live.',
  },
  { name: 'Cost', blurb: 'Pay for what you use and know what each user costs.' },
  {
    name: 'Outside the game',
    blurb: 'Patterns Quorum cannot build, with references worth reading.',
  },
]

const hub = page({
  path: '/patterns',
  title: 'Patterns',
  summary:
    'System design in small pieces: build a Design one rung at a time, then look up the pattern behind each rung.',
  section: 'patterns',
  order: 0,
  aliases: ['system design', 'cheatsheet', 'architecture', 'design patterns', 'scaling', 'ladder'],
  headings: headingsFor(PATTERN_GROUPS.map((group) => group.name)),
  text: PATTERN_GROUPS.map((group) => `${group.name} ${group.blurb}`).join(' '),
  body: (_model, h) => {
    const pages: ReadonlyArray<Page> = navOf('patterns')
    return h.div(
      [h.Class('prose')],
      [
        paragraph(
          'A cheatsheet for designing systems, in two halves that point at each other. The Stack ladder adds one piece at a time and says when to climb. The patterns explain the idea behind each rung, what it costs, and how to set it in the game.',
          h,
        ),
        h.p(
          [],
          [
            'New here? Start at ',
            link('/patterns/one-box', 'One box', h),
            ' and climb, or jump to a pattern when a gauge on your Board turns red. Most pages draw a real Design on the game’s own board and explain every setting it uses.',
          ],
        ),
        ...PATTERN_GROUPS.flatMap((group) => {
          const members = pages.filter((entry) => entry.group === group.name)
          return members.length === 0
            ? []
            : [
                section(
                  group.name,
                  [
                    paragraph(group.blurb, h),
                    cardGrid(
                      members.map((entry) =>
                        hubCard(
                          entry,
                          group.name === 'Stack ladder'
                            ? h.span(
                                [
                                  h.Class(
                                    'flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[13px] font-semibold tabular-nums text-muted-foreground',
                                  ),
                                ],
                                [String(entry.order - 100)],
                              )
                            : quadrantBadge('patterns', 'size-9 shrink-0', h),
                          '',
                          h,
                        ),
                      ),
                      h,
                    ),
                  ],
                  h,
                ),
              ]
        }),
      ],
    )
  },
})

export const patternsPages: ReadonlyArray<Page> = [hub]
