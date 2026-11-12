import type { Html } from 'foldkit/html'
import {
  AXES,
  FRAMEWORK_IDS,
  LANGUAGES,
  LANGUAGE_IDS,
  RUNTIME_IDS,
  type Axes,
  type FrameworkDef,
  type RuntimeDef,
} from '@quorum/simulation/catalog'
import { stackLogo } from '@quorum/ui/game/bits'
import { ms } from '@quorum/ui/game/format'
import type { Page } from '../page.ts'
import {
  authored,
  factsBox,
  headingsFor,
  link,
  page,
  paragraph,
  researchLink,
  section,
  table,
  termsSection,
  type Fact,
  type H,
  type Lang,
} from './shared.ts'

/* Languages, runtimes, and frameworks: one page per runtime and framework, and a hub that compares them. */

export const runtimePath = (id: RuntimeDef['id']): string => `/runtimes/${id}`
export const frameworkPath = (id: FrameworkDef['id']): string => `/frameworks/${id}`

/** Five pips per axis, as on the stack picker. */
const axes = (l: Lang, values: Axes, h: H): Html => {
  const t = l.t.reference.stacks
  return table(
    t.axisColumns,
    AXES.map((axis) => ({
      key: axis,
      cells: [
        t.axes[axis],
        h.span(
          [h.AriaLabel(t.pips(values[axis])), h.Class('inline-flex gap-1')],
          [1, 2, 3, 4, 5].map((step) =>
            h.span(
              [
                h.Key(String(step)),
                h.Class(
                  step <= values[axis]
                    ? 'size-2 rounded-full bg-foreground/70'
                    : 'size-2 rounded-full bg-foreground/12',
                ),
              ],
              [],
            ),
          ),
        ),
      ],
    })),
    h,
    [1],
  )
}

const languageFacts = (l: Lang, language: RuntimeDef['language']): ReadonlyArray<Fact> => {
  const t = l.t.reference.stacks
  const def = LANGUAGES[language]
  return [
    { name: t.velocity, value: `×${def.velocity}` },
    { name: t.salary, value: `×${def.salary}` },
    { name: t.build, value: t.minutes(def.buildMinutes) },
  ]
}

const runtimePage = (l: Lang, def: RuntimeDef): Page => {
  const t = l.t.reference.stacks
  const path = runtimePath(def.id)
  const text = authored(l, path)
  const frameworks = FRAMEWORK_IDS.filter((id) => l.cat.FRAMEWORKS[id].language === def.language)
  return page(l, {
    path,
    title: def.name,
    summary: def.blurb,
    parent: '/runtimes',
    order: RUNTIME_IDS.indexOf(def.id),
    era: null,
    aliases: [LANGUAGES[def.language].name, t.models[def.model]],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        l.title('tradeoffs'),
        l.title('frameworks'),
        def.glossary.length ? l.title('engineeringTerms') : null,
      ]),
    ],
    text: `${def.blurb} ${text.text}`,
    aside: (_model, h) =>
      factsBox(
        l,
        def.name,
        stackLogo(def.language, 'size-6', h),
        null,
        [
          { name: t.language, value: LANGUAGES[def.language].name },
          { name: t.concurrency, value: t.models[def.model] },
          { name: t.speed, value: `×${def.speed}` },
          { name: t.memory, value: `${def.memoryMb} MB` },
          { name: t.startup, value: t.seconds(def.startupSeconds) },
          { name: t.warmup, value: def.warmup ? t.seconds(def.warmup) : '—' },
          { name: t.gcPause, value: def.gc ? ms(def.gc.pauseMs) : t.none },
          {
            name: t.unlockedBy,
            value: def.research ? researchLink(l, def.research, h) : t.starterKit,
          },
          ...languageFacts(l, def.language),
        ],
        h,
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          ...(text.view ? [text.view(model, h)] : []),
          section(l.title('tradeoffs'), [axes(l, def.axes, h)], h),
          section(
            l.title('frameworks'),
            [
              h.ul(
                [],
                frameworks.map((id) =>
                  h.li([h.Key(id)], [link(frameworkPath(id), l.cat.FRAMEWORKS[id].name, h)]),
                ),
              ),
            ],
            h,
          ),
          termsSection(l, def.glossary, h),
        ],
      ),
    related: ['/runtimes', ...frameworks.map(frameworkPath)],
  })
}

