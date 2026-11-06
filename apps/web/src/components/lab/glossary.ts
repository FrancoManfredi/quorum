import { copy, type Messages } from '@/i18n/messages.ts'
import { GlossaryMessage } from '@/game/glossary.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { ArrowUpRight, Check, Search } from 'lucide'
import {
  CVE_DEFS,
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  patchCost,
  patchWindow,
  type GlossaryEntry,
} from '@quorum/simulation/catalog'
import { Message } from '@/game/message.ts'
import { CVE_TERMS, cveTermId } from '@/game/advisories.ts'
import type { Model } from '@/game/model.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, SCROLL, WELL } from '@quorum/ui/game/bits'
import { shell } from './panels.ts'

/* ==========================================================================
   The Glossary (design 15, packages/simulation/src/catalog/glossary.ts): every engineering term the game uses, what
   it does in the game, and where to read more. Terms the player has met in
   play carry a check; the rest stay readable.
   ========================================================================== */

const categoryName = (t: Messages, category: GlossaryCategory): string =>
  ({
    performance: t.glossary.performance,
    reliability: t.glossary.reliability,
    observability: t.glossary.observability,
    data: t.glossary.data,
    runtimes: t.glossary.runtimes,
    network: t.glossary.network,
    security: t.glossary.security,
    delivery: t.glossary.delivery,
    team: t.glossary.team,
    business: t.glossary.business,
  })[category]

type Words = Readonly<{ term: string; definition: string; inGame: string }>

/** The entry's words in the builder's language: the catalog has them by id; an advisory is told from its CVE. */
const wordsOf = (entry: GlossaryEntry, h: HtmlBuilder<Message>): Words => {
  const t = copy(h)
  const own = t.catalog.glossary[entry.id]
  if (own) return own
  const def = CVE_DEFS.find((cve) => cveTermId(cve.id) === entry.id)
  if (!def) return { term: entry.term, definition: entry.definition, inGame: entry.inGame }
  return {
    term: entry.term,
    definition: t.glossary.cveDefinition(
      def.score,
      def.affects.map((id) => t.catalog.components[id].name).join(', '),
    ),
    inGame: t.glossary.cveInGame(
      t.units.devHours(patchCost(def.score)),
      Math.round(patchWindow(def.score) / 60),
    ),
  }
}

/** A link's label in the builder's language. */
const labelOf = (entry: GlossaryEntry, index: number, h: HtmlBuilder<Message>): string =>
  copy(h).catalog.glossary[entry.id]?.links[index]?.label ?? entry.links[index]?.label ?? ''

/**
 * Every term the panel lists: the engineering glossary, then the CVEs the Simulation can disclose
 * (18 "How to tell"). A real advisory names one of these ids; a fake advisory's id is not here.
 */
const TERMS: ReadonlyArray<GlossaryEntry> = [...GLOSSARY, ...CVE_TERMS]

const BY_ID = new Map(TERMS.map((entry) => [entry.id, entry]))

/** Accept unaccented keyboard input as well as the spelling shown in the glossary. */
const searchable = (text: string): string =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const matches = (
  entry: GlossaryEntry,
  query: string,
  category: string | null,
  h: HtmlBuilder<Message>,
): boolean => {
  if (category !== null && entry.category !== category) return false
  const text = searchable(query.trim())
  return (
    text === '' ||
    searchable(entry.term).includes(text) ||
    searchable(entry.definition).includes(text) ||
    searchable(entry.inGame).includes(text) ||
    [wordsOf(entry, h).term, wordsOf(entry, h).definition, wordsOf(entry, h).inGame].some((words) =>
      searchable(words).includes(text),
    )
  )
}

