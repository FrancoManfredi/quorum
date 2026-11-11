import * as Markdown from '@foldkit/markdown'
import type { HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { ArrowRight, Info, Lightbulb, TriangleAlert } from 'lucide'
import { COMPONENTS, ERAS, researchList } from '@quorum/simulation/catalog'
import { OPTION_CONTROLS } from '../reference/options.ts'
import { groupBadge } from '@quorum/ui/game/bits'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { researchMark } from '@quorum/ui/game/research-marks'
import { icon } from '@quorum/ui/primitives/icon'
import { islandAttributes } from '../islands.ts'
import { Message, type Model } from '../main.ts'
import { mixBar } from './mix.ts'
import { leverView } from './lever.ts'
import * as Quiz from '../submodels/quiz.ts'
import { practiceView } from './practice-card.ts'
import { sandboxView } from './sandbox-card.ts'
import { designView } from './design-card.ts'

/* The live views behind each Markdown directive. src/islands.ts declares their attributes. */

const NOTE = {
  tip: { label: 'Tip', glyph: Lightbulb, tone: 'text-ok' },
  warn: { label: 'Watch out', glyph: TriangleAlert, tone: 'text-warn' },
  real: { label: 'How real is it', glyph: Info, tone: 'text-group-edge' },
} as const

export const islandViews = (model: Model, h: HtmlBuilder<Message>): Markdown.Islands =>
  Markdown.islandsFor(islandAttributes, {
    Note: ({ tone }, content) => {
      const note = NOTE[tone ?? 'tip']
      return h.aside(
        [h.Class('not-prose my-6 rounded-lg border border-border px-4 py-3')],
        [
          h.div(
            [h.Class('mb-1 flex items-center gap-1.5 text-[13px] font-medium')],
            [icon(h, note.glyph, `size-3.5 ${note.tone}`), note.label],
          ),
          h.div([h.Class('prose text-[14px] [&>*+*]:mt-2')], content),
        ],
      )
    },
    Quiz: (quiz, _content, index) =>
      h.submodel({
        slotId: `quiz-${index}`,
        model: model.quiz,
        view: Quiz.view,
        toParentMessage: (message) => Message.QuizChanged({ message }),
        viewInputs: { ...quiz, key: `${model.path}#${index}` },
      }),
    Sandbox: ({ id }, _content, index) => sandboxView(model, id, index, h),
    Design: ({ id }) => designView(id, h),
    Options: ({ id }) => {
      const controls = OPTION_CONTROLS[id] ?? []
      if (controls.length === 0) return h.empty
      return h.div(
        [h.Class('not-prose my-6 overflow-x-auto rounded-lg border border-border')],
        [
          h.table(
            [h.Class('w-full border-collapse text-[13.5px] leading-snug')],
            [
              h.thead(
                [],
                [
                  h.tr(
                    [],
                    ['Control', 'Settings', 'When'].map((header) =>
                      h.th(
                        [
                          h.Key(header),
                          h.Class(
                            'border-b border-border bg-muted/50 px-3 py-2 text-left text-[12.5px] font-medium whitespace-nowrap text-muted-foreground',
                          ),
                        ],
                        [header],
                      ),
                    ),
                  ),
                ],
              ),
              h.tbody(
                [h.Class('divide-y divide-border')],
                controls.map((control) =>
                  h.tr(
                    [h.Key(control.name)],
                    [
                      h.td([h.Class('px-3 py-2 align-top font-medium')], [control.name]),
                      h.td(
                        [h.Class('px-3 py-2 align-top text-muted-foreground')],
                        [control.settings],
                      ),
                      h.td([h.Class('px-3 py-2 align-top text-muted-foreground')], [control.shown]),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      )
    },
    Component: ({ id }) => {
      const def = COMPONENTS[id]
      return h.a(
        [
          h.Href(`/components/${id}`),
          h.Class(
            cn(
              'not-prose group my-6 flex max-w-md items-center gap-3.5 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/60',
            ),
          ),
        ],
        [
          groupBadge(def.group, COMPONENT_ICONS[id], 'size-10', h),
          h.span(
            [h.Class('min-w-0 flex-1')],
            [
              h.span(
                [h.Class('flex items-baseline gap-2')],
                [
                  h.span([h.Class('text-[15px] font-semibold tracking-tight')], [def.name]),
                  h.span([h.Class('text-[12px] text-muted-foreground')], [def.product]),
                ],
              ),
              h.span(
                [h.Class('mt-0.5 block text-[13px] leading-snug text-muted-foreground')],
                [def.blurb],
              ),
            ],
          ),
          icon(
            h,
            ArrowRight,
            'size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5',
          ),
        ],
      )
    },
    Mix: ({ era }) => {
      const def = ERAS[Number(era)]
      return def
        ? h.figure(
            [h.Class('not-prose my-5')],
            [
              mixBar(def.mix, h),
              h.figcaption(
                [h.Class('text-[12.5px] text-muted-foreground')],
                [`${def.name} request mix`],
              ),
            ],
          )
        : h.empty
    },
    Practice: ({ id }) => practiceView(id, h),
    Lever: ({ kind }) => leverView(kind, h),
    Track: ({ track }) =>
      h.ol(
        [h.Class('not-prose my-5 flex flex-wrap gap-2')],
        researchList
          .filter((entry) => entry.track === track)
          .map((entry) =>
            h.li(
              [h.Key(entry.id)],
              [
                h.a(
                  [
                    h.Href(`/research/${entry.id}`),
                    h.Class(
                      'flex items-center gap-2 rounded-md border border-border py-1 pr-3 pl-1 text-[13px] hover:bg-muted/60',
                    ),
                  ],
                  [researchMark(entry, 'sm', false, h), entry.name],
                ),
              ],
            ),
          ),
      ),
  })
