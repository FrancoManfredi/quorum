import { AppRoute } from '../route.ts'
import { record } from '../history.ts'
import {
  currentFile,
  hasCompany,
  ledgerOf,
  onlineFileOf,
  roomCode,
  roomLive,
  roomOwner,
  type Model,
  type Room,
} from '../model.ts'
import { RoomPhase, roomStep } from '../room-machine.ts'
import { afterRound } from './session.ts'
import { withFile } from '../saves.ts'
import { CopyText, WriteCompany, PublishRoom, SendRoom } from '../commands.ts'
import { ROOM_NAME_LENGTH } from '../names.ts'
import { setRoomName } from '../../platform/room-socket.ts'
import { refusalIn } from '../../i18n/refusal.ts'
import { ROOM_SAMPLES, ServerMessage } from '@quorum/simulation/room'
import type { ClientMessage } from '@quorum/simulation/room'
import type { Sample } from '@quorum/simulation/state'
import type { RoomEnd } from '../room-machine.ts'
import {
  milestones,
  say,
  savePayloadOf,
  withToast,
  type MessageCases,
  type UpdateResult,
} from './shared.ts'

/* ==========================================================================
   The Room this tab is in. The server owns the Game; this file paints the
   snapshots, sends what the player asks for, and writes the Company back when
   the owner takes it offline.
   ========================================================================== */

type RoomTag =
  | 'RoomReceived'
  | 'RoomStatusChanged'
  | 'RoomPublishAsked'
  | 'RoomPublished'
  | 'RoomPublishFailed'
  | 'RoomTakeOfflineAsked'
  | 'RoomLeaveAsked'
  | 'RoomVoteAsked'
  | 'RoomBallot'
  | 'RoomSpeedChosen'
  | 'RoomKickAsked'
  | 'RoomSent'
  | 'RoomChecked'
  | 'RoomNameChanged'
  | 'RoomNameSaved'
  | 'RoomLinkCopied'

/** The Room's server state, cleared: the name this tab sends stays. */
const emptyRoom = (model: Model, phase: Room['phase']): Room => ({
  ...model.room,
  phase,
  seats: [],
  speed: 1,
  vote: null,
  seq: 1,
})

/** An answered funding round closes the offer it came from, as it does offline. */
const panelAfter = (panel: Model['panel'], game: Model['board']['game']): Model['panel'] =>
  panel === 'offer' && game.round._tag !== 'Offered' ? afterRound(game) : panel

/**
 * Paints one Room frame onto the Board. `whole` says how much of the Room's sample window the
 * frame carries: a Welcome every Sample the Room keeps, a Snapshot only the ones this Seat has
 * not seen. The Game keeps them exactly as an offline Game does, because the Dashboard's short
 * ranges read the Game's own history.
 */
const painted = (
  model: Model,
  frame: Readonly<{
    game: Model['board']['game']
    seats: Room['seats']
    speed: number
    vote: Room['vote']
    samples: ReadonlyArray<Sample>
    time: number
  }>,
  whole: boolean,
): Model => {
  const history = record(model.board.dashboard.history, frame.samples, frame.time)
  const samples = (whole ? frame.samples : [...model.board.game.history, ...frame.samples]).slice(
    -ROOM_SAMPLES,
  )
  return {
    ...model,
    panel: panelAfter(model.panel, frame.game),
    board: {
      ...model.board,
      game: { ...frame.game, history: [...samples] },
      clock: { ...model.board.clock, speed: frame.speed, mode: { _tag: 'Running' } },
      bottleneckAt: -1,
      dashboard: { ...model.board.dashboard, history },
    },
    room: {
      ...model.room,
      seats: frame.seats,
      speed: frame.speed,
      vote: frame.vote,
    },
  }
}

const send = (model: Model, message: ClientMessage): UpdateResult => ({
  model,
  commands: [SendRoom({ message })],
})

