import { copyIn, nodeTitle, type Messages } from '@/i18n/messages.ts'
import { copy, localized, eraWords } from '@/i18n/messages.ts'
import * as Effect from 'effect/Effect'
import { Mount } from 'foldkit'
import { UrlRequest } from 'foldkit/navigation'
import { DISCLAIMER_URL, PRIVACY_URL, SOURCE_URL, WIKI_URL } from '@/platform/analytics.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Coffee,
  Download,
  Trash2,
  Lock,
  ScrollText,
  Settings,
  Store,
  Trophy,
} from 'lucide'
import { icon } from '@quorum/ui/primitives/icon'
import { githubMark } from '@quorum/ui/primitives/github'
import { companyMark } from '@/components/company-mark.ts'
import { connecting, titleIsOpen } from './boot-machine.ts'
import {
  ACHIEVEMENT_IDS,
  COMPONENTS,
  ERAS,
  MUTATORS,
  MUTATOR_IDS,
  PERKS,
  PERK_IDS,
  VENTURES,
  VENTURE_IDS,
} from '@quorum/simulation/catalog'
import { foundingOf, levelOf, perkPrice } from '@quorum/simulation/founder'
import { legacyMultiplier, startEra } from '@quorum/simulation/founding'
import { solveFlow } from '@quorum/simulation/solve'
import type { Game } from '@quorum/simulation/state'
import { CHALLENGES, challengeById, dailyDrill } from '@quorum/simulation/challenges'
import { TRACKS, sandboxOpen } from '@quorum/simulation/sandbox'
import { clock, compact } from '@quorum/ui/game/format'
import { Message } from './message.ts'
import { PrefsMessage } from './prefs.ts'
import { boardChallenge, boardSandbox, currentFile, hasCompany, type Model } from './model.ts'
import { LOGOS } from './logos.ts'
import { MAX_COMPANY_NAME, hasRecovered, nameOr, recent, type CompanyFile } from './saves.ts'
import { menuOf, type MenuPage } from './route.ts'
import { supportedLocales } from '../i18n/index.ts'
import { play } from './sound.ts'

type Page = typeof MenuPage.Type | 'main' | 'save'

/** The page the screen showed before main, so Back lands on the row that opened it. */
let lastPage: Page = 'main'

const rowsOf = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLElement>('.booth-list [data-row]')].filter(
    (row) => !(row instanceof HTMLButtonElement && row.disabled),
  )

/** The title's Mounts. A Scene test resolves them by hand. */
export const BoothDriver = Mount.define('BoothDriver', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const screen = element.querySelector<HTMLElement>('.booth-screen')
        const mouse = element.querySelector<HTMLElement>('.booth-mouse')
        const keys = [...element.querySelectorAll<HTMLElement>('.booth-key')]
        const light = (name: string) => {
          const key =
            keys.find((key) => key.dataset.k === name) ??
            keys[Math.floor(Math.random() * keys.length)]
          if (!key) return
          key.classList.remove('is-lit')
          void key.offsetWidth
          key.classList.add('is-lit')
        }
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.altKey || event.metaKey || event.ctrlKey) return
          const target = event.target
          if (target instanceof Element && target !== document.body && !element.contains(target))
            return
          if (element.querySelector('.booth-term')) return
          // A name is typed, not navigated: Enter and the vertical arrows step out of the field.
          if (target instanceof HTMLInputElement) {
            if (event.key === 'Escape') {
              event.preventDefault()
              target.blur()
              return
            }
            if (event.key !== 'Enter' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
              return
            event.preventDefault()
            const rows = rowsOf(element)
            const at = rows.indexOf(target)
            const step = event.key === 'ArrowUp' ? -1 : 1
            const next = rows[at < 0 ? 0 : (at + step + rows.length) % rows.length]
            next?.focus()
            return
          }
          light(event.key === ' ' ? 'Space' : event.key)
          play('tick')
          const rows = rowsOf(element)
          const at = rows.indexOf(document.activeElement as HTMLElement)
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            const next = rows[at < 0 ? 0 : (at + step + rows.length) % rows.length]
            if (next && next !== rows[at]) {
              next.focus()
              play('hover')
            }
          } else if (['Escape', 'Backspace', 'ArrowLeft'].includes(event.key)) {
            const back = element.querySelector<HTMLElement>('[data-back]')
            if (back) {
              event.preventDefault()
              back.click()
            }
          } else if (
            event.key === 'ArrowRight' ||
            ((event.key === 'Enter' || event.key === ' ') && at < 0)
          ) {
            event.preventDefault()
            if (at < 0) rows[0]?.focus()
            else rows[at]?.click()
          }
        }
        const onPointerOver = (event: Event) => {
          if (!(event instanceof PointerEvent)) return
          const row = event.target instanceof Element ? event.target.closest('[data-row]') : null
          if (!(row instanceof HTMLElement) || row === document.activeElement) return
          if (row instanceof HTMLButtonElement && row.disabled) return
          row.focus({ preventScroll: true })
          if (event.pointerType !== 'touch') play('hover')
        }
        const onPointerMove = (event: Event) => {
          if (!(event instanceof PointerEvent)) return
          if (!screen || event.pointerType === 'touch') return
          const box = screen.getBoundingClientRect()
          const x = event.clientX - box.left
          if (mouse) mouse.style.translate = `${((x / box.width - 0.5) * 60).toFixed(1)}% 0`
        }
        const onPointerDown = () => mouse?.classList.add('is-down')
        const onPointerUp = () => mouse?.classList.remove('is-down')
        const onClick = (event: Event) => {
          if (event.target instanceof Element && event.target.closest('button')) play('choose')
        }
        window.addEventListener('keydown', onKeyDown)
        element.addEventListener('pointerover', onPointerOver)
        element.addEventListener('pointermove', onPointerMove)
        element.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('pointerup', onPointerUp)
        element.addEventListener('click', onClick)
        return () => {
          window.removeEventListener('keydown', onKeyDown)
          element.removeEventListener('pointerover', onPointerOver)
          element.removeEventListener('pointermove', onPointerMove)
          element.removeEventListener('pointerdown', onPointerDown)
          window.removeEventListener('pointerup', onPointerUp)
          element.removeEventListener('click', onClick)
        }
      }),
      (cleanup) => Effect.sync(cleanup),
    ).pipe(Effect.as(Message.Synced())),
})

