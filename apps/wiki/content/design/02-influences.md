---
title: 2. Influences and research
summary: Why players love Upload Labs, Factorio, and Opus Magnum, and why some players quit.
section: design
order: 2
---

This page records what comparable games and their players teach, and the Quorum rule each lesson
becomes. The research comes from web search in October 2026. Sources are listed at the end.

## Upload Labs

Upload Labs (EnigmaDev Studios, October 2025) is a free-to-play incremental game where the player
connects window-like Nodes that download, process, and upload files. About 5,000 English Steam
reviews exist, and about 89–90% of them are positive.

### Why players like it

| Observation                                                                                                                                                                               | Evidence                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Nodes are windows full of live numbers.** Each Node shows its own throughput and state, so the board is the dashboard.                                                                  | Wiki: Nodes are "window-like interfaces representing internal computer components and processes".                                 |
| **Flow goes left to right.** A source, processors, an uploader, and a collector. The player reads the chain at a glance.                                                                  | Getting-started guide: "The connection flow in the game is always from left to right."                                            |
| **Income per second is the score.** Players learn to watch the rate, not the total, and to compare before and after each change.                                                          | Nub Games guide: "Income per second is the better signal because it quickly shows whether a change delivered a real improvement." |
| **Upgrade the slowest stage.** The core skill is to find the limiting stage, not to add more Nodes. Extra branches can make the system slower because consumers share throughput.         | Nub Games guide: "upgrade the slowest stage instead of boosting the entire network at once".                                      |
| **Stacked multipliers invite theorycrafting.** Processors such as Refiner, Pre-analyzer, and Enhancer multiply value, size, or research yield. Players discuss the best chains on forums. | Steam discussion "Best combination to get research points?" with chains like "data refiner > pre-analyzer > enhancer > data lab". |
| **Resource ratios.** Advanced players split CPU, GPU, download, and upload by ratio to the cycles each Node needs.                                                                        | Steam guide "Full Guide 2.2": "If 1 node requires 100C and another requires 50C, split the CPU 2\:1."                             |
| **Several currencies, several loops.** Cash, Tokens, Science, Hacker XP, and Application Points each feed a different system.                                                             | Upload Labs wiki, "Progression & Prestige".                                                                                       |
| **A prestige portal with modifiers.** Version 3.0 reworked the portal around "universe modifiers, which change how you play in exchange for increased game speed".                        | SteamDB patch notes, 20 September 2026.                                                                                           |
| **It runs in the background.** The game is light and can be minimized.                                                                                                                    | Getting-started guide.                                                                                                            |

### Why players quit

| Complaint                                                                                                                                                             | Evidence                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Shallow late game.** New file types repeat the same loop with a bigger number. "Unlocking a new machine or resource \[should introduce\] a fresh problem to solve." | Steam discussion "A promising concept hiding a shallow idle grind".                |
| **Numbers lose meaning.** Suffixes go k, M, b, t, and then aa, ab, ac. "This destroys any sense of scale or achievement."                                             | Same discussion. The author proposes a clear end target.                           |
| **Click tedium after prestige.** "Having to click on each network node 200 times for upgrades… this game triggered my carpal tunnel."                                 | Steam discussion "This game is painful".                                           |
| **Poor documentation.** "This game barely has any documentation, the guide is no help at all at some points."                                                         | Steam discussion "Questions about 2.0".                                            |
| **Monetization pressure.** Paid tokens and time generators feel like a mobile game.                                                                                   | VaporLens review summary; Steam store DLC list ("Daily Tokens", "Time Generator"). |
| **Confusing tutorial.**                                                                                                                                               | VaporLens: "Tutorial is confusing and buggy" is the top complaint.                 |

## Factorio

Factorio is the reference for automation games, and software developers love it.

