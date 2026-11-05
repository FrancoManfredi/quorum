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
export const GOLDEN_HASH = '4ee502da'

/**
 * The hash of the Game each Challenge's reference solution ends on
 * (`fixtures/challenges.ts`). Node, the browsers and workerd must agree.
 */
export const REFERENCE_HASHES: Readonly<Record<string, string>> = {
  'hello-world': '696483b0',
  'split-the-box': '9607e4ef',
  slashdotted: '5ce28a5f',
  c10k: 'fda4ebf1',
  'event-loop': '354877a6',
  'too-many-connections': '1f16a372',
  shoestring: 'e3820a62',
  'n-plus-one': '1da244b7',
  'thirteen-engineers': 'f1905462',
  'credential-stuffing': 'a099500d',
  'black-friday': 'f1d05f0c',
  'us-east-1': '18624689',
  'exactly-once': '54bf5988',
  'two-million-sockets': '2461aa1d',
  'pokemon-go': '56f20dfc',
  'healthcare-launch': '6573b38b',
  'thundering-herd': 'c2ef2e08',
  'read-states': '4375d63c',
  'fail-whale': 'd5587558',
  'reports-at-noon': '46c4cdf0',
  'gpu-economics': '781b8b1e',
  metastable: 'd5e71f8c',
  'regex-of-doom': '7a64a5c5',
  'forty-three-seconds': '078f151c',
  'follow-the-sun': '82f3655f',
  celebrity: 'd3e06ba5',
  'gone-from-the-internet': 'b658a1b3',
  'the-typo': '8e268aeb',
  'leap-second': '316e7e05',
  'rule-of-40': '9c974cba',
  'postgres-for-everything': '766a4e4d',
  'five-nines': '629666e9',
}