/** Each page puts the selection on its first row after Back, or main on the row that opened the last page. */
export const PageMounted = Mount.define('PageMounted', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.sync(() => {
      const page = (element.getAttribute('data-page') ?? 'main') as Page
      const rows = rowsOf(element.parentElement ?? element)
      const from = page === 'main' ? rows.find((row) => row.dataset.to === lastPage) : undefined
      lastPage = page
      ;(from ?? rows.find((row) => !('back' in row.dataset)) ?? rows[0])?.focus({
        preventScroll: true,
      })
      return Message.Synced()
    }),
})

const GLYPHS: ReadonlyArray<{ at: number; paths: ReadonlyArray<string> }> = [
  { at: 0, paths: ['M89 11V150', 'M50 11a39 39 0 1 0 0.01 0'] },
  { at: 120, paths: ['M11 0V50a39 39 0 0 0 78 0', 'M89 0V100'] },
  { at: 240, paths: ['M50 11a39 39 0 1 0 0.01 0'] },
  { at: 360, paths: ['M11 0V100', 'M11 50a39 39 0 0 1 39-39H60'] },
  { at: 440, paths: ['M11 0V50a39 39 0 0 0 78 0', 'M89 0V100'] },
  {
    at: 560,
    paths: ['M11 0V100', 'M11 45a34.5 34.5 0 0 1 69 0V100', 'M80 45a34.5 34.5 0 0 1 69 0V100'],
  },
]

const glyphPaths = (
  paths: ReadonlyArray<string>,
  at: number,
  delay: number,
  h: HtmlBuilder<Message>,
) =>
  paths.map((d) =>
    h.path([
      h.D(d),
      h.Transform(`translate(${at} 0)`),
      h.PathLength('1'),
      h.Style({ 'animation-delay': `${delay}ms` }),
    ]),
  )

const wordmark = (h: HtmlBuilder<Message>): Html =>
  h.svg(
    [h.ViewBox('0 0 720 194'), h.Class('booth-wordmark'), h.Role('img'), h.AriaLabel('Quorum')],
    [
      ...GLYPHS.flatMap(({ at, paths }, letter) => glyphPaths(paths, at, 300 + letter * 70, h)),
      h.circle([h.Cx('89'), h.Cy('180'), h.R('14')]),
    ],
  )

type Row = Readonly<{
  key: string
  label: string
  detail?: string
  side?: Html | string | undefined
  mark?: Html
  message: Message | null
  big?: boolean
  back?: boolean
  to?: Page
  pressed?: boolean
  record?: boolean
  danger?: boolean
  /** Holds at the bottom of a scrolling page: the founding screen's Found action. */
  sticky?: boolean
}>

const row = (r: Row, h: HtmlBuilder<Message>): Html => {
  const body = [
    r.back ? h.span([h.Class('booth-mark'), h.AriaHidden(true)], ['‹']) : h.empty,
    r.mark ?? h.empty,
    h.span(
      [h.Class('booth-label')],
      [h.span([], [r.label]), r.detail ? h.span([h.Class('booth-detail')], [r.detail]) : h.empty],
    ),
    r.side === undefined
      ? h.empty
      : typeof r.side === 'string'
        ? h.span([h.Class('booth-side')], [r.side])
        : h.span([h.Class('booth-side')], [r.side]),
  ]
  const className = `booth-row ${r.big ? 'is-big' : ''} ${r.back ? 'is-back' : ''} ${r.danger ? 'is-danger' : ''} ${r.sticky ? 'is-sticky' : ''}`
  if (r.record)
    return h.div(
      [h.Key(r.key), h.Tabindex(-1), h.DataAttribute('row', ''), h.Class(`${className} is-record`)],
      body,
    )
  return h.button(
    [
      h.Key(r.key),
      h.Type('button'),
      h.Disabled(r.message === null),
      ...(r.message ? [h.OnClick(r.message)] : []),
      h.DataAttribute('row', ''),
      ...(r.back ? [h.DataAttribute('back', '')] : []),
      ...(r.to ? [h.DataAttribute('to', r.to)] : []),
      ...(r.pressed === undefined ? [] : [h.AriaPressed(r.pressed ? 'true' : 'false')]),
      h.Class(className),
    ],
    body,
  )
}