const frameworkPage = (l: Lang, def: FrameworkDef): Page => {
  const t = l.t.reference.stacks
  const path = frameworkPath(def.id)
  const text = authored(l, path)
  const runtimes = RUNTIME_IDS.filter(
    (id) => def.language === null || l.cat.RUNTIMES[id].language === def.language,
  )
  return page(l, {
    path,
    title: def.name,
    summary: def.blurb,
    parent: '/runtimes',
    order: 100 + FRAMEWORK_IDS.indexOf(def.id),
    aliases: def.language ? [LANGUAGES[def.language].name, t.entityAlias] : [t.entityAlias],
    source: text.source,
    fallback: text.fallback,
    headings: [
      ...text.headings,
      ...headingsFor([
        l.title('tradeoffs'),
        l.title('runsOn'),
        def.glossary.length ? l.title('engineeringTerms') : null,
      ]),
    ],
    text: `${def.blurb} ${text.text}`,
    aside: (_model, h) =>
      factsBox(
        l,
        def.name,
        def.id === 'none' ? null : stackLogo(def.id, 'size-6', h),
        null,
        [
          {
            name: t.language,
            value: def.language ? LANGUAGES[def.language].name : l.t.reference.any,
          },
          { name: t.overhead, value: t.cpuMs(def.overhead) },
          { name: t.velocity, value: `×${def.velocity}` },
          { name: t.memory, value: `+${def.memoryMb} MB` },
          { name: t.startup, value: `+${def.startupSeconds} s` },
          { name: t.orm, value: def.orm ? t.ormYes : l.t.reference.no },
        ],
        h,
      ),
    body: (model, h) =>
      h.div(
        [h.Class('prose')],
        [
          ...(text.view ? [text.view(model, h)] : []),
          section(l.title('tradeoffs'), [axes(l, def.axes, h)], h),
          section(
            l.title('runsOn'),
            [
              h.ul(
                [],
                runtimes.map((id) =>
                  h.li([h.Key(id)], [link(runtimePath(id), l.cat.RUNTIMES[id].name, h)]),
                ),
              ),
            ],
            h,
          ),
          termsSection(l, def.glossary, h),
        ],
      ),
    related: ['/runtimes'],
  })
}

export const stackPages = (l: Lang): ReadonlyArray<Page> => {
  const t = l.t.reference.stacks
  const RUNTIMES = l.cat.RUNTIMES
  const FRAMEWORKS = l.cat.FRAMEWORKS
  const hub = page(l, {
    path: '/runtimes',
    title: t.title,
    summary: t.summary,
    order: 4,
    aliases: t.aliases,
    headings: headingsFor([l.title('languages'), l.title('runtimes'), l.title('frameworks')]),
    text: [
      ...RUNTIME_IDS.map((id) => RUNTIMES[id].name),
      ...FRAMEWORK_IDS.map((id) => FRAMEWORKS[id].name),
    ].join(' '),
    body: (_model, h) =>
      h.div(
        [h.Class('prose')],
        [
          paragraph(t.intro, h),
          section(
            l.title('languages'),
            [
              table(
                t.languageColumns,
                LANGUAGE_IDS.map((id) => {
                  const def = LANGUAGES[id]
                  return {
                    key: id,
                    cells: [
                      h.span(
                        [h.Class('inline-flex items-center gap-2')],
                        [stackLogo(id, 'size-4', h), def.name],
                      ),
                      `×${def.velocity}`,
                      `×${def.salary}`,
                      `×${def.hireTime}`,
                      t.minutes(def.buildMinutes),
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
            l.title('runtimes'),
            [
              table(
                t.runtimeColumns,
                RUNTIME_IDS.map((id) => {
                  const def = RUNTIMES[id]
                  return {
                    key: id,
                    cells: [
                      link(runtimePath(id), def.name, h),
                      t.models[def.model],
                      `×${def.speed}`,
                      `${def.memoryMb} MB`,
                      def.gc ? ms(def.gc.pauseMs) : '—',
                    ],
                  }
                }),
                h,
                [2, 3, 4],
              ),
            ],
            h,
          ),
          section(
            l.title('frameworks'),
            [
              table(
                t.frameworkColumns,
                FRAMEWORK_IDS.map((id) => {
                  const def = FRAMEWORKS[id]
                  return {
                    key: id,
                    cells: [
                      link(frameworkPath(id), def.name, h),
                      def.language ? LANGUAGES[def.language].name : l.t.reference.any,
                      `${def.overhead} ms`,
                      `×${def.velocity}`,
                      def.orm ? l.t.reference.yes : l.t.reference.no,
                    ],
                  }
                }),
                h,
                [2, 3],
              ),
            ],
            h,
          ),
        ],
      ),
  })
  return [
    hub,
    ...RUNTIME_IDS.map((id) => runtimePage(l, RUNTIMES[id])),
    ...FRAMEWORK_IDS.map((id) => frameworkPage(l, FRAMEWORKS[id])),
  ]
}
