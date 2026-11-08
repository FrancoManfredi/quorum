# Architecture

## Runtime boundaries

`apps/web` and `apps/backend` are separate deployable applications. The browser sends requests to the website origin. The website Worker forwards `/api/*` requests to the API Worker through an Alchemy-managed service binding. Alchemy deploys both Workers in one stack.

```text
Browser / Foldkit
       │ same-origin /api/rpc
       ▼
Website Worker ── service binding ──► API Worker
                                           │
                                           ▼
                                      Effect RPC
                                           │
                                           ▼
                                      packages/rpc
```

`apps/wiki` is a third deployable application with no API. Foldkit prerenders every page at build time, and `Cloudflare.Website.Foldkit` serves the files; its generated Worker answers only 404s ([ADR 0009](adr/0009-the-wiki-is-a-prerendered-app.md)).

The service binding is a deployment concern. Business handlers must not depend on Cloudflare types or bindings. The root `alchemy.run.ts` owns all resource declarations and selects the default website or reference example by Alchemy stage (`reference` selects the example). Each app exposes a plain `src/worker.ts` runtime entry module; these modules do not import Alchemy or declare infrastructure.

## Request routing

`packages/rpc/src/paths.ts` owns `API_PREFIX` and `RPC_PATH`. `alchemy.run.ts` derives the website's `runWorkerFirst` rule from `API_PREFIX`, so the path that the contract declares and the path that the deployment routes cannot drift apart.

The website Worker therefore receives only requests under that prefix, and forwards them to the API Worker through the service binding. Every other path is served from the static assets, including the client-side fallback for unmatched routes.

The API Worker sets `workersDev: false`. The website origin is its only public surface, so a caller cannot skip the website Worker by addressing the API directly.

## Rooms

A Company can go online in a Room. The Room is the `RoomObject` Durable Object, hosted by the API
Worker and bound through Alchemy as one namespace. It owns the Game, its Dashboard samples, the
Seats, the open vote, and the revision. The website Worker forwards `/api/room/socket` through the
same service binding, and the API Worker hands the upgrade to the Room's object.

The browser never steps a Company in a live Room. `tick` still solves the Ledger and the Bottleneck
so the Board draws, but time advances only on the Room's alarm. Intents and Room messages are
declared in `packages/simulation/src/room.ts`, beside the Simulation, because their payloads are the
Game and its Intents; `packages/rpc` keeps the paths and the two plain RPCs. The owner takes the
Company offline with a token that lives in its Company file, which writes the Room's final Game back
to the browser and deletes the object.

Cursors are Presence, not a move. A Seat sends its pointer 25 times a second at most, the Room relays
each frame to the other Seats without saving it, and the Board draws the gaps as a spline. A pointer
never enters a snapshot, so a Seat that joins late sees no one else's stale cursor.

## Telemetry

Sentry records errors, traces, and profiles ([ADR 0013](./adr/0013-sentry-for-errors-traces-and-profiles.md)). Cloudflare Workers Observability keeps logs only: `alchemy.run.ts` turns its traces off, so a request is traced once. Observability is configured on the host resources in `alchemy.run.ts`, never in contexts.

- The browser starts Sentry in `apps/web/src/platform/sentry.ts`. Foldkit's `crash` and `slow` options report to it; `traced` wraps work that matters to load time or smoothness.
- Both Workers wrap their entry with `Sentry.withSentry`. They need the `nodejs_compat` flag, which `sentryCompatibility` sets. The API Worker also provides the Effect tracer, logger, and error reporter, so `Effect.withSpan` in a context becomes a Sentry span.
- The browser sends trace headers to `/api/` only. The website Worker passes them through the service binding, so one trace covers the browser, both Workers, and D1.
- `SubmitSurvey` is a traced Command: its browser span reaches the API Worker's `survey.submit` span. A failed submission is captured with the Exit's type, Era, and one sentence, never the answers.
- Sampling: traces 10%, profiles 5% of sessions. Review both after a week of real traffic.

## Product analytics

The browser sends anonymous PostHog events through the website Worker at `/q` (`INGEST_PREFIX` in `packages/rpc/src/paths.ts`). The Worker forwards them to PostHog Cloud US; the browser never calls PostHog directly, so ad blockers do not match the hostname.

- `apps/web/src/platform/analytics.ts` owns the SDK, the session, and the heartbeat.
- `apps/web/src/game/analytics-bridge.ts` maps the playtest log to the nine events the plan keeps.
- `apps/web/src/game/analytics-budget.ts` caps a session at 80 events and a device at 600 a month. Funnel events bypass the session cap, never the month cap.
- `apps/wiki/src/platform/analytics.ts` sends `$pageview` for the wiki in the same project.
- `VITE_POSTHOG_KEY` is required at build time for both apps. Without it, the SDK never loads and nothing is sent.
- Settings has **Share anonymous usage data**. The policy is `apps/wiki/content/about/privacy.md`.
- The Exit survey's answers are a D1 row the API Worker validates ([ADR 0015](./adr/0015-the-exit-survey-is-a-d1-row.md)). A sent survey also emits `survey:submitted` with the Exit's figures and the length of each answer, never the text.

