---
title: Use agent access
summary: Let a coding agent read your Company through Quorum's MCP server, and ask it for advice. The agent reads; you play.
section: guides
order: 11
aliases: mcp, agent, claude code, codex, agent room, room id, ai, assistant, copy state as json
---

Use this guide when you want a coding agent, such as Claude Code or Codex, to read your Company and
tell you what to fix.

Quorum serves a read-only [MCP](https://modelcontextprotocol.io) endpoint at
`https://playquorum.dev/mcp`. Your browser uploads a snapshot of the open Company every few seconds
while **Agent access** is on, and the endpoint answers from the last upload. The agent can read the
Board, the incidents, and the Inbox, but it cannot place a Node, click a button, or change a
setting.

## Before you start

- An agent that supports remote MCP servers over Streamable HTTP.
- A Company open in [playquorum.dev](https://playquorum.dev).

## Add the endpoint to your agent

1. Add the server. For Claude Code, run:

   ```sh
   claude mcp add --transport http quorum https://playquorum.dev/mcp
   ```

   For Codex, add this to `~/.codex/config.toml`:

   ```toml
   [mcp_servers.quorum]
   url = "https://playquorum.dev/mcp"
   ```

2. Start the agent. There is no install step, no local port, and no key.

## Turn on Agent access

1. Open the game menu with **Esc** and select **Settings**.
2. Turn on **Agent access**. It is off by default, and the game remembers your choice.
3. Copy the **Agent room** id under the switch.

The id is a name for the snapshot, not a password. The write key stays in your browser, so another
person with the id can read the Company but cannot replace what the agent sees. Turning Agent access
off deletes the snapshot.

## Ask the agent

1. Include the id in your question, for example: "Read agent room `abcDEFghiJKLmnoPQRstuv` and tell me what to fix
   first."
2. Check that the agent calls `get_status`, then `get_company`. The status says how old the snapshot
   is. If the answer names your Cash, users, and Era, the connection works.

:::Note{tone="tip"}
Ask the agent to explain, not only to prescribe. "Why is the Database the bottleneck?" teaches you
more than "What do I click?"
:::

The agent has eight tools, and all of them only read:

| Tool            | What it returns                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `get_status`    | When the snapshot last synced, the mode, and how much it holds. Call it first.                                  |
| `get_company`   | Cash, users, Apdex, the Era, latency percentiles, revenue, Burn, the bottleneck, and your Research. Start here. |
| `get_design`    | Every Node and Link, with its live load, latency, and drops, plus the health of each request kind.              |
| `get_incidents` | The running incident, the alert rules and alarms, and recent postmortems.                                       |
| `get_inbox`     | Your mail, with the choices each message offers. The agent can read the choices, not take them.                 |
| `get_history`   | Recent samples of users, revenue, Burn, latency, p99, Apdex, and errors, to see trends.                         |
| `explain_node`  | Why one Node is busy: its Load change, the traffic behind it, and the research that reveals it.                 |
| `get_game`      | The whole saved Game as JSON. It is large, so the agent should prefer the others.                               |

Every tool takes the room id as its `room` argument. The agent reads the last upload, so pause the
game (**Space**) if you want its answer to match what you see. When you close the tab, the last
snapshot stays for 24 hours.

## Apply the advice yourself

1. Read what the agent suggests.
2. Check the claim on the board before you act. For example, select the Node it names and read
   its **Load** row, which [Find the bottleneck](/guides/find-the-bottleneck) covers in full.
3. Make the change yourself, then ask the agent to read the Company again.

## When it does not answer

| Message from the agent                             | Fix                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| "Pass the agent room id shown in Quorum Settings…" | Copy the id under **Agent access** and include it in the question.                           |
| "This Room has no snapshot yet…"                   | Open the Company and turn on **Agent access**.                                               |
| "A Challenge is open."                             | Challenges are scored, so no agent can read them. Leave the Challenge first.                 |
| The figures are older than the game                | The tab is closed or asleep. Bring it to the front; the last snapshot stays until a new one. |
| "No Room is open…"                                 | Open a Company.                                                                              |

## When the agent cannot connect

Open **Settings** and select **Copy state as JSON**. Paste the result into your agent. The JSON
holds the same views that the tools return, and it answers nothing while a Challenge is open
either. Copy it again each time the game changes.
