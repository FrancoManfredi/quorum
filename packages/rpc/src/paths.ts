/**
 * Path prefix served by the API Worker. The website Worker forwards this
 * prefix to the API through its service binding, so `alchemy.run.ts` derives
 * its `runWorkerFirst` rule from this value.
 */
export const API_PREFIX = '/api'

export const RPC_PATH = `${API_PREFIX}/rpc`

/** Where a Room's WebSocket lives. The website Worker forwards the prefix. */
export const ROOM_PATH = `${API_PREFIX}/room`
export const ROOM_SOCKET_PATH = `${ROOM_PATH}/socket`

/**
 * The same-origin path the website Worker proxies to PostHog. It is not part
 * of the API: the browser sends analytics here so blockers do not match
 * PostHog's hostname.
 */
export const INGEST_PREFIX = '/q'

/** The public MCP endpoint. The website Worker forwards it to the API Worker. */
export const MCP_PATH = '/mcp'

/** Where a browser uploads its agent snapshot. */
export const AGENT_PREFIX = `${API_PREFIX}/agent`
export const AGENT_ROOM_PATH = `${AGENT_PREFIX}/room`
