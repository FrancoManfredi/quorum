import { Data, Result } from 'effect'
import type { IncidentId } from './catalog.ts'
import type { Game, GameNode, Incident } from './state.ts'
import { step as incidentStep } from './incident-machine.ts'

export type Refusal = Data.TaggedEnum<{
  Locked: { readonly what: string; readonly research: string }
  TooEarly: { readonly what: string; readonly era: string }
  Unaffordable: {
    readonly what: string
    readonly price: number
    readonly currency: 'cash'
  }
  NotAllowed: { readonly reason: string }
  Missing: {}
}>

export const Refusal = Data.taggedEnum<Refusal>()

export const describeRefusal = (refusal: Refusal): string =>
  Refusal.$match(refusal, {
    Locked: ({ what, research }) => `${what} needs ${research}.`,
    TooEarly: ({ what, era }) => `${what} opens in ${era}.`,
    Unaffordable: ({ what, price }) =>
      `${what} costs $${Math.round(price).toLocaleString('en-US')}.`,
    NotAllowed: ({ reason }) => reason,
    Missing: () => 'That is gone.',
  })

export type Action = Result.Result<Game, Refusal>

export const ok = (game: Game): Action => Result.succeed(game)
export const no = (refusal: Refusal): Action => Result.fail(refusal)
export const notAllowed = (reason: string): Action => no(Refusal.NotAllowed({ reason }))

export const withNode = (game: Game, id: string, apply: (node: GameNode) => Action): Action => {
  const node = game.nodes.find((entry) => entry.id === id)
  return node ? apply(node) : no(Refusal.Missing())
}

export const patch = (game: Game, id: string, change: Partial<GameNode>): Game => ({
  ...game,
  nodes: game.nodes.map((node) => (node.id === id ? { ...node, ...change } : node)),
})

export const spend = (
  game: Game,
  price: number,
  what: string,
  apply: (game: Game) => Game,
): Action =>
  game.cash < price
    ? no(Refusal.Unaffordable({ what, price, currency: 'cash' }))
    : ok(apply({ ...game, cash: game.cash - price }))

/**
 * The player's first action while an Incident runs acknowledges it (11 "The incident loop"), so an
 * Incident a response ended is never mistaken for one left alone to cascade.
 */
export const answering = (game: Game, incident: Incident): Incident => ({
  ...incident,
  phase: incidentStep(incident.phase, { _tag: 'Acked', at: game.time }),
})

/** Ends an incident that one action ends. */
export const endIncident = (game: Game, kind: IncidentId, refusal: string): Action =>
  game.incident?.kind === kind
    ? ok({ ...game, incident: { ...answering(game, game.incident), remaining: 0 } })
    : notAllowed(refusal)
