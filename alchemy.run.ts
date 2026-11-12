import { sentryRollupPlugin } from '@sentry/rollup-plugin'
import * as Alchemy from 'alchemy'
import * as Cloudflare from '@alchemy.run/cloudflare'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { API_PREFIX, INGEST_PREFIX, MCP_PATH } from '@quorum/rpc'
import { wikiSources } from './packages/agent/wiki-sources.ts'
import { simVersion } from './packages/simulation/sim-version.ts'
import type { AgentRoomInstance } from './apps/backend/src/platform/agent-room.ts'
import type { RoomInstance } from './apps/backend/src/platform/room-object.ts'

const compatibility = { date: '2026-10-08' }
// The Sentry SDK in the API and website Workers needs AsyncLocalStorage, which `nodejs_compat` gives.
const sentryCompatibility = { ...compatibility, flags: ['nodejs_compat'] }

/**
 * The PostHog project token. It is a build-time Vite variable, not a Worker
 * binding: the app inlines it at build time and the Worker only proxies the
 * requests. The deploy environment must set it.
 */
const posthogKey = process.env.VITE_POSTHOG_KEY ?? ''

/**
 * The Sentry DSN (ADR 0013). The browser inlines it at build time like the PostHog token; the
 * Workers get it as a binding. A DSN is public by design. The deploy environment must set it.
 * `VITE_SENTRY_RELEASE` (the commit) is the release all three report.
 */
const sentryDsn = process.env.VITE_SENTRY_DSN ?? ''
const sentryRelease = process.env.VITE_SENTRY_RELEASE ?? ''
// Plain-text bindings. A stage without a DSN gets none, and the Workers' SDK stays off.
const sentryEnv = {
  ...(sentryDsn && { SENTRY_DSN: sentryDsn }),
  ...(sentryRelease && { SENTRY_RELEASE: sentryRelease }),
}

/**
 * Source maps. The website build uploads its own through the Sentry plugin in
 * `apps/web/vite.config.ts`, for the assets and the Worker it bundles. Alchemy bundles the API
 * Worker with rolldown, so the same plugin joins that build here. Both need `SENTRY_AUTH_TOKEN`,
 * and read `SENTRY_ORG` and `SENTRY_PROJECT` from the environment. Without the token, nothing
 * uploads. The maps stay out of the deployed code: Alchemy writes them to `.alchemy`.
 */
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const apiBuild = {
  build: {
    input: {
      plugins: [
        // Fills in the Simulation's version, the git hash of `packages/simulation/src`.
        simVersion(),
        // Bundles the wiki pages an agent can read as MCP resources.
        wikiSources(),
        ...(sentryAuthToken
          ? [
              sentryRollupPlugin({
                authToken: sentryAuthToken,
                ...(sentryRelease ? { release: { name: sentryRelease } } : {}),
              }),
            ]
          : []),
      ],
    },
  },
}

/**
 * The public hostnames of the `prod` stage. The old hostname 301s to the new one, path and query
 * kept. Both zones must exist in the Cloudflare account.
 */
const PRODUCTION_DOMAIN = {
  name: 'playquorum.dev',
  redirects: ['quorum.elianiva.com', 'www.playquorum.dev'],
}

/** The wiki's public hostname in the `prod` stage, in the same zone (ADR 0009). */
const WIKI_DOMAIN = 'wiki.playquorum.dev'

/**
 * Cloudflare Workers Observability, configured on the host resources only. It keeps the logs.
 * Sentry owns traces, so Cloudflare's are off: they would record every request a second time,
 * with the URLs and SQL text of its automatic spans.
 * Sampling at 0.1 keeps one request in ten, which is enough for a launch spike.
 */
const observability = {
  enabled: true,
  headSamplingRate: 0.1,
  logs: { enabled: true, invocationLogs: true, headSamplingRate: 0.1, persist: true },
  traces: { enabled: false },
}

/**
 * Per-IP limits at the website Worker, before a request reaches the API or the
 * analytics proxy. A single player rarely makes more than a handful of API
 * calls a minute, so these leave room for a shared office while they stop an
 * anonymous script from creating Rooms without end.
 */