| Observation                                                                                                                                                                                              | Evidence                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Evenly spaced goals.** "It evenly spaces out its achievement moments so that you get a steady stream of goals."                                                                                        | Hacker News thread on Factorio addiction.                                                                               |
| **Every problem is the player's fault.** "Almost every single problem is directly caused by the player's own actions, through a logical chain of events."                                                | Same thread.                                                                                                            |
| **It feels like programming.** Concurrency, bottlenecks, deadlocks, and starvation appear in the factory. "The only thing preventing you from doing this to your application is the lack of visibility." | Same thread.                                                                                                            |
| **Watching the system settle.** "Once you make a change, watching the system come to equilibrium again is really fun."                                                                                   | Fuseki.net, "What Is Interesting About Factorio".                                                                       |
| **Refactoring is inevitable.** Early designs become obsolete, and rebuilding them is part of the fun.                                                                                                    | LeadDev, "Factorio and the promise of better software engineering"; James Quigley, "Dev Lessons Learned From Factorio". |
| **Blueprints.** Reusable, tileable designs save time and reward modular thinking.                                                                                                                        | James Quigley.                                                                                                          |
| **Flow from challenge and mastery.** "As soon as you reach one goal, there's always a new goal which immediately pops up."                                                                               | TheGamer, "Yes, Factorio Is Actually THAT Good".                                                                        |
| **No manipulative tricks.** "There are certainly no loot boxes or randomized rewards."                                                                                                                   | Hacker News thread.                                                                                                     |

## Opus Magnum and Zachtronics

| Observation                                                                                                                                   | Evidence                         |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **A crude solution is easy; a good one is hard.** "Finding an initial, crude solution is easy… you're just seeing if you can make it better." | PC Gamer.                        |
| **Histograms, not leaderboards.** "Instead of asking 'Can you be number one?'… they ask, 'Can you make it to the 70th percentile?'"           | PC Gamer.                        |
| **Three axes that conflict.** Cost, cycles, and area. It is hard to lead on all three at once, so players choose a direction.                 | Engadget; biggieblog.com.        |
| **Watching machines work is satisfying.**                                                                                                     | Game Developer, Road to the IGF. |

## Idle game theory

| Observation                                                                                                                                                                 | Evidence                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **A seesaw between production and cost.** Production first beats costs, then costs become prohibitive. Prestige lets the player get further along the cost curve each time. | Anthony Pecorella, "The Math of Idle Games" (Kongregate). |
| **Prestige creates ladder climbing.** A reset with a large boost gives a sense of power.                                                                                    | Same, Part III.                                           |
| **Phase shifts.** Universal Paperclips changes what the game is about several times. "It's not merely the fact that the numbers go up but how they do so."                  | The New Yorker; How-To Geek.                              |
| **A real ending.** Lantz wanted the game "to end in a way that let people pull back from it".                                                                               | hey.gg interview with Frank Lantz.                        |

Quorum borrows prestige, phase shifts, and a real ending from idle games. It rejects their background
clock. The Company advances only while the player has it open, as Factorio's single-player factory
waits when the player quits, so leaving the game means leaving the Company alone.

## Research in factory games

Research in factory games matters here because the live Insight rate runs far ahead of research
costs from the Seed Era on ([Balancing](/design/16-balancing)). The research comes from November 2026.

| Observation                                                                                                                                                                         | Evidence                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Research is paid in kinds, not one currency.** Factorio has 7 science packs in the base game, and each needs its own production chain. More of an old pack never buys a new tier. | Factorio wiki, Research; teemo.dev, Research tech tree.     |
| **The slowest input limits research.** A technology needs one of each listed pack per unit, so the scarcest pack sets the rate.                                                     | teemo.dev, Research tech tree.                              |
| **Research takes time.** Each Factorio research unit has a lab time. Dyson Sphere Program labs produce a fixed hash rate. A full stock of packs still takes time.                   | Factorio wiki, Research; DSP wiki, Research.                |
| **Research uses what would make money.** An Upload Labs Data Lab consumes files that an Uploader would sell. Satisfactory milestones consume parts that cannot be taken back.       | Upload Labs wiki, Research; Satisfactory wiki, Milestones.  |
| **Quality beats volume.** Upload Labs yields 1 Research for a text file and 32 for a game file, and Refined files yield 2×.                                                         | Upload Labs wiki, Research.                                 |
| **New tiers ask for new shapes.** Each shapez level asks for one new, more complex shape. Freeplay asks for shapes per second, not a total.                                         | shapez wiki, Levels and Upgrading.                          |
| **Research speed is research.** Factorio's lab speed bonus and DSP's Research speed upgrades are technologies.                                                                      | teemo.dev, Research labs and science costs; DSP calculator. |

## Translation table

Each row turns one lesson into a Quorum rule and links the document that owns the rule.

