import { PreviewFigures, TradeoffOption } from '../model.ts'
import { Schema } from 'effect'

/** The tradeoff Messages, as cases for the root union. */
export const tradeoffCases = {
  OptionPreviewed: { nodeId: Schema.String, option: TradeoffOption },
  PreviewComputed: { nodeId: Schema.String, option: TradeoffOption, preview: PreviewFigures },
  /** The compute worker searched the Bottleneck for the sim second `at`. */
  BottleneckFound: { bottleneck: Schema.NullOr(Schema.String), at: Schema.Finite },
  OptionLeft: {},
  OptionChosen: { nodeId: Schema.String, option: TradeoffOption },
  OptionConfirmed: {},
  /** The compute worker ran an option's ghost runs. */
  TradeoffClosed: {},
}
