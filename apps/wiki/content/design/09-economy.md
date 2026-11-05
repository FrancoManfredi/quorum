---
title: 9. Economy
summary: Currencies, sources and sinks, the cloud bill, pricing models, and funding.
section: design
order: 9
---

## Currencies

Each currency has one main source and one main sink, so the player always knows what each number
is for.

| Currency  | Symbol | Main source                          | Main sink                   | Resets on Exit |
| --------- | ------ | ------------------------------------ | --------------------------- | -------------- |
| Cash      | $      | Served requests                      | Nodes, Burn, salaries       | Yes            |
| Insight   | ◇      | Sampled traffic                      | Research                    | Yes            |
| Dev Hours | DH     | Engineers                            | Features, tasks, migrations | Yes            |
| Equity    | %      | Starts at 100%; falls when you raise | Determines the Exit payout  | Yes            |
| Legacy    | ★      | Exits                                | The Legacy shop             | No             |

Users are not a currency. They are the state that every currency depends on.

## Cash

### Sources

| Source            | Detail                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Request revenue   | `value × Apdex weight` per served request ([Simulation](/design/04-simulation#apdex-and-revenue)).                                                                                   |
| Funding grants    | One grant per round raised ([Funding](#funding)).                                                                                                                                    |
| Subscriptions     | From the Pre-seed Era, the "Paid plans" feature adds a fixed revenue per paying user per calendar day, independent of requests. This makes revenue less spiky and rewards retention. |
| Challenge rewards | None. Challenges pay in Legacy and badges ([Challenges](/design/14-challenges)).                                                                                                     |
| Sandbox rewards   | None. A Sandbox pays nothing in any currency ([Sandbox](/design/14-challenges#sandbox)).                                                                                             |

### The Payments drawer

Revenue first goes to the **Payments** drawer. The player clicks Collect to move it into Cash.

- The drawer holds 60 seconds of revenue at the current rate, at size 1, and never less than $25.
  Each size step doubles it.
- Revenue beyond the drawer's size is lost while the player is playing. While the player is away, the
  offline simulation pays revenue straight into Cash ([Simulation](/design/04-simulation#offline-progress)).
- Research "Stripe Billing" (Garage, 30 ◇) collects automatically. After that, the drawer only shows
  the rate.

This keeps the Garage Era active and then removes the click before it becomes a chore
([pillar 5](/design/01-vision#pillar-5-respect-the-player)).

## The cloud bill

**Burn** is the total Cash spent per second. The HUD shows Cash with its net change per second,
income minus Burn. The Cost panel (`$`) splits Burn into the lines below, with Revenue and the margin
beside them. The table is the bill the build charges:

| Line          | Formula                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Compute       | Σ instances `vCPU × $0.05 × family price × pricing model` × cost index; RAM comes with the family                            |
| Managed data  | Σ data Nodes at their size price; a Database adds its provisioned volume and each shard                                      |
| Storage       | Object storage: GB stored × price × storage class, plus its retrieval fee ([Data tier](/design/07-data-tier#object-storage)) |
| Egress        | GB out × egress price ([Egress](#egress))                                                                                    |
| Requests      | API Gateway requests × $0.002 × cost index. Not built yet: Serverless Functions, SQS and Object Storage                      |
| Third parties | Payment fees, Auth Provider per user, LLM tokens, push messages                                                              |
| Observability | Analytics sampling and retention ([Observability](/design/12-observability#the-cost-of-seeing))                              |
| Salaries      | Σ engineers × salary × language factor                                                                                       |

Real teams are often surprised by the egress, observability, and third-party lines. The game
surfaces them on purpose.

### Base prices

| Resource                          | Price                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| vCPU, general family              | $0.05/s                                                                                                   |
| vCPU, family multiplier           | Burstable 0.4×, Compute 0.85×, General 1×, Memory 1.3×                                                    |
| RAM                               | Implied by the family, inside the vCPU price: 2 GB per vCPU (Burstable, Compute), 4 (General), 8 (Memory) |
| Object storage, standard          | $0.000032/s per GB                                                                                        |
| Object storage, infrequent access | 0.5× the standard price, and $0.01 per GB read back                                                       |
| Object storage, archive           | 0.1× the standard price. A read waits for a restore, and fails as `timeout` until then                    |
| Database volume, provisioned IOPS | 1.5× the Database's box. Proposed: the design says "higher cost" and gives no rate                        |
| Block storage                     | **Not built yet:** no block-storage price and no volume model                                             |
| Engineer salary (base)            | $0.40/s                                                                                                   |

These are Garage prices. Every price in this document, including placement, Burn, egress, and
third-party fees, is multiplied by the Era's cost index, except the Payment Provider's fee and the
Auth Provider's per-user price. The index keeps Burn a real share of revenue at every size of
company. [Balancing](/design/16-balancing#cost-index) holds the index and the salary scale, and
[Balancing](/design/16-balancing#prices) holds the full table.

### How prices map to real prices

Each price follows one of two rules, so a player who knows the real price can check it:

| Rule        | Prices                                                                            | Mapping                                                             |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Time-billed | Instances, GPUs, managed Nodes, storage, the Kubernetes control plane, LLM tokens | $1 per sim second in the game is $1 per real hour. A vCPU is $0.05. |
| Per use     | Egress, the Payment Provider, push and email messages, Data Warehouse scans       | The real list price per GB, per checkout, per message, or per scan. |

LLM tokens use the time-billed rule because they compete with GPU Nodes for the same prompts. On
the same scale, a busy H100 is cheaper per prompt than the LLM API only while it is more than half
busy, as in real self-hosting ([Reality check](/design/reality-check#prices)).

Request values set what a user is worth. A user sends about 0.02 requests a second, which on the
time-billed rule is 0.02 an hour in real time, at about $0.25 each, so revenue is about $4 per user
per real month. Meta's 2025 worldwide ARPU was $57 a year, about $4.75 a month.

The two rules do not agree with each other: per-use prices are about 3,600 times cheaper, relative
to compute, than in a real bill. This is on purpose. At the time-billed rate, every page view would
pay half its value in egress. Request values, the cost index, and the salary index are balance
controls and do not follow a real price.

## Pricing models

Every Node bills at one rate until the Series A Era. From Series A, each compute Node — an App
Server or a Worker — has a pricing model. The player picks it on the Node's card, and the box price
in the cloud bill is multiplied by it.

**Built:** On-demand, Reserved and Spot, on sized compute Nodes. **Not built yet:** Serverless, which
needs the Serverless Function Component and a per-use price.

| Model      | Price   | Condition                                                                                                                                                                                                                                                                                         |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On-demand  | 1.0×    | None. Remove at any time.                                                                                                                                                                                                                                                                         |
| Reserved   | 0.6×    | A commitment of one calendar week. Removing the Node does not stop the Burn until the term ends: selling it early charges the Burn it still owes, and it cannot change model before then.                                                                                                         |
| Spot       | 0.3×    | The provider can reclaim the Node at any time. The player gets a 10-second warning (stylized; the real AWS notice is two minutes). A reclaimed Node goes down for 20 sim seconds. Good for Workers and stateless servers behind a load balancer with spare capacity. Fatal for a single database. |
| Serverless | Per use | Only for Serverless Functions and managed services. **Not built yet.**                                                                                                                                                                                                                            |

The real lesson: the cheapest fleet mixes all three. Reserved instances cover the base load, on-demand
instances cover the daily peak, and spot instances run batch work.

## Egress

| Path                          | Price per GB |
| ----------------------------- | ------------ |
| Origin to internet            | $0.09        |
| CDN to internet               | $0.02        |
| Cross-zone, each direction    | $0.01        |
| Cross-region                  | $0.02        |
| Object storage R2 to internet | $0           |

`media` at 5 MB per request makes egress the largest line on the bill in the Series A Era unless a CDN
or R2 serves it. A player who ignores egress sees revenue rise and margin fall.

## Third-party fees

| Service          | Price                                                      |
| ---------------- | ---------------------------------------------------------- |
| Payment Provider | 2.9% + $0.30 per successful `buy`, not indexed             |
| Auth Provider    | $0.00006/s per user, $0.0864 per calendar day, not indexed |
| LLM API          | $2.50 per 1,000 tokens                                     |
| Push and email   | $0.0001 per message                                        |
| API Gateway      | $0.002 per request, on the Requests line                   |

## Funding

When users reach an Era milestone, investors offer a round. The player can raise or decline.

| Round    | Milestone (users)                | Grant         | Dilution                 | Notes                                               |
| -------- | -------------------------------- | ------------- | ------------------------ | --------------------------------------------------- |
| Pre-seed | 1,000                            | $2,500        | 10%                      |                                                     |
| Seed     | 5,000                            | $15,000       | 19%                      | Carta median 19.4% (Q2 2026)                        |
| Series A | 25,000                           | $80,000       | 19%                      | Carta median 18.7% (Q2 2026)                        |
| Series B | 150,000                          | $1,500,000    | 13%                      | Carta median 12.9% (2025)                           |
| Series C | 1,000,000                        | $18,000,000   | 12%                      | Carta: 16% median across seed to Series C           |
| Pre-IPO  | 10,000,000                       | $150,000,000  | 12%                      |                                                     |
| IPO      | 50,000,000 and the IPO checklist | Public market | 15% sold in the offering | [Progression](/design/10-progression#era-6-pre-ipo) |

A grant is about 17 sim minutes (1,000 s) of the Burn at the milestone, so it stays worth taking
at every size of company.

**Money buys growth.** An Era that begins with a raised round runs at the full growth rate `g`. An
Era that begins with a declined round runs at 0.7 × `g`, so it takes about 1.4 times as long
([Simulation](/design/04-simulation#users-and-growth)). The player trades Equity for speed.

**Declining** a round keeps Equity and gives no grant. The Era still advances, so the new kinds still
arrive, and the player must pay for them from revenue. A player who declines every round and still
reaches IPO earns the achievement "Default Alive", named after Paul Graham's essay. The pacing bots
check that this path does not beat the raise-every-round path in Legacy per hour
([Balancing](/design/16-balancing#pacing-model)).

Dilution compounds. A founder who raises every round keeps about
0.90 × 0.81 × 0.81 × 0.87 × 0.88 × 0.88 ≈ 39.8% before the IPO offering and about 33.8% after it,
which is above a typical real founder stake at IPO.

## Valuation

The company has a valuation at all times. It decides the Exit payout.

```text
ARR        = revenue per calendar day × 365 × valuation_scale
growth     = user growth over the last calendar week, annualized, in percent
margin     = (income − Burn) / income, in percent
rule_of_40 = growth + margin
base       = 4 + 0.15 × max(0, rule_of_40)            clamped to [2, 30]
multiple   = max(1, base + 2 with Investor relations + the quarter's bonus)
valuation  = ARR × multiple
```

The clamp applies to `base` only. Investor relations adds 2 to the multiple, and a public quarter
adds its bonus, from −10 to +10 ([Progression](/design/10-progression#era-7-public)), so either can
take the multiple past 30.

`valuation_scale` is 1.5 × 10⁻⁴. Request values are stylized game dollars, so Cash and revenue run
far above real figures. The scale converts a year of game revenue into the real-dollar ARR that the
company would report ([Balancing](/design/16-balancing#valuation-scale)). The Valuation, Exit payout,
and Legacy use real dollars. Cash, revenue, and Burn use game dollars.

The [Rule of 40](/design/glossary#rule-of-40) is a real heuristic for software companies: growth plus
profit margin should be at least 40%. It gives the late game a reason to care about margin, not only
growth.

## Runway and running out of Cash

**Runway** is Cash divided by net Burn. The HUD shows it when net Burn is positive.

**Partly built.** The Dashboard's Company panel shows runway as Cash divided by net Burn. There is
no bridge offer and no automatic shutdown: Cash goes negative and keeps going, and the company
never ends.

When Cash reaches zero:

1. Placement and upgrades stop.
2. Burn continues and Cash goes negative.
3. At −1 calendar day of Burn, investors offer a **bridge**: a grant that covers 3 calendar days of
   Burn for 8% dilution. The player can accept, or cut costs.
4. If the player declines and Cash reaches −3 calendar days of Burn, Nodes shut down, most expensive
   first, until net Burn is zero.

The company never ends. Running out of money is a setback, not a game over
([pillar 5](/design/01-vision#pillar-5-respect-the-player)).

## Sources and sinks summary

```text
Users ──requests──► Revenue ──► Payments ──collect──► CASH ──► Nodes, Burn, salaries, hires
  ▲                                                     ▲
  │                                                     └── Funding (costs Equity)
  │
  └── Apdex ◄── design quality ◄── capacity, research, features

Sampled traffic ──► INSIGHT ──► Research ──► Components, variants, techniques, visibility
Postmortems ──► action items (open until researched) ──┘

Engineers ──► DEV HOURS ──► Features (more users, revenue, load)
                         ──► Tasks, migrations, debt paydown (cheaper and safer system)

Exit (Equity × valuation) ──► LEGACY ──► Permanent perks, Playbooks, Ventures
```

The three main currencies (Cash, Insight, Dev Hours) compete for the player's attention, not for
each other. No exchange between them exists, except that Cash hires engineers and pays for Analytics.
This keeps each choice legible.
