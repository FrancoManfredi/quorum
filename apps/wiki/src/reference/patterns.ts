import { quadrantBadge } from '../components/quadrant.ts'
import type { Messages } from '../i18n/messages.ts'
import type { Page } from '../page.ts'
import { navOf } from '../pages.ts'
import {
  cardGrid,
  headingsFor,
  hubCard,
  link,
  page,
  paragraph,
  section,
  titleOf,
  type Lang,
} from './shared.ts'

/* The Patterns hub: every page of the section, under its group, as cards. The pages themselves
   are authored (content/patterns); this page only lists them, so a new page appears here by its
   `group` and `order`. */

export type GroupName = keyof Messages['groups']

/** The groups in reading order. A page names its group in English in its frontmatter, and the
    name and the blurb of each, in the page's language, are interface copy (`t.groups`). */
export const PATTERN_GROUPS: ReadonlyArray<GroupName> = [
  'Foundations',
  'Scaling steps',
  'Scaling reads and compute',
  'Scaling data',
  'Messaging and async',
  'Resilience',
  'Deploys and change',
  'Operate and observe',
  'Security and edge',
  'Cost',
  'Ran in production',
  'When it broke',
  'Outside the game',
]

export const patternsPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.patterns
  const groups = PATTERN_GROUPS.map((key) => ({ key, ...l.t.groups[key] }))
  return [
    page(l, {
      path: '/patterns',
      title: t.title,
      summary: t.summary,
      section: 'patterns',
      order: 0,
      aliases: t.aliases,
      headings: headingsFor(groups.map((group) => titleOf(group.key, group.name))),
      text: groups.map((group) => `${group.name} ${group.blurb}`).join(' '),
      body: (_model, h) => {
        const pages: ReadonlyArray<Page> = navOf(l.locale, 'patterns')
        return h.div(
          [h.Class('prose')],
          [
            paragraph(t.intro, h),
            h.p([], [t.newHere, link('/patterns/one-box', t.oneBox, h), t.newHereAfter]),
            ...groups.flatMap((group) => {
              const members = pages.filter((entry) => entry.group === group.key)
              return members.length === 0
                ? []
                : [
                    section(
                      titleOf(group.key, group.name),
                      [
                        paragraph(group.blurb, h),
                        cardGrid(
                          members.map((entry) =>
                            hubCard(
                              entry,
                              group.key === 'Scaling steps'
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
    }),
  ]
}
