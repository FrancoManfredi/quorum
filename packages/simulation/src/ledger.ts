import type { Limit, Receipt, Resources, WorkUnit } from './capacity.ts'
import type { DeviceId, InsightPool, Kind, RegionId, RequestKind } from './catalog.ts'
import type { ErrorCause, Failures } from './distribution.ts'

/* ==========================================================================
   The Ledger: every figure the Simulation derives at a Step. It is the single
   source of truth for every number the game shows, and it is never saved.
   ========================================================================== */

export type NodeStatus = 'idle' | 'ok' | 'warn' | 'danger' | 'down'

/** The cloud bill by line (09 "The cloud bill"), in dollars per second. */
export type BurnLines = Readonly<{
  compute: number
  /** Data Nodes, without the GB they store. */
  data: number
  /** GB stored, priced per GB per second. */
  storage: number
  /** Egress to the internet, from the origin and the CDN. */
  egress: number
  /** Payment Provider fees, scans, tokens, and push messages. */
  thirdParty: number
  /** API Gateway requests, priced per request served. */
  requests: number
  observability: number
  salaries: number
}>

export type NodeLedger = Readonly<{
  inbound: number
  /** Offered arrivals per second by operation, before drops; sums to inbound. */
  traffic: Readonly<Partial<Record<Kind, number>>>
  /** Requests per second of the current mix the Node could take. */
  capacity: number
  utilization: number
  limit: Limit
  /** Mean milliseconds this Node adds to a request. */
  latency: number
  /** 99th percentile of the milliseconds this Node adds, for its busiest kind. */
  p99: number
  /**
   * Milliseconds this Node adds to a request of each kind that passes through it: the
   * waterfall's per-hop time, split by kind instead of blended into `latency` (12 "The
   * visibility ladder", `tracing`).
   */
  hopByKind: Readonly<Partial<Record<Kind, number>>>
  /**
   * Seconds a request of each kind waits at this Node before it is worked: `age` attributed to
   * the kinds that pass through this Queue, 0 for every other Node (12 "The visibility ladder",
   * `tracing`).
   */
  waitByKind: Readonly<Partial<Record<Kind, number>>>
  /**
   * Each kind's share of the work at the resource that limits this Node, which can differ from
   * its share of `traffic`: a rare report can take most of a Database's CPU (12 "Load diagnosis").
   */
  workShare: Readonly<Partial<Record<Kind, number>>>
  /** The resource `workShare` and `cost` count, or null where every request costs the same. */
  workUnit: WorkUnit | null
  /**
   * Mean work one request takes from the limiting resource, in its unit: utilization is
   * `inbound × cost` over the resource's size, which is how Load change splits a change.
   */
  cost: number
  /** Each kind's Cost receipt, on App Servers, Workers, Databases, and Read Replicas. */
  receipts: Readonly<Partial<Record<Kind, Receipt>>>
  /** Requests per second of `inbound` that are retries or hedged copies of a call. */
  repeated: number
  /** Requests per second of `inbound` that each Users' Request kind causes, across every hop. */
  origins: Readonly<Partial<Record<RequestKind, number>>>
  /** Requests per second dropped for lack of capacity. */
  dropped: number
  /** Queries per second refused for lack of connections. */
  refused: number
  /** Requests per second that leave with nowhere to go, and their kinds. */
  stranded: number
  strandedKinds: ReadonlyArray<Kind>
  /** Database connections in use, and the limit. */
  connections: Readonly<{ used: number; max: number }> | null
  hitRatio: number | null
  /** Keys per second a Cache evicts to make room for its refills; null for any other Node. */
  evictions: number | null
  /** Seconds a new task waits in this Queue before a Worker takes it; infinite with none draining. */
  age: number | null
  /** Milliseconds a replica lags behind the primary. */
  lagMs: number | null
  /** The working set does not fit in RAM. */
  disk: boolean
  /** Requests per second sent on, by kind. */
  out: Readonly<Partial<Record<Kind, number>>>
  resources: Resources
  throttled: boolean
  swapping: boolean
  status: NodeStatus
}>

export type LinkLedger = Readonly<{
  from: string
  to: string
  rate: number
  /** Operations per second carried, or attributed samples on a tap; sums to rate. */
  traffic: Readonly<Partial<Record<Kind, number>>>
  /** The kind carrying the most traffic, for the particle colour. */
  kind: Kind
  /** The far end fails what this link carries. */
  failing: boolean
  /** Share of calls that fail on a Link that retries or breaks; 0 on others. */
  failure: number
}>

export type KindLedger = Readonly<{
  rate: number
  success: number
  /** Apdex, with the async part also scored on when its result is ready. */
  apdex: number
  /** Apdex of the async part's completion, or null when nothing went through a Queue. */
  completion: number | null
  mean: number
  p50: number
  p95: number
  p99: number
}>

/** What one region's users get for one request kind. */
export type RegionKindLedger = Readonly<{
  /** Requests per second this region's users send. */
  rate: number
  success: number
  /** Apdex of the answered requests, with the users' hop. */
  apdex: number
  /** Apdex the same answers would have with no hop to reach the Design. */
  near: number
  fail: Failures
  /** Milliseconds the users' hop adds to reach the Design. */
  hopMs: number
  p99: number
}>

