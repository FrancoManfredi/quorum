import { COMPONENT_GLOSSARY } from './components/defs.ts'
import type { ComponentId, IncidentId, ResearchId } from './catalog.ts'
import type { StepEvent } from './events.ts'
import type { Game } from './state.ts'

/* ==========================================================================
   Glossary discovery (15 "Glossary"): the entries a Company has met. The
   panel shows every entry; met ones are marked. Pure: the browser calls it
   per tick in a Company and keeps the ids in the Founder record.
   ========================================================================== */

export const BY_COMPONENT: Partial<Record<ComponentId, ReadonlyArray<string>>> = COMPONENT_GLOSSARY

/** The entries each Research item teaches; the Research detail links to them. */
export const BY_RESEARCH: Partial<Record<ResearchId, ReadonlyArray<string>>> = {
  anycast: ['anycast', 'bgp-border-gateway-protocol'],
  'lang-node': ['async-io', 'blast-radius', 'event-loop'],
  'lang-csharp': ['async-io', 'jit-warmup'],
  'lang-rust': ['async-io'],
  'lang-zig': ['thread-pool', 'blast-radius'],
  'lang-haskell': ['green-threads', 'gc-pause'],
  'idempotency-keys': ['at-least-once-delivery', 'idempotency'],
  autoscaling: ['autoscaling', 'cold-start', 'diurnal-traffic', 'vertical-and-horizontal-scaling'],
  'multi-az': ['availability-zone', 'blast-radius', 'egress'],
  queues: ['backpressure', 'transactional-outbox'],
  'auth-provider': ['bcrypt'],
  'libuv-pool': ['bcrypt', 'event-loop', 'thread-pool'],
  ci: ['blue-green-deployment', 'continuous-delivery', 'dora-metrics', 'feature-flag'],
  'circuit-breakers': ['bulkhead', 'circuit-breaker', 'metastable-failure'],
  opcache: ['bytecode-cache'],
  caching: ['cache-hit-rate', 'cache-aside', 'write-through-cache'],
  'stampede-protection': ['cache-stampede', 'thundering-herd'],
  'cache-warming': ['cache-stampede', 'cache-warming'],
  'testing-culture': ['canary-deployment', 'dora-metrics', 'feature-flag'],
  'data-warehouse': ['cdc-change-data-capture', 'oltp-and-olap'],
  'on-call': ['mttd-and-mtta', 'on-call'],
  runbooks: ['runbook'],
  'sre-team': ['runbook'],
  // The Team's remaining research (08 "Adoption", "Deploy frequency", "Teams").
  'ab-testing': ['feature-flag'],
  'trunk-based': ['continuous-delivery', 'dora-metrics'],
  'data-team': ['cdc-change-data-capture', 'oltp-and-olap'],
  'platform-team': ['conways-law', 'container-orchestration'],
  'document-db': ['hot-key', 'sharding'],
  'event-streaming': ['at-least-once-delivery', 'cdc-change-data-capture'],
  embeddings: ['model-inference'],
  cdn: ['cdn-content-delivery-network', 'egress'],
  'tiered-caching': ['cdn-content-delivery-network', 'tiered-caching'],
  'code-review': ['code-review', 'dora-metrics'],
  'lang-java': ['cold-start', 'gc-pause', 'jit-warmup', 'thread-pool'],
  gzip: ['compression', 'egress'],
  pooling: ['connection-pooling'],
  leaderless: ['consistent-hashing', 'eventual-consistency', 'leaderless-replication'],
  sharding: ['consistent-hashing', 'hot-key', 'sharding'],
  containers: ['container-orchestration'],
  'gdpr-residency': ['data-residency'],
  'dependency-scanning': ['dependency-scanning'],
  tracing: ['distributed-tracing', 'red-method'],
  'trace-search': ['distributed-tracing'],
  notebooks: ['observability'],
  metrics: [
    'annotation',
    'diurnal-traffic',
    'downsampling',
    'four-golden-signals',
    'observability',
  ],
  'dns-rr': ['dns-round-robin'],
  'encryption-at-rest': ['encryption-at-rest'],
  'error-budgets': ['error-budget', 'slo-sla-sli'],
  'slo-dashboards': ['burn-rate', 'error-budget', 'slo-sla-sli'],
  'node-cluster': ['event-loop'],
  replication: ['eventual-consistency', 'read-replica', 'replication-lag'],
  'ryw-routing': ['eventual-consistency', 'read-replica', 'read-your-writes-consistency'],
  'multi-region': ['fallacies-of-distributed-computing'],
  timeouts: ['fallacies-of-distributed-computing', 'retry-with-backoff-and-jitter', 'timeout'],
  'hybrid-fanout': ['fan-out', 'fan-out-on-write', 'hot-key'],
  'eager-loading': ['fan-out', 'n1-query'],
  'lang-go': ['gc-pause', 'green-threads'],
  'gogc-tuning': ['gc-pause'],
  zgc: ['gc-pause'],
  'geo-dns': ['geodns'],
  'infra-as-code': ['iac-tool', 'mirror', 'drift'],
  gitops: ['gitops', 'drift', 'blast-radius'],
  'lang-python': ['gil-global-interpreter-lock', 'pre-fork-worker-model', 'process-per-request'],
  'lang-ruby': ['gil-global-interpreter-lock', 'thread-pool'],
  'lang-elixir': ['green-threads'],
  'load-balancing': ['health-check', 'load-balancer', 'vertical-and-horizontal-scaling'],
  'health-checks': ['health-check'],
  percentiles: ['hedged-request', 'percentile-p50-p95-p99', 'tail-at-scale'],
  keepalive: ['http-keep-alive'],
  http2: ['http2-and-http3'],
  http3: ['http2-and-http3'],
  'full-text-search': ['inverted-index'],
  'php-fpm': ['littles-law', 'pre-fork-worker-model', 'process-per-request', 'shared-nothing'],
  'lb-algorithms': ['load-balancer', 'power-of-two-choices'],
  'load-shedding': ['load-shedding'],
  'backoff-jitter': ['metastable-failure', 'retry-with-backoff-and-jitter'],
  'hosted-models': ['model-inference', 'rate-limiting'],
  'model-serving': ['model-inference'],
  'query-analysis': ['n1-query'],
  'fw-laravel': ['n1-query'],
  'fw-rails': ['n1-query'],
  'fw-django': ['n1-query'],
  'object-storage': ['object-storage'],
  logs: ['observability'],
  alerting: ['observability', 'percentile-p50-p95-p99'],
  'investor-relations': ['operating-margin'],
  'guidance-modeling': ['operating-margin'],
  pitr: ['point-in-time-recovery', 'rpo-and-rto'],
  'restore-drills': ['point-in-time-recovery', 'rpo-and-rto'],
  consensus: ['raft'],
  'dr-drills': ['rpo-and-rto'],
  soc2: ['soc-2'],
  'tls-everywhere': ['soc-2', 'tls-certificate'],
  'sync-replication': ['synchronous-replication'],
  'cert-automation': ['tls-certificate'],
  waf: ['waf-web-application-firewall'],
  // The research that closed the tracks (05, 07, 10): each links to what it teaches.
  'l4-lb': ['load-balancer'],
  'rate-limiting': ['rate-limiting', 'token-bucket'],
  esi: ['edge-side-includes', 'cache-hit-rate'],
  'bot-management': ['bot-management', 'waf-web-application-firewall'],
  'scheduled-scaling': ['autoscaling', 'diurnal-traffic'],
  'arm-instances': ['vertical-and-horizontal-scaling'],
  quantization: ['quantization', 'model-inference'],
  'continuous-batching': ['continuous-batching', 'model-inference'],
  bulkheads: ['bulkhead', 'circuit-breaker'],
  'graceful-degradation': ['graceful-degradation', 'load-shedding'],
  'hedged-requests': ['hedged-request', 'tail-at-scale'],
  'chaos-engineering': ['chaos-engineering', 'blast-radius'],
  denormalization: ['denormalization', 'n1-query'],
  precompute: ['materialized-view', 'oltp-and-olap'],
  'binary-rpc': ['binary-rpc', 'compression'],
  outbox: ['transactional-outbox', 'at-least-once-delivery'],
  'expand-contract': ['expand-and-contract', 'tech-debt'],
}

