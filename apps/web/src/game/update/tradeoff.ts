import * as Work from '@quorum/simulation/work'
import { AppendLog, ComputePreview, WritePrefs } from '../commands.ts'
import { Model, type TradeoffOption } from '../model.ts'
import { Result } from 'effect'
import { line } from '../telemetry.ts'
import { migrates, optionMessage } from './options.ts'
import { optionAction } from '@quorum/ui/board/jobs'
import { refusalIn } from '../../i18n/refusal.ts'
import {
  say,
  type AnyCommand,
  type Dispatch,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'
import { step as tradeoffStep, type TradeoffState } from '../tradeoff-machine.ts'

/** A card that can be applied: a hovered or pinned option. */
type OpenTradeoff = Extract<TradeoffState, Readonly<{ _tag: 'Hovering' | 'Pinned' }>>

/**
 * A card for an option. A refusal shows at once; the ghost runs go to the compute
 * worker, and their preview arrives as PreviewComputed.
 */
export const tradeoffOf = (
  model: Model,
  nodeId: string,
  option: TradeoffOption,
  pinned: boolean,
): readonly [TradeoffState, ReadonlyArray<AnyCommand>] =>
  Result.match(
    migrates(model.board.game, nodeId) && option.kind !== 'family'
      ? Work.changeStack(
          model.board.game,
          nodeId,
          option.kind === 'runtime' ? { runtime: option.id } : { framework: option.id },
        )
      : optionAction(model.board.game, nodeId, option),
    {
      onSuccess: () =>
        [
          pinned
            ? { _tag: 'Pinned', nodeId, option, preview: null }
            : { _tag: 'Hovering', nodeId, option, preview: null },
          [ComputePreview({ game: model.board.game, nodeId, option })],
        ] as const,
      onFailure: (refusal) =>
        [
          {
            _tag: 'Refused',
            nodeId,
            option,
            reason: refusalIn(say(model), refusal),
          },
          [],
        ] as const,
    },
  )

/** Applies an option and logs what its card predicted, so playtests can compare it with the outcome. */
export const applyOption = (model: Model, card: OpenTradeoff, route: Dispatch): UpdateResult => {
  const closed: Model = { ...model, board: { ...model.board, tradeoff: { _tag: 'Closed' } } }
  const applied = route(closed, optionMessage(card.nodeId, card.option))
  if (applied.model.board.game === closed.board.game) return applied
  const seen = applied.model.prefs.seenTradeoffs.includes(card.option.kind)
    ? applied.model.prefs.seenTradeoffs
    : [...applied.model.prefs.seenTradeoffs, card.option.kind]
  const next: Model = { ...applied.model, prefs: { ...applied.model.prefs, seenTradeoffs: seen } }
  return {
    model: next,
    commands: [
      ...(applied.commands ?? []),
      WritePrefs({ prefs: next.prefs }),
      AppendLog({
        entries: [
          line(model.board.game.time, 'TradeoffPreviewed', {
            option: card.option,
            preview: card.preview,
          }),
        ],
      }),
    ],
  }
}

type TradeoffTag =
  | 'OptionPreviewed'
  | 'PreviewComputed'
  | 'BottleneckFound'
  | 'OptionLeft'
  | 'OptionChosen'
  | 'OptionConfirmed'
  | 'TradeoffClosed'

export const tradeoffHandlers = (
  model: Model,
  route: Dispatch,
): MessageCases<UpdateResult, TradeoffTag> => ({
  OptionPreviewed: ({ nodeId, option }) => {
    if (model.board.tradeoff._tag === 'Pinned') return { model }
    const [card, commands] = tradeoffOf(model, nodeId, option, false)
    const next =
      card._tag === 'Refused'
        ? tradeoffStep(model.board.tradeoff, card)
        : tradeoffStep(model.board.tradeoff, { _tag: 'Hovered', nodeId, option })
    return { model: { ...model, board: { ...model.board, tradeoff: next } }, commands }
  },

  PreviewComputed: ({ nodeId, option, preview }) => {
    const next = tradeoffStep(model.board.tradeoff, {
      _tag: 'PreviewComputed',
      nodeId,
      option,
      preview,
    })
    return next === model.board.tradeoff
      ? { model }
      : { model: { ...model, board: { ...model.board, tradeoff: next } } }
  },

  BottleneckFound: ({ bottleneck, at }) => {
    if (at !== model.board.bottleneckAt || bottleneck === model.board.bottleneck) return { model }
    const next: Model = { ...model, board: { ...model.board, bottleneck } }
    return { model: next }
  },

  OptionLeft: () => {
    const next = tradeoffStep(model.board.tradeoff, { _tag: 'Left' })
    return next === model.board.tradeoff
      ? { model }
      : { model: { ...model, board: { ...model.board, tradeoff: next } } }
  },

  OptionChosen: ({ nodeId, option }) => {
    // Once an option set is confirmed, its options apply on click; the card stays one line.
    if (model.prefs.seenTradeoffs.includes(option.kind)) {
      const hovered = model.board.tradeoff
      const same =
        (hovered._tag === 'Hovering' || hovered._tag === 'Pinned') &&
        hovered.nodeId === nodeId &&
        hovered.option.kind === option.kind &&
        hovered.option.id === option.id
      return applyOption(
        model,
        {
          _tag: 'Pinned',
          nodeId,
          option,
          preview: same ? hovered.preview : null,
        },
        route,
      )
    }
    const [card, commands] = tradeoffOf(model, nodeId, option, true)
    const next =
      card._tag === 'Refused'
        ? tradeoffStep(model.board.tradeoff, card)
        : tradeoffStep(model.board.tradeoff, { _tag: 'Chosen', nodeId, option })
    return { model: { ...model, board: { ...model.board, tradeoff: next } }, commands }
  },

  OptionConfirmed: () => {
    const card = model.board.tradeoff
    if (card._tag !== 'Pinned' || card.preview === null) return { model }
    const next = tradeoffStep(card, { _tag: 'Confirmed' })
    return applyOption({ ...model, board: { ...model.board, tradeoff: next } }, card, route)
  },

  TradeoffClosed: () => {
    const next = tradeoffStep(model.board.tradeoff, { _tag: 'Cancelled' })
    return next === model.board.tradeoff
      ? { model }
      : { model: { ...model, board: { ...model.board, tradeoff: next } } }
  },
})
