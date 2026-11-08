import { describe, expect, test } from 'vitest'
import type { Ack, Status, Upload } from '@quorum/agent/snapshot'
import { newWriteKey, roomIdOf } from '@quorum/agent/room-id'
import type { AgentRooms, AgentRoomStub } from '../contexts/agent/room.ts'
import { agentHttp } from './agent-http.ts'

const roomId = 'abcdefghijklmnopqrstuv'

const upload = (): Upload => ({
  v: 1,
  epoch: 'e1',
  rev: 1,
  reset: false,
  head: {
    game: null,
    mode: 'challenge',
    screen: { route: 'Board', panel: 'none', region: 'na', selectedNode: null },
    paused: false,
    speed: 1,
    bottleneck: null,
    whatIfs: null,
    inboxHash: 'a',
  },
  samples: { from: 0, to: 0, items: [] },
  nodes: { from: 0, items: {} },
  inbox: [],
})

const fakeRooms = (seen: Array<string>) => {
  const room: AgentRoomStub = {
    write: async (body: Upload, key: string): Promise<Ack> => {
      seen.push(`write:${key}:${body.epoch}`)
      return {
        epoch: body.epoch,
        rev: body.rev,
        sampleSeq: body.samples.to,
        nodeTime: 0,
        inboxHash: body.head.inboxHash,
        at: 1,
      }
    },
    clear: async (key: string) => {
      seen.push(`clear:${key}`)
    },
    read: async (name, input) => {
      seen.push(`read:${name}`)
      return JSON.stringify({ name, input })
    },
    status: async (): Promise<Status> => ({
      mode: 'company',
      updatedAt: 5,
      sampleSeq: 10,
      nodeTime: 10,
      samples: 2,
      nodes: 1,
      inbox: 0,
      epoch: 'e1',
      rev: 1,
    }),
  }
  const rooms: AgentRooms = {
    getByName: (id) => {
      seen.push(`room:${id}`)
      return room
    },
  }
  return rooms
}

const mcp = (body: unknown, headers: Record<string, string> = {}): Request =>
  new Request('http://api.test/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

describe('the public agent edge', () => {
  test('answers MCP requests without a key', async () => {
    const seen: Array<string> = []
    const rooms = fakeRooms(seen)

    const init = await agentHttp(
      mcp({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2025-11-25' },
      }),
      rooms,
    )
    expect(init.status).toBe(200)
    expect(
      ((await init.json()) as { result: { protocolVersion: string } }).result.protocolVersion,
    ).toBe('2025-11-25')

    const call = await agentHttp(
      mcp({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'get_company', arguments: { room: roomId } },
      }),
      rooms,
    )
    expect(seen).toContain(`room:${roomId}`)
    expect(seen).toContain('read:get_company')
    expect(call.status).toBe(200)
  })

  test('get_status reads the Room', async () => {
    const rooms = fakeRooms([])
    const response = await agentHttp(
      mcp({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'get_status', arguments: { room: roomId } },
      }),
      rooms,
    )
    const body = (await response.json()) as {
      result: { content: Array<{ text: string }> }
    }
    expect(JSON.parse(body.result.content[0]!.text)).toMatchObject({
      mode: 'company',
      updatedAt: 5,
    })
  })

  test('a notification is accepted with no body, and GET is refused', async () => {
    const response = await agentHttp(
      mcp({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      fakeRooms([]),
    )
    expect(response.status).toBe(202)

    const get = await agentHttp(new Request('http://api.test/mcp'), fakeRooms([]))
    expect(get.status).toBe(405)
  })

  test('a foreign Origin is refused, and an unknown protocol version is a 400', async () => {
    const foreign = await agentHttp(
      mcp({ jsonrpc: '2.0', id: 1, method: 'ping' }, { Origin: 'https://evil.example' }),
      fakeRooms([]),
    )
    expect(foreign.status).toBe(403)

    const version = await agentHttp(
      mcp({ jsonrpc: '2.0', id: 1, method: 'ping' }, { 'MCP-Protocol-Version': '2099-01-01' }),
      fakeRooms([]),
    )
    expect(version.status).toBe(400)
  })

  test('the browser writes only with the key that owns the Room', async () => {
    const seen: Array<string> = []
    const rooms = fakeRooms(seen)
    const key = newWriteKey()
    const id = await roomIdOf(key)

    const put = await agentHttp(
      new Request('http://api.test/api/agent/room', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(upload()),
      }),
      rooms,
    )
    expect(put.status).toBe(200)
    expect(seen).toContain(`room:${id}`)
    expect(seen).toContain(`write:${key}:e1`)

    const missing = await agentHttp(
      new Request('http://api.test/api/agent/room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upload()),
      }),
      rooms,
    )
    expect(missing.status).toBe(401)

    const drop = await agentHttp(
      new Request('http://api.test/api/agent/room', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${key}` },
      }),
      rooms,
    )
    expect(drop.status).toBe(204)
    expect(seen).toContain(`clear:${key}`)
  })

  test('a malformed upload is refused before the Room sees it', async () => {
    const seen: Array<string> = []
    const response = await agentHttp(
      new Request('http://api.test/api/agent/room', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${newWriteKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ v: 1, epoch: 'e', rev: 1 }),
      }),
      fakeRooms(seen),
    )
    expect(response.status).toBe(400)
    expect(seen.some((entry) => entry.startsWith('write:'))).toBe(false)
  })
})
