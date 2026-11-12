import { cn } from 'cn'
import { CVE_TERMS, GLOSSARY_CATEGORIES, type GlossaryEntry } from '@quorum/simulation/catalog'
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
  titleOf,
  type Lang,
} from './shared.ts'

/* One page per engineering term, and a hub grouped by category. The game links its terms here. */

/** The English heading of each category, which anchors it in every language. */
const CATEGORY_NAMES: Readonly<Record<(typeof GLOSSARY_CATEGORIES)[number], string>> = {
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

const entity = (l: Lang, entry: GlossaryEntry, order: number): Page => {
  const path = termPath(entry.id)
  const text = authored(l, path)
  const category = l.t.reference.categories[entry.category]
  return page(l, {
    path,
    title: entry.term,
    summary: entry.definition,
    parent: '/glossary',
    order,
    aliases: [...new Set([entry.id, category, CATEGORY_NAMES[entry.category]])],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...headingsFor([l.title('inQuorum'), entry.design?.length ? l.title('design') : null]),
      ...text.headings,
      ...headingsFor([
        entry.related.length ? l.title('readNext') : null,
        entry.links.length ? l.title('learnMore') : null,
      ]),
    ],
    text: `${entry.definition} ${entry.inGame} ${text.text}`,
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          h.p([], [h.span([h.Class(cn(EYEBROW, 'mr-2'))], [category])]),
          section(l.title('inQuorum'), [paragraph(entry.inGame, h)], h),
          entry.design?.length
            ? section(
                l.title('design'),
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
                l.title('readNext'),
                [
                  h.p(
                    [],
                    [
                      linkList(
                        entry.related.map((id) => link(termPath(id), termName(l, id), h)),
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
                l.title('learnMore'),
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

export const glossaryPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.glossary
  // Every page the glossary lists: the engineering terms, then the CVEs the Simulation can disclose.
  const terms: ReadonlyArray<GlossaryEntry> = [...l.cat.GLOSSARY, ...CVE_TERMS]
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, l.locale))
  const entities = terms.map((entry, index) => entity(l, entry, index))
  // A category's heading is anchored by its English name.
  const categories = GLOSSARY_CATEGORIES.map((category) =>
    titleOf(CATEGORY_NAMES[category], l.t.reference.categories[category]),
  )
  const hub = page(l, {
    path: '/glossary',
    title: t.title,
    summary: t.summary,
    order: 6,
    aliases: t.aliases,
    headings: headingsFor(categories),
    text: terms.map((entry) => entry.term).join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          ...GLOSSARY_CATEGORIES.map((category, index) =>
            section(
              categories[index] ?? titleOf(category, category),
              [
                h.ul(
                  [h.Class('not-prose grid gap-x-6 gap-y-1.5 sm:grid-cols-2')],
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
  return [hub, ...entities]
}