const done = (h: HtmlBuilder<Message>) => icon(h, Check, 'booth-icon text-ok')
const locked = (h: HtmlBuilder<Message>) => icon(h, Lock, 'booth-icon')

const backRow = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return row(
    { key: 'back', label: t.title.back, message: Message.MenuChosen({ menu: 'main' }), back: true },
    h,
  )
}

const group = (text: string, h: HtmlBuilder<Message>): Html =>
  h.span([h.Key(`group-${text}`), h.Class('booth-group')], [text])

const mainRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const game = model.board.game
  const file = currentFile(model)
  const current = hasCompany(model) ? file : null
  const count = model.saves.companies.length
  return [
    ...(current
      ? [
          row(
            {
              key: 'continue',
              mark: companyMark(current.logo, 'booth-logo-mini', h),
              label: t.title.continueText,
              detail: `${current.name} · ${t.title.eraUsersTime(eraWords(t, game).name, compact(game.users), clock(game.time))}`,
              message: Message.Continued(),
              big: true,
            },
            h,
          ),
        ]
      : []),
    row(
      {
        key: 'new',
        label: current ? t.title.newCompany : t.title.startACompany,
        message: Message.MenuChosen({ menu: 'found' }),
        big: !current,
        to: 'found',
      },
      h,
    ),
    ...(count > 0
      ? [
          row(
            {
              key: 'companies',
              label: t.title.companies,
              detail: t.title.savedCount(count),
              message: Message.MenuChosen({ menu: 'companies' }),
              to: 'companies',
            },
            h,
          ),
        ]
      : []),
    row({ key: 'preseed', label: t.title.startInPreSeed, message: Message.PreseedStarted() }, h),
    row(
      {
        key: 'sandbox',
        label: t.title.sandbox,
        message: Message.MenuChosen({ menu: 'sandbox' }),
        to: 'sandbox',
      },
      h,
    ),
    row(
      {
        key: 'challenges',
        label: t.title.challenges,
        message: Message.MenuChosen({ menu: 'challenges' }),
        to: 'challenges',
      },
      h,
    ),
  ]
}

const sandboxRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    backRow(h),
    ...TRACKS.flatMap((track) => [
      group(t.catalog.eras[track.stage]?.name ?? '', h),
      ...track.sandboxes.map((id) => {
        const open = sandboxOpen(id, model.passed)
        return row(
          {
            key: id,
            label: t.catalog.guided[id].name,
            side: model.passed.includes(id) ? done(h) : open ? undefined : locked(h),
            message: open ? Message.GuidedStarted({ id }) : null,
          },
          h,
        )
      }),
    ]),
    group('', h),
    row({ key: 'free', label: t.title.freeSandbox, message: Message.FreeSandboxStarted() }, h),
  ]
}

/** The founding screen's identity: the chosen logo, and the name above the fold. */
const identity = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('booth-identity')],
    [
      companyMark(model.draft.logo, 'booth-logo-big', h),
      h.label(
        [h.Class('booth-field')],
        [
          h.span([h.Class('booth-field-label')], [t.title.companyName]),
          h.input([
            h.Class('booth-input'),
            h.Type('text'),
            h.Value(model.draft.name),
            h.Placeholder(t.title.nameYourCompany),
            h.Maxlength(MAX_COMPANY_NAME),
            h.Autocomplete('off'),
            h.Spellcheck(false),
            h.AriaLabel(t.title.companyName),
            h.DataAttribute('row', ''),
            h.OnInput((name) => Message.CompanyNameChanged({ name })),
          ]),
        ],
      ),
    ],
  )
}

/** A logo is one click, and each tile carries its own accessible name. */
const logoPicker = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('booth-logos')],
    LOGOS.map((logo) =>
      h.button(
        [
          h.Key(`logo-${logo.id}`),
          h.Type('button'),
          h.Class(`booth-logo ${model.draft.logo === logo.id ? 'is-on' : ''}`),
          h.Title(t.logos[logo.id]),
          h.AriaLabel(t.logos[logo.id]),
          h.AriaPressed(model.draft.logo === logo.id ? 'true' : 'false'),
          h.DataAttribute('row', ''),
          h.OnClick(Message.LogoChosen({ logo: logo.id })),
        ],
        [companyMark(logo.id, 'booth-logo-mark', h)],
      ),
    ),
  )
}

const foundRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const founder = model.founder
  const founding = foundingOf(founder)
  return [
    backRow(h),
    identity(model, h),
    group(t.title.logo, h),
    logoPicker(model, h),
    group(t.title.venture, h),
    ...VENTURE_IDS.map((id) => {
      const def = localized(VENTURES[id], t.catalog.ventures[id])
      return row(
        {
          key: id,
          label: def.name,
          detail: def.summary,
          side: id === founding.venture ? done(h) : `×${def.legacy.toFixed(1)}`,
          message: Message.VentureChosen({ id }),
          pressed: id === founding.venture,
        },
        h,
      )
    }),
    group(t.title.mutators, h),
    ...MUTATOR_IDS.map((id) =>
      row(
        {
          key: id,
          label: t.catalog.mutators[id].name,
          detail: t.catalog.mutators[id].rule,
          side: founding.mutators.includes(id)
            ? done(h)
            : `+${Math.round(MUTATORS[id].legacy * 100)}%`,
          message: Message.MutatorToggled({ id }),
          pressed: founding.mutators.includes(id),
        },
        h,
      ),
    ),
    group('', h),
    row(
      {
        key: 'found',
        mark: companyMark(model.draft.logo, 'booth-logo-mini', h),
        label: t.title.found(nameOr(model.draft.name)),
        detail: t.title.legacy2(startEra(founding), legacyMultiplier(founding).toFixed(2)),
        message: Message.CompanyFounded(),
        big: true,
        sticky: true,
      },
      h,
    ),
  ]
}

/** The Companies page: every file, newest first, with the one Continue opens marked. */
const companyRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    backRow(h),
    ...recent(model.saves.companies).map((file) =>
      row(
        {
          key: file.id,
          mark: companyMark(file.logo, 'booth-logo-mini', h),
          label: file.name,
          detail: `${t.catalog.ventures[file.venture].name} · ${t.title.eraUsersTime(t.catalog.eras[file.stage]?.name ?? '', compact(file.users), clock(file.time))}`,
          side:
            file.online !== null
              ? `${t.room.onlineMark} · ${file.online.code}`
              : file.id === model.saves.current
                ? t.title.current
                : dateOf(file),
          message: Message.CompanyChosen({ id: file.id }),
        },
        h,
      ),
    ),
    ...(model.saves.companies.length === 0 ? [group(t.title.noCompaniesSavedYet, h)] : []),
  ]
}

const dateOf = (file: CompanyFile): string =>
  new Date(file.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** One Company's file: what it is, then Open, then Delete behind a second press. */
const saveRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const file = model.saves.companies.find((entry) => entry.id === model.saveFocus)
  if (!file) return [backRow(h)]
  return [
    row({ key: 'back', label: t.title.companies, message: Message.CompanyClosed(), back: true }, h),
    h.div(
      [h.Class('booth-file')],
      [
        companyMark(file.logo, 'booth-logo-big', h),
        h.div(
          [h.Class('booth-file-text')],
          [
            h.span([h.Class('booth-file-name')], [file.name]),
            h.span(
              [h.Class('booth-detail')],
              [
                `${t.catalog.ventures[file.venture].name} · ${t.title.eraUsersTime(t.catalog.eras[file.stage]?.name ?? '', compact(file.users), clock(file.time))}`,
              ],
            ),
            h.span(
              [h.Class('booth-detail')],
              [
                file.mutators.length > 0 ? `${t.title.mutatorCount(file.mutators.length)} · ` : '',
                t.title.started(
                  new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                ),
              ],
            ),
          ],
        ),
      ],
    ),
    row(
      {
        key: 'open',
        label: file.id === model.saves.current ? t.title.continueText : t.title.openCompany,
        side: file.id === model.saves.current ? t.title.current : undefined,
        message: Message.CompanyOpened({ id: file.id }),
        big: true,
      },
      h,
    ),
    ...(model.saveConfirm._tag === 'Confirming'
      ? [
          row(
            {
              key: 'delete',
              label: t.title.deleteForever,
              detail: t.title.theCompanyAndItsDesignAre,
              message: Message.CompanyDeleteConfirmed(),
              danger: true,
            },
            h,
          ),
          row(
            {
              key: 'keep',
              label: t.title.keepCompany,
              message: Message.CompanyDeleteCancelled(),
            },
            h,
          ),
        ]
      : [
          row(
            {
              key: 'delete',
              label: t.title.deleteCompany,
              side: icon(h, Trash2, 'booth-icon'),
              message: Message.CompanyDeleteAsked(),
            },
            h,
          ),
        ]),
  ]
}

const challengeRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const founder = model.founder
  const drill = model.today ? dailyDrill(model.today) : null
  const challenge = (id: string, name: string, detail: string, legacy: number) =>
    row(
      {
        key: id,
        label: name,
        detail,
        side: founder.completed.includes(id)
          ? done(h)
          : legacy > 0
            ? t.title.legacy(legacy)
            : undefined,
        message: Message.ChallengeStarted({ id }),
      },
      h,
    )
  return [
    backRow(h),
    ...(drill ? [challenge(drill.id, t.title.dailyDrill, drill.brief, 0)] : []),
    ...ERAS.flatMap((era, stage) => {
      const list = CHALLENGES.filter((entry) => entry.era === stage)
      return list.length === 0
        ? []
        : [
            group(t.catalog.eras[stage]?.name ?? era.name, h),
            ...list.map((entry) =>
              challenge(
                entry.id,
                t.catalog.challenges[entry.id]!.name,
                t.catalog.challenges[entry.id]!.brief,
                entry.legacy,
              ),
            ),
          ]
    }),
  ]
}

const legacyRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    backRow(h),
    ...PERK_IDS.map((id) => {
      const def = localized(PERKS[id], t.catalog.perks[id])
      const price = perkPrice(model.founder, id)
      return row(
        {
          key: id,
          label: `${def.name} ${levelOf(model.founder, id)}/${def.costs.length}`,
          detail: def.effect,
          side: price === null ? done(h) : t.title.legacy(price),
          message:
            price !== null && model.founder.legacy >= price ? Message.PerkBought({ id }) : null,
        },
        h,
      )
    }),
  ]
}

const historyRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    backRow(h),
    ...(model.founder.history.length === 0
      ? [group(t.title.noExitsYet, h)]
      : model.founder.history
          .map((entry, index) =>
            row(
              {
                key: `h${index}`,
                label:
                  entry.name ||
                  `${t.catalog.exits[entry.exit].name} · ${t.catalog.ventures[entry.founding.venture].name}`,
                detail: `${entry.name ? `${t.catalog.exits[entry.exit].name} · ` : ''}${t.catalog.ventures[entry.founding.venture].name} · ${t.title.eraUsersTime(t.catalog.eras[entry.stage]?.name ?? '', compact(entry.peak), clock(entry.time))}`,
                side: `+${entry.legacy}`,
                message: null,
                record: true,
              },
              h,
            ),
          )
          .toReversed()),
  ]
}

const achievementRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  return [
    backRow(h),
    ...ACHIEVEMENT_IDS.map((id) => {
      const earned = model.founder.achievements.includes(id)
      return row(
        {
          key: id,
          label: t.catalog.achievements[id].name,
          detail: t.catalog.achievements[id].condition,
          side: h.span(
            [h.Class('flex items-center')],
            [
              earned ? done(h) : locked(h),
              h.span([h.Class('sr-only')], [earned ? t.title.earned : t.title.notYet]),
            ],
          ),
          message: null,
          record: true,
        },
        h,
      )
    }),
  ]
}

/** Settings as rows: each switch shows On or Off, and Language steps to the next one. */
const settingsRows = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)

  const at = supportedLocales.findIndex(({ value }) => value === model.prefs.locale)
  const next = supportedLocales[(at + 1) % supportedLocales.length]!
  const toggle = (key: string, label: string, on: boolean, message: Message) =>
    row({ key, label, side: on ? t.title.on : t.title.off, message, pressed: on }, h)
  return [
    backRow(h),
    toggle(
      'muted',
      t.title.muteSoundM,
      model.prefs.muted,
      Message.PrefsChanged({ message: PrefsMessage.MuteToggled() }),
    ),
    toggle(
      'easy-mode',
      t.title.easyMode,
      model.prefs.easyMode,
      Message.PrefsChanged({ message: PrefsMessage.EasyModeToggled() }),
    ),
    ...(model.prefs.easyMode
      ? [
          toggle(
            'auto-pause',
            t.title.pauseOnSEV1AndSEV2,
            model.prefs.autoPause,
            Message.PrefsChanged({ message: PrefsMessage.AutoPauseToggled() }),
          ),
        ]
      : []),
    toggle(
      'blur-pause',
      t.title.pauseWhenTheWindowLosesFocus,
      model.prefs.blurPause,
      Message.PrefsChanged({ message: PrefsMessage.BlurPauseToggled() }),
    ),
    toggle(
      'motion',
      t.title.reduceMotion,
      model.prefs.motion === 'reduce',
      Message.PrefsChanged({ message: PrefsMessage.MotionToggled() }),
    ),
    toggle(
      'text',
      t.title.textAt150,
      model.prefs.text === 'large',
      Message.PrefsChanged({ message: PrefsMessage.TextToggled() }),
    ),
    toggle(
      'theme',
      t.title.darkMode,
      model.prefs.theme === 'dark',
      Message.PrefsChanged({ message: PrefsMessage.ThemeToggled() }),
    ),
    toggle(
      'agent',
      t.title.agentAccess,
      model.prefs.agentAccess,
      Message.PrefsChanged({ message: PrefsMessage.AgentAccessToggled() }),
    ),
    toggle(
      'analytics',
      t.title.shareAnonymousUsageData,
      model.prefs.analytics,
      Message.PrefsChanged({ message: PrefsMessage.AnalyticsToggled() }),
    ),
    row(
      {
        key: 'privacy',
        label: t.title.privacyPolicy,
        message: Message.ClickedLink({ request: UrlRequest.External({ href: PRIVACY_URL }) }),
      },
      h,
    ),
    row(
      {
        key: 'language',
        label: t.title.language,
        side: supportedLocales[at]?.label ?? '',
        message: Message.PrefsChanged({
          message: PrefsMessage.LocaleChosen({ locale: next.value }),
        }),
      },
      h,
    ),
    row({ key: 'save-export', label: t.title.copySaveAsText, message: Message.SaveExported() }, h),
    row({ key: 'save-import', label: t.title.importASave, message: Message.SaveImportAsked() }, h),
    row({ key: 'copy', label: t.title.copyStateAsJSON, message: Message.StateCopied() }, h),
    ...(model.oldSave && !hasRecovered(model.saves.companies)
      ? [
          row(
            {
              key: 'old-save',
              label: t.title.recoverPreviousSave,
              detail: t.title.recoverPreviousSaveDetail,
              message: Message.OldSaveImportAsked(),
            },
            h,
          ),
        ]
      : []),
  ]
}

