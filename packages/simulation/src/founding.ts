import {
  CALENDAR_DAY,
  CHAOS_FROM_STAGE,
  CHAOS_WEIGHT,
  COMPONENTS,
  ERAS,
  HN_WEIGHT,
  HOME_REGION,
  LANGUAGES,
  MONOLITH_DEBT,
  MONOLITH_KLOC,
  MUTATORS,
  MUTATOR_BANS,
  OPEN_ACTION_WEIGHT,
  PERKS,
  RESEARCH,
  RUNTIMES,
  SLO_LEVELS,
  VENTURES,
  type ComponentId,
  type IncidentId,
  type LanguageId,
  type MutatorId,
  type PerkId,
  type ResearchId,
  type RuntimeId,
  type VentureDef,
} from './catalog.ts'
import { newGame, preseedGame } from './company.ts'
import { restarting, type Life } from './life.ts'
import { sreStaffed } from './lookups.ts'
import { NEW_ENGINEER } from './state.ts'
import type { Founding, Game, GameNode, Region, Retries } from './state.ts'

/* ==========================================================================
   What a Company's founding changes (13): perk levels, the Venture, and the
   Mutators. Every rule reads `game.founding`. A Sandbox ignores all of it.
   ========================================================================== */

/** The level of a perk the Company was founded with. 0 in a Sandbox. */
export const perkLevel = (game: Game, id: PerkId): number =>
  game.sandbox ? 0 : Math.min(PERKS[id].costs.length, game.founding.perks[id] ?? 0)

export const ventureOf = (game: Game): VentureDef =>
  game.sandbox ? VENTURES['b2b-saas'] : VENTURES[game.founding.venture]

export const hasMutator = (game: Game, id: MutatorId): boolean =>
  !game.sandbox && game.founding.mutators.includes(id)

/** The Legacy multiplier of a founding: the Venture's, times one plus every Mutator's share. */
export const legacyMultiplier = (founding: Founding): number =>
  VENTURES[founding.venture].legacy *
  (1 + founding.mutators.reduce((sum, id) => sum + MUTATORS[id].legacy, 0))

/* ---------- perks ---------- */

/** Starting Cash: ×2 per Angel network level. */
export const angelFactor = (level: number): number => {
  let factor = 1
  for (let index = 0; index < level; index += 1) factor *= 2
  return factor
}

export const insightPerk = (game: Game): number => 1 + 0.2 * perkLevel(game, 'pattern-recognition')
export const growthPerk = (game: Game): number => 1 + 0.1 * perkLevel(game, 'founders-reputation')

/** Equity a round costs: the Era's dilution less 2 points per Better terms level. */
export const dilutionOf = (game: Game, dilution: number): number =>
  Math.max(0, dilution - 0.02 * perkLevel(game, 'better-terms'))

/** Cash a round pays: Tight budget halves it. */
export const grantOf = (game: Game, grant: number): number =>
  hasMutator(game, 'tight-budget') ? grant / 2 : grant

/**
 * How much an open action item multiplies its incident's weight: War stories halves the excess,
 * and so does an SRE team, which works the items instead of only filing them (08 "Teams").
 */
export const openActionWeight = (game: Game): number => {
  let excess = OPEN_ACTION_WEIGHT - 1
  for (let level = 0; level < perkLevel(game, 'war-stories'); level += 1) excess /= 2
  if (sreStaffed(game)) excess /= 2
  return 1 + excess
}

/** What the Mutators do to an incident's weight. */
export const mutatorWeight = (game: Game, kind: IncidentId): number =>
  (kind === 'spike' && hasMutator(game, 'hn-front-page') ? HN_WEIGHT : 1) *
  (kind === 'instance' && hasMutator(game, 'chaos-monkey') && game.stage >= CHAOS_FROM_STAGE
    ? CHAOS_WEIGHT
    : 1)

/* ---------- Mutator rules ---------- */

/** The language Single language holds every App Server to: the Garage's. */
export const FOUNDING_LANGUAGE: LanguageId = 'php'

