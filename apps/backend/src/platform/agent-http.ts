import { Option, Schema } from 'effect'
import { AGENT_ROOM_PATH, MCP_PATH } from '@quorum/rpc'
import { handleMcp, SUPPORTED } from '@quorum/agent/mcp'
import { isAllowedOrigin } from '@quorum/agent/origin'
import { isWriteKey, roomIdOf } from '@quorum/agent/room-id'
import { Upload } from '@quorum/agent/snapshot'
import type { AgentRooms } from '../contexts/agent/room.ts'
import { WIKI_PAGES } from './wiki-pages.ts'

/* ==========================================================================
   The two public edges behind the website Worker: the keyless MCP endpoint,
   and the write-keyed upload the browser uses. The MCP protocol lives here;
   each tool call is answered by the Room's Durable Object.
   ========================================================================== */

const MAX_BODY = 2 * 1024 * 1024

const decodeUpload = Schema.decodeUnknownOption(Upload)

const cors = (origin: string | null, methods = 'POST, OPTIONS'): Record<string, string> =>
  origin === null
    ? {}
    : {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'content-type, mcp-protocol-version, authorization',
        'Access-Control-Allow-Methods': methods,
        Vary: 'Origin',
      }

const json = (body: unknown, status: number, origin: string | null): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  })

const tooLarge = (origin: string | null): Response =>
  json({ error: 'The request is too large.' }, 413, origin)

const bearer = (request: Request): string | null => {
  const header = request.headers.get('Authorization')
  if (header === null || !header.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length)
}

const mcp = async (
  request: Request,
  rooms: AgentRooms,
  origin: string | null,
): Promise<Response> => {
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: cors(origin) })
  if (request.method !== 'POST')
    return new Response(null, { status: 405, headers: { Allow: 'POST, OPTIONS' } })

  const length = Number(request.headers.get('Content-Length') ?? 0)
  if (length > MAX_BODY) return tooLarge(origin)

  const version = request.headers.get('MCP-Protocol-Version')
  if (version !== null && !(SUPPORTED as ReadonlyArray<string>).includes(version))
    return json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Unsupported protocol version' },
      },
      400,
      origin,
    )

  const text = await request.text()
  if (text.length > MAX_BODY) return tooLarge(origin)

  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    return json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      400,
      origin,
    )
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body))
    return json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'One JSON-RPC message per POST' },
      },
      400,
      origin,
    )

  const response = await handleMcp(
    body as Parameters<typeof handleMcp>[0],
    (room, name, input) => rooms.getByName(room).read(name, input),
    (room) => rooms.getByName(room).status(),
    WIKI_PAGES,
  )
  return response === undefined
    ? new Response(null, { status: 202, headers: cors(origin) })
    : json(response, 200, origin)
}

const room = async (
  request: Request,
  rooms: AgentRooms,
  origin: string | null,
): Promise<Response> => {
  if (request.method === 'OPTIONS')
    return new Response(null, { status: 204, headers: cors(origin, 'PUT, DELETE, OPTIONS') })

  const key = bearer(request)
  if (key === null || !isWriteKey(key))
    return json({ error: 'A write key is required.' }, 401, origin)

  const stub = rooms.getByName(await roomIdOf(key))

  if (request.method === 'PUT') {
    const type = request.headers.get('Content-Type') ?? ''
    if (!type.startsWith('application/json'))
      return json({ error: 'Send the upload as JSON.' }, 415, origin)
    const length = Number(request.headers.get('Content-Length') ?? 0)
    if (length > MAX_BODY) return tooLarge(origin)

    const text = await request.text()
    if (text.length > MAX_BODY) return tooLarge(origin)

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return json({ error: 'The upload is not valid JSON.' }, 400, origin)
    }
    const upload = decodeUpload(body)
    if (Option.isNone(upload))
      return json({ error: 'The upload is not a valid snapshot.' }, 400, origin)

    try {
      return json(await stub.write(upload.value, key), 200, origin)
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : 'The Room is unavailable.' },
        500,
        origin,
      )
    }
  }

  if (request.method === 'DELETE') {
    try {
      await stub.clear(key)
      return new Response(null, { status: 204, headers: cors(origin) })
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : 'The Room is unavailable.' },
        500,
        origin,
      )
    }
  }

  return new Response(null, { status: 405, headers: { Allow: 'PUT, DELETE, OPTIONS' } })
}

/** Serves `/mcp` and the browser's upload path. Anything else is a 404. */
export const agentHttp = async (request: Request, rooms: AgentRooms): Promise<Response> => {
  const origin = request.headers.get('Origin')
  if (!isAllowedOrigin(origin)) return new Response('Forbidden', { status: 403 })

  const path = new URL(request.url).pathname
  if (path === MCP_PATH) return mcp(request, rooms, origin)
  if (path === AGENT_ROOM_PATH) return room(request, rooms, origin)
  return new Response('Not found', { status: 404 })
}