const pagesOf = (
  t: Messages,
): Record<
  Page,
  Readonly<{ title: string; rows: (model: Model, h: HtmlBuilder<Message>) => ReadonlyArray<Html> }>
> => ({
  main: { title: '', rows: mainRows },
  found: { title: t.title.newCompany, rows: foundRows },
  companies: { title: t.title.companies, rows: companyRows },
  save: { title: t.title.company, rows: saveRows },
  sandbox: { title: t.title.sandbox, rows: sandboxRows },
  challenges: { title: t.title.challenges, rows: challengeRows },
  legacy: { title: t.title.legacyShop, rows: legacyRows },
  history: { title: t.title.history, rows: historyRows },
  achievements: { title: t.title.achievements, rows: achievementRows },
  settings: { title: t.title.settings, rows: settingsRows },
})

/** The page the monitor shows. A Company file replaces the Companies list in place. */
const pageOf = (model: Model): Page => {
  const page = menuOf(model.route)
  return page === 'companies' && model.saveFocus !== null ? 'save' : page
}

/** A page's heading: where it is, and the figure it spends or counts. */
const crumb = (model: Model, page: Page, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const figure =
    page === 'found' || page === 'challenges' || page === 'legacy'
      ? t.title.legacy(model.founder.legacy)
      : page === 'companies'
        ? `${model.saves.companies.length}`
        : page === 'achievements'
          ? `${model.founder.achievements.length}/${ACHIEVEMENT_IDS.length}`
          : ''
  return h.div(
    [h.Class('booth-crumb')],
    page === 'main'
      ? []
      : [
          h.span([], [t.title.mainMenu]),
          h.span([h.AriaHidden(true)], [' › ']),
          h.b([], [pagesOf(t)[page].title]),
          figure ? h.span([h.Class('booth-figure')], [figure]) : h.empty,
        ],
  )
}

const hint = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('booth-hint'), h.AriaHidden(true)],
    [
      ['↑↓', t.title.select],
      [t.title.enter, t.title.open],
      [t.title.esc, t.title.back],
    ].map(([key, label]) => h.span([], [h.kbd([], [key ?? '']), h.span([], [label ?? ''])])),
  )
}

/** The busiest Node of the saved Design, by utilization. */
const busiest = (t: Messages, game: Game): { name: string; load: number } | null => {
  const flow = solveFlow(game)
  let best: { name: string; load: number } | null = null
  for (const node of game.nodes) {
    if (COMPONENTS[node.type].fixed) continue
    const load = flow.nodes[node.id]?.utilization ?? 0
    if (!best || load > best.load) best = { name: nodeTitle(t, game, node), load }
  }
  return best
}

/** The users line over the last Samples, in a 100 x 30 box. */
const sparkOf = (game: Game): string => {
  const users = game.history.slice(-60).map((sample) => sample.users)
  if (users.length < 2) return ''
  const low = Math.min(...users)
  const span = Math.max(...users) - low || 1
  return `M${users
    .map(
      (value, i) =>
        `${((i / (users.length - 1)) * 100).toFixed(1)} ${(28 - ((value - low) / span) * 26).toFixed(1)}`,
    )
    .join(' L')}`
}

const status = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const file = currentFile(model)
  const hot = busiest(t, game)
  const spark = sparkOf(game)
  const tone = !hot ? '' : hot.load >= 0.9 ? 'is-bad' : hot.load >= 0.7 ? 'is-warn' : 'is-ok'
  return h.aside(
    [h.Class('booth-status')],
    [
      ...(file
        ? [
            h.span(
              [h.Class('booth-status-brand')],
              [companyMark(file.logo, 'booth-status-logo', h), h.span([], [file.name])],
            ),
          ]
        : []),
      h.span(
        [h.Class('booth-status-era')],
        [h.span([], [eraWords(t, game).name]), ` · ${clock(game.time)}`],
      ),
      h.span([h.Class('booth-status-users')], [compact(game.users)]),
      h.span([h.Class('booth-status-unit')], [t.title.users]),
      spark
        ? h.svg(
            [
              h.ViewBox('0 0 100 30'),
              h.Attribute('preserveAspectRatio', 'none'),
              h.AriaHidden(true),
            ],
            [h.path([h.D(spark)])],
          )
        : h.empty,
      hot
        ? h.span(
            [h.Class(`booth-status-hot ${tone}`)],
            [h.i([], []), h.span([], [hot.name]), ` ${Math.round(hot.load * 100)}%`],
          )
        : h.empty,
    ],
  )
}

export const ReaderClock = Mount.define('ReaderClock', {
  messages: [Message.Synced],
  execute: ({ element }) =>
    Effect.acquireRelease(
      Effect.sync(() => {
        const show = () =>
          (element.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }))
        show()
        return setInterval(show, 1000)
      }),
      (timer) => Effect.sync(() => clearInterval(timer)),
    ).pipe(Effect.as(Message.Synced())),
})

