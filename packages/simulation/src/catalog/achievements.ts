/* Achievements (14 "Achievements"): knowledge, unusual builds, and real engineering moments, never hours played. */

import type { MutatorId, VentureId } from './ventures.ts'

export const ACHIEVEMENT_IDS = [
  'hello-world',
  'works-on-my-machine',
  'split-brain',
  'averages-lie',
  'shared-nothing',
  'blocked',
  'off-by-one-region',
  'littles-law',
  'metastable',
  'big-rewrite',
  'strangler',
  'quorum',
  'eventually',
  'polyglot',
  'zero-gc',
  'no-cache',
  'celebrity',
  'follow-the-sun',
  'postgres-for-everything',
  'hug-of-death',
  'egress-shock',
  'chaos-monkey',
  'blameless',
  'nines',
  'five-nines',
  'monoglot',
  'default-alive',
  'unicorn',
  'decacorn',
  'everyone-online',
  'warm-start',
  'rule-of-40',
  'beat-and-raise',
  'serial-founder',
  'histogram',
  'pareto',
  'two-hard-things',
  'conways-law',
  'fallacies',
  'thundering-herd',
  'runbook',
  'finops',
  'spot-the-difference',
  'let-it-crash',
] as const
export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export type AchievementDef = Readonly<{
  id: AchievementId
  name: string
  condition: string
  unlocks?: Readonly<{ venture?: VentureId; mutator?: MutatorId }>
}>

const achievement = (def: AchievementDef): AchievementDef => def

