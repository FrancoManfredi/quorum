/* ==========================================================================
   The wire between the relay and the Quorum page. The page opens a WebSocket
   to the relay and keeps it open; the relay asks, the page answers. Both
   sides import this file, so it names only data: no Node, no browser.
   ========================================================================== */

export const RELAY_HOST = '127.0.0.1'
export const RELAY_PORT = 7437

/** The page's address. Pages on localhost may also connect, for development. */
export const QUORUM_ORIGIN = 'https://playquorum.dev'

export type PageMessage =
  | Readonly<{ type: 'hello'; visible: boolean }>
  | Readonly<{ type: 'visible'; visible: boolean }>
  | Readonly<{ type: 'result'; id: number; ok: true; text: string }>
  | Readonly<{ type: 'result'; id: number; ok: false; error: string }>

const recordOf = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

export const isPageMessage = (value: unknown): value is PageMessage => {
  const message = recordOf(value)
  if (!message) return false
  if (message['type'] === 'hello' || message['type'] === 'visible')
    return typeof message['visible'] === 'boolean'
  if (message['type'] !== 'result' || typeof message['id'] !== 'number') return false
  return message['ok'] === true
    ? typeof message['text'] === 'string'
    : message['ok'] === false && typeof message['error'] === 'string'
}

export type RelayMessage = Readonly<{
  type: 'call'
  id: number
  tool: string
  input: Record<string, unknown>
}>