const taskbar = (model: Model, page: Page, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const tool = (
    menu: typeof MenuPage.Type,
    label: string,
    glyph: Parameters<typeof icon>[1],
    extra = '',
  ) =>
    h.button(
      [
        h.Key(menu),
        h.Type('button'),
        h.Title(label),
        h.AriaLabel(label),
        h.AriaPressed(page === menu ? 'true' : 'false'),
        h.OnClick(Message.MenuChosen({ menu: page === menu ? 'main' : menu })),
      ],
      [icon(h, glyph, 'booth-icon'), extra ? h.span([h.Class('booth-figure')], [extra]) : h.empty],
    )
  const veteran = model.founder.history.length > 0
  const hasLegacy = model.founder.earned > 0
  return h.nav(
    [h.Class('booth-taskbar'), h.AriaLabel(t.title.taskbar)],
    [
      ...(hasLegacy ? [tool('legacy', t.title.legacyShop, Store, `${model.founder.legacy}`)] : []),
      ...(veteran ? [tool('history', t.title.history, ScrollText)] : []),
      tool('achievements', t.title.achievements, Trophy),
      tool('settings', t.title.settings, Settings),
      h.a(
        [
          h.Href(WIKI_URL),
          h.Target('_blank'),
          h.Rel('noreferrer noopener'),
          h.Title(t.title.wiki),
          h.AriaLabel(t.title.wiki),
        ],
        [icon(h, BookOpen, 'booth-icon')],
      ),
      h.span([h.Class('booth-clock'), h.OnMount(ReaderClock())], ['--:--']),
    ],
  )
}

/** The host the monitor connects to, and what it restores there: the Company, a Sandbox, or a Challenge. */
const sessionOf = (model: Model): readonly [string, string] => {
  const t = copyIn(model.prefs.locale)

  const game = model.board.game
  const challengeRun = boardChallenge(model.board)
  if (challengeRun) {
    const challenge = challengeById(challengeRun.id)
    return [
      `drill@${challengeRun.id.replace(':', '-')}`,
      challenge
        ? `${t.catalog.challenges[challenge.id]?.name ?? challenge.name} · ${t.catalog.challenges[challenge.id]?.brief ?? challenge.brief}`
        : '',
    ]
  }
  const sandbox = boardSandbox(model.board)
  if (sandbox)
    return [
      `you@sandbox-${sandbox.id ?? 'free'}`,
      sandbox.id ? t.catalog.guided[sandbox.id].name : t.title.freeSandbox,
    ]
  return [
    'oncall@prod',
    t.title.eraUsersTime(eraWords(t, game).name, compact(game.users), clock(game.time)),
  ]
}

/** Leaving the title: the screen connects to the board before it opens. */
const terminal = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const [host, line] = sessionOf(model)
  return h.div(
    [h.Key('term'), h.Class('booth-term'), h.AriaLive('polite')],
    [
      h.p([], [h.b([], [`$ ssh ${host}`])]),
      h.p([], [line]),
      h.p([h.Class('text-ok')], [t.title.connected]),
      h.span([h.Class('booth-caret')], []),
    ],
  )
}

const screen = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const page = pageOf(model)
  const open = hasCompany(model)
  // The status column reads the open Company's Game. On a Company file, the file shows its own figures.
  const showStatus = open && page !== 'companies' && page !== 'save'
  return h.div(
    [h.Class(`booth-screen ${showStatus ? '' : 'is-new'}`)],
    [
      h.section(
        [h.Class('booth-home')],
        [
          wordmark(h),
          crumb(model, page, h),
          h.nav(
            [
              h.Key(page === 'save' ? `save-${model.saveFocus}` : page),
              h.Class('booth-list'),
              h.AriaLabel(t.title.mainMenu),
              h.DataAttribute('page', page),
              h.OnMount(PageMounted()),
            ],
            pagesOf(t)[page].rows(model, h),
          ),
          hint(h),
        ],
      ),
      showStatus ? status(model, h) : h.empty,
      taskbar(model, page, h),
      connecting(model.boot) ? terminal(model, h) : h.empty,
    ],
  )
}

/** The keycap tops seen over the slab's front edge, with the keys the driver lights by name. */
const keysOf = (t: Messages): ReadonlyArray<readonly [string, string?]> => [
  ['', t.title.escape],
  ...Array.from({ length: 5 }, () => [''] as const),
  ['space', t.title.space],
  ...Array.from({ length: 4 }, () => [''] as const),
  ['', t.title.backspace],
  ['wide', t.title.enter],
  ['', 'ArrowLeft'],
  ['', 'ArrowUp'],
  ['', 'ArrowDown'],
  ['', 'ArrowRight'],
]

const desk = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class('booth-desk'), h.AriaHidden(true)],
    [
      h.div(
        [h.Class('booth-keyboard')],
        [
          h.div(
            [h.Class('booth-keyrow')],
            keysOf(t).map(([size, name]) =>
              h.span(
                [
                  h.Class(`booth-key ${size ? `is-${size}` : ''}`),
                  ...(name ? [h.DataAttribute('k', name)] : []),
                ],
                [],
              ),
            ),
          ),
        ],
      ),
      h.div([h.Class('booth-mouse')], []),
    ],
  )
}

