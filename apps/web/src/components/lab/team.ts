import { copy, localized, nodeTitle, type Messages } from '@/i18n/messages.ts'
import { TeamMessage } from '@/game/team.ts'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Option } from 'effect'
import { DragAndDrop } from '@foldkit/ui'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Bot,
  Bug,
  Check,
  Code,
  Container,
  Database,
  Crown,
  Gem,
  Hourglass,
  Lock,
  Plus,
  Rabbit,
  Rocket,
  Scale,
  Shield,
  Siren,
  FlaskConical,
  Trash2,
  UserMinus,
  X,
  Zap,
} from 'lucide'
import {
  FEATURES,
  FEATURE_IDS,
  LANGUAGES,
  MIGRATION_STEPS,
  POLICY_IDS,
  RESEARCH,
  RUNTIMES,
  TASKS,
  TASK_IDS,
  type ComponentId,
  type FeatureId,
  type FrameworkId,
  type IncidentId,
  type ResearchId,
  type PolicyId,
  type RuntimeId,
  type TaskId,
  PATCH_GRACE,
} from '@quorum/simulation/catalog'
import { POLICY_LEVEL } from '@quorum/simulation/catalog'
import { perkLevel } from '@quorum/simulation/founding'
import { has, sreStaffed } from '@quorum/simulation/lookups'
import { openRegions } from '@quorum/simulation/regions'
import type {
  Engineer,
  Game,
  GameNode,
  Service,
  Team,
  TeamKind,
  WorkItem,
  WorkKind,
} from '@quorum/simulation/state'
import {
  badDeployChance,
  deployEvery,
  devHoursRate,
  doraMetrics,
  languageOfService,
  membersOf,
  payrollOf,
  policyNow,
  rampSeconds,
  ownerOf,
  pipelineOf,
  salaryOf,
  serviceBurnOf,
  serviceOf,
  serviceOfFeature,
  sharesDatabase,
  signingOf,
  teamOutputs,
  upkeepShare,
} from '@quorum/simulation/team'
import { overdueBy } from '@quorum/simulation/cve'
import {
  adoptionShareOf,
  awaitingFeatures,
  isBuilt,
  isFeatureLive,
  liftReading,
  liveFeatures,
} from '@quorum/simulation/features'
import { isReady, stepOf } from '@quorum/simulation/migration'
import { PLATFORM_STAGE, loadBalancersOf, nodesOfService } from '@quorum/simulation/work'
import {
  featureHoursOf,
  featureRefusal,
  MAX_TEAMS,
  removeRefusal,
  runbookKinds,
  runbookRefusal,
  splitCost,
  splitRefusal,
  taskRefusal,
} from '@quorum/simulation/work'
import type { Refusal } from '@quorum/simulation/actions'
import { refusalIn } from '@/i18n/refusal.ts'
import { money } from '@quorum/ui/game/format'
import { STACK_LOGOS } from '@quorum/ui/game/icons'
import { Message } from '@/game/message.ts'
import { ledgerOf, type Model } from '@/game/model.ts'
import { glowing, shown } from '@/game/reveal.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { badge } from '@quorum/ui/primitives/badge'
import { button } from '@quorum/ui/primitives/button'
import { cn } from '@/lib/utils'
import { EYEBROW, FIGURE, PANEL, SCROLL, WELL, ring, stackLogo } from '@quorum/ui/game/bits'
import { shell } from './panels.ts'

/* ==========================================================================
   The Team panel (08), drawn as the engineering floor. On the left each team
   is a pod of seats: the founder, engineers, offers on their way, and an
   open seat to hire into. On the right the work moves along a ship line,
   queue → building → built → deploy → live, with a migration shown as the
   share of traffic on each Stack, and the roadmap of Features and tasks.
   ========================================================================== */

const NAMES = [
  'Ada',
  'Linus',
  'Grace',
  'Ken',
  'Barbara',
  'Dennis',
  'Margaret',
  'Guido',
  'Frances',
  'Bjarne',
  'Radia',
  'Yukihiro',
  'Sophie',
  'Rasmus',
  'Hedy',
  'Ryan',
]

const nameOf = (id: string): string => NAMES[Number(id.slice(1)) % NAMES.length] ?? id

/** Each person keeps one avatar colour. */
const HUES = [28, 62, 150, 195, 240, 285, 330]
const hueOf = (id: string): number => HUES[Number(id.slice(1)) % HUES.length] ?? 240

const amount = (value: number): string =>
  value < 10 ? value.toFixed(1) : String(Math.floor(value))
const dh = (t: Messages, value: number): string => t.units.devHours(amount(value))

/** Dev Hours per sim second, per minute. */
const perMinute = (rate: number): string => {
  const value = rate * 60
  return value < 10 ? value.toFixed(1) : String(Math.round(value))
}

/** A wait in sim seconds: seconds under a minute and a half, minutes above. */
const wait = (t: Messages, seconds: number): string =>
  seconds < 90 ? t.units.s(Math.max(0, Math.ceil(seconds))) : t.units.min(Math.ceil(seconds / 60))

/** A team's name: the Simulation names the first "Core" and the rest "Team 2", so those are told in words. */
export const teamName = (t: Messages, team: Team): string => {
  if (team.id === 'core' && team.name === 'Core') return t.team.coreTeam
  const numbered = /^Team (\d+)$/.exec(team.name)
  return numbered ? t.team.teamN(Number(numbered[1])) : team.name
}

/** A Service's name: the first is "Monolith" and a split without a name is "Service 2". */
export const serviceName = (t: Messages, service: Service): string => {
  if (service.id === 'monolith' && service.name === 'Monolith') return t.team.monolith
  const numbered = /^Service (\d+)$/.exec(service.name)
  return numbered ? t.team.serviceN(Number(numbered[1])) : service.name
}

/** A work item's name in words: the Simulation's `itemName`, from the catalog tables. */
export const workItemName = (t: Messages, item: WorkItem): string => {
  if (item.kind === 'feature') return t.catalog.features[item.ref as FeatureId]?.name ?? item.ref
  if (item.kind === 'task') {
    const name = t.catalog.tasks[item.ref as TaskId]?.name ?? item.ref
    return item.ref === 'runbook' && item.target
      ? t.team.runbookItem(
          name,
          t.catalog.incidents[item.target as IncidentId]?.name ?? item.target,
        )
      : name
  }
  if (item.kind === 'patch') {
    const component = t.catalog.components[item.target as ComponentId]
    return component ? t.team.patchOf(component.name) : t.team.patchDesign
  }
  if (item.kind === 'spike')
    return t.team.spikeOf(t.catalog.research[item.ref as ResearchId]?.name ?? item.ref)
  if (item.kind === 'split') return t.team.splitAService
  if (item.kind === 'move')
    return item.ref === 'auth'
      ? t.team.moveAuthInHouse
      : item.ref === 'reshard'
        ? t.team.reshardDatabase
        : t.team.changeDatabaseEngine
  return t.team.migrationStep(item.ref.slice(5))
}

/** Features the Company has, has built, or has queued. */
const planned = (game: Game, id: FeatureId): boolean =>
  isBuilt(game, id) || game.backlog.some((item) => item.ref === id)

/**
 * Why a Feature cannot be queued, in words. The Simulation's reasons are English, so each is
 * told again from the same checks, in the same order.
 */
const featureWhy = (t: Messages, game: Game, id: FeatureId, refusal: Refusal): string => {
  const reason = t.team.refusal
  const def = FEATURES[id]
  const name = t.catalog.features[id].name
  if (game.sandbox) return reason.sandbox
  if (def.era > game.stage) return reason.tooEarly(name, t.catalog.eras[def.era]?.name ?? '')
  if (def.research && !has(game, def.research))
    return reason.locked(name, t.catalog.research[def.research].name)
  const missing = def.requires.filter((needed) => !planned(game, needed))
  if (missing.length > 0)
    return reason.needs(
      name,
      missing.map((needed) => t.catalog.features[needed].name).join(reason.and),
    )
  if (id === 'data-residency' && !openRegions(game).includes('eu'))
    return reason.needsEuRegion(name)
  if (id === 'email-digests' && !game.nodes.some((node) => node.type === 'queue'))
    return reason.needsQueue(name)
  return refusalIn(t, refusal)
}

/** Why an engineering task cannot be queued, in words: each task has the one reason it names. */
const taskWhy = (t: Messages, game: Game, id: TaskId, refusal: Refusal): string => {
  const reason = t.team.refusal
  const research = TASKS[id].research
  if (game.sandbox) return reason.sandbox
  if (research && !has(game, research))
    return reason.locked(t.catalog.tasks[id].name, t.catalog.research[research].name)
  return id === 'add-index'
    ? reason.everyQueryIndexed
    : id === 'refactor'
      ? reason.noTechDebt
      : id === 'upgrade-cluster'
        ? reason.noCluster
        : id === 'off-loop'
          ? reason.noEventLoop
          : id === 'timeouts-retries'
            ? reason.everyLinkPolicy
            : id === 'load-test'
              ? reason.loadTestRunning
              : refusalIn(t, refusal)
}

/** Why a runbook cannot be written for an incident kind, in words. */
const runbookWhy = (t: Messages, game: Game, kind: IncidentId, refusal: Refusal): string => {
  const reason = t.team.refusal
  if (game.sandbox) return reason.sandbox
  if (!has(game, 'runbooks'))
    return reason.locked(reason.aRunbook, t.catalog.research.runbooks.name)
  if (!sreStaffed(game)) return reason.needsSre
  if (
    game.backlog.some(
      (item) => item.kind === 'task' && item.ref === 'runbook' && item.target === kind,
    )
  )
    return reason.runbookOnBacklog(t.catalog.incidents[kind].name)
  return refusalIn(t, refusal)
}

