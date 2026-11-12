import {
  ACHIEVEMENT_IDS,
  ERAS,
  EXIT_IDS,
  FAMILY_IDS,
  FEATURE_IDS,
  IAC_TOOLS,
  IAC_TOOL_INFO,
  MUTATOR_IDS,
  PERK_IDS,
  POLICY_IDS,
  REGIONS,
  SIZES,
  TASK_IDS,
  VENTURE_IDS,
  rttOf,
} from '@quorum/simulation/catalog'
import { GUIDED, SANDBOX_IDS, type GuidedSandbox } from '@quorum/simulation/sandbox'
import { compact, money } from '@quorum/ui/game/format'
import type { Page } from '../page.ts'
import { componentList } from './components.ts'
import { componentsPlacing } from './graph.ts'
import { incidentPath } from './incidents.ts'
import {
  authored,
  eraName,
  eraPath,
  headingsFor,
  link,
  linkList,
  page,
  paragraph,
  percent,
  researchLink,
  section,
  table,
  titleOf,
  type Lang,
} from './shared.ts'

/* The systems around the board: the team, the infrastructure, prestige, and the Sandboxes. */

const team = (l: Lang): Page => {
  const t = l.t.reference.team
  const { POLICIES, FEATURES, TASKS } = l.cat
  return page(l, {
    path: '/team',
    title: t.title,
    summary: t.summary,
    order: 7,
    aliases: t.aliases,
    headings: headingsFor([l.title('policies'), l.title('features'), l.title('tasks')]),
    text: [
      ...FEATURE_IDS.map((id) => `${FEATURES[id].name} ${FEATURES[id].effect}`),
      ...TASK_IDS.map((id) => TASKS[id].name),
    ].join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          section(
            l.title('policies'),
            [
              table(
                t.policyColumns,
                POLICY_IDS.map((id) => {
                  const def = POLICIES[id]
                  return {
                    key: id,
                    cells: [
                      def.label,
                      `×${def.velocity}`,
                      percent(def.debt),
                      `×${def.badDeploy}`,
                      String(def.deploysPerDay),
                    ],
                  }
                }),
                h,
                [1, 2, 3, 4],
              ),
            ],
            h,
          ),
          section(
            l.title('features'),
            [
              table(
                t.featureColumns,
                FEATURE_IDS.map((id) => {
                  const def = FEATURES[id]
                  return {
                    key: id,
                    cells: [
                      def.research
                        ? h.span([], [def.name, h.br([]), researchLink(l, def.research, h)])
                        : def.name,
                      link(eraPath(def.era), eraName(l, def.era), h),
                      String(def.dh),
                      def.effect,
                      def.hidden ?? '—',
                    ],
                  }
                }),
                h,
                [2],
              ),
            ],
            h,
          ),
          section(
            l.title('tasks'),
            [
              table(
                t.taskColumns,
                TASK_IDS.filter((id) => !TASKS[id].internal).map((id) => {
                  const def = TASKS[id]
                  return {
                    key: id,
                    cells: [
                      def.name,
                      String(def.dh),
                      def.effect,
                      def.research ? researchLink(l, def.research, h) : '—',
                    ],
                  }
                }),
                h,
                [1],
              ),
            ],
            h,
          ),
        ],
      ),
  })
}

