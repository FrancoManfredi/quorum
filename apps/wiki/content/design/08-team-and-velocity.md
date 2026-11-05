---
title: 8. Team and velocity
summary: Engineers, Dev Hours, features, tech debt, services, and Conway's law.
section: design
order: 8
---

Servers are half of the game. The other half is the people who change them. This system makes
runtime choices bite in both directions: Rust saves servers and costs engineer time, Rails saves
engineer time and costs servers. It also makes microservices a real decision with a real reason, as
described by [Conway's law](/design/glossary#conways-law) and [Brooks's law](/design/glossary#brookss-law).

The Team system arrives in two steps. In the Garage Era, the player is the only engineer and
produces Dev Hours. Hiring unlocks in the Pre-seed Era.

## Dev Hours

**Dev Hours** (DH) are the currency of engineering work.

```text
DH per calendar day = Σ_teams effective_engineers(team) × 8 × velocity(team) × policy × error_budget_factor × (1 − upkeep_share)
```

One DH is one engineer-hour. An engineer works 8 hours in a calendar day (the same work window that
limits deploys), so one engineer produces 8 DH per calendar day. The founder produces 0.8 of that,
because the founder also runs the company. Dev Hours follow the Team's calendar, like hiring,
ramp-up, and deploys. The live game runs the Team's calendar 24× faster than the board's (see the
[live tuning](/design/16-balancing#live-tuning)), so an engineer produces 8 DH per real minute.

| Term                  | Source                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `effective_engineers` | Headcount after the coordination penalty ([Coordination](#coordination)).                                               |
| `velocity`            | Language × framework × tech debt factor ([Runtimes](/design/06-runtimes#language-profiles)).                            |
| `policy`              | The team policy ([Team policy](#team-policy)).                                                                          |
| `error_budget_factor` | 1.1 with budget to spare, 1.0 normally, 0.5 during a freeze ([Incidents](/design/11-incidents#slos-and-error-budgets)). |
| `upkeep_share`        | The share that keeps live Features running ([Upkeep](#upkeep)).                                                         |

Dev Hours are spent on six kinds of work:

| Work              | Examples                                                         | Section                                 |
| ----------------- | ---------------------------------------------------------------- | --------------------------------------- |
| Features          | Onboarding, search filters, recommendations                      | [Features](#features)                   |
| Engineering tasks | Add an index, eager loading, idempotency keys, fix a memory leak | [Engineering tasks](#engineering-tasks) |
| Migrations        | Change a service's language, split a service, move auth in-house | [Migrations](#migrations)               |
| Debt paydown      | Refactoring sprints                                              | [Tech debt](#tech-debt)                 |
| Upkeep            | Bug fixes, dependency updates, support for live Features         | [Upkeep](#upkeep)                       |
| Spikes            | Make the running Study faster                                    | [Spikes](#spikes)                       |

Work items sit in a **backlog** with a priority order. Engineers work on the top items in parallel,
up to one item per team at a time. An item can stop before it starts, waiting on something only the
player can give it; the owner writes, and Approve or Later is the answer ([Blocked](#blocked)).

Dev Hours a team does not spend stay in a company-wide **pool**, and the Team panel shows the pool
and its fill rate. **Rush** spends the pool on one backlog item: it pays as much of that item's
remaining cost as the pool holds, so an item finishes without waiting for a team to build it.
The autopilot rushes the item at the top of the backlog, and Add index rushes itself.

## Hiring

| Property     | Detail                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signing cost | One-time Cash: $2,000 × salary multiplier in the Pre-seed Era, scaling with the Era.                                                                                             |
| Salary       | Burn per engineer, multiplied by the language's salary factor ([Runtimes](/design/06-runtimes#hiring-and-salaries)).                                                             |
| Time to hire | Calendar days, multiplied by the language's time-to-hire factor, and −30% with `hiring-pipeline`. A company with services in several languages hires for the service's language. |
| Ramp-up      | A new hire produces 30% for the first calendar week, then 100%. Rails conventions halve the ramp.                                                                                |

Layoffs refund nothing, end the salary Burn, and cost 10% velocity for a calendar week (morale).
Morale is global: one team's layoff slows every team.

### Pay and mood

An engineer signs at the Era's going rate, and the salary index keeps climbing. Their pay does not
climb with it: an engineer hired in Pre-seed still earns Pre-seed's rate in Seed, which is half of
what a new hire commands. That is the **pay gap**. A raise pays them the Era's rate and raises the
payroll with them.

Three things wear an engineer's **mood** down, and the game tracks each:

- **A long freeze.** While the error budget is spent and Features run at half speed
  ([Incidents](/design/11-incidents#slos-and-error-budgets)), a calendar week of it takes all of a
  mood.
- **Pages.** Every incident that pages their team costs the engineer a little of it: −0.08, so a
  dozen pages is a slump.
- **A pay gap.** At a 50% gap the mood falls by a third of a point a calendar day.

An engineer at 0.35 mood writes to the player, once per slump. The three answers are theirs to
choose ([Mail](/design/18-mail#teammates)): **Give time off** (three calendar days with no Dev
Hours, and they come back content), **Raise salary** (to the Era's rate), or **Accept resignation**
(they leave, the payroll ends, and there is no layoff's morale hit). An engineer on time off
produces nothing; the rest of the team carries the backlog.

Mood, the page count, and the salary index each engineer is paid at are saved with the Company. A
save from before them has every engineer content, on the Era's rate, with no pages.

## Teams

Engineers belong to teams. The player creates teams and assigns engineers.

| Team type     | Unlocked                  | Owns                                       | Effect                                                                                                                                                                                                                         |
| ------------- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product team  | Pre-seed                  | One or more services                       | Produces DH for features and engineering tasks on its services.                                                                                                                                                                |
| Platform team | Series A, `platform-team` | Kubernetes, CI/CD, the Service Mesh        | Removes the per-cluster DH tax. Halves deploy time.                                                                                                                                                                            |
| SRE team      | Series A                  | On-call, runbooks, incident response       | MTTR −40%: an incident, and the recovery it drives, runs 60% as long. Open action items raise incident odds by half as much. It holds the pager a runbook needs ([Incidents](/design/11-incidents#runbooks)).                  |
| Data team     | Series B, `data-team`     | The warehouse, CDC, the Vector Index       | `report` and `ai` features cost −30% DH. A CDC pipeline has half the lag.                                                                                                                                                      |
| Security team | Pre-IPO, `security-team`  | WAF rules, dependency scanning, compliance | Required for the SOC 2 milestone. Halves the weakness that draws a Supply-chain compromise, stacking with Dependency scanning, and doubles the grace before an overdue CVE is exploited into a Data breach (proposed factors). |

Product, Platform, SRE, Data and Security teams exist in the build. A Platform team needs
`platform-team` research, an SRE team `sre-team`, a Data team `data-team`, and a Security team
`security-team`, each with an engineer on it. Their Dev Hours build no backlog: they run the system
instead.

## Coordination

Communication cost grows with the number of people who must agree. The game models this per team:

```text
effective_engineers(team) = n / (1 + k × (n − 1) + β × n × (n − 1))
k = 0.08 by default, × 0.7 with a structured framework (Spring Boot, NestJS, Symfony)
β = 0.0004
```

| Engineers in one team | Effective engineers |
| --------------------- | ------------------- |
| 1                     | 1.0                 |
| 5                     | 3.8                 |
| 10                    | 5.7                 |
| 20                    | 7.5                 |
| 40                    | 8.4                 |
| 80                    | 8.1                 |

Past about 10 people, one team adds little. The β term is the retrograde term of the Universal
Scalability Law: a team above about 48 people produces less than a smaller one. This is the game's
version of Brooks's law: "adding manpower to a late software project makes it later".

## Services

A **Service** is a codebase with its own deploy pipeline, owned by one team. Every App Server and
Worker belongs to a Service. The starting company has one Service: the monolith.

A Service **carries Features**. The request kinds those Features put on the wire, the load they add
and the kind they unlock, are the Service's traffic. Features that no other Service names stay with
the starting Service, so a Company that never splits runs exactly as it did before Services existed,
and an old save opens on one Service.

**Splitting** a service (research "Service boundaries", Series B) moves some live Features to a new
codebase with a name and an owning team.

```text
split_DH = 0.3 × 0.5 × Σ DH of the moved Features      (at least 0.5 DH, to a tenth)
```

The 0.3 is the migration factor for a split and the 0.5 is the codebase's KLOC per Dev Hour, so a
split costs the same 0.3 of the moved part as the [Migrations](#migrations) table says: moving
Checkout, 320 DH, is 48 Dev Hours. The Dev Hours go on the backlog as one **split** item, owned by
the team the split gives the Service, and the moved code leaves the codebase it came from.

Each Service now deploys on its own timer and rolls its own bad deploy, from its own owner's
policy and its own tech debt, not the Design's: the one shared CI/CD Pipeline still sets the
cadence and the strategy every Service ships through, so two Services on the same policy still
deploy about as often, but a bad deploy on one no longer waits behind, or pulls down, another's.
Burn has no Node-level ownership to split exactly, so each Service's reported Burn is its share of
the Company's total Burn by its share of the Company's total codebase (KLOC). Proposed: the design
asks for a split and gives no formula, so this is the simplest one that uses a figure every Service
already tracks. A Stack change still migrates the whole Design rather than one Service.

| Gain                                           | Cost                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Teams stay small, so coordination improves     | A network hop between services: +1 ms and serialization CPU on both sides                         |
| Each service can pick its own Stack            | Another deploy pipeline, more Nodes, more Burn                                                    |
| A bad deploy hits one service, not all of them | Distributed failure modes: partial outages, retries, timeouts ([Incidents](/design/11-incidents)) |
| Each service scales on its own                 | DH for the split itself (proportional to the moved code)                                          |

### Ownership

A Service has one owning team. The build ties the two together:

- **Who fixes it.** The owner's engineers take that Service's backlog items first. Another team's
  engineers do not take them, so a Service whose owner is busy waits. A team that owns no Service
  helps on the starting one, which keeps a Company that never splits playing as it did.
- **Who is paged.** A bad deploy names the Service whose code broke, and the incident and its
  postmortem name the owner as the team that fixes it.
- **What it costs.** A team's velocity uses the tech debt of the Service it owns, not the whole
  Design's.

The SRE team takes the pager for every Service. A restructure action moves a Service from one team
to another at once, with no Dev Hours of its own: the new owner's engineers take its backlog first
from the next tick on, and the next bad deploy on it pages them.

### Blast radius

A bad deploy fails **only the traffic of the Service that shipped it**: its own Feature kinds, at the
share [Bad deploy](/design/11-incidents#bad-deploy) gives. With one Service that is every kind, as an
old save expects. This is the mechanic behind the Gain row above: the deploy that breaks `buy` in
the checkout Service leaves `login` and `page` alone. Infrastructure incidents, such as a zone, a
Database, or a Queue, still hit every Service that uses the Node.

**Shared database penalty.** Services that share one database keep 50% of the coordination penalty,
because schema changes still need agreement. This is the "distributed monolith" trap. The build
multiplies the coordination constant `k` by 1.5 for a team whose Service shares its Database with
another Service: two services on the starting Database pay it, and a Service that names its own
Database Node, such as a second one the player placed, pays nothing. Giving each service its own
data store removes the penalty and creates the problems in
[keeping copies in sync](/design/07-data-tier#keeping-copies-in-sync).

Conway's law works in both directions in the game: the team structure the player builds shapes the
service graph, and the service graph decides how well the teams work.

## Features

A **Feature** is a product change built with Dev Hours. Features are the main way to raise revenue
per user and market size. Every feature also changes load, which feeds the
[bottleneck loop](/design/03-game-loops#l1-bottleneck-30-seconds-to-3-minutes).

Four rules make Features behave like real product work:

1. **Real sizes.** A Feature costs what a small team needs to build it.
2. **Uncertain effects.** A Feature's effect is not known until users have it.
3. **Gradual rollout and adoption.** Users get a Feature in steps and pick it up over time.
4. **Upkeep.** A live Feature costs Dev Hours for as long as it stays in the product.

### Sizes

DH are engineer-hours, so sizes come from how long real teams take. The sizes follow the appetites in
Basecamp's _Shape Up_: a small batch is one engineer for one to two weeks, and a big batch is two
engineers for six weeks. A week is 40 DH.

| Feature              | Era      | Requires                         | Size                  | DH    | Win effect on users and money                 | Effect on load                                     |
| -------------------- | -------- | -------------------------------- | --------------------- | ----- | --------------------------------------------- | -------------------------------------------------- |
| Landing page         | Garage   | —                                | 1 day                 | 8     | Market +20%                                   | `page` +10%                                        |
| Signup flow          | Garage   | —                                | 2 days                | 16    | Growth +15%                                   | Unlocks `write` early at a low share               |
| Pagination           | Garage   | —                                | Half a day            | 4     | —                                             | `read` payload −50%, adds an unindexed query shape |
| Password login       | Pre-seed | Signup flow                      | 1 week                | 40    | Required for paid plans                       | Unlocks `login`                                    |
| Paid plans           | Pre-seed | Password login                   | 2 weeks               | 80    | `write` value +30%                            | —                                                  |
| Email digests        | Pre-seed | Signup flow                      | 1 week                | 40    | Churn −10%                                    | **Not built yet:** no `job` burst                  |
| Search filters       | Seed     | —                                | 1 week                | 40    | `search` value +25%                           | `q-search` cost +40%                               |
| Profile photos       | Seed     | Password login                   | 1 week                | 40    | Growth +10%                                   | Unlocks `upload`                                   |
| Public API           | Seed     | Password login                   | 4 weeks               | 160   | Market +25%                                   | `read` +30%, bursty clients, bots                  |
| Infinite scroll      | Seed     | Pagination                       | 3 days                | 24    | `read` value +10%, time in app +25%           | `read` +40%                                        |
| Video                | Series A | Profile photos                   | 2 engineers, 6 weeks  | 480   | Market +40%                                   | Unlocks `media`                                    |
| Chat                 | Series A | Password login                   | 2 engineers, 6 weeks  | 480   | Churn −20%                                    | Unlocks `rt`                                       |
| Checkout             | Series A | Paid plans                       | 2 engineers, 4 weeks  | 320   | Unlocks `buy`                                 | `q-tx`, Payment Provider dependency                |
| Notifications center | Series A | Chat                             | 2 weeks               | 80    | Growth +10%                                   | `rt` +20%                                          |
| Mobile app           | Series A | Public API                       | 2 engineers, 3 months | 960   | Market +60%                                   | `read` +50%                                        |
| Data export          | Series B | —                                | 2 weeks               | 80    | Enterprise plans: `write` value +20%          | Unlocks `job`                                      |
| Dashboards           | Series B | —                                | 2 engineers, 6 weeks  | 480   | Enterprise plans: Market +10%                 | Unlocks `report`                                   |
| AI assistant         | Series B | —                                | 2 engineers, 6 weeks  | 480   | Unlocks `ai`                                  | GPU or LLM API dependency                          |
| Recommendations      | Series B | Video, Data export               | 2 engineers, 6 weeks  | 480   | `media` and `job` usage +30%                  | Batch `job` and a model                            |
| Audit log            | Series B | Password login                   | 3 weeks               | 120   | Market +10%: enterprises can buy              | `q-write` +20%                                     |
| Activity feed        | Series C | —                                | 2 engineers, 6 weeks  | 480   | Market +50%                                   | Unlocks `feed`                                     |
| Webhooks             | Series C | Public API                       | 3 weeks               | 120   | Market +20% (integrations)                    | Unlocks `hook`                                     |
| Push notifications   | Series C | Mobile app, Notifications center | 2 weeks               | 80    | Growth +15%, churn +5% if over-sent           | Unlocks `push`                                     |
| Localization         | Series C | —                                | 2 engineers, 6 weeks  | 480   | Market +40% outside North America             | More regions matter                                |
| Offline mode         | Series C | Mobile app                       | 2 engineers, 6 weeks  | 480   | Churn −10%                                    | Sync bursts on reconnect                           |
| Single sign-on       | Pre-IPO  | Password login                   | 6 weeks               | 240   | Enterprise market +10%                        | `login` moves to SAML or OIDC                      |
| Data residency       | Pre-IPO  | An open EU region                | 3 engineers, 3 months | 1,440 | Required for the EU market                    | EU data stays in an EU region                      |
| Status page          | Pre-IPO  | —                                | 2 days                | 16    | Churn −10%                                    | —                                                  |
| Usage-based pricing  | Public   | Paid plans                       | 2 engineers, 6 weeks  | 480   | `job`, `write`, `ai` and `hook` requests +15% | Metering `job` and `q-write`                       |

The largest Feature in the build is Mobile app at 960 DH; Data residency, at 1,440 DH, is larger
still but needs an open EU region, checked when it is queued, rather than another Feature. From the
Pre-IPO Era on, a Company with the EU region open cannot grow it without Data residency: the
Region's share of the market reads zero until it ships. Earlier Eras, and every Era before regions
split, play as they did before this Feature existed.

Market gains multiply, and there is no cap: each Feature's share of the Era's market compounds.
Features reach more of the people who could use the product. They cannot create new people.

Some features ship with hidden costs that appear later: a new unindexed query shape, an N+1 in a
list view, or a scan in a dashboard. Research "Code review" reveals these costs before the feature
ships.

### Outcomes

**Built.** The "Win effect" column is what a Feature does when it works. Most product changes do not
work as planned. When Microsoft ran controlled experiments, about a third of ideas improved the
metric they targeted, a third did nothing, and a third made it worse.

When a Feature is queued, the Simulation rolls its outcome from the Company's seeded random stream.
The roll changes only the effects on users and money: market, growth, churn, and value. The effect
on load is certain, because users call the new code whether it helps them or not. A Feature that
fails still costs capacity.

| Outcome | Chance | Realized effect, as a share of the win effect |
| ------- | ------ | --------------------------------------------- |
| Win     | 1/3    | 60% to 140%                                   |
| Flat    | 1/3    | −10% to +20%                                  |
| Loss    | 1/3    | −50% to −10%                                  |

A Feature that only unlocks a kind or meets a requirement, such as Password login or Checkout, always
does that. Its roll applies only to the other effects it has.

The player does not see the roll. The Feature card shows the win effect as "Expected". The player
learns the realized effect only by measuring it ([Measured lift](#measured-lift)).

### Rollout

Without Feature Flags ([Components](/design/05-components#feature-flags)), a Feature goes to every user
in the deploy that ships it.

With Feature Flags, each shipped Feature has a rollout. The player moves it through the design's
steps: dark, 5%, 25%, 50%, 100% of users.

**Built:** the `ff` Component, a rollout share per Feature, and the blast-radius rule. The steps are
the design's four. A bad deploy that comes from a flagged Feature hits only its rollout share, so a
Feature at 5% cannot break more than 5% of what it would have
([Incidents](/design/11-incidents#mitigation-toolbox)). A Feature with no step set is live for every
user, which is what a Design with no Feature Flags Node does with all of them, so an old save opens
unchanged. One click sets a step to Off, which is the mitigation an incident needs. The share counts
the moment it is set, and the Deploy bar and the flags card read it.

**Built:** the rollout scales what users get. Effects and load follow the Feature's exposure, its
rollout times its adoption ([Adoption](#adoption)), so a dark Feature earns nothing and costs no
capacity, and a Feature at 50% reaches half its effect once its users have adopted it.

**Built:** **Shift** moves a live Feature's rollout, including to Off, through the Inspector's flag
control above; a Feature turned off this way still pays its upkeep, because its code has not gone
anywhere ([Upkeep](#upkeep)). **Remove** takes the code out for good: the Feature leaves `shipped`
and the Service that carried it, every effect it had stops, and its upkeep ends with it. A Feature
another live or planned Feature `requires` cannot be removed, so the dependency graph the backlog
checks never breaks underfoot. Removing is not undone the way Undo undoes a board action: building
the Feature again queues it from zero, with a new rollout and a new rolled outcome.

### Adoption

**Built.** A Feature's **adoption** share starts at 0 in the deploy that ships it and approaches 1
with calendar time. Its **exposure** is the product of its rollout and its adoption, and every
effect and every load change an exposure of 0 has none of and an exposure of 1 has all of. The
Team panel shows each live Feature's adopted share.

Users do not adopt a Feature on the day it ships. Each Feature has an **adoption** share that
approaches 1 as calendar time passes:

```text
adoption += (1 − adoption) × Δt / τ        τ = 7 calendar days
exposure  = rollout × adoption
```

All effects and load scale with `exposure`. After one calendar week, a Feature at 100% rollout
reaches about 63% of its effect, and about 95% after three weeks. Real adoption follows an S-curve
(the Bass diffusion model). The game uses the exponential approach because the Simulation allows only
exact arithmetic ([Simulation](/design/04-simulation)).

### Measured lift

**Built.** With `ab-testing` researched, a Feature between 5% and 50% rollout reports its lift with
a confidence interval on its Team card. The counts are sampled requests from the exposed users and
from the holdout, since the Feature reached its current rollout step; a new step starts the count
again. Analytics' sample rate sets the rate, and a Design with no Analytics tap counts 1% of
requests.

The lift it measures is the Feature's realized outcome ([Outcomes](#outcomes)), not its win effect:
the interval narrows toward the rolled market, growth, and churn effects, so the verdict becomes
Wins for a Win or a strong Flat, and Loses for a Loss. Reading a Feature before A/B testing still
means comparing the metrics before and after its launch.

Analytics measures a Feature's **lift**, its realized effect, under two conditions:

- Research "A/B testing" is done.
- The Feature is between 5% and 50% rollout, so some users still do not have it and form a holdout
  group.

The Feature card then shows the lift with a 95% confidence interval. The interval narrows as
Analytics samples more requests from both groups:

```text
half_width = 1.96 × σ × sqrt(1 / n_exposed + 1 / n_holdout)
σ = 1.0 (the spread of a relative effect, tunable)
```

`n_exposed` and `n_holdout` count sampled requests from each group since the Feature reached its
current step. The verdict is **Wins** when the interval is above zero, **Loses** when it is below
zero, and **Too early** while it contains zero. A higher sample rate gives a verdict sooner, which is
one more reason to pay for sampling ([Observability](/design/12-observability#the-cost-of-seeing)).

Before A/B testing, the player can compare the metrics before and after a launch. Growth, the Era,
and incidents also move those metrics at the same time. That is the real reason teams use
controlled experiments.

### Upkeep

**Built.** Each product team loses a share of its Dev Hours to the Features its Service carries,
before the backlog gets any.

Every live Feature needs upkeep: bug fixes, dependency updates, and support questions. Upkeep takes
a share of each team's Dev Hours before the backlog gets any:

```text
upkeep_share(service) = 0.4 × S / (S + 2,000) × (1 + debt)        capped at 0.6
S = DH of the Features shipped on the service and not yet removed
```

A product with 500 DH of Features spends 8% of its Dev Hours on upkeep. With 4,000 DH it spends 27%,
and it approaches 40% with no debt. Developers in Stripe's survey spent about 42% of their week on
maintenance and bad code. Turning a Feature off does not end its upkeep. Removing it does.

Upkeep makes a large product slower to change. The player chooses which Features earn their upkeep
and removes the ones that lose or stay flat. Until Remove lands, the only lever is what the Company
ships, which is the trap the section describes.

A team that runs the system instead of the product, a Platform, SRE or Data team, pays no upkeep: its
Dev Hours build no backlog. The Team panel's Live column shows the share.

### Blocked

An item can stop before its team does any work on it. The build checks the four waits the design
names, and the first that holds is the reason:

| Wait       | Holds when                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------- |
| An index   | The Service has a query shape with no index ([Data tier](/design/07-data-tier#indexes)).        |
| A copy     | The Service shares its Database with another ([the distributed monolith](#blast-radius)).       |
| A hire     | The team has eight engineers (proposed), near where the coordination table flattens.            |
| A decision | The Design is below its Apdex target: what to build first is the player's call, not the team's. |

An item with none of them moves. The team's owner writes and the item waits: its Dev Hours go to the
pool, and later items go ahead of it. **Approve** clears the wait for good, because an item never
stops twice. **Later** keeps it waiting and brings the Mail back after a calendar day.

## Engineering tasks

Tasks are DH spent on the system instead of the product. Many come from incident action items.

An action item is not always a task: a postmortem opens the first **research** in its kind's
prevention list that the player does not own and can study now
([Incidents](/design/11-incidents#postmortems)). The six kinds 11 names by hand open research, not
tasks here: online schema migrations, leap smearing, dependency scanning, Deno permissions,
point-in-time recovery, restore drills and infrastructure as code
([Incidents](/design/11-incidents#the-six-kinds)). A response during the incident is the other half:
cancel the migration, pin and redeploy, restore from a backup, restart the Nodes a clock jump hit
([Mitigation toolbox](/design/11-incidents#mitigation-toolbox)).

Ten tasks are designed. The build has eight, and four of those are not in this list.

| Task                        | DH  | Effect                                                                      | Status                                      |
| --------------------------- | --- | --------------------------------------------------------------------------- | ------------------------------------------- |
| Add index (per query shape) | 4   | Removes one slow query shape ([Data tier](/design/07-data-tier#indexes)).   | Built                                       |
| Eager loading               | 10  | Removes N+1 multipliers on one service.                                     | Built                                       |
| Fix memory leak             | 15  | Stops RSS growth on one service until the next big feature.                 | Built                                       |
| Idempotency keys            | 20  | Removes `duplicate` on checkout and double-processing on queues.            | Research "Idempotency keys", not a task     |
| Move CPU work off the loop  | 12  | Node.js and Python async only: moves a CPU-heavy kind to worker threads.    | Not built yet                               |
| Add timeouts and retries    | 8   | Applies a link policy to every link of one service.                         | Research "Timeouts and retries", not a task |
| Graceful shutdown           | 6   | Deploys and scale-downs finish in-flight requests instead of failing them.  | Not built yet                               |
| Health check endpoint       | 4   | Enables deep health checks.                                                 | Research "Health checks", not a task        |
| Write a runbook             | 10  | Enables automatic mitigation for one incident type (with an SRE team).      | Built                                       |
| Load test                   | 15  | Shows the capacity of each Node at 2× current demand, for one calendar day. | Not built yet                               |

The build's other four tasks:

| Task               | DH  | Effect                                                                    |
| ------------------ | --- | ------------------------------------------------------------------------- |
| Drop session state | 8   | Transaction pooling stops breaking queries.                               |
| Refactor           | 10  | Tech debt −20 points ([Tech debt](#tech-debt)).                           |
| Fix migration bugs | 1   | Queued by a migration: the new Stack stops failing requests.              |
| Upgrade clusters   | 24  | Every Kubernetes Cluster runs a supported version for a calendar quarter. |

## Spikes

A **Spike** is a Team's time-boxed work on the running Study
([Progression](/design/10-progression#studies)). The player adds it to a Team's backlog like a task.
While the Team works on it, the Study runs at 2× speed, and the Team's Dev Hours go to the Spike
instead of to Features or tasks. The Spike ends when its Study completes or the player removes it.
Only one Team can spike a Study.

So research competes with the product for engineers, as it does at real companies. A player who
needs `caching` now can buy it with a Team's time instead of waiting.

## Migrations

A migration changes a service's language, moves a capability between Components, or splits a service.

```text
migration_DH = codebase_size × migration_factor
codebase_size grows with every feature shipped on that service (in thousands of lines)
```

| Migration                                 | Factor                | Notes                                                                                 | Status        |
| ----------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- | ------------- |
| Variant inside a language (FPM to Octane) | 0.1                   | Fast, with surprises (state bleed).                                                   | Built         |
| Framework inside a language               | 0.5                   |                                                                                       | Built         |
| Language change                           | 1.0                   | Multiplied by the target language's velocity inverse: rewriting into Rust costs more. | Built         |
| Split a service                           | 0.3 of the moved part | Adds a Service with its own owner and Features ([Services](#services)).               | Built         |
| Move auth in-house from an Auth Provider  | Fixed 120             |                                                                                       | Not built yet |
| Database engine change                    | 0.8                   | Plus a data copy that takes calendar time proportional to volume.                     | Not built yet |

Two migration kinds exist: a Stack change moves a Service's runtime and framework, and a split makes
a new Service ([Services](#services)). Nothing moves auth in-house, and nothing changes a database
engine.

During a migration:

- Both versions run, and the player shifts traffic in steps (strangler pattern): 5%, 25%, 50%, 100%.
- Each step can reveal bugs, which appear as a small error rate on the new version until fixed.
- Features on that service ship at half speed.

The "big rewrite" is a trap. A full-company language change while competitors ship features costs
users. The game makes this visible with a market-share line in the Series B Era and later.

## Tech debt

**Tech debt** is a percentage from 0% to 100% per service.

| Grows with                                                                                              | Effect                             |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Each Feature shipped, at its team's policy: 6 points under Move fast, 3 under Balanced, 1 under Quality | Velocity × (1 − 0.5 × debt)        |
| Hotfixes during incidents                                                                               | Incident chance × (1 + debt)       |
| No framework, as the codebase grows                                                                     | New hire ramp-up × (1 + debt)      |
| Skipped tests (no CI)                                                                                   | Bad-deploy chance × (1 + 2 × debt) |

Paydown: assign DH to "Refactor" on a service. Each DH removes a fixed amount of debt. Paying down
debt earns nothing directly. It makes everything else cheaper, which is why it is real.

## Team policy

One setting per team, changeable at any time with a one-calendar-day transition.

| Policy    | Velocity | Debt per Feature                  | Bad-deploy chance | Deploys per day |
| --------- | -------- | --------------------------------- | ----------------- | --------------- |
| Move fast | 1.3×     | 6 points                          | 1.5×              | 16              |
| Balanced  | 1.0×     | 3 points                          | 1.0×              | 8               |
| Quality   | 0.8×     | 1 point, with 10% passive paydown | 0.5×              | 4               |

## Deploy frequency

Features ship in deploys. A feature finished between deploys waits for the next one.

```text
deploys_per_calendar_day = min(policy's cap, 480 minutes of work / (build_time + deploy_time + verify_time))
```

- Build time comes from the language ([Runtimes](/design/06-runtimes#language-profiles)). Rust's 12-minute
  builds and Java's 6-minute builds slow shipping. PHP's 30-second builds and file-copy deploys speed
  it up.
- Deploy time comes from the strategy ([Components](/design/05-components#cicd-pipeline)) and the runtime
  startup and warmup. A manual deploy takes 30 minutes and a pipeline 5 without a Pipeline placed,
  and checking the result takes 15. A placed CI/CD Pipeline deploys in 2 minutes on Recreate, 5 on
  Rolling, 7 on Blue-green and 10 on Canary; a Platform team halves any of them.
- More deploys per day ship features sooner and make each deploy smaller, which lowers the size of a
  bad deploy. DORA research links deployment frequency and short lead times to better
  delivery performance. Its 2024 report found that change failure rate does not fall in step: the
  medium cluster had a lower rate than the high cluster. So the game lowers the size of a bad deploy
  with frequency, and it does not lower the chance.

Every deploy then rolls for a bug: 10% from Pre-seed on (none in the Garage), times the policy's
bad-deploy chance, times (1 + 2 × debt), times 0.7 with automated tests and 0.8 with code review. A
bad deploy fails 8% of the requests for each item it shipped, up to the ceiling its deploy strategy
sets: 40% without a Pipeline and on Rolling, 100% on Recreate, 10% on Blue-green and 5% on Canary.

**Built:** four of the five DORA metrics appear on the Team panel once the player has a CI/CD
Pipeline: deploy frequency, lead time for changes (the sim seconds between deploy slots), change
failure rate (bad deploys over every deploy the Company has made), and failed deployment recovery
time (the mean MTTR of every Bad deploy postmortem, a dash with none yet). Rework rate is not
built: the build keeps no record of a change a later deploy had to redo.