/** Why a Service cannot be split, in words. */
const splitWhy = (
  t: Messages,
  game: Game,
  draft: Readonly<{ name: string; owner: string; features: ReadonlyArray<FeatureId> }>,
  refusal: Refusal,
): string => {
  const reason = t.team.refusal
  if (game.sandbox) return reason.sandbox
  if (!has(game, 'service-boundaries'))
    return reason.locked(reason.aServiceSplit, t.catalog.research['service-boundaries'].name)
  if (draft.features.length === 0) return reason.chooseFeature
  if (!game.teams.some((team) => team.id === draft.owner)) return reason.teamGone
  const name = draft.name.trim()
  if (
    name !== '' &&
    game.services.some((service) => service.name.toLowerCase() === name.toLowerCase())
  )
    return reason.serviceExists(name)
  for (const id of draft.features) {
    const featureName = t.catalog.features[id].name
    if (!isFeatureLive(game, id)) return reason.notLive(featureName)
    const carrier = serviceOfFeature(game, id)
    if (carrier.id !== serviceOf(game).id)
      return reason.alreadyOn(featureName, serviceName(t, carrier))
  }
  return refusalIn(t, refusal)
}

const clamp = (share: number): number => Math.max(0, Math.min(1, share))

const POLICY_ICONS: Record<PolicyId, Parameters<typeof icon>[1]> = {
  'move-fast': Rabbit,
  balanced: Scale,
  quality: Gem,
}

/** Work kinds keep the build-group colours, so a kind reads the same everywhere. */
const kindOf = (t: Messages): Record<WorkKind, Readonly<{ label: string; fill: string }>> => ({
  feature: { label: t.team.feature, fill: 'bg-group-edge' },
  task: { label: t.team.engineering, fill: 'bg-group-data' },
  migration: { label: t.team.migration, fill: 'bg-group-compute' },
  spike: { label: t.team.spike, fill: 'bg-group-ops' },
  patch: { label: t.team.security, fill: 'bg-danger' },
  split: { label: t.team.split, fill: 'bg-group-ops' },
  move: { label: t.team.move, fill: 'bg-group-compute' },
})

const STRIPES = 'repeating-linear-gradient(-45deg, oklch(1 0 0 / 0.28) 0 6px, transparent 6px 12px)'

const heading = (title: string, right: Html, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('flex items-center justify-between gap-2 px-1 pt-2')],
    [h.span([h.Class(EYEBROW)], [title]), right],
  )

const iconButton = (
  label: string,
  glyph: Parameters<typeof icon>[1],
  message: Message,
  enabled: boolean,
  h: HtmlBuilder<Message>,
  className = '',
): Html =>
  button(
    {
      onClick: message,
      isDisabled: !enabled,
      variant: 'ghost',
      size: 'icon-xs',
      className: cn('text-muted-foreground', className),
      attributes: [h.AriaLabel(label), h.Title(label)],
    },
    icon(h, glyph, 'size-3.5'),
    h,
  )

/** A circle drawn around an avatar: ramp-up for a new hire, the wait for an offer. */
const halo = (share: number, className: string, h: HtmlBuilder<Message>): Html => {
  const radius = 25
  const length = 2 * Math.PI * radius
  return h.svg(
    [
      h.AriaHidden(true),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 54 54'),
      h.Fill('none'),
      h.Class(cn('pointer-events-none absolute -inset-[5px] size-[54px]', className)),
    ],
    [
      h.circle([
        h.Cx('27'),
        h.Cy('27'),
        h.R(String(radius)),
        h.Stroke('currentColor'),
        h.StrokeWidth('2.5'),
        h.Attribute('opacity', '0.18'),
      ]),
      h.circle([
        h.Cx('27'),
        h.Cy('27'),
        h.R(String(radius)),
        h.Stroke('currentColor'),
        h.StrokeWidth('2.5'),
        h.StrokeLinecap('round'),
        h.Attribute('stroke-dasharray', `${length}`),
        h.Attribute('stroke-dashoffset', `${length * (1 - clamp(share))}`),
        h.Attribute('transform', 'rotate(-90 27 27)'),
        h.Class('transition-[stroke-dashoffset] duration-200 ease-out'),
      ]),
    ],
  )
}

/* ---------- the floor ---------- */

const seat = (
  key: string,
  face: Html,
  name: string,
  note: Html | string,
  corners: ReadonlyArray<Html>,
  className: string,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(key),
      h.Class(
        cn(
          'group relative flex min-w-0 flex-col items-center gap-1.5 rounded-xl px-1.5 pt-3.5 pb-2.5 text-center',
          className,
        ),
      ),
    ],
    [
      face,
      h.span(
        [h.Class('mt-1 w-full truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
        [name],
      ),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'w-full truncate text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
            ),
          ),
        ],
        [note],
      ),
      ...corners,
    ],
  )

const corner = (side: 'left' | 'right', control: Html, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        cn(
          'absolute top-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
          side === 'left' ? 'left-1' : 'right-1',
        ),
      ),
    ],
    [control],
  )

const face = (
  hue: number | null,
  content: Html,
  badgeMark: Html,
  ring: Html,
  h: HtmlBuilder<Message>,
): Html => {
  return h.span(
    [
      h.Class(
        cn(
          'relative grid size-11 shrink-0 place-items-center rounded-full text-[calc(17px*var(--type-scale))] font-semibold text-white shadow-[inset_0_-2px_0_oklch(0_0_0/0.12),0_1px_2px_oklch(0_0_0/0.12)]',
          hue === null && 'bg-primary-fill text-on-primary-fill',
        ),
      ),
      ...(hue === null
        ? []
        : [
            h.Style({
              'background-image': `linear-gradient(to bottom, oklch(0.72 0.13 ${hue}), oklch(0.6 0.15 ${hue}))`,
            }),
          ]),
    ],
    [ring, content, badgeMark],
  )
}

const languageMark = (language: Engineer['language'], h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.Class(
        'absolute -right-1 -bottom-1 grid size-[18px] place-items-center rounded-full bg-surface shadow-raised',
      ),
    ],
    [stackLogo(language, 'size-3', h)],
  )

const engineerSeat = (game: Game, engineer: Engineer, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const ramp = (game.time - engineer.hiredAt) / rampSeconds(game)
  const ramping = ramp < 1
  const name = nameOf(engineer.id)
  return seat(
    engineer.id,
    face(
      hueOf(engineer.id),
      h.span([], [name.slice(0, 1)]),
      languageMark(engineer.language, h),
      ramping ? halo(ramp, 'text-ok', h) : h.empty,
      h,
    ),
    name,
    ramping ? t.team.ramping : t.team.s(money(salaryOf(game, engineer.language))),
    [],
    'bg-raised shadow-raised',
    h,
  )
}

const engineerControls = (
  engineer: Engineer,
  teams: ReadonlyArray<Team>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Html> => {
  const t = copy(h)

  const index = teams.findIndex((team) => team.id === engineer.team)
  const next = teams[(index + 1) % teams.length]
  return [
    teams.length > 1 && next
      ? corner(
          'left',
          iconButton(
            t.team.moveTo(teamName(t, next)),
            ArrowLeftRight,
            Message.TeamChanged({
              message: TeamMessage.EngineerAssigned({ engineerId: engineer.id, teamId: next.id }),
            }),
            true,
            h,
          ),
          h,
        )
      : h.empty,
    corner(
      'right',
      iconButton(
        t.team.layOff(nameOf(engineer.id)),
        UserMinus,
        Message.TeamChanged({ message: TeamMessage.LayoffChosen({ engineerId: engineer.id }) }),
        true,
        h,
        'hover:text-danger',
      ),
      h,
    ),
  ]
}

const founderSeat = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return seat(
    'founder',
    face(null, icon(h, Crown, 'size-[18px]'), h.empty, h.empty, h),
    t.team.you,
    t.team.founder,
    [],
    'bg-raised shadow-raised',
    h,
  )
}

const hireSeat = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const language = languageOfService(game)
  const price = signingOf(game, language)
  const open = game.stage >= 1
  const afford = game.cash >= price
  return h.button(
    [
      h.Key('hire'),
      h.Type('button'),
      h.OnClick(Message.TeamChanged({ message: TeamMessage.HireChosen() })),
      h.Disabled(!open || !afford),
      h.AriaLabel(
        open ? t.team.hireEngineerFor(LANGUAGES[language].name, money(price)) : t.team.hiringLocked,
      ),
      h.Class(
        cn(
          'press group flex min-w-0 flex-col items-center gap-1.5 rounded-xl border-[1.5px] border-dashed px-1.5 pt-3.5 pb-2.5 text-center',
          open && afford
            ? 'border-foreground/25 text-foreground hover:border-foreground/45 hover:bg-foreground/[0.03]'
            : 'cursor-not-allowed border-foreground/12 text-muted-foreground',
        ),
      ),
    ],
    [
      h.span(
        [
          h.Class(
            cn(
              'relative grid size-11 place-items-center rounded-full',
              open && afford ? 'bg-primary-fill text-on-primary-fill shadow-primary' : WELL,
              'rounded-full',
            ),
          ),
        ],
        [
          icon(h, open ? Plus : Lock, open ? 'size-5' : 'size-4'),
          open ? languageMark(language, h) : h.empty,
        ],
      ),
      h.span(
        [h.Class('mt-1 w-full truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
        [open ? t.team.hire : t.team.locked],
      ),
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'w-full truncate text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
            ),
          ),
        ],
        [open ? money(price) : (t.catalog.eras[1]?.name ?? '')],
      ),
    ],
  )
}