const received = (model: Model, message: ServerMessage): UpdateResult =>
  ServerMessage.match(message, {
    Welcome: (frame) => {
      // The first join shows the Board; a reconnect (a rename, a dropped socket)
      // leaves the panel the player has open alone.
      const first = RoomPhase.guards.Connecting(model.room.phase)
      const shown = painted(
        model,
        {
          game: frame.game,
          seats: frame.seats,
          speed: frame.speed,
          vote: frame.vote,
          samples: frame.samples,
          time: frame.game.time,
        },
        true,
      )
      const next: Model = {
        ...shown,
        panel: first ? 'none' : shown.panel,
        room: {
          ...model.room,
          phase: roomStep(model.room.phase, {
            _tag: 'Joined',
            seat: frame.seat,
            owner: frame.seat === frame.owner,
          }),
          seats: frame.seats,
          speed: frame.speed,
          vote: frame.vote,
        },
      }
      return roomOwner(next)
        ? milestones(model, { model: next }, [], ledgerOf(next))
        : { model: next, commands: [] }
    },
    Snapshot: (frame) => {
      const next = painted(
        model,
        {
          game: frame.game,
          seats: frame.seats,
          speed: frame.speed,
          vote: frame.vote,
          samples: frame.samples,
          time: frame.time,
        },
        false,
      )
      // Achievements belong to the owner's Founder; a guest earns none.
      return roomOwner(next)
        ? milestones(model, { model: next }, [], ledgerOf(next))
        : { model: next }
    },
    Seats: (frame) => ({
      model: {
        ...model,
        room: {
          ...model.room,
          seats: frame.seats,
          speed: frame.speed,
          vote: frame.vote,
        },
      },
    }),
    Joined: (frame) => withToast(model, say(model).room.joined(frame.seat.name), 'plain'),
    Refused: (frame) => withToast(model, refusalIn(say(model), frame.refusal), 'warn'),
    // Cursors are Presence. The socket hands them to the Board's overlay, so
    // they never reach the Model; these cases keep the union whole.
    Cursor: () => ({ model }),
    CursorGone: () => ({ model }),
    Final: (frame) => handover(model, frame.game),
    Ended: (frame) => {
      const next = roomStep(model.room.phase, { _tag: 'Ended', reason: frame.reason })
      // The Room is gone. The owner has been handed the Company (Final), and a
      // guest has nothing left to look at, so it goes back to the title.
      const route = AppRoute.guards.Room(model.route) ? AppRoute.Title() : model.route
      return withToast(
        { ...model, route, room: { ...model.room, phase: next, seats: [] }, panel: 'none' },
        say(model).room[reasonKeyOf(frame.reason)],
        'plain',
      )
    },
  })

const REASON_KEY: Record<
  RoomEnd,
  'endOffline' | 'endHandover' | 'endExpired' | 'endStale' | 'endRemoved'
> = {
  offline: 'endOffline',
  handover: 'endHandover',
  expired: 'endExpired',
  stale: 'endStale',
  removed: 'endRemoved',
}

const reasonKeyOf = (reason: RoomEnd) => REASON_KEY[reason]

/** The owner brought the Company home: write it and leave the Room. */
const handover = (model: Model, game: Model['board']['game']): UpdateResult => {
  const code = roomCode(model)
  const file = code === null ? null : onlineFileOf(model, code)
  const board = { ...model.board, game }
  const online = file === null ? model.saves : withFile(model.saves, { ...file, online: null })
  const next: Model = {
    ...model,
    board,
    saves: online,
    room: { ...model.room, phase: roomStep(model.room.phase, { _tag: 'Left' }) },
    route: AppRoute.Company(),
    panel: 'none',
  }
  const commands =
    file === null
      ? []
      : [
          WriteCompany({
            id: file.id,
            index: withFile(next.saves, { ...file, online: null }),
            ...savePayloadOf(next, board),
          }),
        ]
  return { model: next, commands }
}

const published = (model: Model, code: string, token: string): UpdateResult => {
  const file = currentFile(model)
  if (file === null) return withToast(model, say(model).room.notAvailable, 'warn')
  const saves = withFile(model.saves, {
    ...file,
    online: { code, token, at: Date.now() },
  })
  const next: Model = {
    ...model,
    saves,
    route: AppRoute.Room({ room: code }),
    panel: 'room',
    room: emptyRoom(model, roomStep(model.room.phase, { _tag: 'Connecting', code })),
  }
  return {
    model: next,
    commands: [WriteCompany({ id: file.id, index: saves, ...savePayloadOf(next, next.board) })],
  }
}