const infrastructure = (l: Lang): Page => {
  const t = l.t.reference.infrastructure
  const { FAMILIES, REGION_INFO } = l.cat
  return page(l, {
    path: '/infrastructure',
    title: t.title,
    summary: t.summary,
    order: 8,
    aliases: t.aliases,
    headings: headingsFor([
      l.title('instanceFamilies'),
      l.title('sizes'),
      l.title('regions'),
      l.title('roundTrips'),
      l.title('iacTools'),
    ]),
    text: [
      ...FAMILY_IDS.map((id) => FAMILIES[id].blurb),
      ...REGIONS.map((id) => REGION_INFO[id].name),
    ].join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          section(
            l.title('instanceFamilies'),
            [
              table(
                t.familyColumns,
                FAMILY_IDS.map((id) => {
                  const def = FAMILIES[id]
                  return {
                    key: id,
                    cells: [def.name, `${def.ramPerVcpu} GB`, `×${def.price}`, def.blurb],
                  }
                }),
                h,
                [1, 2],
              ),
            ],
            h,
          ),
          section(
            l.title('sizes'),
            [
              paragraph(t.sizesIntro, h),
              table(
                t.sizeColumns,
                SIZES.map((size) => ({
                  key: size.name,
                  cells: [size.name, String(size.vcpu), `${size.gbps} Gbps`],
                })),
                h,
                [1, 2],
              ),
            ],
            h,
          ),
          section(
            l.title('regions'),
            [
              table(
                t.regionColumns,
                REGIONS.map((id) => {
                  const def = REGION_INFO[id]
                  return {
                    key: id,
                    cells: [def.name, percent(def.share), `+${def.offset / 60} h`],
                  }
                }),
                h,
                [1, 2],
              ),
            ],
            h,
          ),
          section(
            l.title('roundTrips'),
            [
              paragraph(t.roundTripsIntro, h),
              table(
                [t.from, ...REGIONS.map((id) => REGION_INFO[id].short)],
                REGIONS.map((from) => ({
                  key: from,
                  cells: [REGION_INFO[from].name, ...REGIONS.map((to) => `${rttOf(from, to)} ms`)],
                })),
                h,
                REGIONS.map((_, index) => index + 1),
              ),
            ],
            h,
          ),
          section(
            l.title('iacTools'),
            [
              table(
                t.iacColumns,
                IAC_TOOLS.map((id) => {
                  const def = IAC_TOOL_INFO[id]
                  return {
                    key: id,
                    cells: [
                      def.name,
                      def.language,
                      def.refreshOnPlan
                        ? t.onEveryPlan
                        : t.whenYouRun(String(def.refresh), Boolean(def.repair)),
                    ],
                  }
                }),
                h,
              ),
            ],
            h,
          ),
        ],
      ),
  })
}

const prestige = (l: Lang): Page => {
  const t = l.t.reference.prestige
  const { EXITS, PERKS, VENTURES, MUTATORS, ACHIEVEMENTS } = l.cat
  return page(l, {
    path: '/prestige',
    title: t.title,
    summary: t.summary,
    order: 9,
    aliases: t.aliases,
    headings: headingsFor([
      l.title('exits'),
      l.title('perks'),
      l.title('ventures'),
      l.title('mutators'),
      l.title('achievements'),
    ]),
    text: [
      ...PERK_IDS.map((id) => `${PERKS[id].name} ${PERKS[id].effect}`),
      ...VENTURE_IDS.map((id) => `${VENTURES[id].name} ${VENTURES[id].summary}`),
      ...MUTATOR_IDS.map((id) => `${MUTATORS[id].name} ${MUTATORS[id].rule}`),
      ...ACHIEVEMENT_IDS.map((id) => `${ACHIEVEMENTS[id].name} ${ACHIEVEMENTS[id].condition}`),
    ].join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          section(
            l.title('exits'),
            [
              table(
                t.exitColumns,
                EXIT_IDS.map((id) => {
                  const def = EXITS[id]
                  return {
                    key: id,
                    cells: [
                      def.name,
                      link(eraPath(def.stage), l.cat.ERAS[def.stage]?.name ?? '', h),
                      Number.isFinite(def.cap) ? money(def.cap) : t.uncapped,
                      `×${def.multiplier}`,
                      def.continues ? l.t.reference.yes : l.t.reference.no,
                    ],
                  }
                }),
                h,
                [2, 3],
              ),
            ],
            h,
          ),
          section(
            l.title('perks'),
            [
              table(
                t.perkColumns,
                PERK_IDS.map((id) => {
                  const def = PERKS[id]
                  return {
                    key: id,
                    cells: [
                      def.name,
                      def.effect,
                      String(def.costs.length),
                      def.costs.map(compact).join(' · '),
                    ],
                  }
                }),
                h,
                [2, 3],
              ),
            ],
            h,
          ),
          section(
            l.title('ventures'),
            [
              h.p(
                [],
                [
                  t.venturesBefore,
                  link('/ventures', l.t.reference.ventures.title, h),
                  t.venturesAfter,
                ],
              ),
              table(
                t.ventureColumns,
                VENTURE_IDS.map((id) => {
                  const def = VENTURES[id]
                  return {
                    key: id,
                    cells: [link(`/ventures#${id}`, def.name, h), def.summary, `×${def.legacy}`],
                  }
                }),
                h,
                [2],
              ),
            ],
            h,
          ),
          section(
            l.title('mutators'),
            [
              table(
                t.mutatorColumns,
                MUTATOR_IDS.map((id) => {
                  const def = MUTATORS[id]
                  return { key: id, cells: [def.name, def.rule, `+${percent(def.legacy)}`] }
                }),
                h,
                [2],
              ),
            ],
            h,
          ),
          section(
            l.title('achievements'),
            [
              table(
                t.achievementColumns,
                ACHIEVEMENT_IDS.map((id) => {
                  const def = ACHIEVEMENTS[id]
                  return { key: id, cells: [def.name, def.condition] }
                }),
                h,
              ),
            ],
            h,
          ),
        ],
      ),
  })
}