## Code ownership

- `apps/web/src/app` owns the Foldkit application. Remote data belongs in Foldkit Query submodels. Update handlers decide when to load or revalidate them. A flow with exclusive phases is a `foldkit/experimental/machine` definition beside its tagged state union, not a set of nullable fields ([ADR 0011](adr/0011-state-machines-are-for-flows.md)); [State machines](state-machines.md) lists every machine and the properties it holds. `src/game/update.ts` routes Messages; a subject's handlers live in `src/game/update/<subject>.ts` and its Message cases in `src/game/message/<subject>.ts` ([ADR 0015](adr/0015-update-handlers-live-by-subject.md)).
- `apps/backend/src/contexts` is the home for server-side bounded contexts as product vocabulary is discovered. Do not pre-invent product domains in the scaffold.
- `apps/wiki` owns the wiki: `src/entry.server.ts` lists every page to prerender, `src/content.ts` reads the Markdown in `content/`, and `src/reference` builds catalog pages from `@quorum/simulation`. Islands in Markdown render views from `@quorum/ui`.
- `packages/rpc` owns the public wire contract only: Effect RPC groups, request/response schemas, declared errors, and the API path prefix.
- `packages/simulation` owns the Simulation: the catalog, the Game schema, the solver, the Step, actions, and the Sandboxes. A Node's lifecycle is one tagged state in `src/life.ts`, not separate fields ([ADR 0011](adr/0011-state-machines-are-for-flows.md)). The browser plays it and the API Worker will replay Challenges with it ([ADR 0004](adr/0004-simulation-package.md)). It imports only `effect` and its own files, and uses only exact math, so every runtime computes the same Game.
- `packages/ui` (`@quorum/ui`) owns the design language and the views both apps show ([ADR 0010](adr/0010-ui-package.md)): the primitives under `src/primitives`, the Graphite theme in `src/theme.css` (each app imports it after Tailwind), the shared game views, number formats, and icons under `src/game`, and the Pixi board with its routing and compute worker under `src/board`. A view takes the data it shows, never an app's Model; the board takes a `BoardState` with a `translate` function and reports gestures and sounds through callbacks. It ships TypeScript source; each app's Vite build compiles it. `src/boundary.test.ts` checks its import rules.
- `packages/mcp-relay` is `quorum-mcp-relay`, the one package published to npm. Its CLI runs on the player's machine as an MCP server on stdio and as a WebSocket server on loopback, which the Quorum page connects to ([ADR 0007](adr/0007-agents-read-the-game-through-a-local-relay.md)). `src/tools.ts` and `src/protocol.ts` import nothing, so the web app imports them for the tool list and the wire messages.
- `examples/reference` shows a complete Query-to-RPC path in a separate website app. Run it with `pnpm dev:reference`, which uses the root Alchemy entrypoint with the `reference` stage; it is deliberately excluded from the default stack.

## Dependency direction

```text
apps/web ─────────► packages/rpc, packages/simulation, packages/ui
apps/backend ─────► packages/rpc, packages/simulation
apps/wiki ────────► packages/simulation, packages/ui
examples/reference ► packages/rpc
apps/web ─────────► packages/mcp-relay (tools, protocol only)
packages/rpc ─────► effect
packages/simulation ► effect
packages/mcp-relay ► ws
packages/ui ───────► packages/simulation, foldkit, @foldkit/ui, lucide, pixi.js
```

The web app must not import backend implementation modules. The wiki must not import either other app or `packages/rpc`. The RPC package must not import either app or the Simulation. The Simulation must not import either app, `packages/rpc`, or any UI, browser, or Cloudflare module. The relay must not import either app, `packages/rpc`, or the Simulation. The UI package must not import an app or `packages/rpc`, and its primitives must not import its game views, its board, or the Simulation. Share the wire contract, not internal backend models.

## Cloudflare scope

The stack provisions the website Worker, the API Worker, one D1 database, `Results`, bound to the API Worker as `FEEDBACK` for the Exit survey, and the `RoomObject` Durable Object namespace the API Worker hosts. The resource keeps its first name because renaming it would create a new, empty database. The Exit survey needs a durable row the Worker validates, not an analytics event ([ADR 0015](./adr/0015-the-exit-survey-is-a-d1-row.md)). Challenges are scored in the browser and send nothing ([ADR 0016](./adr/0016-challenges-stay-in-the-browser-until-accounts.md)). The schema is in `apps/backend/migrations`, which Alchemy applies on deploy.

The survey context sees only its store service, `SurveyStore` (`apps/backend/src/contexts/survey/store.ts`). Its D1 implementation uses the structural `SqlRunner` in `apps/backend/src/platform/sql.ts`, which a `D1Database` satisfies; tests run the same SQL on `node:sqlite`. A Room is that requirement for the one Durable Object namespace. Add R2, Access, or other Cloudflare
services only when a product feature requires them.