export const roomHandlers = (model: Model): MessageCases<UpdateResult, RoomTag> => ({
  RoomReceived: ({ message }) => received(model, message),
  RoomStatusChanged: ({ status }) => {
    if (status === 'open') return { model }
    if (!RoomPhase.guards.Online(model.room.phase)) return { model }
    return {
      model: {
        ...model,
        room: { ...model.room, phase: roomStep(model.room.phase, { _tag: 'Dropped' }) },
      },
    }
  },
  RoomChecked: ({ code, exists }) => {
    if (exists || roomCode(model) !== code) return { model }
    const next = roomStep(model.room.phase, { _tag: 'Ended', reason: 'removed' })
    return withToast(
      {
        ...model,
        route: AppRoute.Title(),
        room: { ...model.room, phase: next, seats: [] },
        panel: 'none',
      },
      say(model).room.missing,
      'plain',
    )
  },
  RoomNameChanged: ({ name }) => ({
    model: {
      ...model,
      room: { ...model.room, draft: name.slice(0, ROOM_NAME_LENGTH) },
    },
  }),
  RoomNameSaved: () => {
    const name = model.room.draft.trim().slice(0, ROOM_NAME_LENGTH)
    if (name === '') return { model: { ...model, room: { ...model.room, draft: model.room.name } } }
    if (name === model.room.name) return { model }
    setRoomName(name)
    return { model: { ...model, room: { ...model.room, name, draft: name } } }
  },
  RoomLinkCopied: () => {
    const code = roomCode(model)
    if (code === null) return { model }
    return {
      model,
      commands: [
        CopyText({
          text: `${window.location.origin}/room/${code}`,
          done: say(model).room.linkCopied,
          blocked: say(model).toasts.clipboardBlocked,
        }),
      ],
    }
  },
  RoomPublishAsked: () => {
    const file = currentFile(model)
    if (file === null) return withToast(model, say(model).room.notAvailable, 'warn')
    if (file.online !== null)
      return {
        model: {
          ...model,
          route: AppRoute.Room({ room: file.online.code }),
          panel: 'room',
          room: emptyRoom(
            model,
            roomStep(model.room.phase, { _tag: 'Connecting', code: file.online.code }),
          ),
        },
      }
    return {
      model,
      commands: [
        PublishRoom({
          name: file.name,
          game: { ...model.board.game, history: [] },
          samples: model.board.game.history,
          wall: Date.now(),
        }),
      ],
    }
  },
  RoomPublished: ({ code, token }) => published(model, code, token),
  RoomPublishFailed: ({ message }) => withToast(model, message, 'warn'),
  RoomTakeOfflineAsked: () =>
    RoomPhase.guards.Online(model.room.phase) && model.room.phase.owner
      ? send(model, { _tag: 'TakeOffline' })
      : withToast(model, say(model).room.notAvailable, 'warn'),
  RoomLeaveAsked: () => {
    const next: Model = {
      ...model,
      room: { ...model.room, phase: roomStep(model.room.phase, { _tag: 'Left' }) },
      route: hasCompany(model) ? AppRoute.Company() : AppRoute.Title(),
      panel: 'none',
    }
    return withToast(next, say(model).room.left, 'plain')
  },
  RoomVoteAsked: ({ kind }) => send(model, { _tag: 'StartVote', kind }),
  RoomBallot: ({ vote, yes }) => send(model, { _tag: 'Ballot', vote, yes }),
  RoomSpeedChosen: ({ value }) => {
    const speed = value === 0.5 || value === 3 || value === 10 ? value : 1
    return RoomPhase.guards.Online(model.room.phase) && model.room.phase.owner
      ? send(model, { _tag: 'Speed', value: speed })
      : withToast(model, say(model).room.notAvailable, 'warn')
  },
  RoomKickAsked: ({ seat }) => send(model, { _tag: 'Kick', seat }),
  RoomSent: () => ({ model }),
})

/** The Room this tab is in steps the Company, so the tick does not. */
export const roomSteps = (model: Model): boolean =>
  roomLive(model) && !RoomPhase.guards.Connecting(model.room.phase)