const pendingSeat = (game: Game, id: string, readyAt: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const left = readyAt - game.time
  return seat(
    id,
    h.span(
      [
        h.Class(
          'relative grid size-11 place-items-center rounded-full border-[1.5px] border-dashed border-foreground/25 text-muted-foreground',
        ),
      ],
      [icon(h, Hourglass, 'size-4')],
    ),
    nameOf(id),
    t.team.inText(wait(t, left)),
    [],
    'bg-foreground/[0.025] shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
    h,
  )
}

const policySwitch = (team: Team, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('grid grid-cols-4 gap-[3px] p-[3px]', WELL, 'rounded-[11px]'))],
    POLICY_IDS.map((policy) => {
      const selected = team.policy === policy
      return h.button(
        [
          h.Key(`${team.id}-${policy}`),
          h.Type('button'),
          h.AriaPressed(selected ? 'true' : 'false'),
          h.OnClick(
            Message.TeamChanged({ message: TeamMessage.PolicyChosen({ teamId: team.id, policy }) }),
          ),
          h.Class(
            cn(
              'press flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[calc(12px*var(--type-scale))] font-medium',
              selected
                ? 'bg-raised text-foreground shadow-raised'
                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
            ),
          ),
        ],
        [
          icon(h, POLICY_ICONS[policy], 'size-3.5'),
          h.span([h.Class('truncate')], [t.catalog.policies[policy].label]),
        ],
      )
    }),
  )
}

const kindsOf = (t: Messages): ReadonlyArray<readonly [TeamKind, string, typeof Code]> => [
  ['product', t.team.product, Code],
  ['platform', t.team.platform, Container],
  ['sre', 'SRE', Siren],
  ['data', t.team.data, Database],
  ['security', t.team.security, Shield],
]

/**
 * Product teams build the backlog; Platform, SRE, Data and Security teams run the system
 * (08 "Teams"). A locked kind still shows: the backend refuses it, as the other three always have.
 */
const kindSwitch = (team: Team, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('grid grid-cols-5 gap-[3px] p-[3px]', WELL, 'rounded-[11px]'))],
    kindsOf(t).map(([kind, label, mark]) => {
      const selected = team.kind === kind
      return h.button(
        [
          h.Key(`${team.id}-${kind}`),
          h.Type('button'),
          h.AriaPressed(selected ? 'true' : 'false'),
          h.OnClick(
            Message.TeamChanged({ message: TeamMessage.KindChosen({ teamId: team.id, kind }) }),
          ),
          h.Class(
            cn(
              'press flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 text-[calc(12px*var(--type-scale))] font-medium',
              selected
                ? 'bg-raised text-foreground shadow-raised'
                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
            ),
          ),
        ],
        [icon(h, mark, 'size-3.5'), h.span([h.Class('truncate')], [label])],
      )
    }),
  )
}

const pod = (model: Model, team: Team, index: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const output = teamOutputs(game, ledgerOf(model)).find((entry) => entry.team.id === team.id)
  const now = policyNow(game, team)
  const pending = game.hires.filter((entry) => entry.team === team.id)
  const sandbox = game.sandbox
  const target = DragAndDrop.maybeDropTarget(model.board.team.drag)
  const dropTarget =
    DragAndDrop.isDragging(model.board.team.drag) &&
    Option.exists(target, (entry) => entry.containerId === team.id)
  return h.section(
    [
      h.Key(team.id),
      ...DragAndDrop.droppable(team.id, teamName(t, team)),
      h.Class(
        cn(
          PANEL,
          'flex flex-col gap-3 p-3 transition-shadow',
          dropTarget && 'ring-2 ring-primary ring-offset-2',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-start gap-2 px-1')],
        [
          h.div(
            [h.Class('flex min-w-0 flex-1 flex-col')],
            [
              h.span(
                [
                  h.Class(
                    'truncate text-[calc(15px*var(--type-scale))] font-semibold tracking-[-0.02em]',
                  ),
                ],
                [teamName(t, team)],
              ),
              h.span(
                [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
                [t.team.people(output?.headcount ?? 0)],
              ),
            ],
          ),
          h.div(
            [h.Class('flex flex-col items-end')],
            [
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(22px*var(--type-scale))] leading-none font-medium'),
                  ),
                ],
                [perMinute(output?.rate ?? 0)],
              ),
              h.span(
                [h.Class(cn(EYEBROW, 'mt-1 text-[calc(9.5px*var(--type-scale))]'))],
                [t.team.dHMin],
              ),
            ],
          ),
          index > 0
            ? iconButton(
                t.team.removeTeam,
                Trash2,
                Message.TeamChanged({ message: TeamMessage.Removed({ teamId: team.id }) }),
                true,
                h,
              )
            : h.empty,
        ],
      ),
      index > 0 && !sandbox && game.stage >= PLATFORM_STAGE ? kindSwitch(team, h) : h.empty,
      team.kind === 'product' ? policySwitch(team, h) : h.empty,
      team.kind === 'product' && now.id !== team.policy
        ? h.span(
            [h.Class('-mt-1.5 px-1 text-[calc(11px*var(--type-scale))] text-muted-foreground')],
            [t.team.untilTomorrow(t.catalog.policies[now.id].label)],
          )
        : h.empty,
      h.div(
        [h.Class('grid grid-cols-3 gap-2')],
        [
          index === 0 ? founderSeat(h) : h.empty,
          ...membersOf(game, team).map((engineer, memberIndex) =>
            h.div(
              [h.Key(engineer.id), h.Class('group relative')],
              [
                h.div(
                  [
                    ...DragAndDrop.draggable(
                      {
                        model: model.board.team.drag,
                        toParentMessage: (message) =>
                          Message.TeamChanged({ message: TeamMessage.DragChanged({ message }) }),
                        itemId: engineer.id,
                        containerId: team.id,
                        index: memberIndex,
                      },
                      h,
                    ),
                    ...DragAndDrop.sortable(engineer.id),
                    h.AriaLabel(t.team.moveFrom(nameOf(engineer.id), teamName(t, team))),
                    h.Class(
                      cn(
                        'cursor-grab touch-none rounded-xl focus-visible:outline-2 focus-visible:outline-primary active:cursor-grabbing',
                        Option.exists(
                          DragAndDrop.maybeDraggedItemId(model.board.team.drag),
                          (id) => id === engineer.id,
                        ) && 'opacity-45',
                      ),
                    ),
                  ],
                  [engineerSeat(game, engineer, h)],
                ),
                ...engineerControls(engineer, game.teams, h),
              ],
            ),
          ),
          ...pending.map((entry) =>
            pendingSeat(
              game,
              entry.id,
              entry.phase._tag === 'Pending' ? entry.phase.readyAt : game.time,
              h,
            ),
          ),
          // Hiring is not shown before its Era (15 "Progressive disclosure").
          index === 0 && !sandbox && game.stage >= 1 ? hireSeat(game, h) : h.empty,
        ],
      ),
      sandbox
        ? h.empty
        : team.kind === 'platform'
          ? platformWork(h)
          : team.kind === 'sre'
            ? sreWork(game, h)
            : team.kind === 'data'
              ? dataWork(h)
              : team.kind === 'security'
                ? securityWork(h)
                : working(
                    game.backlog[
                      game.teams.slice(0, index).filter((entry) => entry.kind === 'product').length
                    ],
                    h,
                  ),
    ],
  )
}

/** What an SRE pod has on its desk: the pager, the runbooks, and the MTTR it holds down. */
const sreWork = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('flex items-center gap-2 px-2.5 py-2', WELL, 'rounded-[10px]'))],
    [
      icon(h, Siren, 'size-3.5 text-muted-foreground'),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [
          game.runbooks.length === 0
            ? t.team.holdsThePager
            : t.team.holdsThePagerRunbooks(game.runbooks.length),
        ],
      ),
    ],
  )
}

/** What a Data pod has on its desk: the warehouse, the copies, and the Features they make cheaper. */
const dataWork = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('flex items-center gap-2 px-2.5 py-2', WELL, 'rounded-[10px]'))],
    [
      icon(h, Database, 'size-3.5 text-muted-foreground'),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [t.team.runsTheWarehouseReportAndAI],
      ),
    ],
  )
}

/** What the pod has on its desk: the backlog item its team builds. */
const platformWork = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('flex items-center gap-2 px-2.5 py-2', WELL, 'rounded-[10px]'))],
    [
      icon(h, Container, 'size-3.5 text-muted-foreground'),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [t.team.runsClustersAndDeploys],
      ),
    ],
  )
}

/** What a Security pod has on its desk: WAF rules, dependency scanning, and compliance. */
const securityWork = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('flex items-center gap-2 px-2.5 py-2', WELL, 'rounded-[10px]'))],
    [
      icon(h, Shield, 'size-3.5 text-muted-foreground'),
      h.span(
        [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [t.team.securityDesk],
      ),
    ],
  )
}

