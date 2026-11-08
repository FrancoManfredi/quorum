import { cn } from 'cn'
import {
  CVE_TERMS,
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  type GlossaryCategory,
  type GlossaryEntry,
} from '@quorum/simulation/catalog'
import { EYEBROW } from '@quorum/ui/game/bits'
import type { Page } from '../page.ts'
import {
  authored,
  headingsFor,
  link,
  linkList,
  page,
  paragraph,
  section,
  termName,
  termPath,
} from './shared.ts'

/* One page per engineering term, and a hub grouped by category. The game links its terms here. */

const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  performance: 'Performance',
  reliability: 'Reliability',
  observability: 'Observability',
  data: 'Data',
  runtimes: 'Runtimes',
  network: 'Network',
  security: 'Security',
  delivery: 'Delivery',
  team: 'Team',
  business: 'Business',
}

/** Every page the glossary lists: the engineering terms, then the CVEs the Simulation can disclose. */
const ALL_TERMS: ReadonlyArray<GlossaryEntry> = [...GLOSSARY, ...CVE_TERMS]

const entity = (entry: GlossaryEntry): Page => {
  const path = termPath(entry.id)
  const text = authored(path)
  return page({
    path,
    title: entry.term,
    summary: entry.definition,
    parent: '/glossary',
    order: ALL_TERMS.indexOf(entry),
    aliases: [entry.id, CATEGORY_LABELS[entry.category]],
    source: text.source,
    headings: [
      ...headingsFor(['In Quorum', entry.design?.length ? 'Design' : null]),
      ...text.headings,
      ...headingsFor([
        entry.related.length ? 'Read next' : null,
        entry.links.length ? 'Learn more' : null,
      ]),
    ],
    text: `${entry.definition} ${entry.inGame} ${text.text}`,
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          h.p([], [h.span([h.Class(cn(EYEBROW, 'mr-2'))], [CATEGORY_LABELS[entry.category]])]),
          section('In Quorum', [paragraph(entry.inGame, h)], h),
          entry.design?.length
            ? section(
                'Design',
                [
                  h.p(
                    [],
                    [
                      linkList(
                        entry.design.map((target) => link(target.url, target.label, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          ...(text.view ? [text.view(model, h)] : []),
          entry.related.length
            ? section(
                'Read next',
                [
                  h.p(
                    [],
                    [
                      linkList(
                        entry.related.map((id) => link(termPath(id), termName(id), h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          entry.links.length
            ? section(
                'Learn more',
                [
                  h.ul(
                    [],
                    entry.links.map((source) =>
                      h.li(
                        [h.Key(source.url)],
                        [
                          h.a(
                            [h.Href(source.url), h.Rel('noopener'), h.Target('_blank')],
                            [source.label],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                h,
              )
            : h.empty,
        ],
      ),
    related: ['/glossary'],
  })
}

const sorted = [...ALL_TERMS].sort((a, b) => a.term.localeCompare(b.term))
const entities = ALL_TERMS.map(entity)

const hub = page({
  path: '/glossary',
  title: 'Glossary',
  summary:
    'The real engineering terms behind the game: what each means at work, and what it does in Quorum.',
  order: 6,
  aliases: ['terms', 'definitions', 'dictionary'],
  headings: headingsFor(GLOSSARY_CATEGORIES.map((category) => CATEGORY_LABELS[category])),
  text: ALL_TERMS.map((entry) => entry.term).join(' '),
  body: (_model, h) =>
    h.div(
      [h.Class('prose')],
      [
        paragraph(
          'Quorum models real systems, so its words are real words. Each term has the meaning you would use at work, and what it does in the game. Security also lists the advisories the Simulation can disclose.',
          h,
        ),
        ...GLOSSARY_CATEGORIES.map((category) =>
          section(
            CATEGORY_LABELS[category],
            [
              h.ul(
                [h.Class('not-prose grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3')],
                sorted
                  .filter((entry) => entry.category === category)
                  .map((entry) =>
                    h.li(
                      [h.Key(entry.id), h.Class('text-[14px]')],
                      [link(termPath(entry.id), entry.term, h)],
                    ),
                  ),
              ),
            ],
            h,
          ),
        ),
      ],
    ),
})

export const glossaryPages: ReadonlyArray<Page> = [hub, ...entities]
