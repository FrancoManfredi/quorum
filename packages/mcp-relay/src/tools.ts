export type ToolDefinition = Readonly<{
  name: string
  description: string
  inputSchema: Readonly<{ type: 'object'; properties: Readonly<Record<string, object>> }>
}>

const object = (properties: Record<string, object> = {}) =>
  ({ type: 'object', properties }) as const

export const TOOLS = [
  {
    name: 'get_company',
    description:
      'Headline state of the open Company: time, cash, users, Apdex, Era, Venture, the Bottleneck, and what the player has on screen. Start here.',
    inputSchema: object(),
  },
  {
    name: 'get_design',
    description:
      'The Design: every Node and Link as placed, plus the live Ledger figures for each (utilization, status, latency, drops) and per-request-kind health.',
    inputSchema: object(),
  },
  {
    name: 'get_incidents',
    description:
      'The running incident, the alert rules and alarms, and recent postmortems with their cost.',
    inputSchema: object({
      limit: { type: 'number', description: 'Most recent postmortems to return. Default 5.' },
    }),
  },
  {
    name: 'get_inbox',
    description:
      'Mail the game sent, oldest first. Each Thread has its sender, subject, entries, and the choices it offers; the agent can read the choices but cannot take them.',
    inputSchema: object({
      folder: { enum: ['inbox', 'spam', 'trash'], description: 'Default inbox.' },
      unreadOnly: { type: 'boolean' },
    }),
  },
  {
    name: 'get_history',
    description:
      'Recent Samples of the Company (users, demand, served, revenue, burn, latency, p99, Apdex, errors), oldest first, to see trends.',
    inputSchema: object({
      last: { type: 'number', description: 'How many Samples. Default 60, at most 600.' },
    }),
  },
  {
    name: 'explain_node',
    description:
      "Why one Node is busy, as far as the player's research shows: its Load change since an hour earlier, the Users' Request kinds and retries behind its traffic, each kind's Work share and Cost receipt, and what-if rows. Names causes, not fixes. Defaults to the selected Node, then the Bottleneck.",
    inputSchema: object({
      nodeId: {
        type: 'string',
        description: 'The Node to explain. Default: selected, then Bottleneck.',
      },
    }),
  },
  {
    name: 'get_game',
    description:
      'The whole saved Game as JSON, for anything the other tools leave out. Large: prefer the others.',
    inputSchema: object(),
  },
] as const satisfies ReadonlyArray<ToolDefinition>

export type ToolName = (typeof TOOLS)[number]['name']