const working = (item: WorkItem | undefined, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Class(cn('flex items-center gap-2 px-2.5 py-2', WELL, 'rounded-[10px]'))],
    item
      ? [
          statusMark('building', item.spent / item.cost, h),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
            [codeOf(item.kind, item.ref)],
          ),
          h.span(
            [h.Class('min-w-0 flex-1 truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
            [workItemName(t, item)],
          ),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-muted-foreground'))],
            [`${Math.floor(clamp(item.spent / item.cost) * 100)}%`],
          ),
        ]
      : [
          statusMark('queued', 0, h),
          h.span(
            [h.Class('text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
            [t.team.nothingAssigned],
          ),
        ],
  )
}

/** A Service's Nodes as buttons that reveal each on the Board. */
const nodeRow = (
  label: string,
  nodes: ReadonlyArray<GameNode>,
  empty: string,
  game: Game,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Class(
        'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[calc(11.5px*var(--type-scale))]',
      ),
    ],
    [
      h.span([h.Class('text-muted-foreground')], [t.team.labelColon(label)]),
      ...(nodes.length === 0
        ? [h.span([h.Class('text-muted-foreground')], [empty])]
        : nodes.map((node) =>
            h.button(
              [
                h.Type('button'),
                h.OnClick(Message.RevealNode({ nodeId: node.id })),
                h.AriaLabel(t.team.openNode(nodeTitle(t, game, node))),
                h.Class('font-medium hover:underline'),
              ],
              [nodeTitle(t, game, node)],
            ),
          )),
    ],
  )
}