/** Why a Mutator refuses to place a Component here, or null. */
export const placeRefusal = (game: Game, type: ComponentId, region: Region): string | null => {
  for (const id of game.founding.mutators) {
    if (game.sandbox) break
    if (MUTATOR_BANS[id]?.includes(type))
      return `${MUTATORS[id].name}: no ${COMPONENTS[type].name}.`
  }
  if (region !== HOME_REGION && hasMutator(game, 'one-region'))
    return `${MUTATORS['one-region'].name}: the home region only.`
  return venturePlaceRefusal(game, type, region)
}

/* ---------- Venture rules (13 "Ventures") ---------- */

/**
 * How much likelier a Venture's signature incident is for it, and the weakness
 * that incident keeps: an incident only its own Venture can suffer often.
 */
export const SIGNATURE_WEIGHT = 4
export const SIGNATURE_WEAKNESS = 2

/** The Venture's signature incident, or null for a Venture without one. */
export const signatureOf = (game: Game): IncidentId | null => ventureOf(game).signature

/** Whether this incident is the Venture's signature: the rule that only it can suffer. */
export const isSignature = (game: Game, kind: IncidentId): boolean =>
  !game.sandbox && signatureOf(game) === kind

/** The weight a signature incident carries for its Venture; 1 for every other. */
export const signatureWeight = (game: Game, kind: IncidentId): number =>
  isSignature(game, kind) ? SIGNATURE_WEIGHT : 1

/** The weakness a signature incident keeps for its Venture, and 0 for every other Company. */
export const signatureWeakness = (game: Game, kind: IncidentId): number =>
  isSignature(game, kind) ? SIGNATURE_WEAKNESS : 0

/** Why the Venture keeps data out of this region, or refuses the Node, or null. */
export const venturePlaceRefusal = (
  game: Game,
  type: ComponentId,
  region: Region,
): string | null => {
  const venture = ventureOf(game)
  const { residency, hubsPerRegion, gpus } = venture.constraint
  // GPUs are scarce: the Company buys a couple and resizes them (13 "Ventures", AI startup).
  if (gpus > 0 && type === 'gpu') {
    const held = game.nodes.filter((node) => node.type === 'gpu').length
    if (held >= gpus) return `${venture.name}: GPUs are scarce, ${gpus} GPU Nodes at most.`
  }
  // Realtime is served where the players are: one Hub per region (13 "Ventures", Game backend).
  if (
    hubsPerRegion !== null &&
    game.stage >= hubsPerRegion &&
    type === 'ws' &&
    game.nodes.some((node) => node.type === 'ws' && node.region === region)
  ) {
    const from = ERAS[hubsPerRegion]?.name ?? 'here'
    return `${venture.name}: one Realtime Hub per region from ${from}.`
  }
  if (residency === null || game.stage < residency || region === HOME_REGION) return null
  if (COMPONENTS[type].group !== 'data') return null
  return `${venture.name}: data stays in the home region from ${ERAS[residency]?.name ?? 'here'}.`
}

/** Why the Venture refuses a retry policy, or null. Its customers already retry. */
export const retryRefusal = (game: Game, retries: Retries): string | null => {
  const venture = ventureOf(game)
  return venture.constraint.noNaiveRetries && retries === 'naive'
    ? `${venture.name}: customers write their own retry loops.`
    : null
}

/** What a request may take and still earn: a bid miss earns nothing. */
export const earnsInTime = (game: Game, ms: number): boolean => {
  const deadline = ventureOf(game).constraint.deadline
  return deadline === null || ms <= deadline
}

/** A bought Component's lifecycle: procurement runs it one calendar day after it is paid for. */
export const placedLife = (game: Game, node: GameNode): Life =>
  ventureOf(game).constraint.procurement ? restarting(CALENDAR_DAY, 'restart', 0) : node.life

/** Why a Mutator refuses a runtime, or null. */
export const runtimeRefusal = (game: Game, runtime: RuntimeId): string | null => {
  const venture = ventureOf(game)
  const languages = venture.constraint.languages
  if (languages !== null && !languages.includes(RUNTIMES[runtime].language)) {
    const names = languages.map((id) => LANGUAGES[id].name).join(' or ')
    return `${venture.name}: the service runs ${names}.`
  }
  return hasMutator(game, 'single-language') && RUNTIMES[runtime].language !== FOUNDING_LANGUAGE
    ? `${MUTATORS['single-language'].name}: every App Server runs PHP.`
    : null
}

