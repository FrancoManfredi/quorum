import type { Html } from 'foldkit/html'
import {
  DOCK_GROUPS,
  DOCK_OF,
  COMPONENTS,
  COMPONENT_IDS,
  COPY_PRICE_GROWTH,
  CVE_DEFS,
  REQUEST_KINDS,
  RESEARCH,
  SELL_REFUND,
  SIZES,
  type ComponentDef,
  type ComponentId,
} from '@quorum/simulation/catalog'
import { BY_COMPONENT } from '@quorum/simulation/term-links'
import { groupBadge } from '@quorum/ui/game/bits'
import { money, ms } from '@quorum/ui/game/format'
import { COMPONENT_ICONS } from '@quorum/ui/game/icons'
import { nodeCard } from '../components/node-card.ts'
import type { Page } from '../page.ts'
import { researchNext, worksWith } from './graph.ts'
import {
  authored,
  cardGrid,
  eraName,
  eraPath,
  factsBox,
  headingsFor,
  hubCard,
  link,
  linkList,
  page,
  paragraph,
  researchLink,
  section,
  termsSection,
  titleOf,
  type Fact,
  type H,
  type Lang,
} from './shared.ts'

/* One page per Component, and the Components hub. Every fact comes from COMPONENTS. */

export const componentPath = (id: ComponentId): string => `/components/${id}`

/** The Era a Component becomes available in: its unlocking Research's, or Garage. */
export const componentEra = (def: ComponentDef): number =>
  def.unlock ? RESEARCH[def.unlock].era : 0

/** The dock groups' headings: the group's name in the language, anchored by its English name. */
const dockTitles = (l: Lang) =>
  DOCK_GROUPS.map((group, index) =>
    titleOf(group.label, l.cat.DOCK_GROUPS[index]?.label ?? group.label),
  )

export const componentBadge = (id: ComponentId, size: string, h: H): Html =>
  groupBadge(COMPONENTS[id].group, COMPONENT_ICONS[id], size, h)

const kinds = (l: Lang, list: ReadonlyArray<keyof Lang['cat']['KINDS']>): string =>
  list.length === REQUEST_KINDS.length
    ? l.t.reference.components.everyKind
    : list.length
      ? list.map((kind) => l.cat.KINDS[kind].label).join(', ')
      : '—'

const facts = (l: Lang, def: ComponentDef, h: H): ReadonlyArray<Fact> => {
  const t = l.t.reference.components
  return [
    { name: t.code, value: def.code },
    { name: t.realProduct, value: def.product },
    {
      name: t.group,
      value: l.cat.DOCK_GROUPS.find((group) => group.key === DOCK_OF[def.id])?.label ?? def.group,
    },
    {
      name: t.unlockedBy,
      value: def.unlock ? researchLink(l, def.unlock, h) : t.starterKit,
    },
    {
      name: t.era,
      value: link(eraPath(componentEra(def)), eraName(l, componentEra(def)), h),
    },
    ...(def.fixed
      ? [{ name: t.placed, value: t.alwaysOnBoard }]
      : [
          { name: t.place, value: t.firstCopy(money(def.cost)) },
          { name: t.burn, value: def.sized ? t.byInstanceType : `${money(def.burn)}/s` },
        ]),
    {
      name: t.sizes,
      value: def.sized
        ? t.sizeRange(SIZES[0].name, SIZES[SIZES.length - 1]?.name ?? '')
        : String(def.steps),
    },
    { name: t.overhead, value: def.latency ? ms(def.latency) : '—' },
    { name: t.takes, value: kinds(l, def.accepts) },
    { name: t.sends, value: kinds(l, def.sends) },
    ...(def.coldStart ? [{ name: t.coldStart, value: l.t.reference.yes }] : []),
  ]
}

const rules = (l: Lang, def: ComponentDef, h: H): ReadonlyArray<Html> => {
  const t = l.t.reference.components
  return def.fixed
    ? [paragraph(t.fixed(def.name), h)]
    : [
        h.ul(
          [],
          [
            h.li([], [t.copyGrowth(Math.round((COPY_PRICE_GROWTH - 1) * 100))]),
            h.li([], [t.sellRefund(Math.round(SELL_REFUND * 100))]),
            h.li(
              [],
              [def.sized ? t.sizedRule : def.steps > 1 ? t.stepsRule(def.steps) : t.oneSize],
            ),
            ...(def.coldStart ? [h.li([], [t.coldRule])] : []),
            ...(def.tap ? [h.li([], [t.tapRule])] : []),
            ...(def.control ? [h.li([], [t.controlRule])] : []),
          ],
        ),
      ]
}