const filter = (
  key: string,
  label: string,
  category: GlossaryCategory | null,
  chosen: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  h.button(
    [
      h.Key(key),
      h.Type('button'),
      h.AriaPressed(chosen ? 'true' : 'false'),
      h.OnClick(Message.GlossaryChanged({ message: GlossaryMessage.Filtered({ category }) })),
      h.Class(
        cn(
          'h-7 shrink-0 rounded-lg px-2.5 text-[calc(12px*var(--type-scale))] font-medium transition-colors',
          chosen
            ? 'bg-raised text-foreground shadow-raised'
            : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
        ),
      ),
    ],
    [label],
  )

const filters = (chosen: string | null, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('px-5 pb-3')],
    [
      h.div(
        [
          h.Role('group'),
          h.AriaLabel(t.glossary.category),
          h.Class(
            cn(
              'flex gap-[3px] overflow-x-auto rounded-[11px] p-[3px] [scrollbar-width:none]',
              WELL,
            ),
          ),
        ],
        [
          filter('all', t.glossary.all, null, chosen === null, h),
          ...GLOSSARY_CATEGORIES.map((category) =>
            filter(category, categoryName(t, category), category, chosen === category, h),
          ),
        ],
      ),
    ],
  )
}

const row = (entry: GlossaryEntry, open: boolean, met: boolean, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.li(
    [h.Key(entry.id)],
    [
      h.button(
        [
          h.Type('button'),
          h.AriaCurrent(open ? 'true' : 'false'),
          h.OnClick(Message.GlossaryOpened({ id: entry.id })),
          h.Class(
            cn(
              'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[calc(13px*var(--type-scale))] transition-colors',
              open
                ? 'bg-primary-fill text-on-primary-fill'
                : met
                  ? 'text-foreground hover:bg-well'
                  : 'text-muted-foreground hover:bg-well hover:text-foreground',
            ),
          ),
        ],
        [
          h.span([h.Class('flex-1 truncate')], [wordsOf(entry, h).term]),
          ...(met
            ? [icon(h, Check, 'size-3.5 shrink-0'), h.span([h.Class('sr-only')], [t.glossary.met])]
            : []),
        ],
      ),
    ],
  )
}

const section = (label: string, children: ReadonlyArray<Html>, h: HtmlBuilder<Message>): Html =>
  h.section(
    [h.AriaLabel(label), h.Class('flex flex-col gap-2')],
    [h.h3([h.Class(EYEBROW)], [label]), ...children],
  )

const related = (entry: GlossaryEntry, met: (id: string) => boolean, h: HtmlBuilder<Message>) =>
  h.ul(
    [h.Class('flex flex-wrap gap-1.5')],
    entry.related.flatMap((id) => {
      const other = BY_ID.get(id)
      if (!other) return []
      return [
        h.li(
          [h.Key(id)],
          [
            h.button(
              [
                h.Type('button'),
                h.OnClick(Message.GlossaryOpened({ id })),
                h.Class(
                  'flex h-7 items-center gap-1.5 rounded-lg bg-well px-2.5 text-[calc(12.5px*var(--type-scale))] shadow-well transition-colors hover:bg-foreground/10',
                ),
              ],
              [
                wordsOf(other, h).term,
                ...(met(id) ? [icon(h, Check, 'size-3 shrink-0 text-muted-foreground')] : []),
              ],
            ),
          ],
        ),
      ]
    }),
  )

const links = (entry: GlossaryEntry, h: HtmlBuilder<Message>) =>
  h.ul(
    [h.Class('flex flex-col')],
    entry.links.map((link, index) =>
      h.li(
        [h.Key(link.url)],
        [
          h.a(
            [
              h.Href(link.url),
              h.Target('_blank'),
              h.Rel('noreferrer noopener'),
              h.Class(
                'group inline-flex items-center gap-1 py-1 text-[calc(13px*var(--type-scale))] text-foreground underline decoration-foreground/25 underline-offset-[3px] transition-colors hover:decoration-foreground',
              ),
            ],
            [
              labelOf(entry, index, h),
              icon(
                h,
                ArrowUpRight,
                'size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-px group-hover:-translate-y-px',
              ),
            ],
          ),
        ],
      ),
    ),
  )

