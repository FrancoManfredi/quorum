import { Schema } from 'effect'
import { ServerMessage } from '@quorum/simulation/room'

/** The Room Messages, as cases for the root union. */
export const roomCases = {
  /** One frame from the socket, decoded. */
  RoomReceived: { message: ServerMessage },
  RoomStatusChanged: { status: Schema.Literals(['open', 'closed', 'error']) },
  /** The player asks to take the current Company online. */
  RoomPublishAsked: {},
  RoomPublished: { code: Schema.String, token: Schema.String },
  RoomPublishFailed: { message: Schema.String },
  RoomTakeOfflineAsked: {},
  RoomLeaveAsked: {},
  RoomVoteAsked: { kind: Schema.Literals(['fund', 'exit']) },
  RoomBallot: { vote: Schema.Finite, yes: Schema.Boolean },
  RoomSpeedChosen: { value: Schema.Finite },
  RoomKickAsked: { seat: Schema.String },
  RoomSent: {},
  /** The Room a link named does not exist, or it has ended. */
  RoomChecked: { code: Schema.String, exists: Schema.Boolean },
  /** The name field, while the player types. */
  RoomNameChanged: { name: Schema.String },
  /** The player keeps the name they typed. */
  RoomNameSaved: {},
  /** Copies this Room's link. */
  RoomLinkCopied: {},
}
