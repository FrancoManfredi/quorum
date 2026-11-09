# Agents read a Company through a remote MCP server

An agent reads a Company at one public MCP endpoint, with nothing installed. The player turns on
**Agent access**, copies the Agent room id, and gives it to the agent. The browser uploads a
snapshot every few seconds, and the server answers the tools from the last upload.

The Company stays in the browser. The local relay existed because the game was only there. A
remote endpoint needs the data on the server, so the browser sends it. One upload carries a head and
three append-only streams. The head is the Game without `history`, the screen, the Bottleneck, and
the what-if rows. The streams are the company samples, the per-Node samples, and the Inbox. The
first upload after a page load is a baseline: 600 company samples, 24 Node samples per Node, and the
Inbox. Every later upload carries only the samples after the server's cursor, and the Inbox only
when it changes.

An Agent room is a Durable Object named by a hash of the browser's write key. The id is public and
the key stays in local storage. Reads need no key. Writes need the key, so a leaked id cannot
replace the snapshot. The object stores the snapshot and runs the same `readTool` that the
**Copy state as JSON** button uses. The API Worker speaks MCP and routes each `tools/call` to the
object named by the `room` argument. The protocol needs no session and no SSE.

The endpoint is `https://playquorum.dev/mcp`. A tool call is one POST and one JSON reply. The tools
are read-only, and the tool list does not change between Rooms. When a Room does not carry the data
a tool needs, the tool returns a clear error. A Challenge uploads a refusal instead of a Game, so an
agent cannot read a scored run.

Considered options:

- **The local relay.** Rejected: it needs Node, a fixed port, a loopback exception, and a tab that
  answers. The remote endpoint costs one public route and one namespace.
- **A live tunnel to the tab over a WebSocket.** Rejected: every tool stays fresh, but each player
  keeps a durable socket and the tab becomes a server again. A snapshot is enough for advice.
- **Uploading the whole Model every few seconds.** Rejected: the Inbox and per-Node history are
  hundreds of kilobytes. A head and cursors keep a steady upload near 20 KB.
- **JSON Patch over a stored document.** Rejected: a lost patch corrupts the store, and the
  append-only streams need a cursor anyway.
- **A key for the agent.** Rejected: the player would paste two values. The key stays with the
  browser, and the id is unguessable on its own.

## Consequences

- A Company's state leaves the machine while Agent access is on. The setting is off by default.
- The agent reads a snapshot that can be seconds old. `get_status` reports the age.
- The id is unguessable but not secret. Anyone with it reads the Room. The write key is the only
  secret, and it never reaches the agent.
- The first upload after a page load sends a baseline. Later uploads are incremental.
- An Agent room has no authority over the Game. It stores a copy and expires 24 hours after the
  last upload.
- Turning Agent access off clears every Agent room this browser made. A lost write key leaves the
  object until it expires.
- The same endpoint serves the wiki's explanation, Component, guide, and tutorial pages as MCP
  resources, so an agent can read the rules that the figures follow. The API Worker bundles the
  Markdown at build time (`packages/agent/wiki-sources.ts`), and `packages/agent/src/wiki.ts` turns
  each page into plain Markdown. The design document, Patterns, and the catalog pages stay on the
  website.
- The local relay and its npm package are gone. `packages/agent` holds the tool list, the snapshot
  schema, the view, and the MCP handler, and both apps import it.
- What would change it: a WebSocket back to the tab if players want live incident answers, or
  accounts if an Agent room must survive a browser clear.