export const BY_INCIDENT: Partial<Record<IncidentId, ReadonlyArray<string>>> = {
  poison: ['at-least-once-delivery', 'dead-letter-queue'],
  'double-charge': [
    'at-least-once-delivery',
    'idempotency',
    'retry-with-backoff-and-jitter',
    'timeout',
  ],
  zone: ['availability-zone', 'blast-radius'],
  loop: ['bcrypt', 'event-loop', 'thread-pool'],
  stuffing: ['bcrypt', 'credential-stuffing'],
  bgp: ['bgp-border-gateway-protocol'],
  'bad-deploy': [
    'blast-radius',
    'blue-green-deployment',
    'canary-deployment',
    'code-review',
    'continuous-delivery',
    'dora-metrics',
  ],
  stampede: ['cache-stampede', 'cache-warming', 'thundering-herd'],
  regex: ['canary-deployment', 'redos-regular-expression-denial-of-service'],
  'report-db': ['cdc-change-data-capture', 'oltp-and-olap'],
  'retry-storm': [
    'circuit-breaker',
    'load-shedding',
    'metastable-failure',
    'retry-with-backoff-and-jitter',
  ],
  instance: ['cold-start', 'health-check', 'load-balancer', 'mttr', 'spot-instance'],
  connections: ['connection-pooling'],
  ddos: ['ddos-distributed-denial-of-service'],
  'repl-lag': [
    'eventual-consistency',
    'read-replica',
    'read-your-writes-consistency',
    'replication-lag',
  ],
  partition: ['fallacies-of-distributed-computing', 'network-partition', 'quorum'],
  'hot-key': ['fan-out', 'fan-out-on-write', 'hot-key', 'sharding'],
  'gc-storm': ['gc-pause'],
  region: ['geodns'],
  config: ['blast-radius', 'drift'],
  spike: ['littles-law', 'thundering-herd'],
  leak: ['memory-leak', 'shared-nothing'],
  'gpu-shortage': ['model-inference', 'spot-instance'],
  'dr-drill': ['point-in-time-recovery', 'rpo-and-rto'],
  'bot-surge': ['rate-limiting', 'waf-web-application-firewall'],
  audit: ['soc-2'],
  certificate: ['tls-certificate'],
}