/**
 * What one Service's code served (12 "Controls"): the request kinds its Features touch, summed.
 * `apdex` and `mean` weigh each kind by the rate it sent and the rate it served.
 */
export type ServiceLedger = Readonly<{
  kinds: ReadonlyArray<RequestKind>
  /** Requests per second users send to the Service's kinds. */
  rate: number
  served: number
  failed: number
  apdex: number
  mean: number
  /** The slowest 99th percentile among its kinds. */
  p99: number
}>

export type Ledger = Readonly<{
  nodes: Readonly<Record<string, NodeLedger>>
  links: ReadonlyArray<LinkLedger>
  kinds: Readonly<Partial<Record<RequestKind, KindLedger>>>
  demand: number
  served: number
  errors: Readonly<Record<ErrorCause, number>>
  errorShare: number
  latency: number
  p50: number
  p95: number
  p99: number
  /** Apdex of all requests; failures count as frustrated. */
  apdex: number
  /** Apdex of each region's users, wherever the Design serves them. */
  regions: Readonly<Partial<Record<RegionId, number>>>
  /**
   * Mean milliseconds a request takes from each device's side: `latency` plus that device's own
   * radio round trip, on top of whatever region hop already applies (12 "The visibility ladder",
   * `rum`).
   */
  deviceLatency: Readonly<Record<DeviceId, number>>
  /** What each region's users get for each scored request kind (12 "The Churn breakdown"). */
  regionKinds: Readonly<
    Partial<Record<RegionId, Readonly<Partial<Record<RequestKind, RegionKindLedger>>>>>
  >
  revenue: number
  /** Dollars per second from paid plans, included in `revenue`. */
  subscriptions: number
  /** Insight per second, by pool (12 "Earning Insight"). */
  insight: Readonly<Record<InsightPool, number>>
  /** Component types that sample each request kind, for research that needs breadth. */
  breadth: Readonly<Partial<Record<RequestKind, number>>>
  /** Regions that sample each request kind, through an Analytics tap on a Node there. */
  breadthRegions: Readonly<Partial<Record<RequestKind, number>>>
  /** Dollars per second: the cloud bill, plus salaries. */
  burn: number
  /** Dollars per second a Venture's compliance fines cost, on top of `burn` (13 "Ventures"). */
  fines: number
  /** Dollars per second of payroll, included in `burn`. */
  salaries: number
  /** Dollars per second of egress, included in `burn`. */
  egress: number
  /** Dollars per second to third parties (Payment Provider fees, scans, tokens), included in `burn`. */
  fees: number
  /** The same Burn, split by the lines 09 "The cloud bill" lists. Their sum is `burn`. */
  burnLines: BurnLines
  /**
   * Dollars per second each scored request kind earns, from the same formula as `revenue` before
   * subscriptions: `rate × success × apdex × value × result value × feature factor`, and 0 when
   * the mean misses the Venture's deadline. Subscriptions are added to `revenue` separately.
   */
  revenueByKind: Readonly<Partial<Record<RequestKind, number>>>
  /**
   * Dollars per second a Venture's compliance fine costs each money kind, from stale answers only
   * (13 "Ventures"). Their sum is `fines`.
   */
  finesByKind: Readonly<Partial<Record<RequestKind, number>>>
  /**
   * Dollars per served request of each kind: `burn` split across kinds by their share of
   * `demand`, each divided by its own served rate (10 "Track: Cost", `unit-economics`).
   */
  costPerKind: Readonly<Partial<Record<RequestKind, number>>>
  /**
   * Dollars per second of `burn` attributed to each Service, by its share of `demand` across the
   * kinds its Features touch (10 "Track: Cost", `cost-allocation`). The starting Service, which
   * carries every kind no other Service's Features touch, takes the rest.
   */
  costPerService: Readonly<Partial<Record<string, number>>>
  /** What each Service served, by its id (12 "Controls"). */
  services: Readonly<Record<string, ServiceLedger>>
  /** Most users the market holds: the Era's, grown by Features. */
  market: number
  /** Traffic-weighted velocity of the App Servers' Stacks: language × framework. */
  velocity: number
  /** Request kinds that mostly have no route, for hints. */
  failing: ReadonlyArray<RequestKind>
  /**
   * Requests per second at tomorrow's predicted peak: `demand` scaled by the known diurnal
   * cycle's peak-to-now ratio (10 "Track: Observability", `anomaly-detection`). The cycle is
   * deterministic, so this is a projection, not a statistical forecast.
   */
  forecastPeak: number
  /** The Node whose extra capacity would earn the most, if any. */
  bottleneck: string | null
  /**
   * The most utilized Node on each request kind's own path, if any: the waterfall's bottleneck
   * marker per kind, cheaper than `bottleneck`'s re-solve search (12 "The visibility ladder",
   * `tracing`). A kind with no route, or whose busiest Node sits under 60% utilization, has none.
   */
  bottleneckByKind: Readonly<Partial<Record<RequestKind, string>>>
}>
