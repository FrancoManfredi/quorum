import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { Star } from 'lucide'
import { FIGURE } from '@quorum/ui/game/bits'
import { compact } from '@quorum/ui/game/format'
import { githubMark } from '@quorum/ui/primitives/github'
import { icon } from '@quorum/ui/primitives/icon'
import type { Message } from '../main.ts'
import { REPOSITORY } from '../site.ts'
import type * as Project from '../submodels/project.ts'

/* The repository behind the game and the wiki, as a card: where the code is, and what other
   people have made of it. */

type H = HtmlBuilder<Message>

const REPO_NAME = 'elianiva/quorum'
const LICENSE_URL = `${REPOSITORY}/blob/main/LICENSE`

const cell = (value: string, label: string, h: H): Html =>
  h.div(
    [h.Key(label), h.Class('flex flex-col gap-1 bg-background px-4 py-3.5')],
    [
      h.span([h.Class(cn(FIGURE, 'text-[20px] leading-none font-medium tabular-nums'))], [value]),
      h.span([h.Class('text-[12px] text-muted-foreground')], [label]),
    ],
  )

export const projectCard = (project: Project.Model, h: H): Html => {
  const stats = project.stats
  const cells = stats
    ? [
        { label: 'Stars', value: compact(stats.stars) },
        { label: 'Forks', value: compact(stats.forks) },
        { label: 'Contributors', value: compact(stats.contributors) },
        { label: 'Open issues', value: compact(stats.issues) },
      ]
    : []
  return h.div(
    [h.Class('overflow-hidden rounded-lg border border-border bg-background')],
    [
      h.div(
        [h.Class('flex flex-wrap items-start justify-between gap-y-4 gap-x-6 p-5')],
        [
          h.div(
            [h.Class('flex min-w-0 items-start gap-3')],
            [
              h.span(
                [h.Class('grid size-10 shrink-0 place-items-center rounded-md bg-muted/60')],
                [githubMark(h, 'size-5')],
              ),
              h.div(
                [h.Class('min-w-0')],
                [
                  h.a(
                    [
                      h.Href(REPOSITORY),
                      h.Class(
                        cn(FIGURE, 'text-[14px] font-medium hover:underline underline-offset-4'),
                      ),
                    ],
                    [REPO_NAME],
                  ),
                  h.p(
                    [h.Class('mt-1 max-w-sm text-[13px] leading-snug text-muted-foreground')],
                    ['Read the code, report a bug, or send a fix.'],
                  ),
                ],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-wrap items-center gap-3')],
            [
              h.a(
                [
                  h.Href(REPOSITORY),
                  h.Class(
                    'inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-[13px] font-medium text-background hover:opacity-90',
                  ),
                ],
                [icon(h, Star, 'size-3.5'), 'Star on GitHub'],
              ),
              h.a(
                [
                  h.Href('/about/contributing'),
                  h.Class(
                    'text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground',
                  ),
                ],
                ['How to contribute'],
              ),
            ],
          ),
        ],
      ),
      stats
        ? h.div(
            [h.Class('grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4')],
            cells.map((entry) => cell(entry.value, entry.label, h)),
          )
        : h.empty,
      h.p(
        [
          h.Class(
            'flex flex-wrap items-center gap-x-2 border-t border-border px-4 py-2.5 text-[12px] text-muted-foreground',
          ),
        ],
        [
          h.a(
            [h.Href(LICENSE_URL), h.Class('underline underline-offset-2 hover:text-foreground')],
            [stats?.license ?? 'GPL-3.0'],
          ),
          h.span([h.AriaHidden(true)], ['·']),
          h.span([], [`${stats?.language ?? 'TypeScript'} source`]),
        ],
      ),
    ],
  )
}
