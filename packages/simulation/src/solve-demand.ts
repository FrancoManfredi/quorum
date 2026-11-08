import {
  BOT_SURGE,
  DDOS_MAGNITUDE,
  STUFFING_MAGNITUDE,
  CREDENTIAL_PROTECTION_BLOCK,
  DEADLINE_SURGE,
  KIND_SURGE,
  DIURNAL_AMPLITUDE,
  REQUEST_KINDS,
  RPS_PER_USER,
  WEEKEND_FACTOR,
  type RequestKind,
} from './catalog.ts'
import { ventureOf } from './founding.ts'
import { calendarMinute, cosTurns, saleOf } from './calendar.ts'
import { mixOf } from './features.ts'
import { has } from './lookups.ts'
import { regional, regionalCycle, userSharesOf } from './regions.ts'
import { type Game } from './state.ts'

/** The daily cycle: 1 + A × cos(2π × (hour − 20) / 24). */
export const diurnal = (time: number): number => {
  const minute = calendarMinute(time) % 1440
  return 1 + DIURNAL_AMPLITUDE * cosTurns((minute - 20 * 60) / 1440)
}

/** The weekly cycle: weekdays 1, Saturday and Sunday the weekend factor. Day 1 is a Monday. */
export const weekly = (time: number): number => {
  const day = Math.floor(calendarMinute(time) / 1440) % 7
  return day >= 5 ? WEEKEND_FACTOR : 1
}

/** The Venture's daily cycle. The default Venture runs the slice's curve. */
export const ventureDiurnal = (game: Game): number => {
  const venture = ventureOf(game)
  if (venture.id === 'b2b-saas') return diurnal(game.time)
  const minute = calendarMinute(game.time) % 1440
  return 1 + venture.amplitude * cosTurns((minute - venture.peak * 60) / 1440)
}

export const ventureWeekly = (game: Game): number => {
  const venture = ventureOf(game)
  if (venture.id === 'b2b-saas') return weekly(game.time)
  const day = Math.floor(calendarMinute(game.time) / 1440) % 7
  return day >= 5 ? venture.weekend : 1
}

export const demandOf = (game: Game): Partial<Record<RequestKind, number>> => {
  const mix = mixOf(game)
  const spike = game.incident?.kind === 'spike' ? game.incident.magnitude : 1
  // A Government contract's deadline day lands every agency's work at once (13).
  const deadline = game.incident?.kind === 'deadline-day' ? DEADLINE_SURGE : 1
  // A Venture's signature surge lifts one kind: a premiere, a launch, or a flash sale (13).
  const surge = game.incident ? KIND_SURGE[game.incident.kind] : undefined
  const cycle = game.sandbox
    ? game.scenario?.daily && regional(game)
      ? regionalCycle(game.time, userSharesOf(game))
      : 1
    : regional(game)
      ? regionalCycle(game.time, userSharesOf(game)) * ventureWeekly(game)
      : ventureDiurnal(game) * ventureWeekly(game)
  const total = game.users * RPS_PER_USER * cycle * spike * deadline
  // E-commerce's scheduled sale lifts checkouts on the calendar, a month apart.
  const sale = game.sandbox ? null : ventureOf(game).constraint.sale
  const selling = sale !== null && saleOf(game.time, sale).on ? sale : null
  const demand: Partial<Record<RequestKind, number>> = {}
  for (const kind of REQUEST_KINDS) {
    const share = mix[kind] ?? 0
    if (share > 0)
      demand[kind] =
        total *
        share *
        (surge?.[0] === kind ? surge[1] : 1) *
        (selling?.kind === kind ? selling.lift : 1)
  }
  // Attacks add bots on top of the users: scrapers, a flood, or leaked passwords tried on login.
  // Credential stuffing protection blocks most of the burst before it reaches login (11 "Catalog",
  // `credential-protection`).
  const stuffing = has(game, 'credential-protection') ? CREDENTIAL_PROTECTION_BLOCK : 1
  const attack =
    game.incident?.kind === 'bot-surge'
      ? total * BOT_SURGE
      : game.incident?.kind === 'ddos'
        ? total * DDOS_MAGNITUDE
        : game.incident?.kind === 'stuffing'
          ? total * (mix.login ?? 0.04) * STUFFING_MAGNITUDE * stuffing
          : 0
  if (attack > 0) demand.bot = (demand.bot ?? 0) + attack
  return demand
}