const detail = (entry: GlossaryEntry, met: (id: string) => boolean, h: HtmlBuilder<Message>) => {
  const t = copy(h)
  const words = wordsOf(entry, h)
  return h.article(
    [h.Key(entry.id), h.Class('flex flex-col gap-5')],
    [
      h.header(
        [h.Class('flex flex-col gap-1.5')],
        [
          h.span([h.Class(EYEBROW)], [categoryName(t, entry.category)]),
          h.h2(
            [h.Class('text-[calc(20px*var(--type-scale))] font-semibold tracking-[-0.02em]')],
            [words.term],
          ),
          h.p(
            [h.Class('text-[calc(14px*var(--type-scale))] leading-relaxed text-pretty')],
            [words.definition],
          ),
        ],
      ),
      h.div(
        [h.Class(cn(WELL, 'flex flex-col gap-2 p-3.5'))],
        [
          h.span([h.Class(EYEBROW)], [t.glossary.inTheGame]),
          h.p(
            [h.Class('text-[calc(13.5px*var(--type-scale))] leading-relaxed text-pretty')],
            [words.inGame],
          ),
        ],
      ),
      ...(entry.related.length > 0
        ? [section(t.glossary.related, [related(entry, met, h)], h)]
        : []),
      ...(entry.links.length > 0 ? [section(t.glossary.learnMore, [links(entry, h)], h)] : []),
    ],
  )
}

export const glossaryPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const shown = TERMS.filter((entry) =>
    matches(entry, model.glossary.query, model.glossary.category, h),
  )
  const open =
    (model.glossary.focus !== null ? BY_ID.get(model.glossary.focus) : undefined) ??
    shown[0] ??
    TERMS[0]
  const met = (id: string) => model.founder.glossary.includes(id)
  const metCount = TERMS.filter((entry) => met(entry.id)).length
  return shell(
    t.glossary.glossary,
    [
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'flex items-center gap-1 text-[calc(12px*var(--type-scale))] text-muted-foreground compact:hidden',
            ),
          ),
          h.AriaLabel(t.glossary.ofTermsMet(metCount, TERMS.length)),
        ],
        [icon(h, Check, 'size-3.5'), `${metCount} / ${TERMS.length}`],
      ),
      h.label(
        [h.Class(cn(WELL, 'flex h-8 w-56 items-center gap-2 px-2.5 compact:w-40'))],
        [
          icon(h, Search, 'size-3.5 shrink-0 text-muted-foreground'),
          h.input([
            h.Type('search'),
            h.AriaLabel(t.glossary.searchTheGlossary),
            h.Value(model.glossary.query),
            h.OnInput((query) =>
              Message.GlossaryChanged({ message: GlossaryMessage.Searched({ query }) }),
            ),
            h.Class(
              'w-full min-w-0 bg-transparent text-[calc(13px*var(--type-scale))] outline-none',
            ),
          ]),
        ],
      ),
    ],
    [
      filters(model.glossary.category, h),
      h.div(
        [
          h.Class(
            'grid h-[min(560px,64vh)] min-h-0 grid-cols-[232px_minmax(0,1fr)] gap-6 px-5 pb-5 compact:h-auto compact:grid-cols-1 compact:gap-4',
          ),
        ],
        [
          shown.length > 0
            ? h.ul(
                [
                  h.AriaLabel(t.glossary.terms),
                  h.Class(cn('flex min-h-0 flex-col gap-0.5 pr-1 compact:max-h-[28vh]', SCROLL)),
                ],
                shown.map((entry) => row(entry, entry.id === open?.id, met(entry.id), h)),
              )
            : h.p(
                [
                  h.Class(
                    'px-2.5 py-1.5 text-[calc(13px*var(--type-scale))] text-muted-foreground',
                  ),
                ],
                [t.glossary.noMatches],
              ),
          h.div(
            [h.Class(cn('min-h-0 pr-1 compact:max-h-[50vh]', SCROLL))],
            open ? [detail(open, met, h)] : [],
          ),
        ],
      ),
    ],
    'max-w-[960px]',
    h,
  )
}