const rateLimits = {
  RATE_LIMIT_API: Cloudflare.RateLimit('RateLimitApi', {
    namespaceId: 7301,
    simple: { limit: 60, period: 60 },
  }),
  RATE_LIMIT_INGEST: Cloudflare.RateLimit('RateLimitIngest', {
    namespaceId: 7302,
    simple: { limit: 120, period: 60 },
  }),
}

const state = Layer.unwrap(
  Effect.gen(function* () {
    const dev = yield* Alchemy.ALCHEMY_DEV.pipe(Effect.orDie)
    return dev ? Alchemy.localState() : Cloudflare.state()
  }),
)

export default Alchemy.Stack(
  'quorum',
  { providers: Cloudflare.providers(), state },
  Effect.gen(function* () {
    const stage = yield* Alchemy.Stack.use((stack) => Effect.succeed(stack.stage))
    // A prod deploy without the token would ship a site that silently collects
    // nothing. Fail here instead.
    if (stage === 'prod' && posthogKey === '')
      return yield* Effect.die(
        new Error(
          'VITE_POSTHOG_KEY is required for the prod stage. Set it in the deploy environment.',
        ),
      )
    // Same guard for Sentry: a prod deploy without the DSN would report nothing.
    if (stage === 'prod' && sentryDsn === '')
      return yield* Effect.die(
        new Error(
          'VITE_SENTRY_DSN is required for the prod stage. Set it in the deploy environment.',
        ),
      )
    // The Exit survey's rows. The resource keeps its first name: renaming it would create a new, empty database.
    const Results = Cloudflare.D1.Database('Results', { migrations: './apps/backend/migrations' })
    const ApiWorker = Cloudflare.Worker('Api', {
      main: './apps/backend/src/worker.ts',
      env: {
        FEEDBACK: Results,
        // The same database under a second name: `ACCESS` holds the feature keys that
        // unlock server features, and each context reads its own table.
        ACCESS: Results,
        // The one stateful object in the stack: an online Company's Room.
        ROOMS: Cloudflare.DurableObject<RoomInstance>('RoomObject'),
        // A Company exposed to agents: one object per agent room id.
        AGENT_ROOMS: Cloudflare.DurableObject<AgentRoomInstance>('AgentRoom'),
        ...sentryEnv,
      },
      ...apiBuild,
      compatibility: sentryCompatibility,
      observability,
      // The website reaches the API through its service binding only. Remove
      // this when the API needs its own public URL or custom domain.
      workersDev: false,
    })
    const Website = Cloudflare.Website.Foldkit('Website', {
      rootDir: stage === 'reference' ? 'examples/reference' : 'apps/web',
      main: 'src/worker.ts',
      env: { API: ApiWorker, ...sentryEnv, ...rateLimits },
      assets: {
        runWorkerFirst: [MCP_PATH, `${MCP_PATH}/*`, `${API_PREFIX}/*`, `${INGEST_PREFIX}/*`],
        notFoundHandling: 'single-page-application',
      },
      ...(stage === 'prod' && { domain: PRODUCTION_DOMAIN }),
      compatibility: sentryCompatibility,
      observability,
    })

    // The wiki: every page is prerendered at build time, so it deploys as assets only. A script
    // would evaluate the whole app, every page included, at startup, and that exceeds the Workers
    // startup CPU limit. Pages are folders, so serve them without a trailing slash, and an unknown
    // path loads the app shell, which renders its own not-found page.
    const Wiki = Cloudflare.Website.StaticSite('Wiki', {
      command: 'pnpm --filter @quorum/wiki build',
      outdir: 'apps/wiki/dist/client',
      assets: {
        htmlHandling: 'drop-trailing-slash',
        notFoundHandling: 'single-page-application',
      },
      ...(stage === 'prod' && { domain: WIKI_DOMAIN }),
      compatibility,
      observability,
    })

    yield* Results
    yield* ApiWorker
    const website = yield* Website
    if (stage === 'reference') return { url: website.url }
    const wiki = yield* Wiki
    return { url: website.url, wiki: wiki.url }
  }),
)
