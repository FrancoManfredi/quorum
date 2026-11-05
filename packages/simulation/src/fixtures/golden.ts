import { preseedGame } from '../company.ts'
import type { Game } from '../state.ts'
import { step } from '../step.ts'

/** Sim seconds in one golden Step. */
export const GOLDEN_STEP = 0.25

/** The golden Company: the Pre-seed start with seed 1, so incidents fire and roll. */
export const goldenGame = (): Game => preseedGame(1)

/** Runs a Game for `steps` golden Steps with no player actions. */
export const replay = (game: Game, steps: number): Game => {
  let current = game
  for (let index = 0; index < steps; index += 1) current = step(current, GOLDEN_STEP).game
  return current
}

export const GOLDEN_STEPS = 10_000
// SIM_VERSION 2 (M4): the founder now builds Features with Dev Hours and each
// deploy rolls for a bad deploy, so the Pre-seed replay's demand and seed move.
// SIM_VERSION 3 (M5 Seed): the save gains Queue depth, Cache, Queue and WAF
// options, and stored GB. The Pre-seed replay's values are unchanged; the
// encoded Game carries the new fields, so its hash moves.
// SIM_VERSION 4 (M5 Series A): the save gains each Node's zone, standby, copies
// and Autoscaler settings, the incident's zone, and the error budget. The
// Pre-seed replay's values are unchanged; the encoded Game carries the new
// fields, so its hash moves.
// SIM_VERSION 5 (M5 Series B): the save gains each Node's GPU type, collector,
// GOGC, load shedding and read-your-writes, and each Link's breaker, open time
// and failure share. The Pre-seed replay's values are unchanged; the encoded
// Game carries the new fields, so its hash moves.
// SIM_VERSION 6 (M6): the save gains each Node's region, quorum settings, lost
// replica, spread, backups, fan-out and key splitting, the incident's region,
// users in each SLO hour, the DR drill and the Public quarter. The replay's values
// are unchanged again; only the new fields move the hash.
// SIM_VERSION 7 (M7): the save gains the founding (Venture, Mutators, perks),
// banked Legacy, peak users, and the wall clock of the last save. The replay's
// values are unchanged: with the new fields removed it still hashes to aed6bacd.
// SIM_VERSION 8: one Dev Hour is one engineer-hour, made 8 per calendar day on
// the Team's calendar, and Features have real sizes and requirements, so the
// founder's backlog builds at a new pace.
// SIM_VERSION 9: prices follow real list prices, requests earn half as much, and
// the cost and salary index rise from Seed (16 "Cost index").
// SIM_VERSION 10: Insight has a pool per request kind and a Failure pool, grows
// with the square root of samples per Component type, and research runs as
// Studies that take Insight over time; sampling adds CPU and latency.
// SIM_VERSION 11: a CVE is disclosed every few minutes as a patch ticket with a
// deadline; an overdue one is exploited and starts a Data breach. The save gains
// the disclosed CVEs, and a backlog item gains its deadline.
// SIM_VERSION 12: Split the Box asks for p99 under 300 ms, and the daily drill's
// boards serve their users until the incident. The Company replay is unchanged.
// SIM_VERSION 13: all 32 Challenges. A Challenge board can set its request mix,
// what each kind earns, regional daily cycles, and fixes paid in Dev Hours; a run
// takes incident responses, and a coarse Step runs second by second while
// something fails. A Tomcat box holding realtime connections refuses work at its
// RAM instead of swapping, and a store spread across regions survives a zone.
// The Company replay is unchanged.
// SIM_VERSION 14: async work is scored on when it finishes, a Queue has a max
// length and max attempts, a Worker prefetches and runs its own Queue's task mix,
// a full backlog is offered only as fast as Workers take it, and Kubernetes
// Clusters cost Dev Hours, roll deploys, reschedule pods and need upgrades. The
// save gains each Node's attempts, max length, prefetch and upgrade time, and each
// team's kind.
// SIM_VERSION 15: from Series C each region counts its own Users, grows and
// churns on its own users' Apdex, word of mouth crosses borders, and the raise
// into Series C keeps every user at home with a seed abroad. Half of new users
// are fickle and half steady; steady users leave at a fifth of the rate. The
// save gains each region's share of the users, its steady share, and its Apdex.
// SIM_VERSION 17: a Node's lifecycle is one tagged state (`life`) instead of the
// `down`, `warm` and `downCause` fields. Old saves derive it when they decode.
// SIM_VERSION 18: the save gains each Node's pricing model and the sim time a
// reserved term ends. The replay's values are unchanged; the encoded Game carries
// the new fields, so its hash and every Challenge's move.
// SIM_VERSION 19: the API Gateway is a Component, and the save gains each Node's
// rate limit. A Gateway throttles past its limit and bills per request on a new
// Requests line of the cloud bill. The replay's values are unchanged; the new
// field moves the hash.
// SIM_VERSION 20: the Realtime Hub is a Component, and the save gains each Node's
// Presence, reconnect backoff and Clustering. A Hub holds a connection for every
// realtime message instead of serving it as a request, and a revenue multiplier
// now reaches the user through every hop it answers behind. The replay's values
// are unchanged; the new fields move the hash.
// SIM_VERSION 21: the CI/CD Pipeline is a Component, and the save gains each Node's
// deploy strategy (Recreate, Rolling, Blue-green or Canary). A Pipeline sets how long
// a deploy takes, what it burns, and the ceiling on a bad deploy's blast radius. The
// replay's values are unchanged; the new field moves the hash.
// SIM_VERSION 22: the data tier gains its options. A Database has an engine (Postgres
// or MySQL), a volume (general purpose or provisioned IOPS) and shards; Object Storage
// has a class. Writes wait on the volume's IOPS, MySQL holds more connections, shards
// divide the writes, and an archive-class read fails. The replay's values move where a
// volume or a shard count binds; the new fields move every hash either way.
// SIM_VERSION 23: the achievements with no detector get their mechanic. Four incident
// kinds land (stale reads, reconnect storm, runaway bill, MTU mismatch), a BEAM App
// Server counts the process crashes its supervisor absorbs, and a postmortem records
// when the Design ended an incident on its own. The save gains each Node's crash count,
// the optional postmortem marker, and the Founder's fallacies met, so every hash moves.
// The rest of the data tier lands under the same version: a Database's retention policy and
// the rows every write adds, statement pooling, the Cache's four strategies, the Search
// Engine's refresh interval, a broken backup and its restore drill, and Object Storage's
// lifecycle rules. The save gains each Node's policy, strategy, refresh and restore state,
// and the Game's rows and upload rate.
// SIM_VERSION 24: the older Ventures get the signature incidents 13 names for them, and Ad tech
// gets the bid kind the design gives numbers for. A hot shard costs its Database more CPU per
// query, a premiere, a launch day and a flash sale lift one request kind, the bid request joins
// every mix from Series A, and Blue-green and Canary deploys now need their own research.
// SIM_VERSION 25: running out of Cash has a rule (09). The save gains each Node's
// `shut` flag and the Company's open bridge offer and whether one was offered.
// The golden replay never runs short, so its values are unchanged; the new
// fields move every hash.
// SIM_VERSION 26: the Dashboard draws Cash over time and the Incident history on
// a time axis (12, 15). Every Sample gains `cash` and every Postmortem `endedAt`,
// so the encoded Game carries them and every hash moves; the replay's values are
// unchanged.
// SIM_VERSION 27: the Serverless Function and the Edge Function are Components, and
// the Serverless and Edge compute research unlock them. Neither adds a field to the
// save, so the replay and every reference hash are unchanged; the catalog and the
// solver both move, so the version does.
// SIM_VERSION 28: the Document Store, the Vector Index and the Event Stream are Components,
// unlocked by Document databases, Embeddings and Event streaming. The save gains each Node's
// multi-document transactions, its index type, and its partitions, acknowledgements, retention
// window and partition key, so every hash moves. Three rules move the replay's values too: a
// Python `ai` answer keeps its ML ecosystem bonus only with a Vector Index in the path (06), a
// Feature on a Design with a Document Store costs its access pattern in Dev Hours (07), and the
// Catalog gains three research items, which shifts the Insight every Company earns toward them.
// SIM_VERSION 29: the last four Components land. The CDC Connector copies a Database's writes to an
// Event Stream; the Service Mesh retries, breaks and watches every Link out of its members, adds a
// millisecond a hop, takes 5% of their CPU and their Burn, and takes Platform Dev Hours; Feature
// Flags roll a Feature out per Feature, which caps a bad deploy's blast radius; and Secrets and
// Certificates renew the TLS certificate, which now runs out on the calendar when none is live. The
// save gains the Service's rollouts and the Company's certificate, so every hash moves; three
// sequences move too: a CDC Connector's feed into a stream, a mesh's place in a Design, and the
// certificate's clock, plus four research items that shift what a Company earns toward them.
// SIM_VERSION 31 (the incident loop): an Incident records the second its first signal landed and the
// second it was acknowledged, so a Postmortem gains `mttd` and `mtta`, an Incident `signalAt` and
// `ackAt`, every Node the `draining` window, and the Game the kinds it has handled by hand and the
// runbooks written. Four research items (On-call, Runbooks, SRE team, Enterprise sales) join the
// catalog, an SRE team runs every incident 40% shorter and halves an open action item's weight, a
// drained Node leaves the routing, and an SLA pays credits when its week is missed. The replay's
// values are unchanged; the new fields and the shift in what a Company earns toward move every hash.
// SIM_VERSION 30 (Services and Ownership): a Service carries its Features, the team that owns it,
// and the Database it reads. A bad deploy fails only the Service that shipped it and names that
// Service in its incident and postmortem, a team works the backlog of the Service it owns, and two
// Services on one Database keep half the coordination penalty again. The save gains each Service's
// owner, Features and datastore, the incident's and postmortem's Service, a backlog item's Service,
// and the split work kind, so every hash moves. One research item (Service boundaries) shifts what
// a Company earns toward it.
// SIM_VERSION 33 (Team, upkeep, adoption and the Mail the design waits on): a live Feature takes a
// share of its Team's Dev Hours as upkeep, a backlog item can wait on a decision, an index, a copy
// or a hire until the player approves it, an engineer carries a mood, a page count and a salary and
// can burn out, a CVE's patch is proposed by the Service's owner, and a shipped Feature reaches its
// effects as users adopt it, with A/B testing to measure the lift. The save gains a Feature's
// adoption, its A/B samples, an engineer's pay, mood, pages and time off, and an item's block, owner
// and answer. Five research items join the catalog (A/B testing, Hiring pipeline, Trunk-based
// development, Platform team, Data team), which shifts what a Company earns toward them, and the
// Platform team now needs its research.
// SIM_VERSION 32 (the six kinds and cascades): the six incident kinds 11's catalog names by hand land —
// JVM warmup under load, schema migration lock, supply-chain compromise, accidental delete, operator typo,
// and leap second or clock skew — each with its Era, severity, duration, effect, mitigation and action
// item. An incident nobody answers can start a second one from Series A, so an Incident and a Postmortem
// gain `causedBy`; an Incident may also have no second severity. Two research items join the catalog
// (Online schema migrations, Leap smearing), which shifts what a Company earns toward them.
// SIM_VERSION 34 (the research close-out): the eight Infrastructure options (the L4 Load Balancer,
// the Gateway's token bucket, Edge-side includes, Bot management, Scheduled scaling, the ARM family,
// quantization and continuous batching), the four Reliability mechanics (bulkheads, graceful
// degradation, hedged requests, chaos engineering), the three Performance mechanics (denormalization,
// materialized views, binary RPC) and the two Data mechanics (the outbox, expand and contract) land.
// The save gains each Node's Load Balancer variant, Gateway burst, GPU precision and batch, degrade,
// schedule and materialized flags, each Link's bulkhead and hedge, and the Company's chaos switch and
// weakest Node, so every hash moves. Four rules move the replay's values too: every backend call now
// costs its caller a serialization's CPU, a Pre-seed Search Engine answers 2% of its answers stale
// from a dual write, an ARM box runs at 0.95× the CPU, and 17 research items shift what a Company
// earns toward them.
// SIM_VERSION 36 (the rebase onto main: outcomes, per-service deploys, Security team): the hashes move again.
// SIM_VERSION 35 (the research close-out, part two): the last eleven research items land —
// `profiling` (names each Node's limiting resource, with `tracing`'s breadth rule at 4 Component
// types), `tail-sampling` (×2 Failure Insight), `rum` (a device split added to every Sample, and a
// stylized device latency), `anomaly-detection` (a shorter alert hold, and a forecast peak from
// the diurnal cycle), `credential-protection` (softens the Credential stuffing incident and its
// bot burst), `pen-testing` (opens an action item for the Design's weakest incident kind once a
// calendar week), `rightsizing` (a client-side peak-utilization marker, no save change),
// `egress-optimization` (an R2-priced share of `upload` and `media` egress at $0),
// `unit-economics` and `cost-allocation` (Burn split by request kind and by Service, Ledger-only),
// and `savings-plans` (20% off every compute Node's box, stacked on its pricing model). The save
// gains each Sample's device latency, so every hash moves even where a Company owns none of them.
export const GOLDEN_HASH = '4c02ffd2'