/** The Services a Company runs (08 "Services"): its codebases, their owners, and the split. */
const servicesCard = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const draft = model.board.team.service
  // A split moves a live Feature that no other Service carries.
  const candidates = liveFeatures(game).filter(
    (id) => serviceOfFeature(game, id).id === serviceOf(game).id,
  )
  const refusal = splitRefusal(game, {
    name: draft.name,
    owner: draft.owner,
    features: draft.features,
  })
  const shared = game.services.filter((service) => sharesDatabase(game, service)).length
  return h.section(
    [h.Key('services'), h.Class(cn(PANEL, 'flex shrink-0 flex-col gap-2.5 px-4 pt-3.5 pb-3'))],
    [
      heading(
        t.team.services,
        h.span(
          [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
          [
            shared > 1
              ? t.team.codebasesOneDatabase(game.services.length)
              : t.team.codebases(game.services.length),
          ],
        ),
        h,
      ),
      ...game.services.map((service) => {
        const owner = ownerOf(game, service)
        const paged = game.incident?.service === service.id
        return h.div(
          [
            h.Class(
              cn(
                WELL,
                'flex flex-col gap-1 rounded-[10px] px-2.5 py-2',
                paged && 'ring-1 ring-danger/60',
              ),
            ),
          ],
          [
            h.div(
              [h.Class('flex flex-wrap items-center gap-x-2 gap-y-1')],
              [
                h.span(
                  [h.Class('text-[calc(12.5px*var(--type-scale))] font-medium')],
                  [serviceName(t, service)],
                ),
                badge(
                  {
                    variant: 'outline',
                    className: 'text-[calc(10.5px*var(--type-scale))]',
                  },
                  [t.team.ownedBy(teamName(t, owner))],
                  h,
                ),
                paged
                  ? badge({ variant: 'outline', className: 'text-danger' }, [t.team.paged], h)
                  : h.empty,
              ],
            ),
            h.span(
              [
                h.Class(
                  cn(
                    FIGURE,
                    'whitespace-nowrap text-[calc(10.5px*var(--type-scale))] text-muted-foreground',
                  ),
                ),
              ],
              [
                t.team.serviceLine(
                  service.codebase.toFixed(0),
                  Math.round(service.debt * 100),
                  t.units.perSecond(money(serviceBurnOf(game, ledgerOf(model), service))),
                ),
              ],
            ),
            h.span(
              [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
              [
                service.features.length === 0
                  ? t.team.carriesEveryFeature
                  : t.team.carries(
                      service.features.map((id) => t.catalog.features[id].name).join(', '),
                    ),
              ],
            ),
            nodeRow(t.team.nodes, nodesOfService(game, service.id), t.team.noneYet, game, h),
            nodeRow(
              t.team.loadBalancers,
              loadBalancersOf(game, service.id),
              t.team.notBehindOne,
              game,
              h,
            ),
            game.teams.length > 1
              ? h.div(
                  [h.Class('flex items-center gap-1.5 pt-0.5')],
                  [
                    h.span(
                      [h.Class('text-[calc(11px*var(--type-scale))] text-muted-foreground')],
                      [t.team.moveServiceTo],
                    ),
                    h.select(
                      [
                        h.AriaLabel(t.team.teamThatOwns(serviceName(t, service))),
                        h.OnChange((teamId) =>
                          Message.TeamChanged({
                            message: TeamMessage.ServiceMoved({ serviceId: service.id, teamId }),
                          }),
                        ),
                        h.Class(
                          cn(WELL, 'h-6 rounded-lg px-1.5 text-[calc(11px*var(--type-scale))]'),
                        ),
                      ],
                      game.teams.map((entry) =>
                        h.option(
                          [
                            h.Value(entry.id),
                            ...(entry.id === service.owner ? [h.Selected(true)] : []),
                          ],
                          [teamName(t, entry)],
                        ),
                      ),
                    ),
                  ],
                )
              : h.empty,
          ],
        )
      }),
      has(game, 'service-boundaries')
        ? h.div(
            [h.Class('flex flex-col gap-2 pt-1')],
            [
              h.div(
                [h.Class('flex items-center gap-1.5')],
                [
                  h.input([
                    h.Type('text'),
                    h.Value(draft.name),
                    h.Placeholder(t.team.nameNewService),
                    h.AriaLabel(t.team.newServiceName),
                    h.OnInput((name) =>
                      Message.TeamChanged({ message: TeamMessage.ServiceNamed({ name }) }),
                    ),
                    h.Class(
                      cn(
                        WELL,
                        'h-7 min-w-0 flex-1 rounded-lg px-2 text-[calc(12px*var(--type-scale))] outline-none',
                      ),
                    ),
                  ]),
                  h.select(
                    [
                      h.AriaLabel(t.team.teamOwnsNewService),
                      h.OnChange((teamId) =>
                        Message.TeamChanged({
                          message: TeamMessage.ServiceOwnerChosen({ teamId }),
                        }),
                      ),
                      h.Class(
                        cn(WELL, 'h-7 rounded-lg px-1.5 text-[calc(12px*var(--type-scale))]'),
                      ),
                    ],
                    game.teams.map((entry) =>
                      h.option(
                        [
                          h.Value(entry.id),
                          ...(entry.id === draft.owner ? [h.Selected(true)] : []),
                        ],
                        [teamName(t, entry)],
                      ),
                    ),
                  ),
                ],
              ),
              candidates.length === 0
                ? h.span(
                    [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
                    [t.team.noLiveFeatureLeft],
                  )
                : h.div(
                    [h.Class('flex flex-wrap gap-1.5')],
                    candidates.map((id) => {
                      const on = draft.features.includes(id)
                      return h.button(
                        [
                          h.Key(`split-${id}`),
                          h.Type('button'),
                          h.OnClick(
                            Message.TeamChanged({
                              message: TeamMessage.ServiceFeatureToggled({ id }),
                            }),
                          ),
                          h.Class(
                            cn(
                              'flex h-6 items-center gap-1 rounded-full border px-2 text-[calc(11px*var(--type-scale))]',
                              on
                                ? 'border-primary/60 bg-primary/15 text-foreground'
                                : 'border-foreground/15 text-muted-foreground hover:text-foreground',
                            ),
                          ),
                        ],
                        [on ? icon(h, Check, 'size-3') : h.empty, t.catalog.features[id].name],
                      )
                    }),
                  ),
              h.div(
                [h.Class('flex items-center gap-2')],
                [
                  button(
                    {
                      onClick: Message.TeamChanged({ message: TeamMessage.SplitChosen() }),
                      isDisabled: refusal !== null,
                      variant: 'outline',
                      size: 'sm',
                      attributes: [
                        h.Title(
                          refusal === null
                            ? t.team.moveFeaturesToCodebase
                            : splitWhy(t, game, draft, refusal),
                        ),
                      ],
                    },
                    refusal === null
                      ? [
                          icon(h, Container, 'size-3.5'),
                          t.team.splitFor(t.units.devHours(splitCost(draft.features))),
                        ]
                      : [icon(h, Lock, 'size-3'), t.team.locked],
                    h,
                  ),
                  h.span(
                    [h.Class('text-[calc(11px*var(--type-scale))] text-muted-foreground')],
                    [refusal === null ? '' : splitWhy(t, game, draft, refusal)],
                  ),
                ],
              ),
            ],
          )
        : h.span(
            [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [
              t.team.serviceBoundariesSplits(
                t.catalog.research['service-boundaries'].name,
                t.catalog.eras[RESEARCH['service-boundaries'].era]?.name ?? '',
              ),
            ],
          ),
    ],
  )
}

/**
 * DORA metrics (08 "Deploy frequency"): deploy frequency, lead time for changes, change failure
 * rate, and failed deployment recovery time. Shown once a CI/CD Pipeline is placed, as the design
 * names; before that the one shared deploy pipeline has nothing to measure.
 */
const doraCard = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  if (game.sandbox || !pipelineOf(game)) return h.empty
  const dora = doraMetrics(game)
  const stat = (label: string, value: string): Html =>
    h.div(
      [h.Class('flex flex-col gap-0.5')],
      [
        h.span([h.Class(EYEBROW)], [label]),
        h.span([h.Class(cn(FIGURE, 'text-[calc(13px*var(--type-scale))]'))], [value]),
      ],
    )
  return h.section(
    [h.Key('dora'), h.Class(cn(PANEL, 'flex shrink-0 flex-col gap-2.5 px-4 pt-3.5 pb-3'))],
    [
      heading(t.team.dORAMetrics, h.empty, h),
      h.div(
        [h.Class('grid grid-cols-4 gap-3')],
        [
          stat(t.team.deployFrequency, t.team.perDay(dora.deploysPerDay.toFixed(1))),
          stat(t.team.leadTime, wait(t, dora.leadTime)),
          stat(t.team.changeFailureRate, `${Math.round(dora.changeFailureRate * 100)}%`),
          stat(t.team.mttr, dora.mttr === null ? '—' : wait(t, dora.mttr)),
        ],
      ),
    ],
  )
}

const floor = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  return h.div(
    [
      h.Class(`flex min-h-0 flex-col gap-3 p-4 ${SCROLL}`),
      h.DataAttribute('team-drag-floor', ''),
      ...(DragAndDrop.isDragging(model.board.team.drag)
        ? [h.DataAttribute('team-drag-active', '')]
        : []),
    ],
    [
      game.sandbox ? h.empty : servicesCard(model, h),
      doraCard(game, h),
      game.teams.length > 1 && game.engineers.length > 0
        ? h.p(
            [h.Class('px-1 text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
            [t.team.dragAnEngineerToAnotherTeam],
          )
        : h.empty,
      ...game.teams.map((team, index) => pod(model, team, index, h)),
      Option.match(DragAndDrop.ghostStyle(model.board.team.drag), {
        onNone: () => h.empty,
        onSome: (style) =>
          Option.match(DragAndDrop.maybeDraggedItemId(model.board.team.drag), {
            onNone: () => h.empty,
            onSome: (id) =>
              h.div(
                [
                  h.Style(style),
                  h.Class(cn(PANEL, 'pointer-events-none z-50 px-4 py-3 text-sm font-medium')),
                ],
                [nameOf(id)],
              ),
          }),
      }),
      game.stage >= 1 && game.teams.length < MAX_TEAMS
        ? h.button(
            [
              h.Key('new-team'),
              h.Type('button'),
              h.OnClick(Message.TeamChanged({ message: TeamMessage.Created() })),
              h.Class(
                'press flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-foreground/20 text-[calc(13px*var(--type-scale))] font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              ),
            ],
            [icon(h, Plus, 'size-4'), t.team.newTeam],
          )
        : h.empty,
    ],
  )
}

/* ---------- the ship line ---------- */

/* ---------- a migration ---------- */

const stackName = (t: Messages, runtime: RuntimeId, framework: FrameworkId): string =>
  `${t.catalog.runtimes[runtime].name}${framework === 'none' ? '' : ` · ${t.catalog.frameworks[framework].name}`}`

const migrationCard = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const migration = serviceOf(game).migration
  if (!migration) return h.empty
  const shifted = stepOf(migration)
  const done = migration._tag === 'Finishing'
  const current = shifted > 0 ? (MIGRATION_STEPS[shifted - 1] ?? 1) : 0
  const next = MIGRATION_STEPS[shifted] ?? 1
  const language = RUNTIMES[migration.runtime].language
  const brand = STACK_LOGOS[language].color ?? 'var(--group-compute)'
  const step = game.backlog.find((item) => item.kind === 'migration')
  const percent = (share: number) => `${Math.round(share * 100)}%`
  return h.section(
    [h.Key('migration'), h.Class(cn(PANEL, 'flex shrink-0 flex-col gap-3 px-4 pt-3.5 pb-3'))],
    [
      h.div(
        [h.Class('flex flex-wrap items-center gap-x-3 gap-y-2')],
        [
          h.div(
            [h.Class('flex min-w-0 flex-1 items-center gap-2.5')],
            [
              h.span(
                [h.Class('opacity-45 grayscale')],
                [stackLogo(RUNTIMES[migration.fromRuntime].language, 'size-5', h)],
              ),
              h.span(
                [
                  h.Class(
                    'truncate text-[calc(13px*var(--type-scale))] text-muted-foreground line-through decoration-foreground/25',
                  ),
                ],
                [stackName(t, migration.fromRuntime, migration.fromFramework)],
              ),
              icon(h, ArrowRight, 'size-3.5 shrink-0 text-muted-foreground'),
              stackLogo(language, 'size-5', h),
              h.span(
                [
                  h.Class(
                    'truncate text-[calc(15px*var(--type-scale))] font-semibold tracking-[-0.02em]',
                  ),
                ],
                [stackName(t, migration.runtime, migration.framework)],
              ),
              migration.bugs
                ? badge({ variant: 'destructive' }, [icon(h, Bug, 'size-3'), t.team.bugs], h)
                : h.empty,
            ],
          ),
          done
            ? badge({ variant: 'secondary' }, [icon(h, Check, 'size-3'), t.team.migrated], h)
            : h.div(
                [h.Class('flex items-center gap-2')],
                [
                  h.span(
                    [
                      h.Class(
                        cn(FIGURE, 'text-[calc(11.5px*var(--type-scale))] text-muted-foreground'),
                      ),
                    ],
                    [
                      isReady(migration)
                        ? t.team.ready
                        : step
                          ? `${codeOf('migration', step.ref)} · ${amount(step.spent)}/${dh(t, step.cost)}`
                          : '',
                    ],
                  ),
                  button(
                    { onClick: Message.MigrationCancelled(), variant: 'ghost', size: 'sm' },
                    [t.team.cancel],
                    h,
                  ),
                  button(
                    {
                      onClick: Message.MigrationShifted(),
                      isDisabled: !isReady(migration),
                      size: 'sm',
                    },
                    [icon(h, ArrowRight, 'size-3.5'), t.team.shiftTo(percent(next))],
                    h,
                  ),
                ],
              ),
        ],
      ),
      h.div(
        [h.Class('flex flex-col gap-1')],
        [
          h.div(
            [h.Class(cn('relative h-7 overflow-hidden', WELL, 'rounded-lg'))],
            [
              done
                ? h.empty
                : h.div(
                    [
                      h.Class('absolute inset-0 transition-[clip-path] duration-500 ease-out'),
                      h.Style({
                        'background-color': `color-mix(in oklch, ${brand} ${isReady(migration) ? 45 : 18}%, transparent)`,
                        'background-image': STRIPES,
                        'clip-path': `inset(0 ${(1 - next) * 100}% 0 0)`,
                      }),
                    ],
                    [],
                  ),
              h.div(
                [
                  h.Class(
                    'absolute inset-0 shadow-[inset_0_1px_0_oklch(1_0_0/0.3)] transition-[clip-path] duration-700 [transition-timing-function:var(--ease-in-out)]',
                  ),
                  h.Style({
                    'background-color': brand,
                    'clip-path': `inset(0 ${(1 - current) * 100}% 0 0 round 8px)`,
                  }),
                ],
                [],
              ),
              ...MIGRATION_STEPS.slice(0, -1).map((share, at) =>
                h.div(
                  [
                    h.Key(`tick-${at}`),
                    h.Class('absolute inset-y-0 w-px bg-foreground/15'),
                    h.Style({ left: `${share * 100}%` }),
                  ],
                  [],
                ),
              ),
              h.span(
                [
                  h.Class(
                    cn(
                      FIGURE,
                      'absolute inset-y-0 right-2.5 flex items-center text-[calc(11px*var(--type-scale))] text-muted-foreground',
                    ),
                  ),
                ],
                [t.team.ofTraffic(percent(current))],
              ),
            ],
          ),
          h.div(
            [h.Class('relative h-3.5')],
            MIGRATION_STEPS.map((share, at) =>
              h.span(
                [
                  h.Key(`label-${at}`),
                  h.Class(
                    cn(
                      FIGURE,
                      'absolute top-0 text-[calc(10px*var(--type-scale))]',
                      at < shifted ? 'text-foreground' : 'text-muted-foreground',
                      share >= 1 ? '-translate-x-full' : '-translate-x-1/2',
                    ),
                  ),
                  h.Style({ left: `${share * 100}%` }),
                ],
                [percent(share)],
              ),
            ),
          ),
        ],
      ),
    ],
  )
}

/* ---------- the board ---------- */

type Status = 'queued' | 'building' | 'shipping' | 'live'

/** A Linear-style status mark: a dashed ring waits, a filling pie builds, a check is live. */
const statusMark = (status: Status, share: number, h: HtmlBuilder<Message>): Html => {
  const pie = 2 * Math.PI * 2.5
  const tone =
    status === 'building' ? 'text-warn' : status === 'queued' ? 'text-muted-foreground' : 'text-ok'
  return h.svg(
    [
      h.AriaHidden(true),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 14 14'),
      h.Fill('none'),
      h.Class(cn('size-3.5 shrink-0', tone)),
    ],
    status === 'live'
      ? [
          h.circle([h.Cx('7'), h.Cy('7'), h.R('6.5'), h.Fill('currentColor')]),
          h.path([
            h.D('M4.3 7.2 6.2 9 9.8 5.2'),
            h.Stroke('white'),
            h.StrokeWidth('1.5'),
            h.StrokeLinecap('round'),
            h.StrokeLinejoin('round'),
          ]),
        ]
      : [
          h.circle([
            h.Cx('7'),
            h.Cy('7'),
            h.R('6'),
            h.Stroke('currentColor'),
            h.StrokeWidth('1.5'),
            ...(status === 'queued' ? [h.Attribute('stroke-dasharray', '1.6 1.9')] : []),
          ]),
          status === 'queued'
            ? h.empty
            : h.circle([
                h.Cx('7'),
                h.Cy('7'),
                h.R('2.5'),
                h.Stroke('currentColor'),
                h.StrokeWidth('5'),
                h.Attribute('stroke-dasharray', `${pie * clamp(share)} ${pie}`),
                h.Attribute('transform', 'rotate(-90 7 7)'),
              ]),
        ],
  )
}

/** A stable identifier per catalog entry, as an issue tracker would show it. */
const codeOf = (kind: WorkKind, ref: string): string => {
  if (kind === 'feature') return `FEAT-${FEATURE_IDS.indexOf(ref as FeatureId) + 1}`
  if (kind === 'task') return `ENG-${TASK_IDS.indexOf(ref as TaskId) + 1}`
  if (kind === 'patch') return `SEC-${ref.slice(-4)}`
  if (kind === 'move') return ref === 'auth' ? 'MOV-1' : 'MOV-2'
  if (kind === 'split') return `SVC-${ref.replace(/\D/g, '') || '2'}`
  return `MIG-${ref.replace(/\D/g, '') || '1'}`
}

const label = (kind: WorkKind, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.span(
    [
      h.Class(
        'inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[calc(10.5px*var(--type-scale))] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
      ),
    ],
    [
      h.span([h.Class(cn('size-1.5 rounded-full', kindOf(t)[kind].fill))], []),
      kindOf(t)[kind].label,
    ],
  )
}

/**
 * What a live Feature's users have and what A/B testing reads from it (08 "Adoption", "Measured
 * lift"): the adoption share, and the lift with its interval once the research is done.
 */
const featureReadout = (game: Game, id: FeatureId, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const adopted = Math.round(adoptionShareOf(game, id) * 100)
  const reading = liftReading(game, id)
  const lift = reading
    ? t.team.lift(
        `${reading.lift >= 0 ? '+' : ''}${Math.round(reading.lift * 100)}%`,
        Number.isFinite(reading.halfWidth) ? Math.round(reading.halfWidth * 100) : '—',
        reading.verdict === 'wins'
          ? t.team.wins
          : reading.verdict === 'loses'
            ? t.team.loses
            : t.team.tooEarly,
      )
    : null
  return h.span(
    [h.Class('flex flex-wrap items-center gap-1')],
    [
      badge({ variant: 'secondary' }, [t.team.adopted(adopted)], h),
      ...(lift ? [badge({ variant: 'secondary' }, [lift], h)] : []),
    ],
  )
}

/** The share of the Team's Dev Hours that keeps the live Features running (08 "Upkeep"). */
const upkeepPill = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const share = upkeepShare(game, serviceOf(game))
  if (share <= 0) return h.empty
  return h.div(
    [
      h.Key('upkeep'),
      h.Class(
        cn(
          'flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[calc(11.5px*var(--type-scale))] text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
        ),
      ),
    ],
    [
      h.span([h.Class('flex-1')], [t.team.upkeep]),
      h.span([h.Class(FIGURE)], [t.team.shareOfDevHours(Math.round(share * 100))]),
    ],
  )
}

/** A patch's clock: the time left, then red and counting how long it is overdue until it is exploited. */
const deadline = (game: Game, item: WorkItem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  if (item.due === undefined) return h.empty
  const late = overdueBy(game, item)
  return h.span(
    [
      h.Class(
        cn(
          FIGURE,
          'inline-flex h-5 items-center rounded-full px-1.5 text-[calc(10.5px*var(--type-scale))] font-medium whitespace-nowrap',
          late > 0
            ? 'bg-danger text-white'
            : 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
        ),
      ),
    ],
    [
      late > 0
        ? t.team.exploitIn(wait(t, PATCH_GRACE - late))
        : t.team.dueIn(wait(t, item.due - game.time)),
    ],
  )
}

const estimate = (text: string, h: HtmlBuilder<Message>): Html =>
  h.span(
    [
      h.Class(
        cn(
          FIGURE,
          'inline-flex h-5 items-center rounded-full px-1.5 text-[calc(10.5px*var(--type-scale))] whitespace-nowrap text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
        ),
      ),
    ],
    [text],
  )

/** A small avatar for a card's assignees. */
const mini = (id: string | null, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.span(
    [
      h.Key(id ?? 'founder'),
      h.Title(id ? nameOf(id) : t.team.you),
      h.Class(
        cn(
          'grid size-5 shrink-0 place-items-center rounded-full text-[calc(9.5px*var(--type-scale))] font-semibold text-white ring-2 ring-[var(--card)] not-first:-ml-1.5',
          id === null && 'bg-primary-fill text-on-primary-fill',
        ),
      ),
      ...(id === null ? [] : [h.Style({ 'background-color': `oklch(0.64 0.14 ${hueOf(id)})` })]),
    ],
    [id ? nameOf(id).slice(0, 1) : icon(h, Crown, 'size-2.5')],
  )
}

const assignees = (game: Game, team: Team, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  const people: ReadonlyArray<string | null> = [
    ...(game.teams[0]?.id === team.id ? [null] : []),
    ...membersOf(game, team).map((engineer) => engineer.id),
  ]
  const shown = people.slice(0, 4)
  return h.span(
    [
      h.Class('flex items-center'),
      h.Title(t.team.labelColon(teamName(t, team)) + ` ${people.length}`),
    ],
    [
      ...shown.map((id) => mini(id, h)),
      people.length > shown.length
        ? h.span(
            [
              h.Class(
                cn(FIGURE, 'ml-1 text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
              ),
            ],
            [`+${people.length - shown.length}`],
          )
        : h.empty,
    ],
  )
}

const unassigned = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.span(
    [
      h.Title(t.team.unassigned),
      h.Class('size-5 rounded-full border-[1.5px] border-dashed border-foreground/25'),
    ],
    [],
  )
}

const card = (
  key: string,
  code: string,
  title: string,
  status: Status,
  share: number,
  owner: Html,
  chips: ReadonlyArray<Html>,
  actions: ReadonlyArray<Html>,
  late: boolean,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(key),
      h.Class(
        cn(
          late && 'ring-[1.5px] ring-danger',
          'group relative flex flex-col gap-2 rounded-[10px] bg-surface px-3 py-2.5 shadow-[0_0_0_1px_var(--hairline-soft),0_1px_2px_oklch(0_0_0/0.05)] transition-shadow duration-150 hover:shadow-[0_0_0_1px_var(--hairline),0_2px_6px_oklch(0_0_0/0.07)]',
          status === 'live' && 'bg-transparent shadow-[0_0_0_1px_var(--hairline-soft)]',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-2')],
        [
          h.span(
            [
              h.Class(
                cn(FIGURE, 'flex-1 text-[calc(11px*var(--type-scale))] text-muted-foreground'),
              ),
            ],
            [code],
          ),
          owner,
        ],
      ),
      h.div(
        [h.Class('flex items-start gap-2')],
        [
          h.span([h.Class('mt-[2px]')], [statusMark(status, share, h)]),
          h.span(
            [
              h.Class(
                cn(
                  'line-clamp-2 text-[calc(13px*var(--type-scale))] leading-[1.35] font-medium',
                  status === 'live' && 'text-muted-foreground',
                ),
              ),
            ],
            [title],
          ),
        ],
      ),
      chips.length > 0
        ? h.div([h.Class('flex min-h-5 flex-wrap items-center gap-1')], chips)
        : h.empty,
      actions.length > 0
        ? h.div(
            [
              h.Class(
                'absolute top-1.5 right-1.5 flex items-center rounded-lg bg-surface p-0.5 opacity-0 shadow-[0_0_0_1px_var(--hairline-soft),0_2px_6px_oklch(0_0_0/0.08)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
              ),
            ],
            actions,
          )
        : h.empty,
    ],
  )

const rush = (game: Game, item: WorkItem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return iconButton(
    t.team.rushWith(dh(t, game.devHours)),
    Zap,
    Message.WorkRushed({ id: item.id }),
    game.devHours >= 0.1,
    h,
  )
}

const cancel = (item: WorkItem, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return item.kind === 'migration' || item.ref === 'fix-bugs'
    ? h.empty
    : iconButton(t.team.cancel, X, Message.WorkCancelled({ id: item.id }), true, h)
}

const backlogCard = (
  game: Game,
  item: WorkItem,
  index: number,
  team: Team | undefined,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)

  const share = clamp(item.spent / item.cost)
  const late = overdueBy(game, item) > 0
  return card(
    `item-${item.id}`,
    codeOf(item.kind, item.ref),
    workItemName(t, item),
    team ? 'building' : 'queued',
    share,
    team ? assignees(game, team, h) : unassigned(h),
    [
      label(item.kind, h),
      estimate(
        team || item.spent > 0 ? `${amount(item.spent)}/${dh(t, item.cost)}` : dh(t, item.cost),
        h,
      ),
      deadline(game, item, h),
    ],
    [
      team
        ? h.empty
        : iconButton(
            t.team.up,
            ArrowUp,
            Message.WorkMoved({ id: item.id, direction: -1 }),
            index > 0,
            h,
          ),
      team
        ? h.empty
        : iconButton(
            t.team.down,
            ArrowDown,
            Message.WorkMoved({ id: item.id, direction: 1 }),
            index < game.backlog.length - 1,
            h,
          ),
      rush(game, item, h),
      cancel(item, h),
    ],
    late,
    h,
  )
}

const idleCard = (game: Game, team: Team, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [
      h.Key(`idle-${team.id}`),
      h.Class(
        'flex items-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-foreground/15 px-3 py-2.5',
      ),
    ],
    [
      assignees(game, team, h),
      h.span(
        [h.Class('flex-1 truncate text-[calc(12.5px*var(--type-scale))] text-muted-foreground')],
        [t.team.idle(teamName(t, team))],
      ),
    ],
  )
}

