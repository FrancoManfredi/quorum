import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as roomSocket from './room-socket.ts'

/* ==========================================================================
   A tab holds one socket. A rename or a token arms a new one, and the socket it
   replaces must stay quiet, or both retry and the Room closes the older Seat
   with `4000 Seat moved` until the tab flaps forever.
   ========================================================================== */

type Listener = (event: unknown) => void

class FakeSocket {
  static all: Array<FakeSocket> = []
  readonly listeners = new Map<string, Array<Listener>>()
  readyState = 0
  readonly sent: Array<string> = []
  closedWith: { code: number; reason: string } | null = null

  constructor(readonly url: string) {
    FakeSocket.all.push(this)
  }

  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(code = 1000, reason = ''): void {
    if (this.readyState === 3) return
    this.readyState = 3
    this.closedWith = { code, reason }
    this.fire('close', { code, reason })
  }

  open(): void {
    this.readyState = 1
    this.fire('open', {})
  }

  drop(): void {
    this.close(1006, '')
  }

  get hellos(): ReadonlyArray<{ name: string; token?: string }> {
    return this.sent
      .map((frame) => JSON.parse(frame) as { _tag: string; name?: string; token?: string })
      .filter((frame) => frame._tag === 'Hello')
      .map((frame) => ({
        name: frame.name ?? '',
        ...(frame.token === undefined ? {} : { token: frame.token }),
      }))
  }

  private fire(type: string, event: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) listener(event)
  }
}

const load = async () => roomSocket

beforeEach(() => {
  // Reuse one module instance: a fresh dynamic import under load can exceed the test timeout,
  // and a timed-out first test leaves a retry behind for the next one.
  roomSocket.stop()
  FakeSocket.all = []
  vi.useFakeTimers()
  vi.stubGlobal('window', { location: { protocol: 'http:', host: 'room.test' } })
  vi.stubGlobal('WebSocket', FakeSocket)
  Object.assign(FakeSocket.prototype, {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('the Room socket', () => {
  test('a replaced socket does not retry, so the tab keeps one Seat', async () => {
    const { connect } = await load()
    connect({ code: 'ABC234', seat: 'seat-1', name: 'First' })
    const [first] = FakeSocket.all
    first?.open()
    expect(first?.hellos).toEqual([{ name: 'First' }])

    connect({ code: 'ABC234', seat: 'seat-1', name: 'Second' })
    expect(first?.closedWith?.code).toBe(1000)
    expect(FakeSocket.all).toHaveLength(2)
    const second = FakeSocket.all[1]
    second?.open()
    expect(second?.hellos).toEqual([{ name: 'Second' }])

    vi.advanceTimersByTime(2_000)
    expect(FakeSocket.all).toHaveLength(2)
  })

  test('a socket that drops asks for one replacement', async () => {
    const { connect } = await load()
    connect({ code: 'ABC234', seat: 'seat-1', name: 'First' })
    FakeSocket.all[0]?.open()
    FakeSocket.all[0]?.drop()
    // The first retry waits a second, then doubles.
    vi.advanceTimersByTime(1_200)
    expect(FakeSocket.all).toHaveLength(2)
    FakeSocket.all[1]?.open()
    expect(FakeSocket.all[1]?.hellos).toEqual([{ name: 'First' }])
  })

  test('a Hello carries the owner token once the Room arms it', async () => {
    const { connect } = await load()
    connect({ code: 'ABC234', seat: 'seat-1', name: 'Owner', token: 'secret' })
    FakeSocket.all[0]?.open()
    expect(FakeSocket.all[0]?.hellos).toEqual([{ name: 'Owner', token: 'secret' }])
  })
})
