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

| Perk                    | Levels | Cost (★) per level | Effect per level                                                                                                                                                                                                           |
| ----------------------- | ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angel network           | 5      | 2, 4, 8, 16, 32    | Starting Cash ×2                                                                                                                                                                                                           |
| Alumni network          | 5      | 3, 6, 12, 24, 48   | +1 starting engineer (from the Pre-seed Era)                                                                                                                                                                               |
| Institutional knowledge | 10     | 5 each             | Keep one researched item of your choice through the next Exit                                                                                                                                                              |
| Pattern recognition     | 5      | 4, 8, 16, 32, 64   | Insight +20%                                                                                                                                                                                                               |
| Founder's reputation    | 5      | 4, 8, 16, 32, 64   | User growth +10%                                                                                                                                                                                                           |
| Better terms            | 5      | 6, 12, 24, 48, 96  | Dilution per round −2 points                                                                                                                                                                                               |
| Night shift             | 3      | 5, 15, 45          | Offline cap 12 h, 18 h, 24 h                                                                                                                                                                                               |
| Time dilation           | 2      | 20, 80             | Unlocks 20× and then 40× speed                                                                                                                                                                                             |
| Playbooks               | 4      | 5, 15, 45, 135     | Playbook slots: one free, then 2, 5, 10, 25 ([Playbooks](#playbooks))                                                                                                                                                      |
| Autopilot               | 3      | 10, 30, 90         | Policies, each a switch in the Team panel: queue the cheapest Study; hire while payroll is under a quarter of revenue; buy the next size for App Servers above 70% load                                                    |
| War stories             | 3      | 8, 24, 72          | Open action items raise incident odds by half as much                                                                                                                                                                      |
| Head start              | 3      | 25, 75, 225        | Start the next company in the Pre-seed Era, then in Seed, then in Series A, with that Era's Cash, Equity, Users and research, and a Design that has a Cache (and a Load Balancer behind a second App Server from Series A) |

The twelve perks cost 1,563 ★ in all, and costs grow so that a full shop takes several Exits, which
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

| Venture             | Unlock                      | Demand shape                                           | Mix changes                        | Constraint                                                                                                     | Signature incident          |
| ------------------- | --------------------------- | ------------------------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------- |
| B2B SaaS (default)  | Start                       | Evening peak (20\:00), weekend 1×                      | None: the default mix              | SLA credits from Series B                                                                                      | Big tenant hot shard        |
| Consumer social     | 5 ★                         | Evening peak, weekend 1.15×, viral spikes              | `media` +50% from Series A         | Very low value per request; huge volume                                                                        | Celebrity post              |
| Fintech             | 10 ★                        | Business hours, month-end peaks                        | `buy` ×4, `write` +50%             | Any `stale` on money kinds is a compliance fine                                                                | Double charge               |
| Streaming media     | 10 ★                        | Evening peak, premieres                                | `media` ×4                         | Egress dominates the bill                                                                                      | Premiere spike              |
| Game backend        | 15 ★                        | Evening peak by region                                 | `rt` ×4                            | `rt` Apdex T 50 ms; regions matter from Series A                                                               | Launch day                  |
| AI startup          | 15 ★                        | Flat, with launch spikes                               | `ai` ×3 from Series B              | GPUs are scarce; inference cost decides margin                                                                 | GPU shortage                |
| E-commerce          | 20 ★                        | Daily, with a yearly event                             | `buy` ×2, `search` ×2              | One scheduled sale event per calendar month at ×20 demand                                                      | Flash sale                  |
| Developer platform  | 20 ★ — built                | Flat, bursty clients (peak 20\:00, ±10%)               | `read` ×2; `hook` ×3 from Series C | No naive retries on any Link: customers write their own retry loops                                            | Retry storm from a customer |
| Healthcare          | 30 ★ — built                | Business hours (14\:00), weekend 0.4×                  | `write` ×1.5                       | Data Components stay in the home region from Series A                                                          | Audit finding               |
| Ad tech             | 30 ★ — built                | Flat, enormous (peak 20\:00, ±5%)                      | `bid` ×10                          | A request whose mean passes 100 ms earns nothing (real-time bidding deadlines)                                 | Latency regression          |
| Bootstrapped indie  | Achievement "Default Alive" | Any                                                    | Default                            | No funding rounds. Equity stays 100%. Salaries from revenue only.                                              | Runway                      |
| Government contract | 40 ★ — built                | Business hours (14\:00), weekend 0.2×, deadline spikes | Default                            | Must use Java or C# for the core service; long procurement for new Components (placement takes 1 calendar day) | Deadline day                |

All twelve Ventures are built. The four that arrived last — Developer platform, Healthcare, Ad tech,
and Government contract — each have their demand shape, their rule, and their signature incident. The
eight that shipped earlier each meet the signature incident their row names, with one exception:
Bootstrapped indie's row names Runway, which is a figure rather than an incident, so it has none.
Four of the eight now have the rule their row names: Bootstrapped indie's no-funding rule, and the
three below. Consumer social's celebrity post is the build's **Hot key** incident, and its own row
names what the player meets.

What each Venture starts with:

| Venture             | Cash | Equity | Stack and research                 | Legacy × | Signature incident   |
| ------------------- | ---- | ------ | ---------------------------------- | -------- | -------------------- |
| B2B SaaS            | $300 | 100%   | The Garage's                       | 1.0×     | Big tenant hot shard |
| Consumer social     | $300 | 100%   | The Garage's                       | 1.1×     | Hot key              |
| Fintech             | $300 | 100%   | The Garage's                       | 1.3×     | Double charge        |
| Streaming media     | $300 | 100%   | The Garage's                       | 1.2×     | Premiere spike       |
| Game backend        | $300 | 100%   | The Garage's                       | 1.3×     | Launch day           |
| AI startup          | $300 | 100%   | The Garage's                       | 1.3×     | GPU shortage         |
| E-commerce          | $300 | 100%   | The Garage's                       | 1.2×     | Flash sale           |
| Developer platform  | $300 | 100%   | The Garage's                       | 1.35×    | Retry storm          |
| Healthcare          | $300 | 100%   | The Garage's                       | 1.4×     | Audit finding        |
| Ad tech             | $400 | 100%   | The Garage's                       | 1.3×     | Latency regression   |
| Bootstrapped indie  | $300 | 100%   | The Garage's                       | 1.4×     | —                    |
| Government contract | $900 | 100%   | Tomcat, and `lang-java` researched | 1.5×     | Deadline day         |

All twelve start in the Garage, and the Head start perk still opens Pre-seed. Cash, Equity, the demand
curves and amplitudes, the market and value multipliers, the mix boosts, and the Legacy multipliers
above are the build's proposals; the unlock costs, the 100 ms bid deadline, the Java-or-C# rule, the
calendar-day procurement, the Series A residency, the no-naive-retry rule, the Series B SLA, the
realtime regions from Series A, the scarce GPUs, and the signature incidents are this document's. The
SLA's one SLO level and the AI startup's two GPU Nodes are the game's own. Incident magnitudes: a hot shard costs three times the CPU per query, a
premiere lifts video four times, a launch day lifts realtime six times, and a flash sale lifts
checkouts ×20, for a few minutes.

The rule of each Venture is enforced where the player meets it. Developer platform refuses
`naive` retries on a Link (`retryRefusal`). Healthcare refuses to place a data Component outside the
home region from Series A (`venturePlaceRefusal`). Ad tech's requests earn nothing once the kind's
mean latency passes its deadline (`earnsInTime`). Government contract refuses a runtime that is not
Java or C# (`runtimeRefusal`), and a bought Component runs a calendar day after it is paid for
(`placedLife`).

Three of the older Ventures have their row's rule too. B2B SaaS signs its SLA from Series B: the
availability target it is held to moves one level above the Era's (`sloOf`), so its error budget is
the contract's and a missed week is a breach. With Enterprise sales researched, that breach pays
credits back at 10% of subscription revenue while the week is short
([Economy](/design/09-economy#sla-credits)). Game backend keeps one Realtime Hub per region from
Series A (`venturePlaceRefusal`): realtime is served where the players are. AI startup may hold two
GPU Nodes, whatever their size, and resizes them rather than buying more
(`venturePlaceRefusal`): GPUs are scarce.

The other four rows name a rule that is not a refusal or a target. Each runs in the Simulation:

- Consumer social's constraint is its market shape: half the value per request and twice the market
  (`value` 0.5 and `market` 2 in `catalog/ventures.ts`, read by `features.ts`), and viral spikes come
  twice as often (`spikeWeight`).
- Streaming media's egress dominates the bill: four times the video is four times the egress, and
  every byte leaving the Design bills three times the price (`egress`). The Egress Shock achievement
  asks for the bill.
- Fintech's compliance fine charges 20 times the value of a request for each stale answer to a money
  kind (`read`, `write`, `buy`), as `fines` on the Ledger, taken from Cash beside Burn.
- E-commerce's sale is on the calendar: every 30 calendar days, at noon, for two calendar hours,
  `buy` demand is ×20 (`saleOf` in `calendar.ts`). The Flash sale stays the Venture's signature
  incident, at the same ×20.

A signature incident weighs four times as much for its own Venture (`SIGNATURE_WEIGHT`) and keeps a
weakness of 2 (`SIGNATURE_WEAKNESS`), so it can fire on a well-built Design. Six incidents exist only
as signatures — Latency regression, Deadline day, Big tenant hot shard, Premiere spike, Launch day and
Flash sale — so no other Venture's weakness can start them. Retry storm, Audit finding, Hot key,
Double charge and GPU shortage stay general incidents, and Developer platform, Healthcare, Consumer
social, Fintech and AI startup simply meet theirs four times as often.

Ad tech serves the bid request kind the design names (value $0.001, Apdex T 100 ms, ×10 volume). The
kind arrives with the Series A mix at a 1% share and Ad tech multiplies it tenfold, so its Earn per
request follows from the kind rather than from a `page`/`read` stand-in. Its 100 ms deadline is still
checked against the mean latency of every kind it serves, and the bid kind's own Apdex target is that
same 100 ms.

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
| Shared tenancy          | Noisy neighbours steal up to 30% of an instance's CPU, redrawn every 30 sim seconds       | +10%   |
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