const column = (
  key: string,
  status: Status,
  title: string,
  count: number,
  top: Html,
  cards: ReadonlyArray<Html>,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(key),
      h.Class('flex min-h-[260px] min-w-0 flex-col gap-1.5 rounded-xl bg-foreground/[0.028] p-1.5'),
    ],
    [
      h.div(
        [h.Class('flex items-center gap-2 px-1.5 pt-1 pb-1')],
        [
          statusMark(status, status === 'building' ? 0.5 : 1, h),
          h.span([h.Class('text-[calc(12.5px*var(--type-scale))] font-medium')], [title]),
          h.span(
            [h.Class(cn(FIGURE, 'text-[calc(12px*var(--type-scale))] text-muted-foreground'))],
            [String(count)],
          ),
        ],
      ),
      top,
      ...cards,
    ],
  )

const deployPill = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const built = awaitingFeatures(game).length
  const left = serviceOf(game).nextDeployAt - game.time
  const chance = badDeployChance(game)
  const stalled = game.incident?.kind === 'bad-deploy'
  return h.div(
    [
      h.Key('deploy'),
      h.Class(
        cn(
          'flex items-center gap-2.5 rounded-[10px] px-2.5 py-2',
          built > 0
            ? 'bg-primary-fill text-on-primary-fill shadow-primary'
            : 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]',
        ),
      ),
    ],
    [
      h.span(
        [
          h.Class(
            cn(
              'relative grid size-8 shrink-0 place-items-center rounded-full',
              built > 0 && !stalled
                ? 'bg-ok text-white'
                : stalled
                  ? 'bg-danger text-white'
                  : 'bg-well',
            ),
          ),
        ],
        [
          icon(h, Rocket, 'size-3.5'),
          built > 0 && !stalled
            ? h.span(
                [h.Class('absolute -inset-[3px]')],
                [ring(1 - left / deployEvery(game), 'size-[38px] text-ok', h)],
              )
            : h.empty,
        ],
      ),
      h.div(
        [h.Class('flex min-w-0 flex-col')],
        [
          h.span(
            [h.Class('truncate text-[calc(12.5px*var(--type-scale))] font-medium')],
            [
              built === 0
                ? t.team.nothingToShip
                : stalled
                  ? t.team.held
                  : t.team.deployIn(wait(t, left)),
            ],
          ),
          chance > 0
            ? h.span(
                [
                  h.Class(
                    cn(
                      FIGURE,
                      'text-[calc(10.5px*var(--type-scale))]',
                      chance >= 0.15 ? 'text-warn' : 'opacity-60',
                    ),
                  ),
                  h.Title(t.team.chanceADeployShipsABug),
                ],
                [t.team.badDeploys(Math.round(chance * 100))],
              )
            : h.empty,
        ],
      ),
    ],
  )
}

