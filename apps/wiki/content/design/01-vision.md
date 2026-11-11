---
title: 1. Vision and pillars
summary: What the game is, who it is for, and the rules every design decision follows.
section: design
order: 1
---

## The pitch

Quorum is an incremental systems game for software engineers. You grow a startup from one
virtual machine in a garage to a public company that serves billions of people. You do it by
building and tuning the system that serves your users, one bottleneck at a time. You also decide what
users do: a product change that raises one kind of request is how you feed the research that unlocks
the next tool.

The genre is a node-graph automation game like Upload Labs, with the long-term pull of Factorio and
the replay layer of an idle game. The subject is real backend engineering.

## The fantasy

"I am the engineer who keeps it up." The player sees the graph go red at 3 AM and knows why. The same
player argues that PHP-FPM is fine, then proves it with numbers.

## Audience

| Segment                          | What they want                                                   | What the game gives them                                                                     |
| -------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Working backend engineers        | To see their real knowledge pay off and to argue about runtimes. | Mechanics that behave like production. Their instincts work, and their biases are tested.    |
| Junior engineers and students    | To learn system design without reading a book first.             | Fast feedback. Each concept arrives when the player first needs it, or earlier in a Sandbox. |
| Factorio and Upload Labs players | A new optimization problem with depth.                           | Throughput chains, ratios of request kinds, bottlenecks, and an end goal they can measure.   |
| Incremental game players         | Numbers that grow, deep systems, and a prestige loop.            | Nested loops, automation as a reward, and Legacy that changes the next run.                  |

The primary audience is the first row. Every mechanic must survive review by a senior engineer.
The other rows decide how the game teaches and paces.

## Experience goals

1. **Flow.** The player always knows the next problem. A new bottleneck appears every few minutes,
   and a fix shows its result within seconds.
2. **Recognition.** The player says, "That is exactly what happened to us." Incidents, tradeoffs,
   and failure modes come from real outages and real runtime behavior.
3. **Argument.** Two players disagree about the best stack, and both are right for their own
   design. The game supports many viable builds.
4. **Mastery.** A player with 100 hours plays very differently from a player with 10 hours, and the
   difference is knowledge, not grinding.
5. **Pride.** The player wants to screenshot the design and share the numbers.

## Design pillars

Five pillars govern every design decision. When two conflict, the earlier one wins.

### Pillar 1: Every number is a real thing

Each mechanic models a real behavior. The game simplifies, but it never invents a behavior that
contradicts how real systems work. When an engineer asks "why does this happen", the answer is a
real concept such as [Little's law](/glossary/littles-law), a
[GIL](/glossary/gil-global-interpreter-lock), or a
[replication lag](/glossary/replication-lag).

Test: every rule has a row in [Reality check](/design/reality-check).

### Pillar 2: Tradeoffs, not tiers

No upgrade strictly dominates another. Each choice moves the player along a cost profile with at
least two axes: throughput, tail latency, memory, money, Dev Hours, reliability, and operational
risk. Rust is fast but slow to write. Node.js handles many idle connections but stalls on CPU work.
PHP-FPM is slow per request, but it cannot leak memory between requests. The request mix follows the
same rule: a Product lever buys one kind's Insight with capacity, growth, and Dev Hours.

Test: for each runtime, framework, and Component variant, at least one realistic design exists in
which it is the best choice. [Balancing](/design/16-balancing#the-dominance-test) defines the check.

### Pillar 3: The bottleneck is the content

Content comes from moving the bottleneck: each fix shifts the constraint to a different place. A new unlock must introduce a new problem, not a bigger number with a new label. This pillar
answers the main complaint about Upload Labs: "the same loop with different labels"
([Influences](/design/02-influences#why-players-quit)).

Test: each Era brings at least one new failure mode that the previous Era's tools cannot solve.

### Pillar 4: The board is the dashboard

The player reads the state of the system from the board, not from menus. Node cards show live
load, throughput, latency, and stack. Particles show request kinds, link thickness shows volume,
and color shows health. Menus hold configuration, not information.

Test: during normal play, the player can find the bottleneck without opening a panel.

### Pillar 5: Respect the player

Quorum has no paid timers, no energy, no loot boxes, and no fear of missing out. Tedium is a
design bug, so automation of repeated actions is a reward the player earns, and it arrives before
the action becomes tiresome. The game stops nagging when the player stops. Closing the Company stops
the clock too, so the game never asks the player to come back and collect, defend, or catch up
([Simulation](/design/04-simulation#the-clock-stops)).

Test: no action needs more than five repeated clicks without a bulk alternative.

## What Quorum is not

- **Not a certification course.** The game does not quiz the player. It teaches through
  consequences.
- **Not a vendor catalog.** Products appear as examples of a category, such as "Cache (Redis)".
  The game does not rank vendors.
- **Not a Kubernetes simulator.** Quorum models the behaviors that the player optimizes, and it
  models them directly ([ADR 0022](https://github.com/elianiva/quorum/blob/main/docs/adr/0022-the-company-pauses-when-the-player-leaves.md)).
- **Not an infinite number treadmill.** The user count stops at the number of people online, about
  6 billion ([Reality check](/design/reality-check#scale)). After that, the game is about margin,
  latency, and reliability.
- **Not a language war with a winner.** Stereotypes such as "PHP is slow" are the starting point of
  a mechanic, not its conclusion.

## Success measures

| Measure                                                  | Target                    |
| -------------------------------------------------------- | ------------------------- |
| Time to first meaningful choice                          | Under 60 seconds          |
| Time to first bottleneck the player fixes alone          | Under 3 minutes           |
| First company to IPO                                     | 9 to 12 hours of play     |
| Content to complete all Ventures and Legacy              | 80 to 150 hours of play   |
| Share of playtesters who can explain a p99 after 2 hours | More than 70%             |
| Share of distinct winning stacks in Challenge histograms | No single stack above 40% |

## Related documents

- [Game loops](/design/03-game-loops) turns the experience goals into loops.
- [Runtimes and frameworks](/design/06-runtimes) is the main application of pillar 2.
- [Interface and game feel](/design/15-ui-ux) is the main application of pillar 4.