export const sandboxPath = (id: GuidedSandbox['id']): string => `/sandboxes/${id}`

const sandbox = (l: Lang, def: GuidedSandbox): Page => {
  const t = l.t.reference.sandboxes
  const path = sandboxPath(def.id)
  const text = authored(l, path)
  const taughtOn = componentsPlacing(def.id)
  const incidents = [
    ...new Set(def.objectives.flatMap((objective) => objective.incident?.kind ?? [])),
  ]
  return page(l, {
    path,
    title: def.name,
    summary: def.objectives[0]?.goal ?? def.name,
    parent: '/sandboxes',
    order: SANDBOX_IDS.indexOf(def.id),
    era: def.stage,
    aliases: [...t.entityAliases, def.id],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        l.title('objectives'),
        incidents.length ? l.title('incidentsItFires') : null,
        taughtOn.length ? l.title('whereTaught') : null,
      ]),
    ],
    text: `${def.objectives.map((objective) => objective.goal).join(' ')} ${text.text}`,
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          h.p(
            [],
            [t.guidedBefore, link(eraPath(def.stage), eraName(l, def.stage), h), t.guidedAfter],
          ),
          ...(text.view ? [text.view(model, h)] : []),
          section(
            l.title('objectives'),
            [
              h.ol(
                [],
                def.objectives.map((objective, index) =>
                  h.li(
                    [h.Key(String(index))],
                    [
                      objective.goal,
                      objective.users
                        ? h.span(
                            [h.Class('text-muted-foreground')],
                            [t.users(compact(objective.users))],
                          )
                        : h.empty,
                    ],
                  ),
                ),
              ),
            ],
            h,
          ),
          incidents.length
            ? section(
                l.title('incidentsItFires'),
                [
                  h.p(
                    [],
                    [
                      linkList(
                        incidents.map((id) => link(incidentPath(id), l.cat.INCIDENTS[id].name, h)),
                        h,
                      ),
                    ],
                  ),
                ],
                h,
              )
            : h.empty,
          taughtOn.length
            ? section(l.title('whereTaught'), [componentList(l, taughtOn, h)], h)
            : h.empty,
        ],
      ),
    related: ['/sandboxes'],
  })
}

export const systemPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.sandboxes
  const sandboxes = SANDBOX_IDS.map((id) => sandbox(l, l.cat.GUIDED[id]))
  // An Era's heading is anchored by its English name.
  const eraTitles = ERAS.map((era, index) => titleOf(era.name, l.cat.ERAS[index]?.name ?? era.name))
  const sandboxHub = page(l, {
    path: '/sandboxes',
    title: t.title,
    summary: t.summary,
    order: 11,
    aliases: t.aliases,
    headings: headingsFor(
      eraTitles.map((title, index) =>
        sandboxes.some((entry) => entry.era === index) ? title : null,
      ),
    ),
    text: sandboxes.map((entry) => entry.title).join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          ...eraTitles.map((title, index) => {
            const items = SANDBOX_IDS.filter((id) => GUIDED[id].stage === index)
            return items.length
              ? section(
                  title,
                  [
                    h.ul(
                      [],
                      items.map((id) =>
                        h.li([h.Key(id)], [link(sandboxPath(id), l.cat.GUIDED[id].name, h)]),
                      ),
                    ),
                  ],
                  h,
                )
              : h.empty
          }),
        ],
      ),
  })
  return [team(l), infrastructure(l), prestige(l), sandboxHub, ...sandboxes]
}