/**
 * The hash of the Game each Challenge's reference solution ends on
 * (`fixtures/challenges.ts`). Node, the browsers and workerd must agree.
 */
export const REFERENCE_HASHES: Readonly<Record<string, string>> = {
  'hello-world': '8814dcba',
  'split-the-box': 'cdfa00f1',
  slashdotted: '7a0f4c07',
  c10k: '13c3c42d',
  'event-loop': '128f68e8',
  'too-many-connections': '7a9ffbfd',
  shoestring: '92e90201',
  'n-plus-one': '9f5d9424',
  'thirteen-engineers': '9a6ffed1',
  'credential-stuffing': 'cf6869c8',
  'black-friday': '64a0c52e',
  'us-east-1': '762c834e',
  'exactly-once': '4f40e61d',
  'two-million-sockets': 'd97b06dd',
  'pokemon-go': 'a568aefa',
  'healthcare-launch': '48bfbfed',
  'thundering-herd': '748ec338',
  'read-states': 'ed50ae09',
  'fail-whale': '503d290c',
  'reports-at-noon': 'a1e09ac3',
  'gpu-economics': '7697d866',
  metastable: '474b39c5',
  'regex-of-doom': 'dc0cf037',
  'forty-three-seconds': 'b191e439',
  'follow-the-sun': '130ecbdf',
  celebrity: 'f646bfb9',
  'gone-from-the-internet': '2a167c9c',
  'the-typo': '8563380e',
  'leap-second': 'dc7ef138',
  'rule-of-40': '3f265ad0',
  'postgres-for-everything': '93ba9db1',
  'five-nines': 'c0360188',
}
