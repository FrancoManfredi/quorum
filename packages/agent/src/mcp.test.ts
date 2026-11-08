import { describe, expect, test, vi } from 'vitest'
import { handleMcp } from './mcp.ts'

const roomId = 'abcdefghijklmnopqrstuv'

const request = (method: string, params?: unknown, id: number | string = 1) => ({
  jsonrpc: '2.0' as const,
  id,
  method,
  ...(params === undefined ? {} : { params }),
})

describe('the MCP handler', () => {
  test('initializes and advertises the tools', async () => {
    const call = vi.fn(async () => '{}')
    const status = vi.fn(async () => null)

    const init = (await handleMcp(
      request('initialize', { protocolVersion: '2025-11-25' }),
      call,
      status,
    )) as { result: { protocolVersion: string; capabilities: unknown } }
    expect(init.result.protocolVersion).toBe('2025-11-25')

    const list = (await handleMcp(request('tools/list'), call, status)) as {
      result: {
        tools: Array<{ name: string; inputSchema: { properties: Record<string, unknown> } }>
      }
    }
    expect(list.result.tools.map((tool) => tool.name)).toContain('get_status')
    expect(list.result.tools.every((tool) => 'room' in tool.inputSchema.properties)).toBe(true)
  })

  test('passes the room and strips it from the tool input', async () => {
    const call = vi.fn(async () => JSON.stringify({ ok: true }))
    const status = vi.fn(async () => null)
    const response = (await handleMcp(
      request('tools/call', {
        name: 'explain_node',
        arguments: { room: roomId, nodeId: 'database' },
      }),
      call,
      status,
    )) as { result: { content: Array<{ text: string }> } }

    expect(call).toHaveBeenCalledWith(roomId, 'explain_node', { nodeId: 'database' })
    expect(JSON.parse(response.result.content[0]!.text)).toEqual({ ok: true })
  })

  test('a missing room is a tool error, not a protocol error', async () => {
    const call = vi.fn(async () => '{}')
    const status = vi.fn(async () => null)
    const response = (await handleMcp(
      request('tools/call', { name: 'get_company', arguments: {} }),
      call,
      status,
    )) as { result: { isError: boolean; content: Array<{ text: string }> } }

    expect(response.result.isError).toBe(true)
    expect(response.result.content[0]!.text).toContain('room id')
    expect(call).not.toHaveBeenCalled()
  })

  test('get_status asks the Room, not the tool view', async () => {
    const call = vi.fn(async () => '{}')
    const status = vi.fn(async () => ({ mode: 'company', updatedAt: 5 }))
    const response = (await handleMcp(
      request('tools/call', { name: 'get_status', arguments: { room: roomId } }),
      call,
      status,
    )) as { result: { content: Array<{ text: string }> } }

    expect(status).toHaveBeenCalledWith(roomId)
    expect(call).not.toHaveBeenCalled()
    expect(JSON.parse(response.result.content[0]!.text)).toEqual({
      mode: 'company',
      updatedAt: 5,
    })
  })

  test('a notification gets no answer, and unknown methods and tools fail', async () => {
    const call = vi.fn(async () => '{}')
    const status = vi.fn(async () => null)
    expect(
      await handleMcp({ jsonrpc: '2.0', method: 'notifications/initialized' }, call, status),
    ).toBeUndefined()

    const method = (await handleMcp(request('tools/nope'), call, status)) as {
      error: { code: number }
    }
    expect(method.error.code).toBe(-32601)

    const tool = (await handleMcp(
      request('tools/call', { name: 'place_node', arguments: { room: roomId } }),
      call,
      status,
    )) as { error: { code: number } }
    expect(tool.error.code).toBe(-32602)
  })

  test('get_status says when no snapshot is stored', async () => {
    const response = (await handleMcp(
      request('tools/call', { name: 'get_status', arguments: { room: roomId } }),
      async () => '{}',
      async () => null,
    )) as { result: { content: Array<{ text: string }> } }
    expect(JSON.parse(response.result.content[0]!.text)).toEqual({ stored: false })
  })

  test('a tool failure is reported as text', async () => {
    const call = vi.fn(async () => {
      throw new Error('No snapshot yet.')
    })
    const response = (await handleMcp(
      request('tools/call', { name: 'get_company', arguments: { room: roomId } }),
      call,
      async () => null,
    )) as { result: { isError: boolean; content: Array<{ text: string }> } }
    expect(response.result.isError).toBe(true)
    expect(response.result.content[0]!.text).toBe('No snapshot yet.')
  })
})
