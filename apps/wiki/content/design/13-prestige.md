---
title: 13. Exit and Legacy
summary: The prestige layer: Exits, Legacy, Ventures, and Mutators.
section: design
order: 13
---

The prestige layer. A company ends in an **Exit**. The Exit pays **Legacy**. Legacy buys permanent
perks and opens new **Ventures**, which change the rules of the next company. This follows the idle
game prestige pattern ([Influences](/design/02-influences#idle-game-theory)), and it uses Ventures and
Mutators to keep each company different, which answers the Upload Labs complaint about repetition.

## Exits

| Exit        | Available from    | Payout basis                  | Multiplier                  | Notes                                                   |
| ----------- | ----------------- | ----------------------------- | --------------------------- | ------------------------------------------------------- |
| Acqui-hire  | Series A          | Equity × min(valuation, $50M) | 0.5                         | Ends early. Good for a fast restart with a new Venture. |
| Acquisition | Series B          | Equity × valuation            | 1.0                         | The buyer pays the current valuation.                   |
| IPO         | Pre-IPO checklist | Equity × valuation at listing | 1.5                         | Continues into the Public Era.                          |
| Step down   | Public            | Equity × current market value | 1.5, + quarter streak bonus | Ends the company from the Public Era.                   |

```text
payout = equity × valuation × exit_multiplier
legacy = floor( sqrt( payout / $1,000,000 ) )
```

| Payout       | Legacy |
| ------------ | ------ |
| $1 million   | 1      |
| $100 million | 10     |
| $1 billion   | 31     |
| $10 billion  | 100    |
| $100 billion | 316    |

The square root follows the common prestige curve: each Exit is worth more than the last, but not
exponentially more, so the player keeps a reason to improve rather than repeat
([Balancing](/design/16-balancing#prestige-curve)).

**What resets.** Cash, Insight, Dev Hours, users, research, the board, the team, and Equity.

**What stays.** Legacy, Legacy shop purchases, Playbooks, achievements, Challenge results, unlocked
Ventures and Mutators, and the engineering glossary entries the player has discovered.

## The Legacy shop

| Perk                    | Levels | Cost (★) per level | Effect per level                                                                                             |
| ----------------------- | ------ | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Angel network           | 5      | 2, 4, 8, 16, 32    | Starting Cash ×2                                                                                             |
| Alumni network          | 5      | 3, 6, 12, 24, 48   | +1 starting engineer (from the Pre-seed Era)                                                                 |
| Institutional knowledge | 10     | 5 each             | Keep one researched item of your choice through the next Exit                                                |
| Pattern recognition     | 5      | 4, 8, 16, 32, 64   | Insight +20%                                                                                                 |
| Founder's reputation    | 5      | 4, 8, 16, 32, 64   | User growth +10%                                                                                             |
| Better terms            | 5      | 6, 12, 24, 48, 96  | Dilution per round −2 points                                                                                 |
| Night shift             | 3      | 5, 15, 45          | Offline cap 12 h, 18 h, 24 h                                                                                 |
| Time dilation           | 2      | 20, 80             | Unlocks 20× and then 40× speed                                                                               |
| Playbooks               | 4      | 5, 15, 45, 135     | Playbook slots: one free, then 2, 5, 10, 25 ([Playbooks](#playbooks))                                        |
| Autopilot               | —      | —                  | Not built yet: the build has no Autopilot perk, so upgrades, research queues, and hiring stay manual.        |
| War stories             | 3      | 8, 24, 72          | Open action items raise incident odds by half as much                                                        |
| Head start              | 1      | 25                 | Start the next company in the Pre-seed Era. Levels 2 and 3 (the Seed and Series A starts) are not built yet. |

The eleven perks cost 1,133 ★ in all, and costs grow so that a full shop takes several Exits, which
is the target for 80 to 150 hours.

## Playbooks

A **Playbook** is a saved sub-design: Nodes, links, Stacks, and settings. It is Quorum's version of
Factorio blueprints ([Influences](/design/02-influences#factorio)).

- The player saves a selection on the board as a Playbook.
- Placing a Playbook places all its Nodes in one action, if the player has the Cash and the research.
  Missing research shows as ghost Nodes.
- Playbooks survive Exits. The second company's first hour is faster because the player places a
  known-good Garage design in one action.
- Playbooks export as a text string, so players can share them.

Playbooks remove the post-prestige tedium that Upload Labs players report
([Influences](/design/02-influences#why-players-quit)).

## Ventures

A **Venture** is the kind of company the player founds. Each Venture changes the request mix, demand
shape, constraints, and incidents. The default Venture is unlocked from the start. Others cost Legacy
or come from achievements.

| Venture             | Unlock                      | Demand shape                                           | Mix changes                                       | Constraint                                                                                                     | Signature incident          |
| ------------------- | --------------------------- | ------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------- |
| B2B SaaS (default)  | Start                       | Evening peak (20\:00), weekend 1×                      | None: the default mix                             | SLA credits from Series B                                                                                      | Big tenant hot shard        |
| Consumer social     | 5 ★                         | Evening peak, weekend 1.15×, viral spikes              | `media` +50% from Series A                        | Very low value per request; huge volume                                                                        | Celebrity post              |
| Fintech             | 10 ★                        | Business hours, month-end peaks                        | `buy` ×4, `write` +50%                            | Any `stale` on money kinds is a compliance fine                                                                | Double charge               |
| Streaming media     | 10 ★                        | Evening peak, premieres                                | `media` ×4                                        | Egress dominates the bill                                                                                      | Premiere spike              |
| Game backend        | 15 ★                        | Evening peak by region                                 | `rt` ×4                                           | `rt` Apdex T 50 ms; regions matter from Series A                                                               | Launch day                  |
| AI startup          | 15 ★                        | Flat, with launch spikes                               | `ai` ×3 from Series B                             | GPUs are scarce; inference cost decides margin                                                                 | GPU shortage                |
| E-commerce          | 20 ★                        | Daily, with a yearly event                             | `buy` ×2, `search` ×2                             | One scheduled sale event per calendar month at ×20 demand                                                      | Flash sale                  |
| Developer platform  | 20 ★ — built                | Flat, bursty clients (peak 20\:00, ±10%)               | `read` ×2; `hook` ×3 from Series C                | No naive retries on any Link: customers write their own retry loops                                            | Retry storm from a customer |
| Healthcare          | 30 ★ — built                | Business hours (14\:00), weekend 0.4×                  | `write` ×1.5                                      | Data Components stay in the home region from Series A                                                          | Audit finding               |
| Ad tech             | 30 ★ — built                | Flat, enormous (peak 20\:00, ±5%)                      | `page` ×1.5, `read` ×2: the bid kind is not built | A request whose mean passes 100 ms earns nothing (real-time bidding deadlines)                                 | Latency regression          |
| Bootstrapped indie  | Achievement "Default Alive" | Any                                                    | Default                                           | No funding rounds. Equity stays 100%. Salaries from revenue only.                                              | Runway                      |
| Government contract | 40 ★ — built                | Business hours (14\:00), weekend 0.2×, deadline spikes | Default                                           | Must use Java or C# for the core service; long procurement for new Components (placement takes 1 calendar day) | Deadline day                |

Four Ventures are built in full: Developer platform, Healthcare, Ad tech, and Government contract.
Each has its demand shape, its rule, and its signature incident. The eight Ventures that shipped
earlier still have no rule and no signature incident, apart from the Bootstrapped indie Venture's
no-funding rule; their rows name the rule they ask for.

What each built Venture starts with, and the numbers the build proposed where this document states
none:

| Venture             | Cash | Equity | Stack and research                 | Legacy × | Signature incident |
| ------------------- | ---- | ------ | ---------------------------------- | -------- | ------------------ |
| Developer platform  | $300 | 100%   | The Garage's                       | 1.35×    | Retry storm        |
| Healthcare          | $300 | 100%   | The Garage's                       | 1.4×     | Audit finding      |
| Ad tech             | $400 | 100%   | The Garage's                       | 1.3×     | Latency regression |
| Government contract | $900 | 100%   | Tomcat, and `lang-java` researched | 1.5×     | Deadline day       |

All four start in the Garage, and the Head start perk still opens Pre-seed. Cash, Equity, the demand
curves and amplitudes, the market and value multipliers, the mix boosts, and the Legacy multipliers
above are the build's proposals; the unlock costs, the 100 ms bid deadline, the Java-or-C# rule, the
calendar-day procurement, the Series A residency, the no-naive-retry rule, and the signature
incidents are this document's.

The rule of each built Venture is enforced where the player meets it. Developer platform refuses
`naive` retries on a Link (`retryRefusal`). Healthcare refuses to place a data Component outside the
home region from Series A (`venturePlaceRefusal`). Ad tech's requests earn nothing once the kind's
mean latency passes its deadline (`earnsInTime`). Government contract refuses a runtime that is not
Java or C# (`runtimeRefusal`), and a bought Component runs a calendar day after it is paid for
(`placedLife`).

A signature incident weighs four times as much for its own Venture (`SIGNATURE_WEIGHT`) and keeps a
weakness of 2 (`SIGNATURE_WEAKNESS`), so it can fire on a well-built Design. Latency regression and
Deadline day exist only as signatures: no other Venture's weakness can start them. Retry storm and
Audit finding stay general incidents, and Developer platform and Healthcare simply meet them four
times as often.

Ad tech's bid request kind (value $0.001, Apdex T 100 ms, 10× volume) is still not built, so the
Venture boosts `page` and `read` instead, and its 100 ms deadline applies to the mean latency of
every kind it serves.

Each Venture has its own Legacy multiplier (1.0× to 1.5×), shown before founding.

## Mutators

A **Mutator** is an optional rule that makes a company harder in exchange for more Legacy. Three
Mutators — Legacy monolith, One region forever, and Tight budget — open on the first Exit, and the
other six come from achievements ([Challenges](/design/14-challenges#achievements)). Each one adds a
Legacy multiplier.

| Mutator                 | Rule                                                                                      | Legacy |
| ----------------------- | ----------------------------------------------------------------------------------------- | ------ |
| Chaos Monkey            | Instance failures are four times as likely, from the Seed Era                             | +25%   |
| Hacker News front page  | Traffic spikes are three times as frequent                                                | +15%   |
| Legacy monolith         | Start with a large PHP codebase: migrations cost 3× and tech debt starts at 40%           | +20%   |
| One region forever      | Multi-region is disabled                                                                  | +20%   |
| No caches               | The Cache and CDN are disabled                                                            | +40%   |
| Shared tenancy          | Not built yet: noisy neighbors would put random CPU steal on every instance               | +10%   |
| Tight budget            | Funding grants are halved                                                                 | +20%   |
| Single language         | Every App Server must run PHP                                                             | +15%   |
| Postgres for everything | The Cache, the Wide-column Store, Distributed SQL and the Data Warehouse cannot be placed | +30%   |
| Strict SLO              | The SLO is one level higher in every Era                                                  | +20%   |

"Postgres for everything" is a real engineering argument. With this Mutator the game supports it:
Postgres can serve `q-search` with full-text search, `ai` lookups with pgvector, and queues with
`SKIP LOCKED`, each with a lower ceiling than the dedicated Component.

## Company history

Each Exit adds a row to the company history: the Company's name, Venture, Mutators, time played, peak users, Exit type,
payout, Legacy earned, final Stack mix, and a snapshot of the board. The history is a record of how
the player's engineering changed over time.