/** Under the keyboard: the reminder that the game simplifies on purpose. */
const disclaimer = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.a(
    [
      h.Class('booth-disclaimer'),
      h.Href(DISCLAIMER_URL),
      h.Target('_blank'),
      h.Rel('noreferrer noopener'),
    ],
    [t.title.quorumIsAGameAndSimplifies],
  )
}

/** The edge of the screen: the playtest tools, the source, and the way to support it. */
const strip = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.header(
    [h.Class('booth-strip')],
    [
      h.button(
        [h.Type('button'), h.OnClick(Message.LogExported())],
        [
          icon(h, Download, 'size-3.5'),
          h.span([h.Class('booth-strip-label')], [t.title.exportPlaytestLog]),
        ],
      ),
      h.a(
        [
          h.Href('https://github.com/elianiva/quorum/issues'),
          h.Target('_blank'),
          h.Rel('noreferrer noopener'),
        ],
        [
          h.span([h.Class('booth-strip-dot')], []),
          h.span([h.Class('booth-strip-label')], [t.title.playtestBuild]),
          h.span([], [t.title.savesCanReset]),
          ' · ',
          h.span([], [t.title.feedback]),
          icon(h, ArrowUpRight, 'size-3.5'),
        ],
      ),
      h.a(
        [
          h.Href('https://ko-fi.com/elianiva'),
          h.Target('_blank'),
          h.Rel('noreferrer noopener'),
          h.AriaLabel(t.title.supportOnKofi),
        ],
        [icon(h, Coffee, 'size-3.5'), h.span([h.Class('booth-strip-label')], [t.title.support])],
      ),
      h.a(
        [
          h.Href(SOURCE_URL),
          h.Target('_blank'),
          h.Rel('noreferrer noopener'),
          h.Title(t.title.openSourceOnGitHub),
          h.AriaLabel(t.title.openSourceOnGitHub),
        ],
        [githubMark(h, 'size-3.5')],
      ),
    ],
  )
}

const booth = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Key('booth'), h.Class('booth'), h.OnMount(BoothDriver())],
    [
      h.div(
        [h.Class('booth-stage')],
        [
          desk(h),
          disclaimer(h),
          h.div([h.Class('booth-neck')], []),
          h.div(
            [h.Class('booth-monitor')],
            [
              screen(model, h),
              h.div(
                [h.Class('booth-chin'), h.AriaHidden(true)],
                [
                  h.svg(
                    [h.ViewBox('0 0 100 194')],
                    [
                      ...GLYPHS[0]!.paths.map((d) => h.path([h.D(d)])),
                      h.circle([h.Cx('89'), h.Cy('180'), h.R('14')]),
                    ],
                  ),
                  h.span([h.Class(`booth-power ${connecting(model.boot) ? 'is-busy' : ''}`)], []),
                ],
              ),
            ],
          ),
        ],
      ),
      strip(h),
    ],
  )

const reader = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Key('reader'), h.Class(`reader ${model.boot._tag === 'Clocking' ? 'is-in' : ''}`)],
    [
      h.div(
        [h.Class('reader-body')],
        [
          ...['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((at) =>
            h.span([h.Class(`reader-screw ${at}`)], []),
          ),
          h.div(
            [h.Class('reader-screen'), h.AriaLive('polite')],
            [
              h.span([h.Class('reader-time'), h.OnMount(ReaderClock())], ['--:--']),
              h.span(
                [h.Class('reader-status')],
                [
                  h.span([h.Class('reader-status-out')], [t.title.insertBadge]),
                  h.span([h.Class('reader-status-in')], [t.title.clockedIn]),
                ],
              ),
            ],
          ),
          h.span([h.Class('reader-led')], []),
          h.span([h.Class('reader-slot')], []),
        ],
      ),
      h.div(
        [h.Class('reader-well')],
        [
          h.button(
            [
              h.Type('button'),
              h.AriaLabel(t.title.clockIn),
              h.OnClick(Message.ClockedIn()),
              h.Class('reader-card'),
            ],
            [
              h.svg(
                [h.ViewBox('0 0 100 194'), h.Class('reader-card-mark'), h.AriaHidden(true)],
                [
                  ...GLYPHS[0]!.paths.map((d) =>
                    h.path([h.D(d), h.Fill('none'), h.Stroke('currentColor'), h.StrokeWidth('22')]),
                  ),
                  h.circle([h.Class('fill-signal'), h.Cx('89'), h.Cy('180'), h.R('14')]),
                ],
              ),
              h.span([h.Class('reader-card-chip')], []),
              h.span([h.Class('reader-card-name')], [t.title.founder]),
            ],
          ),
        ],
      ),
    ],
  )
}

export const titleScreen = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.main(
    [
      h.Class(
        'title-screen dark relative grid h-full place-items-center overflow-hidden bg-page text-foreground',
      ),
    ],
    [titleIsOpen(model.boot) ? booth(model, h) : reader(model, h)],
  )
