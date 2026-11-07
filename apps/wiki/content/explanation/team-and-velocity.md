---
title: Team and velocity
summary: Where Dev Hours come from, why a bigger team is not a faster team, and how deploys, tech debt, and policy decide how fast you ship.
section: explanation
order: 8
era: 1
aliases: team, dev hours, dh, velocity, engineers, hiring, layoff, coordination, brooks's law, tech debt, policy, deploys, backlog, migration, platform team, autopilot
gdd: /design/08-team-and-velocity
---

Servers are half of your Company, and the people who change them are the other half. Their work is
measured in Dev Hours (DH), or engineer-hours. The Team spends Dev Hours on Features, engineering
tasks, migrations, and security patches.

## Where Dev Hours come from

In the Garage, you are the only engineer. You make 80% of an engineer's output because you also run
the Company, and you draw no salary. Hiring opens in Pre-seed.

Each team makes Dev Hours by this rule:

```latex
\begin{aligned}
\text{DH per Team day} &= \text{effective engineers} \times \text{velocity} \times 8 \\
\text{velocity} &= \text{Stack velocity} \times \left(1 - 0.5 \times \text{tech debt}\right) \times \text{policy} \\ &\quad \times \text{morale} \times \text{error budget}
\end{aligned}
```

An engineer works an 8-hour day. At 1× speed, one Team day passes in one real minute, so one
engineer makes 8 DH a minute.

Stack velocity comes from the language and framework of your App Servers, weighted by the traffic
each one serves. A convention-heavy framework such as Rails or Laravel raises it, and Rust lowers it.
The [Runtimes](/runtimes) pages list each Stack's velocity. A fast runtime can save servers and cost
engineer time, and a productive one does the reverse.

## Hiring takes Cash and time

A hire costs a one-time signing fee in Cash, and after that the salary adds to your Burn every
second. Both scale with the Era and with the language's salary factor. You always hire for the
language your Service runs, and a rare language such as Elixir or Rust takes longer to hire for.

A new hire works at 30% for their first Team week. Rails conventions halve that ramp, and with no
framework, tech debt stretches it. A layoff refunds nothing. It ends the salary, and the rest of the
team works at 90% for a Team week.

## Why ten engineers are not ten times faster

Every person on a team must agree with the others, and the number of conversations grows faster than
the headcount. The Simulation models this as a coordination penalty, its version of
[Brooks's law](/glossary/brookss-law):

```latex
\text{effective engineers} = n / \left(1 + 0.08 \times \left(n - 1\right) + 0.0004 \times n \times \left(n - 1\right)\right)
```

Eight people work like about five. Past about 48 people, a team gets slower as it grows. The penalty
counts inside each team, so you can split people into up to four teams, each with its own policy. A
structured framework such as Symfony, Spring Boot, or NestJS lowers the penalty by 30%, because its structure means less to agree on.

:::Note{tone="real"}
The second term comes from Neil Gunther's Universal Scalability Law, which also describes servers
that slow down as you add cores. Real companies split into small teams for the same reason, and a
Service in Quorum works the same way. A Service is a codebase one team owns, and a split moves
Features to a new Service with its own team, deploys, and bad deploys. See
[Conway's law](/glossary/conways-law).
:::

## The backlog and deploys

Work waits in a backlog in priority order, and each team builds the first item that no team ahead of
it has taken. A team with no engineers takes nothing. Spare Dev Hours go to a pool, which can rush
any item. A rushed item finishes now, but the hurry adds tech debt to its Service, and from Pre-seed
a rushed Feature makes its deploy likelier to ship a bug. With the autopilot
on, an idle team picks the next Feature it can build, and it queues a Refactor when debt gets high.

A finished Feature does not reach users at once. It waits for the next deploy:

```latex
\text{deploys per Team day} = \operatorname{min}\left(\text{policy cap},\ 480\ \text{work minutes} / \left(\text{build} + \text{deploy} + 15\ \text{verify}\right)\right)
```

Build time comes from the language. PHP builds in seconds, and Rust takes many minutes. A deploy by
hand takes 30 minutes, and [Continuous delivery](/research/ci) cuts that to 5 and lets you roll back a
bad deploy. A Platform team halves the deploy time again.

When a Feature ships, its card's effects apply to every user, and so does its load. Some Features
also ship hidden costs, such as a new query with no index, and [Code review](/research/code-review)
shows these costs before the Feature ships. The [Team](/team#features) reference lists every Feature.

## Bad deploys and blast radius

Each deploy can ship a bug. From Pre-seed, the base chance is 10%. The Move fast policy raises it, and
tech debt can triple it. [Automated tests](/research/testing-culture) lower it by 30% and Code review
by 20%.

A bad deploy fails 8% of App Server requests for each item it shipped, up to 40%. Small, frequent
deploys therefore break less when they break, which is the idea of
[blast radius](/glossary/blast-radius). The [Bad deploy](/incidents/bad-deploy) page shows how to end
one.

## Tech debt and team policy

[Tech debt](/glossary/tech-debt) is a percentage on your Service. Each shipped Feature adds some.
Code with no framework adds a point more, and a task shipped during an incident adds two, because it
is a hotfix. Debt slows velocity by up to half, raises the bad-deploy chance, and makes every
incident likelier.

Each team works under a policy:

| Policy    | Velocity | Debt per Feature | Bad-deploy chance | Most deploys a day |
| --------- | -------- | ---------------- | ----------------- | ------------------ |
| Move fast | 1.3×     | 6 points         | 1.5×              | 16                 |
| Balanced  | 1×       | 3 points         | 1×                | 8                  |
| Quality   | 0.8×     | 1 point          | 0.5×              | 4                  |

Quality also spends 10% of its Dev Hours on debt. A new policy takes over after one Team day. The
Refactor task removes 20 points for 10 DH. It earns nothing directly, but it makes everything else
cheaper and safer.

## Error budgets feed back into speed

From Series A, failed requests count against your SLO. After
[Error budgets](/research/error-budgets) research, the budget changes velocity. With more than half
the budget left, teams work 10% faster, and with the budget spent, they work at half speed.
Reliability becomes a resource that you spend on speed. [How incidents work](/explanation/incidents)
explains the budget.

## Platform teams

From Series A, any team but the founder's can become a Platform team. It builds no backlog and runs
your Kubernetes Clusters and the pipeline instead. Without one, each live Cluster takes half an
engineer's Dev Hours from your product teams. A staffed Platform team removes that tax, keeps Clusters
on a supported version, and halves deploy time.

## Migrations

Changing your Service's Stack starts a migration. Its Dev Hours grow with the codebase, and a
language change costs the most. Traffic moves in four steps: 5%, 25%, 50%, then 100%. Requests on the
new Stack fail 3% of the time until you fix its bugs, and Features build at half speed meanwhile. This
is the [strangler pattern](/glossary/strangler-pattern). See
[Choose a Stack](/guides/choose-a-stack).