const LIVE_SHOWN = 4

const board = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const teams = game.teams
  const queue = game.backlog.slice(teams.length)
  const building = game.backlog.slice(0, teams.length)
  const live = [...liveFeatures(game)].reverse()
  return h.div(
    [h.Class('grid grid-cols-4 gap-2 narrow:grid-cols-1')],
    [
      column(
        'queued',
        'queued',
        t.team.upNext,
        queue.length,
        h.empty,
        queue.map((item, at) => backlogCard(game, item, teams.length + at, undefined, h)),
        h,
      ),
      column(
        'building',
        'building',
        t.team.inProgress,
        building.length,
        h.empty,
        teams.map((team, index) => {
          const item = game.backlog[index]
          return item ? backlogCard(game, item, index, team, h) : idleCard(game, team, h)
        }),
        h,
      ),
      column(
        'shipping',
        'shipping',
        t.team.shipping,
        awaitingFeatures(game).length,
        deployPill(game, h),
        awaitingFeatures(game).map((id) =>
          card(
            `built-${id}`,
            codeOf('feature', id),
            t.catalog.features[id].name,
            'shipping',
            1,
            h.empty,
            [label('feature', h)],
            [],
            false,
            h,
          ),
        ),
        h,
      ),
      column(
        'live',
        'live',
        t.team.live,
        live.length,
        upkeepPill(game, h),
        [
          ...live
            .slice(0, LIVE_SHOWN)
            .map((id) =>
              card(
                `live-${id}`,
                codeOf('feature', id),
                t.catalog.features[id].name,
                'live',
                1,
                h.empty,
                [featureReadout(game, id, h)],
                [
                  iconButton(
                    t.team.removeFeature,
                    Trash2,
                    Message.TeamChanged({ message: TeamMessage.FeatureRemoved({ id }) }),
                    removeRefusal(game, id) === null,
                    h,
                    'text-danger',
                  ),
                ],
                false,
                h,
              ),
            ),
          live.length > LIVE_SHOWN
            ? h.span(
                [
                  h.Key('more'),
                  h.Class(
                    cn(
                      FIGURE,
                      'px-2 py-1 text-[calc(11px*var(--type-scale))] text-muted-foreground',
                    ),
                  ),
                ],
                [t.team.more(live.length - LIVE_SHOWN)],
              )
            : h.empty,
        ],
        h,
      ),
    ],
  )
}

const autopilot = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  return h.button(
    [
      h.Type('button'),
      h.Role('switch'),
      h.AriaChecked(game.autopilot),
      h.OnClick(Message.AutopilotToggled()),
      h.Class(
        cn(
          'press enter-pop inline-flex h-7 items-center gap-1.5 rounded-full pr-1 pl-2.5 text-[calc(11.5px*var(--type-scale))] font-medium',
          glowing(model, 'autopilot') && 'cue-glow',
          !shown(model, 'autopilot') && 'hidden',
          game.autopilot
            ? 'bg-primary-fill text-on-primary-fill shadow-primary'
            : 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)] hover:text-foreground',
        ),
      ),
    ],
    [
      icon(h, Bot, 'size-3.5'),
      t.team.autopilot,
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'rounded-full px-1.5 py-0.5 text-[calc(10px*var(--type-scale))]',
              game.autopilot ? 'bg-white/20' : 'bg-well',
            ),
          ),
        ],
        [game.autopilot ? t.team.oN : t.team.oFF],
      ),
    ],
  )
}

/** The Autopilot perk's policies (13 "The Legacy shop"): a switch for each level the perk has. */
const policyCopy = (t: Messages): Readonly<Record<'research' | 'hire' | 'upgrade', string>> => ({
  research: t.team.policyResearch,
  hire: t.team.policyHire,
  upgrade: t.team.policyUpgrade,
})

const policies = (model: Model, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const t = copy(h)
  const game = model.board.game
  const level = perkLevel(game, 'autopilot')
  return (['research', 'hire', 'upgrade'] as const)
    .filter((policy) => level >= POLICY_LEVEL[policy])
    .map((policy) =>
      h.button(
        [
          h.Key(`policy-${policy}`),
          h.Type('button'),
          h.Role('switch'),
          h.AriaChecked(game.policies[policy]),
          h.OnClick(Message.PolicyToggled({ policy, on: !game.policies[policy] })),
          h.Class(
            cn(
              'press inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[calc(11.5px*var(--type-scale))] font-medium',
              game.policies[policy]
                ? 'bg-primary-fill text-on-primary-fill shadow-primary'
                : 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)] hover:text-foreground',
            ),
          ),
        ],
        [policyCopy(t)[policy]],
      ),
    )
}

/** Chaos experiments (10 "Track: Reliability"): the Company's own failure injection, once researched. */
const chaos = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const target = game.weakest
    ? t.catalog.components[game.nodes.find((entry) => entry.id === game.weakest)?.type ?? 'server']
        .name
    : null
  return h.button(
    [
      h.Type('button'),
      h.Role('switch'),
      h.AriaChecked(game.chaos),
      h.AriaLabel(target ? t.team.chaosNextHitsLabel(target) : t.team.chaosExperiments),
      h.Title(target ? t.team.chaosNextHits(target) : t.team.chaosExperiments),
      h.OnClick(Message.ChaosChosen({ chaos: !game.chaos })),
      h.Class(
        cn(
          'press inline-flex h-7 items-center gap-1.5 rounded-full pr-1 pl-2.5 text-[calc(11.5px*var(--type-scale))] font-medium',
          game.chaos
            ? 'bg-primary-fill text-on-primary-fill shadow-primary'
            : 'text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)] hover:text-foreground',
        ),
      ),
    ],
    [
      icon(h, FlaskConical, 'size-3.5'),
      t.team.chaos,
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'rounded-full px-1.5 py-0.5 text-[calc(10px*var(--type-scale))]',
              game.chaos ? 'bg-white/20' : 'bg-well',
            ),
          ),
        ],
        [game.chaos ? t.team.oN : t.team.oFF],
      ),
    ],
  )
}

/* ---------- the roadmap ---------- */

const costPill = (cost: number, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.span(
    [
      h.Class(
        cn(
          FIGURE,
          'shrink-0 rounded-full bg-primary-fill px-2 py-0.5 text-[calc(10.5px*var(--type-scale))] text-on-primary-fill shadow-primary',
        ),
      ),
    ],
    [dh(t, cost)],
  )
}

