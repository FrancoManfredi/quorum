import { isRoomId } from './room-id.ts'
import { TOOLS } from './tools.ts'

/* ==========================================================================
   MCP over Streamable HTTP, by hand: the requests a read-only server answers.
   The transport adapter in the API Worker turns one POST into one reply. No
   session, no SSE, no server-initiated messages.
   ========================================================================== */

export const SUPPORTED = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'] as const

type Request = Readonly<{ jsonrpc: '2.0'; id?: number | string; method: string; params?: unknown }>

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const reply = (id: number | string, result: unknown) => ({ jsonrpc: '2.0', id, result })
const failure = (id: number | string | null, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message },
})

export type CallTool = (
  room: string,
  name: string,
  input: Record<string, unknown>,
) => Promise<string>

export type RoomStatus = (room: string) => Promise<unknown>

const isKnown = (name: string): boolean => TOOLS.some((tool) => tool.name === name)

export const handleMcp = async (
  request: Request,
  call: CallTool,
  status: RoomStatus,
): Promise<unknown> => {
  const { id, method } = request
  // A notification has no id and gets no answer.
  if (id === undefined) return undefined
  const params = record(request.params)

  switch (method) {
    case 'initialize': {
      const asked = typeof params['protocolVersion'] === 'string' ? params['protocolVersion'] : ''
      return reply(id, {
        protocolVersion: (SUPPORTED as ReadonlyArray<string>).includes(asked)
          ? asked
          : SUPPORTED[1],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'quorum', version: '1.0.0' },
        instructions:
          'Read-only view of a Room the player exposed from Quorum. Pass the room id shown in Settings as the `room` argument on every tool. Start with get_status to see how fresh the snapshot is, then get_company. These tools cannot change the game.',
      })
    }
    case 'ping':
      return reply(id, {})
    case 'tools/list':
      return reply(id, {
        tools: TOOLS.map((tool) => ({
          ...tool,
          annotations: { readOnlyHint: true, openWorldHint: false },
        })),
      })
    case 'tools/call': {
      const name = params['name']
      if (typeof name !== 'string' || !isKnown(name))
        return failure(id, -32602, `Unknown tool: ${String(name)}`)
      const args = record(params['arguments'])
      const room = args['room']
      if (typeof room !== 'string' || !isRoomId(room))
        return reply(id, {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Pass the agent room id shown in Quorum Settings as the room argument.',
            },
          ],
        })
      const input = { ...args }
      delete input['room']
      try {
        const text =
          name === 'get_status'
            ? JSON.stringify((await status(room)) ?? { stored: false })
            : await call(room, name, input)
        return reply(id, { content: [{ type: 'text', text }] })
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error)
        return reply(id, { isError: true, content: [{ type: 'text', text }] })
      }
    }
    default:
      return failure(id, -32601, `Method not found: ${method}`)
  }
}