export const ACHIEVEMENTS: Record<AchievementId, AchievementDef> = {
  'hello-world': achievement({
    id: 'hello-world',
    name: 'Hello, World',
    condition: 'Serve the first request',
  }),
  'works-on-my-machine': achievement({
    id: 'works-on-my-machine',
    name: 'It Works on My Machine',
    condition: 'Ship a bad deploy',
  }),
  'split-brain': achievement({
    id: 'split-brain',
    name: 'Split Brain',
    condition: 'Split the database onto its own Node',
  }),
  'averages-lie': achievement({
    id: 'averages-lie',
    name: 'Averages Lie',
    condition: 'Research percentiles while p99 is more than 5× the mean',
  }),
  'shared-nothing': achievement({
    id: 'shared-nothing',
    name: 'Shared Nothing',
    condition: 'Reach Seed with only PHP-FPM servers and no memory incident',
  }),
  blocked: achievement({
    id: 'blocked',
    name: 'Blocked',
    condition: 'Have a Node.js service whose p99 rises by 100 ms from one kind',
  }),
  'off-by-one-region': achievement({
    id: 'off-by-one-region',
    name: 'Off by One Region',
    condition: 'Serve a user from a region more than 150 ms away',
  }),
  'littles-law': achievement({
    id: 'littles-law',
    name: "Little's Law",
    condition: 'Fix an app server bottleneck by fixing the database',
  }),
  metastable: achievement({
    id: 'metastable',
    name: 'Metastable',
    condition: 'Recover from a retry storm',
  }),
  'big-rewrite': achievement({
    id: 'big-rewrite',
    name: 'Big Rewrite',
    condition: 'Migrate every service to a new language in one company',
  }),
  strangler: achievement({
    id: 'strangler',
    name: 'Strangler',
    condition: 'Finish a migration in four traffic steps with errors under 1%',
  }),
  quorum: achievement({
    id: 'quorum',
    name: 'Quorum',
    condition: 'Run a wide-column store with R + W > N across three regions',
  }),
  eventually: achievement({
    id: 'eventually',
    name: 'Eventually',
    condition: 'Run R = 1, W = 1 at a billion users',
  }),
  polyglot: achievement({
    id: 'polyglot',
    name: 'Polyglot',
    condition: 'Run five languages in production at once',
  }),
  'zero-gc': achievement({
    id: 'zero-gc',
    name: 'Zero GC',
    condition: 'Run a Rust service at 100,000 rps',
  }),
  'no-cache': achievement({
    id: 'no-cache',
    name: 'No Cache',
    condition: 'Reach Series A with no Cache and no CDN',
    unlocks: { mutator: 'no-caches' },
  }),
  celebrity: achievement({
    id: 'celebrity',
    name: 'Celebrity',
    condition: 'Serve a 10-million-follower post with no hot key errors',
  }),
  'follow-the-sun': achievement({
    id: 'follow-the-sun',
    name: 'Follow the Sun',
    condition: 'Serve four regions with no Node above 70% at its local peak',
  }),
  'postgres-for-everything': achievement({
    id: 'postgres-for-everything',
    name: 'Postgres for Everything',
    condition: 'Reach Series B with only Postgres data Components',
    unlocks: { mutator: 'postgres' },
  }),
  'hug-of-death': achievement({
    id: 'hug-of-death',
    name: 'Hug of Death',
    condition: 'Survive a ×10 spike with no lost users',
    unlocks: { mutator: 'hn-front-page' },
  }),
  'egress-shock': achievement({
    id: 'egress-shock',
    name: 'Egress Shock',
    condition: 'Have egress be the largest line on the bill',
  }),
  'chaos-monkey': achievement({
    id: 'chaos-monkey',
    name: 'Chaos Monkey',
    condition: 'Survive 100 random terminations',
    unlocks: { mutator: 'chaos-monkey' },
  }),
  blameless: achievement({
    id: 'blameless',
    name: 'Blameless',
    condition: 'Write 50 postmortems',
  }),
  nines: achievement({
    id: 'nines',
    name: 'Nines',
    condition: 'Hold 99.99% for a calendar week',
    unlocks: { mutator: 'strict-slo' },
  }),
  'five-nines': achievement({
    id: 'five-nines',
    name: 'Five Nines',
    condition: 'Complete the Five Nines Challenge',
  }),
  monoglot: achievement({
    id: 'monoglot',
    name: 'Monoglot',
    condition: 'Reach IPO with one language',
    unlocks: { mutator: 'single-language' },
  }),
  'default-alive': achievement({
    id: 'default-alive',
    name: 'Default Alive',
    condition: 'Reach IPO without raising any round',
    unlocks: { venture: 'bootstrapped' },
  }),
  unicorn: achievement({
    id: 'unicorn',
    name: 'Unicorn',
    condition: 'Reach a $1 billion valuation',
  }),
  decacorn: achievement({
    id: 'decacorn',
    name: 'Decacorn',
    condition: 'Reach a $10 billion valuation',
  }),
  'everyone-online': achievement({
    id: 'everyone-online',
    name: 'Everyone Online',
    condition: 'Reach 6 billion users',
  }),
  'warm-start': achievement({
    id: 'warm-start',
    name: 'Warm Start',
    condition: 'Scale a JVM service during a spike with no p99 regression',
  }),
  'rule-of-40': achievement({
    id: 'rule-of-40',
    name: 'Rule of 40',
    condition: 'Reach a Rule of 40 score of 80 as a public company',
  }),
  'beat-and-raise': achievement({
    id: 'beat-and-raise',
    name: 'Beat and Raise',
    condition: 'Beat guidance eight quarters in a row',
  }),
  'serial-founder': achievement({
    id: 'serial-founder',
    name: 'Serial Founder',
    condition: 'Exit with every Venture',
  }),
  histogram: achievement({
    id: 'histogram',
    name: 'Histogram',
    condition: 'Reach the 90th percentile on any axis of any Challenge',
  }),
  pareto: achievement({
    id: 'pareto',
    name: 'Pareto',
    condition: 'Reach the 70th percentile on all three axes of one Challenge',
  }),
  'two-hard-things': achievement({
    id: 'two-hard-things',
    name: 'Two Hard Things',
    condition: 'Have a stale-read incident on a cache',
  }),
  'conways-law': achievement({
    id: 'conways-law',
    name: "Conway's Law",
    condition: 'Have more teams than Services, then fix it',
  }),
  fallacies: achievement({
    id: 'fallacies',
    name: 'Fallacies',
    condition: 'Experience all eight fallacies of distributed computing in incidents',
  }),
  'thundering-herd': achievement({
    id: 'thundering-herd',
    name: 'Thundering Herd',
    condition: 'Survive a reconnect storm with no errors',
  }),
  runbook: achievement({
    id: 'runbook',
    name: 'Runbook',
    condition: 'Have an incident resolve with no player action',
  }),
  finops: achievement({
    id: 'finops',
    name: 'FinOps',
    condition: 'Run a fleet with reserved, on-demand, and spot Nodes at once',
  }),
  'spot-the-difference': achievement({
    id: 'spot-the-difference',
    name: 'Spot the Difference',
    condition: 'Survive a spot reclaim with no errors',
  }),
  'let-it-crash': achievement({
    id: 'let-it-crash',
    name: 'Let It Crash',
    condition: 'Have an Elixir service survive 1,000 crashes with no failed requests',
  }),
}

/** Mutators no achievement in 14 unlocks: the first Exit opens them. */
export const EXIT_MUTATORS: ReadonlyArray<MutatorId> = [
  'legacy-monolith',
  'one-region',
  'tight-budget',
]
