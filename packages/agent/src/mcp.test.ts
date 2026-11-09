import { describe, expect, test, vi } from 'vitest'
import { handleMcp } from './mcp.ts'
import { wikiPages } from './wiki.ts'

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

  describe('wiki resources', () => {
    const pages = wikiPages({
      'explanation/requests':
        '---\ntitle: How requests flow\nsummary: Routing.\n---\n\nSee [queues](/explanation/queues) and [the Eras](/eras).\n\n::Mix{era="3"}\n\n:::Note{tone="real"}\nReal systems queue.\n:::\n',
      'explanation/queues': '---\ntitle: Queues\nsummary: Waiting.\n---\n\nBody.\n',
      'components/cache':
        'A Cache answers repeated reads. See [Database](/components/database#how-it-works).\n',
    })
    const ask = (method: string, params?: unknown) =>
      handleMcp(
        request(method, params),
        async () => '{}',
        async () => null,
        pages,
      ) as Promise<{
        result: {
          capabilities: Record<string, unknown>
          resources: Array<{ uri: string; title: string; description: string }>
          contents: Array<{ text: string; mimeType: string }>
        }
        error?: { code: number }
      }>

    test('are advertised only when the server has pages', async () => {
      const init = (await handleMcp(
        request('initialize', {}),
        async () => '{}',
        async () => null,
      )) as { result: { capabilities: Record<string, unknown> } }
      expect(init.result.capabilities).not.toHaveProperty('resources')
      expect((await ask('initialize', {})).result.capabilities).toHaveProperty('resources')
    })

    test('list the index first, with titles and no page text', async () => {
      const { result } = await ask('resources/list')
      expect(result.resources.map((entry: { uri: string }) => entry.uri)).toEqual([
        'quorum://wiki/index',
        'quorum://wiki/components/cache',
        'quorum://wiki/explanation/queues',
        'quorum://wiki/explanation/requests',
      ])
      expect(result.resources[3]).toMatchObject({
        title: 'How requests flow',
        description: 'Routing.',
      })
      expect(result.resources[1]!.title).toBe('Cache')
      expect(JSON.stringify(result)).not.toContain('Real systems')
    })

    test('read a page as plain Markdown with links an agent can follow', async () => {
      const { result } = await ask('resources/read', { uri: 'quorum://wiki/explanation/requests' })
      const text = result.contents[0]!.text
      expect(result.contents[0]).toMatchObject({ mimeType: 'text/markdown' })
      // A page the server has links to its resource; any other goes to the website.
      expect(text).toContain('[queues](quorum://wiki/explanation/queues)')
      expect(text).toContain('[the Eras](https://wiki.playquorum.dev/eras)')
      // A live view is dropped, a note keeps its words, and no frontmatter or directive is left.
      expect(text).not.toContain('::')
      expect(text).not.toContain('title:')
      expect(text).toContain('**In real systems:**\nReal systems queue.')
      const cache = await ask('resources/read', { uri: 'quorum://wiki/components/cache' })
      expect(cache.result.contents[0]!.text).toContain(
        '(https://wiki.playquorum.dev/components/database#how-it-works)',
      )
    })

    test('the index lists every page, and an unknown page is a protocol error', async () => {
      const { result } = await ask('resources/read', { uri: 'quorum://wiki/index' })
      expect(result.contents[0]!.text).toContain(
        '[Queues](quorum://wiki/explanation/queues): Waiting.',
      )
      expect((await ask('resources/read', { uri: 'quorum://wiki/nope' })).error?.code).toBe(-32002)
    })
  })
})
