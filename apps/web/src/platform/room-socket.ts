import { Option, Schema } from 'effect'
import { ROOM_SOCKET_PATH } from '@quorum/rpc'
import { ROOM_NAME_LENGTH, randomName } from '../game/names.ts'
import { ClientMessage, ServerMessage, type ClientMessage as Client } from '@quorum/simulation/room'

/* ==========================================================================
   One socket per tab. The Subscription opens it while the Model says a Room is
   open; update handlers send through it. A dropped socket reconnects with
   backoff and the Room answers with a snapshot.
   ========================================================================== */

export type RoomConfig = Readonly<{
  code: string
  seat: string
  name: string
  token?: string
}>

export type RoomStatus = 'open' | 'closed' | 'error'

const encode = Schema.encodeSync(ClientMessage)
const decode = Schema.decodeUnknownOption(ServerMessage)

let socket: WebSocket | null = null
let config: RoomConfig | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let attempt = 0
let stopped = true

const messages = new Set<(message: ServerMessage) => void>()
const statuses = new Set<(status: RoomStatus) => void>()

const announce = (status: RoomStatus) => {
  for (const listener of statuses) listener(status)
}

const urlOf = (code: string): string => {
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}${ROOM_SOCKET_PATH}?code=${encodeURIComponent(code)}`
}

const helloOf = (current: RoomConfig): Client => ({
  _tag: 'Hello',
  seat: current.seat,
  name: current.name,
  ...(current.token === undefined ? {} : { token: current.token }),
})

const open = (): void => {
  const current = config
  if (!current) return
  const next = new WebSocket(urlOf(current.code))
  socket = next
  next.addEventListener('open', () => {
    attempt = 0
    next.send(JSON.stringify(encode(helloOf(current))))
    announce('open')
  })
  next.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return
    let body: unknown
    try {
      body = JSON.parse(event.data)
    } catch {
      return
    }
    const decoded = decode(body)
    if (Option.isNone(decoded)) return
    for (const listener of messages) listener(decoded.value)
  })
  next.addEventListener('close', () => {
    if (socket === next) socket = null
    announce('closed')
    if (stopped || config === null) return
    attempt += 1
    const wait = Math.min(10_000, 500 * 2 ** Math.min(attempt, 5))
    timer = setTimeout(() => {
      timer = null
      if (!stopped) open()
    }, wait)
  })
  next.addEventListener('error', () => announce('error'))
}

/** Opens the socket for this tab, or leaves the open one alone. */
export const connect = (next: RoomConfig): void => {
  const same =
    config !== null &&
    socket !== null &&
    config.code === next.code &&
    config.seat === next.seat &&
    config.name === next.name &&
    config.token === next.token
  config = next
  if (same) return
  stopped = false
  if (timer !== null) clearTimeout(timer)
  timer = null
  socket?.close(1000, 'Reconnecting')
  socket = null
  attempt = 0
  open()
}

export const stop = (): void => {
  stopped = true
  config = null
  if (timer !== null) clearTimeout(timer)
  timer = null
  socket?.close(1000, 'Left')
  socket = null
}

export const send = (message: Client): void => {
  if (socket === null || socket.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify(encode(message)))
}

export const onMessage = (listener: (message: ServerMessage) => void): (() => void) => {
  messages.add(listener)
  return () => messages.delete(listener)
}

export const onStatus = (listener: (status: RoomStatus) => void): (() => void) => {
  statuses.add(listener)
  return () => statuses.delete(listener)
}

const SEAT_KEY = 'quorum.room.seat'
const NAME_KEY = 'quorum.room.name'

/** The Seat this tab takes. A reload keeps it, a new tab gets its own. */
export const seatOf = (): string => {
  const stored = window.sessionStorage.getItem(SEAT_KEY)
  if (stored !== null && stored !== '') return stored
  const seat = crypto.randomUUID()
  window.sessionStorage.setItem(SEAT_KEY, seat)
  return seat
}

/** The browser's storage, or none while the app is under test. */
const names = (): Storage | null => (typeof window === 'undefined' ? null : window.localStorage)

/** What the other Seats see. The first visit picks a name, and the player may change it. */
export const nameOf = (): string => {
  const store = names()
  const stored = store?.getItem(NAME_KEY) ?? null
  if (stored !== null && stored.trim() !== '') return stored
  const name = randomName()
  store?.setItem(NAME_KEY, name)
  return name
}

export const setRoomName = (name: string): void => {
  names()?.setItem(NAME_KEY, name.trim().slice(0, ROOM_NAME_LENGTH))
}