/** The next SLO level up: Strict SLO's step, and an SLA's target. */
const stricterSlo = (slo: number): number => SLO_LEVELS.find((level) => level > slo) ?? slo

/**
 * Strict SLO moves the Era's target to the next level up, and so does an SLA the Venture signed
 * from an Era on (13 "Ventures", B2B SaaS): one level, whichever of the two applies.
 */
export const sloOf = (game: Game, slo: number): number => {
  const sla = game.sandbox ? null : ventureOf(game).constraint.sla
  const signed = sla !== null && game.stage >= sla
  return hasMutator(game, 'strict-slo') || signed ? stricterSlo(slo) : slo
}

/* ---------- founding a Company ---------- */

/**
 * The board a founding starts on: the Garage, or Pre-seed for a Venture that
 * starts in it or for the Head start perk.
 */
const startBoard = (seed: number, founding: Founding): Game => {
  const venture = VENTURES[founding.venture]
  if ((founding.perks['head-start'] ?? 0) >= 1 || venture.start.stage >= 1) return preseedGame(seed)
  const garage = newGame(seed)
  return { ...garage, cash: venture.start.cash, equity: venture.start.equity }
}

/** A Venture that comes with a Stack and research: its first App Server, and what it knows. */
const ventureStart = (game: Game, venture: VentureDef): Game => {
  const { runtime, researched } = venture.start
  if (runtime === null && researched.length === 0) return game
  const firstServer = game.nodes.find((node) => node.type === 'server')?.id ?? null
  const known = researched.filter((id) => !game.researched.includes(id))
  return {
    ...game,
    researched: [...game.researched, ...known],
    nodes:
      runtime === null
        ? game.nodes
        : game.nodes.map((node) =>
            node.id === firstServer ? { ...node, framework: 'none', runtime } : node,
          ),
  }
}

/**
 * A new Company for a founding: the Garage, or Pre-seed with Head start. It
 * starts with the perks' Cash and engineers, the research the Founder kept,
 * the Venture's own Stack and research, and the Legacy monolith's codebase.
 */
export const foundCompany = (
  seed: number,
  founding: Founding,
  keep: ReadonlyArray<ResearchId> = [],
): Game => {
  const venture = VENTURES[founding.venture]
  const start = startBoard(seed, founding)
  const founded: Game = ventureStart({ ...start, founding }, venture)
  const kept = keep.filter((id) => RESEARCH[id] && !founded.researched.includes(id))
  const monolith = founding.mutators.includes('legacy-monolith')
  const service = founded.services[0]
  const alumni = founded.stage >= 1 ? perkLevel(founded, 'alumni-network') : 0
  return {
    ...founded,
    cash: founded.cash * angelFactor(perkLevel(founded, 'angel-network')),
    researched: [...founded.researched, ...kept],
    equity: venture.bootstrapped ? 1 : founded.equity,
    services:
      monolith && service
        ? [
            { ...service, codebase: MONOLITH_KLOC, debt: MONOLITH_DEBT },
            ...founded.services.slice(1),
          ]
        : founded.services,
    engineers: [...founded.engineers, ...alumniOf(founded, alumni)],
    workSeq: founded.workSeq + alumni,
  }
}

/** Alumni join ramped, on the first team, hired for the Service's language. */
export const alumniOf = (game: Game, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `e${game.workSeq + index + 1}`,
    team: game.teams[0]?.id ?? 'core',
    language: FOUNDING_LANGUAGE,
    hiredAt: Number.MIN_SAFE_INTEGER,
    ...NEW_ENGINEER,
  }))

/** The Era a founding starts in. */
export const startEra = (founding: Founding): string =>
  ERAS[(founding.perks['head-start'] ?? 0) >= 1 ? 1 : 0]?.name ?? ''
