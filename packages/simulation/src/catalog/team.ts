/* The Team (08): engineers, policies, pay, deploys, and migrations. */

/** Sim seconds in a calendar day: one sim second is one calendar minute. */
export const CALENDAR_DAY = 1_440

/** Dev Hours one engineer makes in a calendar day: one per hour of an 8-hour workday (08). */
export const DEV_HOURS_PER_DAY = 8

/** The founder produces this share of an engineer's Dev Hours: they also run the company. */
export const FOUNDER_OUTPUT = 0.8

export const POLICY_IDS = ['move-fast', 'balanced', 'quality'] as const
export type PolicyId = (typeof POLICY_IDS)[number]

export type PolicyDef = Readonly<{
  id: PolicyId
  label: string
  velocity: number
  /** Tech debt each shipped Feature adds. */
  debt: number
  /** Multiplies the bad-deploy chance. */
  badDeploy: number
  /** Most deploys in one calendar day. */
  deploysPerDay: number
  /** Share of the team's Dev Hours that pays down debt on its own. */
  paydown: number
}>

export const POLICIES: Record<PolicyId, PolicyDef> = {
  'move-fast': {
    id: 'move-fast',
    label: 'Move fast',
    velocity: 1.3,
    debt: 0.06,
    badDeploy: 1.5,
    deploysPerDay: 16,
    paydown: 0,
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    velocity: 1,
    debt: 0.03,
    badDeploy: 1,
    deploysPerDay: 8,
    paydown: 0,
  },
  quality: {
    id: 'quality',
    label: 'Quality',
    velocity: 0.8,
    debt: 0.01,
    badDeploy: 0.5,
    deploysPerDay: 4,
    paydown: 0.1,
  },
}

/** Calendar days before a new policy takes over from the old one. */
export const POLICY_SWITCH_DAYS = 1

/* ---------- hiring and pay ---------- */

/** Dollars per second per engineer at salary index 1 (09 "Base prices"). */
export const SALARY_BASE = 0.4
/** Cash to sign an engineer in the Pre-seed Era, before the language's salary factor. */
export const SIGNING_BASE = 2_000
/** Calendar days to hire, before the language's time-to-hire factor. */
export const HIRE_DAYS = 1
/** A new hire produces this share for their first calendar week. */
export const RAMP_OUTPUT = 0.3
export const RAMP_DAYS = 7
/** A layoff costs the rest of the team this share of its velocity for a calendar week. */
export const LAYOFF_MORALE = 0.9
export const MORALE_DAYS = 7

/** Coordination (08): n / (1 + k(n − 1) + βn(n − 1)). */
export const COORDINATION = 0.08
/** A structured framework lowers k by this factor. */
export const STRUCTURED_COORDINATION = 0.7
export const RETROGRADE = 0.0004

/* ---------- codebases and tech debt ---------- */

/** Thousands of lines in the first codebase, and per Dev Hour of shipped Features. */
export const START_KLOC = 5
export const KLOC_PER_DH = 0.5
/** Debt a Refactor removes per Dev Hour. */
export const REFACTOR_PER_DH = 0.02
/** Debt a Feature adds to a codebase with no framework. */
export const UNSTRUCTURED_DEBT = 0.01
/** Debt a task adds when it ships during an incident: a hotfix. */
export const HOTFIX_DEBT = 0.02
/** A structured framework grows debt this much slower (06 Symfony). */
export const STRUCTURED_DEBT = 0.7

/* ---------- upkeep (08 "Upkeep") ---------- */

/**
 * What a live Feature costs to keep: `0.4 × S / (S + 2,000) × (1 + debt)`, capped at 0.6, where S
 * is the Dev Hours of the Features shipped on a Service and not yet removed (08 "Upkeep"). The
 * design gives every one of these numbers.
 */
export const UPKEEP_SHARE = 0.4
export const UPKEEP_HALF = 2_000
export const UPKEEP_CEILING = 0.6

/* ---------- outcomes (08 "Outcomes") ---------- */

/**
 * A Feature's outcome, rolled from the Company's seed when it is queued (08 "Outcomes"): the share
 * of its win effect that lands on market, growth, churn, and value. Each band is a third of the
 * roll, and the realized share is uniform across its range. A Feature that only unlocks a kind or
 * meets a requirement always does that: the roll never touches `unlocks`, `load`, `payload`,
 * `queries`, or `shapes`, because "users call the new code whether it helps them or not."
 */
export const OUTCOME_BANDS: ReadonlyArray<Readonly<{ lo: number; hi: number }>> = [
  { lo: 0.6, hi: 1.4 }, // Win
  { lo: -0.1, hi: 0.2 }, // Flat
  { lo: -0.5, hi: -0.1 }, // Loss
]

/**
 * The most the Features' market gains add together (08 "Sizes"): the Era's market at most doubles
 * however many Features ship. Features reach more of the people who could use the product; they
 * cannot create new people.
 */
export const MARKET_GAIN_CAP = 2

/* ---------- adoption and measured lift (08 "Adoption", "Measured lift") ---------- */

/** Calendar days a Feature takes to reach about 63% of its effect. */
export const ADOPTION_DAYS = 7
/** The spread of a relative effect, for the confidence interval (08 "Measured lift"). */
export const LIFT_SPREAD = 1
/** 95% confidence: the z-score the interval uses. */
export const LIFT_CONFIDENCE = 1.96
/** The rollout band that leaves a holdout group to measure against: 5% to 50%. */
export const LIFT_MIN_ROLLOUT = 0.05
export const LIFT_MAX_ROLLOUT = 0.5

/* ---------- blocked work (18 "Teammates") ---------- */