type TileState = 'open' | 'locked' | 'queued' | 'done'

const tile = (
  key: string,
  code: string,
  name: string,
  cost: number,
  effect: string,
  extra: string | null,
  state: TileState,
  status: Html,
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [
      h.Key(key),
      h.Class(
        cn(
          'flex min-w-0 flex-col gap-1.5 rounded-xl px-3 pt-2.5 pb-2.5',
          state === 'locked'
            ? 'bg-foreground/[0.025] text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline-soft)]'
            : state === 'done'
              ? 'bg-[var(--ok-soft)] shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--ok)_18%,transparent)]'
              : 'bg-raised shadow-raised',
        ),
      ),
    ],
    [
      h.div(
        [h.Class('flex items-start gap-2')],
        [
          h.div(
            [h.Class('flex min-w-0 flex-1 flex-col')],
            [
              h.span(
                [
                  h.Class(
                    cn(FIGURE, 'text-[calc(10.5px*var(--type-scale))] text-muted-foreground'),
                  ),
                ],
                [code],
              ),
              h.span(
                [h.Class('truncate text-[calc(13px*var(--type-scale))] font-semibold')],
                [name],
              ),
            ],
          ),
          state === 'done' ? h.empty : costPill(cost, h),
        ],
      ),
      h.span(
        [
          h.Class(
            'line-clamp-2 min-h-[2lh] text-[calc(11.5px*var(--type-scale))] leading-snug text-muted-foreground',
          ),
        ],
        [effect],
      ),
      extra
        ? h.span([h.Class('truncate text-[calc(11.5px*var(--type-scale))] text-warn')], [extra])
        : h.empty,
      h.div([h.Class('mt-auto flex justify-end pt-0.5')], [status]),
    ],
  )

const queueButton = (
  label: string,
  message: Message,
  refusal: string | null,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  return button(
    {
      onClick: message,
      isDisabled: refusal !== null,
      variant: 'outline',
      size: 'sm',
      attributes: [h.Title(refusal ?? t.team.addToTheBacklog)],
    },
    refusal ? [icon(h, Lock, 'size-3'), t.team.locked] : [icon(h, Plus, 'size-3.5'), label],
    h,
  )
}

const featureTile = (game: Game, id: FeatureId, review: boolean, h: HtmlBuilder<Message>) => {
  const t = copy(h)

  const def = localized(FEATURES[id], t.catalog.features[id])
  const live = isFeatureLive(game, id)
  const built = isBuilt(game, id)
  const queued = game.backlog.some((item) => item.ref === id)
  const refusal = featureRefusal(game, id)
  const state: TileState = live
    ? 'done'
    : built || queued
      ? 'queued'
      : refusal !== null
        ? 'locked'
        : 'open'
  return tile(
    id,
    codeOf('feature', id),
    def.name,
    featureHoursOf(game, id),
    def.era > game.stage ? `${t.catalog.eras[def.era]?.name ?? ''} · ${def.effect}` : def.effect,
    review && def.hidden && !live ? def.hidden : null,
    state,
    live
      ? badge(
          { variant: 'secondary', className: 'text-ok' },
          [icon(h, Check, 'size-3'), t.team.live],
          h,
        )
      : built
        ? badge({ variant: 'outline' }, [icon(h, Rocket, 'size-3'), t.team.built], h)
        : queued
          ? badge({ variant: 'outline' }, [t.team.queued], h)
          : queueButton(
              t.team.build,
              Message.TeamChanged({ message: TeamMessage.FeatureQueued({ id }) }),
              refusal ? featureWhy(t, game, id, refusal) : null,
              h,
            ),
    h,
  )
}

/** A runbook names one incident kind: a chip per kind the team has handled, waiting for one. */
const runbookPicker = (game: Game, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const kinds = runbookKinds(game)
  if (kinds.length === 0)
    return h.span(
      [h.Class('text-[calc(11.5px*var(--type-scale))] text-muted-foreground')],
      [t.team.handleIncidentFirst],
    )
  return h.div(
    [h.Class('flex flex-wrap gap-1')],
    kinds.map((kind) => {
      const refusal = runbookRefusal(game, kind)
      const queued = game.backlog.some(
        (item) => item.kind === 'task' && item.ref === 'runbook' && item.target === kind,
      )
      return h.button(
        [
          h.Key(`runbook-${kind}`),
          h.Type('button'),
          h.OnClick(Message.RunbookQueued({ kind })),
          h.Disabled(refusal !== null),
          h.Title(
            refusal
              ? runbookWhy(t, game, kind, refusal)
              : t.team.writeRunbookFor(t.catalog.incidents[kind].name),
          ),
          h.Class(
            'flex h-6 items-center gap-1 rounded-md border border-hairline px-1.5 text-[calc(11px*var(--type-scale))] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50',
          ),
        ],
        [
          icon(h, queued ? Hourglass : Plus, 'size-3'),
          h.span([h.Class('truncate')], [t.catalog.incidents[kind].name]),
        ],
      )
    }),
  )
}

const taskTile = (game: Game, id: TaskId, h: HtmlBuilder<Message>) => {
  const t = copy(h)

  const done = serviceOf(game).fixes.includes(id as never)
  const queued = game.backlog.some((item) => item.ref === id)
  // A runbook tile picks its incident kind in the tile, so its own refusal is only the research.
  const refusal = id === 'runbook' && has(game, 'runbooks') ? null : taskRefusal(game, id)
  const runbooks = game.runbooks.length
  return tile(
    id,
    codeOf('task', id),
    t.catalog.tasks[id].name,
    TASKS[id].dh,
    id === 'runbook' && runbooks > 0
      ? t.team.runbooksWritten(t.catalog.tasks[id].effect, runbooks)
      : t.catalog.tasks[id].effect,
    null,
    done ? 'done' : queued ? 'queued' : refusal !== null ? 'locked' : 'open',
    id === 'runbook'
      ? runbookPicker(game, h)
      : done
        ? badge(
            { variant: 'secondary', className: 'text-ok' },
            [icon(h, Check, 'size-3'), t.team.done],
            h,
          )
        : queued
          ? badge({ variant: 'outline' }, [t.team.queued], h)
          : queueButton(
              t.team.queue,
              Message.TaskQueued({ id }),
              refusal ? taskWhy(t, game, id, refusal) : null,
              h,
            ),
    h,
  )
}

const TILES = 'grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2'

const work = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const tasks = TASK_IDS.filter((id) => {
    const def = localized(TASKS[id], t.catalog.tasks[id])
    return !def.internal && (def.research === null || has(game, def.research))
  })
  const features = FEATURE_IDS.filter((id) => FEATURES[id].era <= game.stage + 1)
  const live = features.filter((id) => isFeatureLive(game, id)).length
  const review = has(game, 'code-review')
  const engineering = tasks.length > 0 && shown(model, 'engineering')
  return h.div(
    [h.Class(`flex min-h-0 flex-col gap-3 p-4 ${SCROLL}`)],
    [
      migrationCard(game, h),
      heading(
        t.team.board,
        h.div(
          [h.Class('flex items-center gap-2')],
          [
            autopilot(model, h),
            ...policies(model, h),
            ...(has(game, 'chaos-engineering') ? [chaos(model, h)] : []),
          ],
        ),
        h,
      ),
      board(game, h),
      heading(
        t.team.features,
        h.span(
          [h.Class(cn(FIGURE, 'text-[calc(11px*var(--type-scale))] text-muted-foreground'))],
          [t.team.live2(live, features.length)],
        ),
        h,
      ),
      h.div(
        [h.Class(TILES)],
        features.map((id) => featureTile(game, id, review, h)),
      ),
      engineering ? heading(t.team.engineering, h.empty, h) : h.empty,
      engineering
        ? h.div(
            [
              h.Class(
                cn(TILES, 'enter-pop rounded-xl', glowing(model, 'engineering') && 'cue-glow'),
              ),
            ],
            tasks.map((id) => taskTile(game, id, h)),
          )
        : h.empty,
    ],
  )
}

export const teamPanel = (model: Model, h: HtmlBuilder<Message>): Html => {
  const t = copy(h)

  const game = model.board.game
  const rate = devHoursRate(game, ledgerOf(model))
  const payroll = payrollOf(game)
  return shell(
    t.team.team,
    [
      payroll > 0
        ? h.span(
            [
              h.Class(
                cn(
                  FIGURE,
                  'text-[calc(12px*var(--type-scale))] whitespace-nowrap text-muted-foreground compact:hidden',
                ),
              ),
            ],
            [t.team.sPayroll(money(payroll))],
          )
        : h.empty,
      h.span(
        [
          h.Class(
            cn(
              FIGURE,
              'flex items-baseline gap-1.5 rounded-full bg-well px-3 py-1 text-[calc(15px*var(--type-scale))] whitespace-nowrap shadow-well',
            ),
          ),
        ],
        [
          dh(t, game.devHours),
          h.span(
            [h.Class('text-[calc(11px*var(--type-scale))] text-ok')],
            [t.team.min(perMinute(rate))],
          ),
        ],
      ),
    ],
    [
      h.div(
        [
          h.Class(
            'grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] border-t border-hairline narrow:grid-cols-1',
          ),
        ],
        [
          h.div(
            [h.Class('flex min-h-0 flex-col border-r border-hairline bg-nested narrow:border-r-0')],
            [floor(model, h)],
          ),
          work(model, h),
        ],
      ),
    ],
    'max-w-[1360px] h-[min(820px,100%)]',
    h,
  )
}