/** Components as a comma-separated list of links. */
export const componentList = (l: Lang, ids: ReadonlyArray<ComponentId>, h: H): Html =>
  h.p(
    [],
    [
      linkList(
        ids.map((id) => link(componentPath(id), l.cat.COMPONENTS[id].name, h)),
        h,
      ),
    ],
  )

const entity = (l: Lang, def: ComponentDef): Page => {
  const t = l.t.reference.components
  const path = componentPath(def.id)
  const text = authored(l, path)
  const cves = CVE_DEFS.filter((cve) => cve.affects.includes(def.id))
  const terms = BY_COMPONENT[def.id]
  const partners = worksWith(def.id)
  const next = researchNext(def.id)
  const unlockName = def.unlock ? l.cat.RESEARCH[def.unlock].name : def.name
  return page(l, {
    path,
    title: def.name,
    summary: def.blurb,
    parent: '/components',
    order: COMPONENT_IDS.indexOf(def.id),
    era: componentEra(def),
    aliases: [def.code, def.product, ...def.product.split(/[,/]/).map((name) => name.trim())],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        l.title('rules'),
        partners.length ? l.title('worksWith') : null,
        next.length ? l.title('researchNext') : null,
        cves.length ? l.title('security') : null,
        terms?.length ? l.title('engineeringTerms') : null,
      ]),
    ],
    text: `${def.product} ${def.blurb} ${text.text}`,
    aside: (_model, h) =>
      h.div(
        [h.Class('flex flex-col gap-4')],
        [
          // The card as it stands on the board, drawn by the board itself.
          h.div(
            [h.Class('overflow-hidden rounded-lg border border-border bg-canvas')],
            [nodeCard(def.id, h)],
          ),
          factsBox(
            l,
            def.name,
            componentBadge(def.id, 'size-8', h),
            def.group,
            facts(l, def, h),
            h,
          ),
        ],
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          ...(text.view ? [text.view(model, h)] : []),
          section(l.title('rules'), rules(l, def, h), h),
          partners.length
            ? section(l.title('worksWith'), [componentList(l, partners, h)], h)
            : h.empty,
          next.length
            ? section(
                l.title('researchNext'),
                [
                  paragraph(t.researchNextIntro(unlockName), h),
                  h.p(
                    [],
                    [
                      linkList(
                        next.map((id) => researchLink(l, id, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          cves.length
            ? section(
                l.title('security'),
                [
                  paragraph(t.securityIntro, h),
                  h.ul(
                    [],
                    cves.map((cve) => h.li([h.Key(cve.id)], [t.cve(cve.id, cve.score.toFixed(1))])),
                  ),
                ],
                h,
              )
            : h.empty,
          termsSection(l, terms, h),
        ],
      ),
    related: [...(def.unlock ? [`/research/${def.unlock}`] : []), `/components`],
  })
}

export const componentPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.components
  const entities = COMPONENT_IDS.map((id) => entity(l, l.cat.COMPONENTS[id]))
  const titles = dockTitles(l)
  const hub = page(l, {
    path: '/components',
    title: t.title,
    summary: t.summary,
    order: 1,
    aliases: t.aliases,
    headings: headingsFor(titles),
    text: entities.map((entry) => entry.title).join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          ...DOCK_GROUPS.map((group, index) =>
            section(
              titles[index] ?? titleOf(group.label, group.label),
              [
                cardGrid(
                  COMPONENT_IDS.filter((id) => DOCK_OF[id] === group.key).map((id) => {
                    const def = l.cat.COMPONENTS[id]
                    const entry = entities.find(
                      (candidate) => candidate.path === componentPath(id),
                    )!
                    return hubCard(
                      entry,
                      componentBadge(id, 'size-9 shrink-0', h),
                      `${def.code} · ${eraName(l, componentEra(def))}`,
                      h,
                    )
                  }),
                  h,
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
