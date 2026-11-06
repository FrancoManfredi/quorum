import { BuildGroupKey } from '../model.ts'
import { ComponentId } from '@quorum/simulation/state'
import { Schema } from 'effect'

/** The canvas Messages, as cases for the root union. */
export const canvasCases = {
  BuildGroupChosen: { group: BuildGroupKey },
  PlacingChosen: { type: Schema.NullOr(ComponentId) },
  NodePlaced: { x: Schema.Finite, y: Schema.Finite },
  NodeSampleChosen: { nodeId: Schema.String, time: Schema.NullOr(Schema.Finite) },
  NodeTapped: { nodeId: Schema.String },
  /** Reveals a Node from a route row or a mail action: switch region, select, center. */
  ServiceAssigned: { nodeId: Schema.String, serviceId: Schema.String },
  /** Inspect a recorded component sample, or return to live traffic. */
  RevealNode: { nodeId: Schema.String },
  /** Moves an App Server or Worker to another Service. */
  NodeToggled: { nodeId: Schema.String },
  SelectionBoxed: {
    ids: Schema.Array(Schema.String),
    /** Plain shift-drag replaces the selection; with Ctrl it adds, with Alt it takes away. */
    mode: Schema.Literals(['replace', 'add', 'subtract']),
  },
  SelectionAll: {},
  NodesCopied: {},
  NodesCut: {},
  /** The copied Nodes follow the pointer until a click places them. */
  NodesPasted: {},
  /** Asks to sell the selection; nothing is sold until it is confirmed. */
  NodesDuplicated: {},
  /** Draws a box around the selected Nodes, or takes the box off if they already sit in one. */
  NodesBoxed: {},
  /** Moves the selected Nodes by a few board units. */
  NodesNudged: { dx: Schema.Finite, dy: Schema.Finite },
  /** The button at the bottom of a Node card. */
  SellAsked: {},
  SellConfirmed: {},
  SellDismissed: {},
  /** Places a copy of the selected Nodes just beside them. */
  SelectionCleared: {},
  /** Select every Node on the Board that can be sold. */
  NodeMoved: { nodeId: Schema.String, x: Schema.Finite, y: Schema.Finite },
  LinkRequested: { from: Schema.String, to: Schema.String },
  LinkCut: { from: Schema.String, to: Schema.String },
  EmptyTapped: {},
  FooterPressed: { nodeId: Schema.String },
  UndoChosen: {},
  RedoChosen: {},
}
