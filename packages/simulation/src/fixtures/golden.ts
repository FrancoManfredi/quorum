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
export const GOLDEN_HASH = '6f8916b2'

/**
 * The hash of the Game each Challenge's reference solution ends on
 * (`fixtures/challenges.ts`). Node, the browsers and workerd must agree.
 */
export const REFERENCE_HASHES: Readonly<Record<string, string>> = {
  'hello-world': '04c023c9',
  'split-the-box': '2e4e1ab2',
  slashdotted: '0c965be1',
  c10k: 'abaed902',
  'event-loop': 'c0c0d5d4',
  'too-many-connections': 'ba236265',
  shoestring: '00db3225',
  'n-plus-one': '0041d59f',
  'thirteen-engineers': '0ace9ac6',
  'credential-stuffing': 'e8d3ef66',
  'black-friday': '3e1adf23',
  'us-east-1': '0e97d9c2',
  'exactly-once': '8ff0ea96',
  'two-million-sockets': '163d63e9',
  'pokemon-go': 'e253a2ea',
  'healthcare-launch': 'fcc62df2',
  'thundering-herd': 'dde35242',
  'read-states': '9ecbcd05',
  'fail-whale': '1696105c',
  'reports-at-noon': 'fb256e01',
  'gpu-economics': '03f8b705',
  metastable: '8981edb9',
  'regex-of-doom': 'c9e7dd54',
  'forty-three-seconds': '955cbca3',
  'follow-the-sun': '4e8c026b',
  celebrity: 'f5827f14',
  'gone-from-the-internet': 'e8fd7ba5',
  'the-typo': '45156a96',
  'leap-second': '04cb445e',
  'rule-of-40': '5b9f5ac8',
  'postgres-for-everything': '51ba517f',
  'five-nines': '11a48362',
}