| Lesson                           | Quorum rule                                                                                                                                                | Owner                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Nodes as live windows            | Node cards show Inbound, Capacity with a load bar, Stack, Latency, and Out. No decorative art on the board.                                                | [Interface](/design/15-ui-ux#node-cards)                  |
| Left-to-right flow               | Users enter on the left. Data stores sit on the right. Payments and Analytics sit at the bottom.                                                           | [Interface](/design/15-ui-ux#the-board)                   |
| Income per second                | The HUD leads with $/s. Each change shows a delta toast after the system settles.                                                                          | [Interface](/design/15-ui-ux#feedback-after-a-change)     |
| Upgrade the slowest stage        | The simulation is a flow network. The tightest Node limits the chain, and the board marks it.                                                              | [Simulation](/design/04-simulation#the-bottleneck)        |
| Stacked multipliers              | Runtimes, frameworks, and techniques multiply different terms of one formula, so combinations matter.                                                      | [Runtimes](/design/06-runtimes)                           |
| Resource ratios                  | Instance types split vCPU and RAM. Each runtime spends them in a different ratio.                                                                          | [Runtimes](/design/06-runtimes#the-capacity-model)        |
| Several currencies               | Cash, Insight, Dev Hours, and Legacy, each with one main source and one main sink.                                                                         | [Economy](/design/09-economy)                             |
| Prestige with modifiers          | Exit grants Legacy. The next company picks a Venture and optional Mutators.                                                                                | [Exit and Legacy](/design/13-prestige)                    |
| **Fix:** shallow late game       | Each Era adds a new failure mode, not a bigger number.                                                                                                     | [Progression](/design/10-progression#eras)                |
| **Fix:** meaningless numbers     | Real units only: users, rps, ms, $/s. The user count stops near 6 billion.                                                                                 | [Balancing](/design/16-balancing#number-ranges)           |
| **Fix:** click tedium            | Buy ×10 and Buy Max from day one, hold to repeat, policies at Series A, and Playbooks after the first Exit.                                                | [Interface](/design/15-ui-ux#bulk-actions)                |
| **Fix:** poor documentation      | Every Component, runtime, and incident has an in-game card that names the real behavior. The engineering glossary is on the wiki, one click from any term. | [Glossary](/glossary)                                     |
| **Fix:** monetization pressure   | No paid currency. No timers that payment can skip.                                                                                                         | [Vision](/design/01-vision#pillar-5-respect-the-player)   |
| **Fix:** confusing tutorial      | No tutorial screens. The Garage Era is the tutorial: one box, two request kinds, one choice at a time.                                                     | [Progression](/design/10-progression#era-0-garage)        |
| **Fix:** learning needs a replay | Guided Sandboxes teach each later mechanic outside the Company, like Factorio tutorial levels. The free Sandbox is a test bench.                           | [Sandbox](/design/14-challenges#sandbox)                  |
| **Reject:** background running   | The Company does not run in the background. Closing the page stops the Simulation, so the idle-game habit of checking on an away factory does not apply.   | [Game loops](/design/03-game-loops#session-shapes)        |
| Playtime is the only clock       | A single-player Factorio factory waits when you quit. Quorum's Company does the same, and nothing accrues while the player is away.                        | [Simulation](/design/04-simulation#the-clock-stops)       |
| Evenly spaced goals              | Pacing targets: a new goal every 2–5 minutes early, every 10–20 minutes late.                                                                              | [Game loops](/design/03-game-loops#pacing)                |
| Problems caused by the player    | Incidents attack weaknesses in the player's design. Random bad luck is rare and always survivable with redundancy.                                         | [Incidents](/design/11-incidents#design-rules)            |
| Lack of visibility               | Observability is a progression track. The player earns p99, traces, and profiles.                                                                          | [Observability](/design/12-observability)                 |
| Research paid in kinds           | Insight has a request kind. Each research item costs Insight of the kinds that teach it, so a new Era's research needs its traffic.                        | [Observability](/design/12-observability#earning-insight) |
| Quality beats volume             | Insight grows with the square root of sampled traffic, per Component and kind. A broad Design teaches more than a big one.                                 | [Observability](/design/12-observability#earning-insight) |
| Research takes time              | Research is a Study with a duration that takes its Insight over time. A Spike or study-speed research makes it faster.                                     | [Progression](/design/10-progression#studies)             |
| Watching the system settle       | After a change, the HUD shows "Settling", then "Stable" with the new rates.                                                                                | [Interface](/design/15-ui-ux#feedback-after-a-change)     |
| Refactoring is inevitable        | Migrations, service splits, and data moves are real projects that cost Dev Hours.                                                                          | [Team and velocity](/design/08-team-and-velocity)         |
| Blueprints                       | Playbooks: saved sub-designs that a player places in one action.                                                                                           | [Exit and Legacy](/design/13-prestige#playbooks)          |
| Histograms on conflicting axes   | Challenges score cost, p99, and complexity on three histograms.                                                                                            | [Challenges](/design/14-challenges)                       |
| Phase shifts                     | Each Era changes what the player optimizes: one box, then scale-out, data, availability, teams, geography, and margin.                                     | [Progression](/design/10-progression#eras)                |
| A real ending                    | Each company ends at an Exit with a score. The player chooses to continue.                                                                                 | [Exit and Legacy](/design/13-prestige)                    |

## Sources

- Upload Labs on Steam: <https://store.steampowered.com/app/3606890/Upload_Labs>
- Upload Labs wiki, Nodes: <https://www.upload-labs.com/en/wiki/nodes>
- Upload Labs wiki, Progression & Prestige: <https://www.upload-labs.com/en/wiki/progression>
- Upload Labs getting-started guide: <https://www.upload-labs.com/en/guides/getting-started>
- Nub Games, Upload Labs guide: <https://nub.games/blog/upload-labs-guide>
- Steam guide, Full Guide 2.2: <https://steamcommunity.com/sharedfiles/filedetails/?id=3624112172>
- Steam discussion, best research combination: <https://steamcommunity.com/app/3606890/discussions/0/603043591290522295>
- Steam discussion, "This game is painful": <https://steamcommunity.com/app/3606890/discussions/0/601919346587124638/>
- Steam discussion, "A promising concept hiding a shallow idle grind": <https://steamcommunity.com/app/3606890/discussions/0/601919346587212222/>
- Steam discussion, "Questions about 2.0": <https://steamcommunity.com/app/3606890/discussions/0/684116795952744705>
- SteamDB, Upload Labs 3.0 patch notes: <https://steamdb.info/patchnotes/25397076/>
- VaporLens, Upload Labs review summary: <https://vaporlens.app/app/3606890/upload_labs>
- Upload Labs wiki, Research: <https://labs-wiki.enigmastudio.dev/en/hub/research>
- Factorio wiki, Research: <https://wiki.factorio.com/Research>
- teemo.dev, Factorio research tech tree and science packs: <https://teemo.dev/game-design/factorio/systems/research-tech-tree-and-science>
- teemo.dev, Factorio research, labs and science costs: <https://teemo.dev/game-design/factorio/systems/research-labs-and-science-costs/>
- shapez wiki, Levels: <https://shapezio.fandom.com/wiki/Levels>
- shapez wiki, Upgrading: <https://shapezio.fandom.com/wiki/Upgrading>
- Satisfactory wiki, Milestones: <https://satisfactory.wiki.gg/wiki/Milestones>
- Dyson Sphere Program wiki, Research: <https://dyson-sphere-program.fandom.com/wiki/Research>
- Dyson Sphere Program calculator, Information Matrix: <https://dyson-calculator.com/en/items/detail/id/I_Matrix/name/Information+Matrix>
- Hacker News, Factorio addiction thread: <https://news.ycombinator.com/item?id=24156475>
- Fuseki.net, What Is Interesting About Factorio: <https://www.fuseki.net/What-Is-Interesting-About-Factorio>
- LeadDev, Factorio and better software engineering: <https://leaddev.com/career-development/factorio-and-the-promise-of-better-software-engineering>
- James Quigley, Dev Lessons Learned From Factorio: <https://blog.quigley.codes/dev-lessons-learned-from-factorio>
- TheGamer, Factorio impressions: <https://www.thegamer.com/factorio-impressions-steam-rating-that-good/>
- PC Gamer, Opus Magnum: <https://www.pcgamer.com/perfectly-solving-opus-magnums-puzzles-is-impossible-but-thats-ok/>
- Engadget, Opus Magnum: <https://www.engadget.com/2018-07-09-opus-magnum-zachtronics-irl.html>
- Kongregate, The Math of Idle Games, Part I: <https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i>
- Kongregate, The Math of Idle Games, Part III: <https://www.kongregate.com/en/pages/the-math-of-idle-games-part-iii>
- The New Yorker, Universal Paperclips: <https://www.newyorker.com/culture/culture-desk/the-unexpected-philosophical-depths-of-the-clicker-game-universal-paperclips>
- hey.gg, interview with Frank Lantz: <https://www.hey.gg/blog/frank-lantz>