const ALWAYS = ['apdex', 'utilization', 'diurnal-traffic']
const BY_STATE = [
  'mttr',
  'strangler-pattern',
  'tech-debt',
  'brookss-law',
  'conways-law',
  'rule-of-40',
  'token-bucket',
]

/** Every id discovery can name, for the test that keeps them glossary ids. */
export const DISCOVERABLE: ReadonlyArray<string> = [
  ...ALWAYS,
  ...BY_STATE,
  ...[BY_COMPONENT, BY_RESEARCH, BY_INCIDENT].flatMap((map) =>
    Object.values(map).flatMap((ids) => ids ?? []),
  ),
]

/** Glossary ids the Company meets in this moment: what it runs, owns, and just went through. */
export const discoverTerms = (
  game: Game,
  events: ReadonlyArray<StepEvent>,
): ReadonlyArray<string> => {
  if (game.sandbox) return []
  const found = new Set<string>(ALWAYS)
  for (const node of game.nodes) for (const id of BY_COMPONENT[node.type] ?? []) found.add(id)
  for (const id of game.researched) for (const term of BY_RESEARCH[id] ?? []) found.add(term)
  for (const event of events) {
    if (event._tag === 'IncidentStarted')
      for (const term of BY_INCIDENT[event.incident.kind] ?? []) found.add(term)
    if (event._tag === 'IncidentResolved') {
      found.add('mttr')
      found.add('mttd-and-mtta')
    }
    if (event._tag === 'MigrationShifted') found.add('strangler-pattern')
    if (event._tag === 'CreditsExhausted') found.add('token-bucket')
  }
  if (game.services.some((service) => service.debt >= 0.25)) found.add('tech-debt')
  if (game.engineers.length >= 8) found.add('brookss-law')
  if (game.teams.length > 1) found.add('conways-law')
  if (game.quarter) found.add('rule-of-40')
  if (game.nodes.some((node) => node.draining)) found.add('node-drain')
  return [...found]
}
