import * as Work from '@quorum/simulation/work'
import { AppendLog, ComputePreview, WritePrefs } from '../commands.ts'
import { Model, type Tradeoff, type TradeoffOption } from '../model.ts'
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

/**
 * A card for an option. A refusal shows at once; the ghost runs go to the compute
 * worker, and their preview arrives as PreviewComputed.
 */
export const tradeoffOf = (
  model: Model,
  nodeId: string,
  option: TradeoffOption,
  pinned: boolean,
): readonly [Tradeoff, ReadonlyArray<AnyCommand>] =>
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
          { nodeId, option, pinned, preview: null, refusal: null },
          [ComputePreview({ game: model.board.game, nodeId, option })],
        ] as const,
      onFailure: (refusal) =>
        [
          { nodeId, option, pinned, preview: null, refusal: refusalIn(say(model), refusal) },
          [],
        ] as const,
    },
  )

/** Applies an option and logs what its card predicted, so playtests can compare it with the outcome. */
export const applyOption = (model: Model, card: Tradeoff, route: Dispatch): UpdateResult => {
  const closed: Model = { ...model, board: { ...model.board, tradeoff: null } }
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
    if (model.board.tradeoff?.pinned) return { model }
    const [card, commands] = tradeoffOf(model, nodeId, option, false)
    return { model: { ...model, board: { ...model.board, tradeoff: card } }, commands }
  },

  PreviewComputed: ({ nodeId, option, preview }) => {
    const card = model.board.tradeoff
    const same =
      card?.nodeId === nodeId && card.option.kind === option.kind && card.option.id === option.id
    return same
      ? { model: { ...model, board: { ...model.board, tradeoff: { ...card, preview } } } }
      : { model }
  },

  BottleneckFound: ({ bottleneck, at }) => {
    if (at !== model.board.bottleneckAt || bottleneck === model.board.bottleneck) return { model }
    const next: Model = { ...model, board: { ...model.board, bottleneck } }
    return { model: next }
  },

  OptionLeft: () =>
    model.board.tradeoff && !model.board.tradeoff.pinned
      ? { model: { ...model, board: { ...model.board, tradeoff: null } } }
      : { model },

  OptionChosen: ({ nodeId, option }) => {
    // Once an option set is confirmed, its options apply on click; the card stays one line.
    if (model.prefs.seenTradeoffs.includes(option.kind)) {
      const hovered = model.board.tradeoff
      const same =
        hovered?.nodeId === nodeId &&
        hovered.option.kind === option.kind &&
        hovered.option.id === option.id
      return applyOption(
        model,
        {
          nodeId,
          option,
          pinned: true,
          preview: same ? hovered.preview : null,
          refusal: same ? hovered.refusal : null,
        },
        route,
      )
    }
    const [card, commands] = tradeoffOf(model, nodeId, option, true)
    return { model: { ...model, board: { ...model.board, tradeoff: card } }, commands }
  },

  OptionConfirmed: () =>
    model.board.tradeoff?.pinned ? applyOption(model, model.board.tradeoff, route) : { model },

  TradeoffClosed: () => ({ model: { ...model, board: { ...model.board, tradeoff: null } } }),
})
