import * as Sentry from '@sentry/cloudflare'
import { DurableObject } from 'cloudflare:workers'
import { Option, Result, Schema } from 'effect'
import { ClientMessage, ROOM_SPEEDS, ServerMessage } from '@quorum/simulation/room'
import type { Region } from '@quorum/simulation/state'
import type { PublishInput, RoomStub } from '../contexts/room/directory.ts'
import {
  advance,
  apply,
  ballot,
  expired,
  finalOf,
  join,
  kick,
  leave,
  openRoom,
  setSpeed,
  snapshotOf,
  startVote,
  ALARM_MS,
  type RoomState,
} from '../contexts/room/room.ts'

/* ==========================================================================
   The Room Durable Object: storage, the alarm that steps the Company, and the
   sockets. The rules live in contexts/room, so this file only knows the host.
   ========================================================================== */

export type RoomEnv = Readonly<{ SENTRY_DSN?: string }>

type Attachment = Readonly<{ seat: string; sampleAt: number }>

const NO_SEAT: Attachment = { seat: '', sampleAt: 0 }

const encode = Schema.encodeSync(ServerMessage)
const decode = Schema.decodeUnknownOption(ClientMessage)

const textOf = (raw: string | ArrayBuffer): string | null => {
  if (typeof raw === 'string') return raw
  try {
    return new TextDecoder().decode(raw)
  } catch {
    return null
  }
}

class RoomObjectBase extends DurableObject<RoomEnv> implements RoomStub {
  private state: RoomState | null = null
  private savedAt = 0

  constructor(ctx: DurableObjectState, env: RoomEnv) {
    super(ctx, env)
    // Storage is async and the constructor is not, so the runtime waits here.
    ctx.blockConcurrencyWhile(async () => {
      this.state = (await ctx.storage.get<RoomState>('room')) ?? null
    })
  }

  /* ---------- The methods the API Worker calls ---------- */

  async publish(input: PublishInput): Promise<void> {
    const { token, ...rest } = input
    this.state = openRoom({ ...rest, token })
    await this.save()
  }

  async info(): Promise<Readonly<{ exists: boolean; seats: number }>> {
    if (this.state === null) return { exists: false, seats: 0 }
    if (expired(this.state, Date.now())) {
      await this.clear()
      return { exists: false, seats: 0 }
    }
    return { exists: true, seats: this.state.seats.length }
  }

