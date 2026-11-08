import { AGENT_ROOM_PATH } from '@quorum/rpc'
import type { Ack } from '@quorum/agent/snapshot'
import { newWriteKey, roomIdOf } from '@quorum/agent/room-id'
import { uploadOf, type SyncState } from '@quorum/agent/sync'
import { snapshotOfModel } from './agent-tools.ts'
import { playingId, type Model } from './model.ts'

/* ==========================================================================
   The browser's side of the agent Room. While Agent access is on, it sends the
   snapshot to the API every few seconds, and only the parts the server does
   not have. The write key never leaves this browser; the room id is the hash
   the player hands to an agent.
   ========================================================================== */

const STORAGE_KEY = 'quorum.agent.rooms'
const INTERVAL_MS = 5_000

type RoomRecord = Readonly<{ writeKey: string; roomId: string; epoch: string }>

let memory: Record<string, RoomRecord> = {}
const pending = new Map<string, Promise<RoomRecord>>()
let wanted = false
let timer: ReturnType<typeof setInterval> | undefined
let latest: Model | null = null
let active: Readonly<{ companyId: string; room: RoomRecord }> | null = null
let sync: SyncState | null = null
let busy = false

const readRooms = (): Record<string, RoomRecord> => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return memory
    const parsed: unknown = JSON.parse(stored)
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, RoomRecord>)
      : memory
  } catch {
    return memory
  }
}

const writeRooms = (rooms: Record<string, RoomRecord>): void => {
  memory = rooms
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  } catch {
    // Blocked storage keeps the Room for this page only.
  }
}

/** The id shown in Settings, or null before this Company has one. */
export const agentRoomId = (companyId: string): string | null =>
  readRooms()[companyId]?.roomId ?? null

/** Finds or makes the Room for this Company. A new Company gets a new key and id. */
const ensureRoom = (companyId: string): Promise<RoomRecord> => {
  const existing = readRooms()[companyId]
  if (existing) return Promise.resolve(existing)
  const waiting = pending.get(companyId)
  if (waiting) return waiting
  const made = (async () => {
    const writeKey = newWriteKey()
    const record: RoomRecord = {
      writeKey,
      roomId: await roomIdOf(writeKey),
      epoch: crypto.randomUUID(),
    }
    const rooms = readRooms()
    if (rooms[companyId] === undefined) {
      rooms[companyId] = record
      writeRooms(rooms)
    }
    return rooms[companyId] ?? record
  })().finally(() => pending.delete(companyId))
  pending.set(companyId, made)
  return made
}

const send = async (): Promise<void> => {
  if (!wanted || busy || latest === null) return
  const companyId = playingId(latest)
  if (companyId === null) return
  const room = await ensureRoom(companyId)
  if (active?.room.roomId !== room.roomId) {
    active = { companyId, room }
    sync = { epoch: room.epoch, rev: 0, acked: null, headJson: null }
  }
  if (sync === null) return

  const upload = uploadOf(snapshotOfModel(latest), sync)
  if (upload === null) return

  busy = true
  try {
    const response = await fetch(AGENT_ROOM_PATH, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${room.writeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upload),
    })
    if (!response.ok) return
    if (!wanted) {
      // The player turned access off while this upload was in flight.
      await fetch(AGENT_ROOM_PATH, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${room.writeKey}` },
      })
      return
    }
    const ack = (await response.json()) as Ack
    sync = { epoch: ack.epoch, rev: ack.rev, acked: ack, headJson: JSON.stringify(upload.head) }
  } catch {
    // The next tick retries the same revision, so the server ignores a duplicate.
  } finally {
    busy = false
  }
}

const clearAll = async (): Promise<void> => {
  active = null
  sync = null
  const rooms = Object.values(readRooms())
  await Promise.allSettled(
    rooms.map((room) =>
      fetch(AGENT_ROOM_PATH, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${room.writeKey}` },
      }),
    ),
  )
}

/** The update loop hands every Model to this, so the timer always sends the newest one. */
export const syncAgent = (model: Model): void => {
  latest = model
  const companyId = playingId(model)
  if (companyId !== null && agentRoomId(companyId) === null) void ensureRoom(companyId)
}

/** Turns the upload on or off. Called whenever settings apply. */
export const setAgentAccess = (on: boolean): void => {
  if (on === wanted) return
  wanted = on
  if (on) {
    timer ??= setInterval(() => void send(), INTERVAL_MS)
    void send()
  } else {
    if (timer !== undefined) clearInterval(timer)
    timer = undefined
    void clearAll()
  }
}