/** Calendar days after which Later brings a block back to the Inbox. Proposed. */
export const BLOCK_REMIND_DAYS = 1
/** A Team this big waits on a hire before it can move: past the coordination table's flat part. Proposed. */
export const BLOCK_HIRE_AT = 8

/* ---------- burnout and quitting (18 "Teammates") ---------- */

/** Where an engineer's mood starts. */
export const MOOD_START = 1
/** Mood at or below this makes an engineer unhappy: they write, and ask to be heard. Proposed. */
export const UNHAPPY_MOOD = 0.35
/** Mood recovered above this, a later slump writes again. Proposed. */
export const CONTENT_MOOD = 0.7
/** Mood a calendar week of a spent error budget costs: 1 at the week, 0 before. Proposed. */
export const FREEZE_MOOD_DAYS = 7
/** Mood each page costs the engineer it wakes. Proposed. */
export const PAGE_MOOD = 0.08
/** Mood a calendar day costs at a full pay gap: paid nothing against the Era's rate. Proposed. */
export const PAY_GAP_MOOD_DAYS = 3
/** Calendar days a spell of time off lasts. Proposed. */
export const TIME_OFF_DAYS = 3

/* ---------- the three Team research effects (10 "Track: Product and business") ---------- */

/** Hiring pipeline: time to hire −30%. */
export const HIRING_PIPELINE = 0.7
/** Trunk-based development: deploy frequency +50%. */
export const TRUNK_FREQUENCY = 1.5
/** A Data team: `report` and `ai` Features cost −30% Dev Hours. */
export const DATA_TEAM_HOURS = 0.7
/** A Data team: a pipeline has half the lag. */
export const DATA_TEAM_LAG = 0.5
/**
 * A Security team (08 "Teams": "Lowers supply-chain and breach incident chances"). It halves the
 * weakness that draws a Supply-chain compromise, same as Dependency scanning research does and
 * stacking with it, and doubles the patch grace before an overdue CVE is exploited into a Data
 * breach, so the player has more time to patch before one starts. Proposed: the design names the
 * effect, not these factors.
 */
export const SECURITY_TEAM_SUPPLY_CHAIN = 0.5
export const SECURITY_TEAM_GRACE = 2

/* ---------- deploys ---------- */

/** Work hours in a calendar day, in minutes: deploys happen in them. */
export const WORK_MINUTES = 480
/** Minutes to deploy by hand, or through a pipeline after Continuous delivery. */
export const MANUAL_DEPLOY_MINUTES = 30
export const CI_DEPLOY_MINUTES = 5
/** Minutes to check a deploy. */
export const VERIFY_MINUTES = 15
/** Bad-deploy chance per deploy, per Era (11 "Bad deploy"). */
export const BAD_DEPLOY_BASE: ReadonlyArray<number> = [0, 0.1, 0.1]
/** Share of requests a bad deploy fails for each item it shipped, and at most. */
export const BAD_DEPLOY_ERRORS = 0.08
export const BAD_DEPLOY_MAX = 0.4
/** Automated tests and code review lower the bad-deploy chance. */
export const TESTS_FACTOR = 0.3
export const CODE_REVIEW_FACTOR = 0.2

/* ---------- migrations (08 "Migrations") ---------- */

/** The strangler steps: the share of traffic on the new Stack. */
export const MIGRATION_STEPS: ReadonlyArray<number> = [0.05, 0.25, 0.5, 1]
/** The share of a migration's Dev Hours each step needs. */
export const MIGRATION_TRANCHES: ReadonlyArray<number> = [0.1, 0.2, 0.3, 0.4]
export const MIGRATION_FACTORS = { variant: 0.1, framework: 0.5, language: 1, split: 0.3 } as const
/** Requests on a new Stack fail this often until its bugs are fixed. */
export const MIGRATION_BUGS = 0.03
/** Fixing a step's bugs costs this share of its tranche, and at least 1 DH. */
export const FIX_BUGS_SHARE = 0.25
/** Features on a migrating service build at this speed. */
export const MIGRATION_FEATURE_SPEED = 0.5

/**
 * Services that share one Database keep this share of the coordination penalty on top of their
 * own, because a schema change still needs every team's agreement (08 "Shared database penalty").
 */
export const SHARED_DB_COORDINATION = 0.5

/* ---------- engineering tasks and moves (08 "Engineering tasks", "Migrations") ---------- */

/** Seconds before a Link the Add timeouts and retries task touches gives up. Proposed. */
export const TASK_LINK_TIMEOUT = 5

/** A Load test shows every Node at this multiple of the demand it has now (08 "Engineering tasks"). */
export const LOAD_TEST_DEMAND = 2
/** Calendar days a Load test's readout lasts. */
export const LOAD_TEST_DAYS = 1

/** Dev Hours to move auth in-house from an Auth Provider, whatever the codebase (08 "Migrations"). */
export const AUTH_MOVE_DH = 120
/** A Database engine change costs this share of the codebase in Dev Hours (08 "Migrations"). */
export const ENGINE_FACTOR = 0.8
/** Calendar minutes the data copy of an engine change takes per GB the Databases hold. Proposed. */
export const ENGINE_COPY_MINUTES_PER_GB = 1

/* ---------- pooler modes (07 "Connection Pooler") ---------- */

/** Pooled queries that fail in transaction mode while the code still uses session state. */
export const SESSION_STATE_CRASHES = 0.05

/* ---------- subscriptions (09 "Sources") ---------- */

/** Share of users on a paid plan, and what a plan pays per calendar day. */
export const PAYING_SHARE = 0.05
export const PLAN_PER_DAY = 24