  /* ---------- Sockets ---------- */

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket')
      return new Response('Expected a WebSocket', { status: 426 })
    if (this.state === null) return new Response('No such Room', { status: 404 })

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket]
    // `acceptWebSocket` rather than `accept`, so the object can hibernate.
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment(NO_SEAT)
    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const text = textOf(raw)
    if (text === null) return
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return
    }
    const decoded = decode(body)
    if (Option.isNone(decoded)) return
    const message = decoded.value

    await ClientMessage.match(message, {
      Hello: (frame) => this.hello(ws, frame.seat, frame.name, frame.token),
      Intents: (frame) => this.intents(ws, frame.id, frame.intents),
      Ballot: (frame) => this.ballot(ws, frame.vote, frame.yes),
      StartVote: (frame) => this.startVote(ws, frame.kind),
      Cursor: (frame) => Promise.resolve(this.cursor(ws, frame.x, frame.y, frame.region)),
      HideCursor: () => Promise.resolve(this.hideCursor(ws)),
      Speed: (frame) => this.speed(ws, frame.value),
      Kick: (frame) => this.kick(ws, frame.seat),
      TakeOffline: () => this.takeOffline(ws),
      Resync: () => Promise.resolve(this.resync(ws)),
      Ping: () => Promise.resolve(),
    })
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    await this.part(ws)
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.part(ws)
  }

  /* ---------- The clock ---------- */

  async alarm(): Promise<void> {
    if (this.state === null) return
    this.advanceNow()
    const state = this.state
    if (!state.open || state.ended !== null || state.seats.length === 0) {
      await this.save()
      await this.ctx.storage.deleteAlarm()
      return
    }
    this.broadcast()
    if (Date.now() - this.savedAt > 4_000) await this.save()
    await this.ctx.storage.setAlarm(Date.now() + ALARM_MS)
  }

  /* ---------- Each message ---------- */

  private async hello(
    ws: WebSocket,
    id: string,
    name: string,
    token: string | undefined,
  ): Promise<void> {
    const current = this.state
    if (current === null) return this.end(ws, 'removed')
    const entering = token === undefined ? { id, name } : { id, name, token }
    const joined = join(current, entering, Date.now())
    if (Result.isFailure(joined)) {
      this.end(ws, joined.failure === 'stale' ? 'stale' : 'removed')
      return
    }
    const next = joined.success
    this.state = next.state
    const seat = next.seat
    // A reload takes its own Seat back from the socket that held it.
    for (const other of this.ctx.getWebSockets()) {
      if (other === ws) continue
      if (this.seatOf(other) === seat.id) other.close(4000, 'Seat moved')
    }
    ws.serializeAttachment({ seat: seat.id, sampleAt: 0 } satisfies Attachment)
    await this.save()
    this.send(ws, {
      _tag: 'Welcome',
      revision: next.state.revision,
      simVersion: next.state.simVersion,
      seat: seat.id,
      game: next.state.game,
      samples: next.state.samples,
      seats: next.state.seats,
      owner: next.state.ownerSeat,
      speed: next.state.speed,
      vote: next.state.vote,
    })
    ws.serializeAttachment({
      seat: seat.id,
      sampleAt: next.state.samples.length,
    } satisfies Attachment)
    this.seats()
    await this.schedule()
  }

  private async intents(
    ws: WebSocket,
    id: number,
    intents: ReadonlyArray<Parameters<typeof apply>[1][number]>,
  ): Promise<void> {
    if (this.state === null) return this.end(ws, 'removed')
    const seat = this.seatOf(ws)
    if (seat === '') return
    if (this.state.ended !== null) {
      this.send(ws, {
        _tag: 'Refused',
        id,
        refusal: { _tag: 'NotAllowed', reason: 'The session has ended.' },
      })
      return
    }
    this.advanceNow()
    const current = this.state
    if (current === null) return
    const applied = apply(current, intents)
    if (Result.isFailure(applied)) {
      this.send(ws, { _tag: 'Refused', id, refusal: applied.failure })
      return
    }
    this.state = applied.success
    await this.save()
    this.broadcast()
    await this.schedule()
  }

  private async ballot(ws: WebSocket, vote: number, yes: boolean): Promise<void> {
    if (this.state === null) return this.end(ws, 'removed')
    const seat = this.seatOf(ws)
    if (seat === '' || this.state.vote === null || this.state.vote.id !== vote) return
    this.advanceNow()
    const current = this.state
    if (current === null) return
    const outcome = ballot(current, seat, yes)
    this.state = outcome.state
    await this.save()
    this.broadcast()
    if (outcome.passed === 'exit') {
      await this.ctx.storage.deleteAlarm()
      this.handOver()
    }
  }

  private async startVote(ws: WebSocket, kind: 'fund' | 'exit'): Promise<void> {
    if (this.state === null) return this.end(ws, 'removed')
    const started = startVote(this.state, this.seatOf(ws), kind)
    if (Result.isFailure(started)) {
      const reason =
        started.failure === 'vote-open' ? 'A vote is already open.' : 'You cannot start that vote.'
      this.send(ws, { _tag: 'Refused', id: 0, refusal: { _tag: 'NotAllowed', reason } })
      return
    }
    this.state = started.success
    await this.save()
    this.broadcast()
  }

  /**
   * Presence only. The Room stamps the Seat from the socket, not from the
   * frame, so one Seat cannot move another's cursor, and it relays the frame
   * without saving it or waiting for the next snapshot.
   */
  private cursor(ws: WebSocket, x: number, y: number, region: Region): void {
    const current = this.state
    if (current === null) return
    const seat = current.seats.find((entry) => entry.id === this.seatOf(ws))
    if (seat === undefined) return
    this.everyone(
      {
        _tag: 'Cursor',
        seat: seat.id,
        name: seat.name,
        colour: seat.colour,
        x,
        y,
        region,
      },
      ws,
    )
  }

  private hideCursor(ws: WebSocket): void {
    const seat = this.seatOf(ws)
    if (seat === '') return
    this.everyone({ _tag: 'CursorGone', seat }, ws)
  }

  private async speed(ws: WebSocket, value: number): Promise<void> {
    if (this.state === null || this.seatOf(ws) !== this.state.ownerSeat) return
    if (!(ROOM_SPEEDS as ReadonlyArray<number>).includes(value)) return
    this.advanceNow()
    const current = this.state
    if (current === null) return
    this.state = setSpeed(current, value)
    await this.save()
    this.broadcast()
  }

  private async kick(ws: WebSocket, seat: string): Promise<void> {
    if (this.state === null || this.seatOf(ws) !== this.state.ownerSeat) return
    this.state = kick(this.state, seat, Date.now())
    this.everyone({ _tag: 'CursorGone', seat })
    for (const other of this.ctx.getWebSockets()) {
      if (this.seatOf(other) !== seat) continue
      this.end(other, 'removed')
    }
    await this.save()
    this.broadcast()
  }

  /**
   * The Seats voted to end the session. The owner takes the Company as it is
   * now, and the guests are told the Room is over.
   */
  private async handOver(): Promise<void> {
    const current = this.state
    if (current === null) return
    const final = finalOf(current)
    for (const other of this.ctx.getWebSockets())
      if (this.seatOf(other) === current.ownerSeat)
        this.send(other, {
          _tag: 'Final',
          revision: current.revision,
          game: final.game,
          samples: final.samples,
        })
    for (const other of this.ctx.getWebSockets())
      if (this.seatOf(other) !== current.ownerSeat) this.end(other, 'handover')
    await this.clear()
  }

  private async takeOffline(ws: WebSocket): Promise<void> {
    const current = this.state
    if (current === null) return
    if (this.seatOf(ws) !== current.ownerSeat) return
    const final = finalOf(current)
    this.send(ws, {
      _tag: 'Final',
      revision: current.revision,
      game: final.game,
      samples: final.samples,
    })
    this.everyone({ _tag: 'Ended', reason: 'offline' }, ws)
    for (const other of this.ctx.getWebSockets()) other.close(1000, 'Company offline')
    await this.clear()
  }

  private resync(ws: WebSocket): void {
    const current = this.state
    if (current === null) return
    this.send(ws, {
      _tag: 'Snapshot',
      revision: current.revision,
      time: current.game.time,
      game: current.game,
      samples: current.samples,
      seats: current.seats,
      owner: current.ownerSeat,
      speed: current.speed,
      vote: current.vote,
    })
    ws.serializeAttachment({
      seat: this.seatOf(ws),
      sampleAt: current.samples.length,
    } satisfies Attachment)
  }

  private async part(ws: WebSocket): Promise<void> {
    if (this.state === null) return
    const seat = this.seatOf(ws)
    if (seat === '') return
    ws.serializeAttachment(NO_SEAT)
    this.state = leave(this.state, seat, Date.now())
    await this.save()
    this.everyone({ _tag: 'CursorGone', seat }, ws)
    this.seats()
    this.broadcast()
    await this.schedule()
  }

  /* ---------- Plumbing ---------- */

  private seatOf(ws: WebSocket): string {
    const attachment = ws.deserializeAttachment() as Attachment | null
    return attachment?.seat ?? ''
  }

  private advanceNow(): void {
    if (this.state === null) return
    this.state = advance(this.state, Date.now()).state
  }

  private send(ws: WebSocket, message: ServerMessage): void {
    try {
      ws.send(JSON.stringify(encode(message)))
    } catch {
      ws.close(1011, 'Send failed')
    }
  }

  private end(
    ws: WebSocket,
    reason: 'offline' | 'handover' | 'expired' | 'stale' | 'removed',
  ): void {
    this.send(ws, { _tag: 'Ended', reason })
    try {
      ws.close(1000, reason)
    } catch {
      // Already closed.
    }
  }

  private everyone(message: ServerMessage, except?: WebSocket): void {
    for (const ws of this.ctx.getWebSockets()) if (ws !== except) this.send(ws, message)
  }

  private seats(): void {
    const current = this.state
    if (current === null) return
    this.everyone({
      _tag: 'Seats',
      seats: current.seats,
      owner: current.ownerSeat,
      speed: current.speed,
      vote: current.vote,
    })
  }

  /** One snapshot per Seat, carrying the samples that Seat has not seen. */
  private broadcast(): void {
    const current = this.state
    if (current === null) return
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = (ws.deserializeAttachment() as Attachment | null) ?? NO_SEAT
      if (attachment.seat === '') continue
      const snapshot = snapshotOf(current, attachment.sampleAt)
      this.send(ws, { _tag: 'Snapshot', ...snapshot })
      ws.serializeAttachment({
        seat: attachment.seat,
        sampleAt: current.samples.length,
      } satisfies Attachment)
    }
  }

  private async schedule(): Promise<void> {
    const state = this.state
    if (state !== null && state.open && state.ended === null && state.seats.length > 0) {
      await this.ctx.storage.setAlarm(Date.now() + ALARM_MS)
      return
    }
    await this.ctx.storage.deleteAlarm()
  }

  private async save(): Promise<void> {
    if (this.state === null) return
    await this.ctx.storage.put('room', this.state)
    this.savedAt = Date.now()
  }

  private async clear(): Promise<void> {
    await this.ctx.storage.deleteAlarm()
    await this.ctx.storage.deleteAll()
    this.state = null
  }
}

/** The instance type a namespace stub carries. */
export type RoomInstance = RoomObjectBase

/** Errors and traces for the Room, with the same DSN the Workers use. */
export const RoomObject = Sentry.instrumentDurableObjectWithSentry(
  (env: RoomEnv) => ({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    initialScope: { tags: { service: 'room-object' } },
  }),
  RoomObjectBase,
)
