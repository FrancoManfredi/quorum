---
title: Measurements
summary: Balance snapshots taken at a named simulation version.
section: design
order: 21
---

These snapshots were recorded at Simulation version 17 (the old numbered scheme) on 4 November 2026.
They make no claim about the current build. When the tuning changes, the numbers are measured again
and the page gets the new version and date.

The bots run the real Simulation through `packages/simulation/src/pacing.ts`. The seeds are the
Simulation's seeds, which differ from the random seeds of a playtest.

## Pacing

### Challenge pace

The Balanced bot at the Challenge pace (`CHALLENGE_TUNING`), seeds 1–5,
until 90 sim minutes.

| Milestone             | Measured (sim min)                                                |
| --------------------- | ----------------------------------------------------------------- |
| First research        | 0.7                                                               |
| First upgrade         | 6.6                                                               |
| Database split        | 6.6                                                               |
| First Feature live    | 1.4                                                               |
| Pre-seed              | 10.7                                                              |
| First hire            | 18.1                                                              |
| Second App Server     | never before Seed                                                 |
| First incident        | 18.4–20.7                                                         |
| Seed                  | 26.8–35.7, and 26.8–29.3 on seeds 1 and 3                         |
| Engineers at Seed     | 2–4                                                               |
| Features live at Seed | 4–6                                                               |
| Margin at Seed entry  | 65–81% at the live prices; −55% to 20% at the design's cost index |

### Live pace

The Balanced bot at the live tuning (`LIVE_TUNING`), seeds 1 and 3.

| Era      | Measured (sim min) |
| -------- | ------------------ |
| Pre-seed | 5.8                |
| Seed     | 20.5–21.1          |
| Series A | 65.5               |
| Series B | 102–106            |

The live pace doubles growth and shortens the incident gap to 200 sim seconds, so it reaches Seed
sooner and recovers more often in the Eras after it.

## Seed

The Balanced bot at the Challenge pace, seeds 1 and 3.

| Milestone            | Measured (sim min) |
| -------------------- | ------------------ |
| Seed                 | 26.8–29.3          |
| Search Engine placed | 30.2–32.3          |
| WAF placed           | 33.3–34.3          |
| Second App Server    | 32.3–43.9          |
| Series A             | 51.9–52.7          |
| Seed length          | 23–25              |

The M2 gate asks for Seed on every seed ([Scope and
roadmap](/design/17-scope-and-roadmap#milestones)). The Challenge pace reaches it at 26.8–35.7 sim
minutes. Nothing else in the table has a target.

Seed lasts 23–25 minutes because the Team's Features raise growth and the market. Going from 5,000
to 25,000 users against a 35,000 market at `g` = 0.0016 takes 28 minutes on its own. The bot's
autopilot builds Features in catalog order, so Profile photos, which gates `upload`, has not shipped
by Series A. Its Queue and Worker branch never runs in a Company, and the Seed Sandboxes play it
instead.

Margin at Series A entry is 84–85% at the live prices and −120% to −126% at the design's Series A cost
index of 120, because at that index the build's Seed Designs cannot pay their way. The figure is
recorded, not asserted, and no bot checks the 25% to 45% target.

## Series A and Series B

The Balanced bot at the Challenge pace, seeds 1 and 3, until 130 sim minutes. Series B has no content
after its Features, so the run stops on the clock.

| Milestone                | Measured (sim min) |
| ------------------------ | ------------------ |
| Series A                 | 51.9–52.7          |
| Second zone and standbys | 56.0–56.8          |
| Series B                 | 91.2–92.7          |
| Users at 130 min         | 279,624–283,477    |
| Availability at 130 min  | 95.46–95.75%       |

Series A leaves at 150,000 users and Series B at 1,000,000 ([Progression](/design/10-progression#eras));
the bot raises both on every seed it plays, and its SLO is 99.9%.

The bot researches Multiple zones first, then spreads every other App Server and Worker to zone B and
gives every data Node a standby. Its autopilot ships Video, Chat, and Checkout in Series A, so
`media`, `rt`, and `buy` reach a bot Company; it ships none of the Series B Features, so `job`,
`report`, and `ai` do not, and `sandbox.test.ts` plays them on the Series B Sandboxes.

The bot spends its error budget many times over. A 99.9% week allows 10 seconds of full outage, and
the bot's incidents are not spread as the design intends. Churn after a long incident (a slow query,
a zone outage before Multiple zones) takes 30% to 50% of its users. These numbers are recorded, not
tuned.

## Series C to Public

The Balanced bot does not reach Series C. On seed 3 it ends at 130 sim minutes in Series B with
279,624 users, against the 10,000,000 that Series C needs; on seed 1 it holds 283,477.
`sandbox.test.ts` plays the Series C to Public mechanics on built Designs.

No bot plays to the IPO, so no IPO time is recorded. [What the checks cover](/design/16-balancing#what-the-checks-cover) lists the checks.

## Exit and Legacy

A second Company on the same seed, with Angel network 1, Pattern recognition 1, and Founder's
reputation 1 (10 Legacy), against a first Company, both played by the Balanced bot
(`legacy-pacing.test.ts`).

| Seed | First: Pre-seed | First: Seed | Second: Pre-seed | Second: Seed |
| ---- | --------------- | ----------- | ---------------- | ------------ |
| 1    | 10.7            | 26.8        | 9.8              | 25.1         |
| 2    | 10.7            | 35.7        | 9.8              | 26.3         |
| 3    | 10.7            | 29.3        | 9.8              | 25.2         |

Sim minutes. The M7 exit check, a second Company that reaches its Exit in 3 to 6 hours, is not
measured: the Balanced bot does not reach Public.

## Challenges

Verification time for each reference replay (wall clock). Each run replays a Challenge's reference
solution from t = 0 at its own Step.

| Challenge            | Steps | Node   | workerd | Chromium | Firefox | WebKit |
| -------------------- | ----- | ------ | ------- | -------- | ------- | ------ |
| Hello, World         | 180   | 140 ms | 48 ms   | 122 ms   | 75 ms   | 120 ms |
| Split the Box        | 240   | 218 ms | 101 ms  | 150 ms   | 218 ms  | 279 ms |
| Slashdotted          | 300   | 1.5 s  | 0.96 s  | 1.4 s    | 1.8 s   | 1.6 s  |
| The Event Loop       | 240   | 191 ms | 121 ms  | 210 ms   | 189 ms  | 156 ms |
| Too Many Connections | 240   | 3.7 s  | 2.3 s   | 3.2 s    | 3.1 s   | 2.9 s  |

The longest replay, Too Many Connections (81 Nodes), takes about 2.3 s of CPU in workerd. That fits
the Workers Paid default of 30 s CPU per request but not the Free plan's 10 ms, so the API Worker
needs a paid plan; no `limits.cpu_ms` change is needed for these five. In Node, every other reference
replay takes under 2 s, and Five Nines (40,320 Steps of 60 sim seconds) takes about 6 s. workerd and
browser times for the newer Challenges are not measured.

## Polish

Recorded state of the interface at this version.

| Topic          | Recorded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings       | Mute, Reduce motion, and Text at 150% in `quorum.prefs.v1`; `M` toggles mute. The text scale is `--type-scale` on the interface; board cards scale with the board's zoom, and the Research tree's Node boxes and spacing grow by 1.5 while a long item name wraps onto a second line. Copy save as text and Import a save move a Company as one `QSV1:` line, refused when its version is another build's                                                                                                      |
| Board zoom     | Zoomed out past 0.38× a card drops its rows, and from 0.36× it becomes a chip: its block, its name and a ring of its load, with its size pips, zone and footer gone. At a third of full size, every Node on the Far Away Sandbox still reads as a named block                                                                                                                                                                                                                                                  |
| Region links   | A belt between two regions carries the round trip its calls pay under its midpoint: 75 ms NA↔EU and 160 ms EU↔APAC from `rttOf`, and 150 ms from a Users Node, which pays a user's two round trips. A link into a global Component pays no place, so it shows no plate                                                                                                                                                                                                                                         |
| Sound          | Incident, Era, and achievement sounds, skipped when muted                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Status         | Node cards mark ok, warn, danger, and down with a dot, a triangle, a square, and a cross as well as colour                                                                                                                                                                                                                                                                                                                                                                                                     |
| Request kinds  | Packets are one of four shapes in the kind's colour; kinds that share a colour share a shape                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Reduced motion | Packets hold still and become arrows under the rate each belt carries; the Bottleneck stops pulsing; panels and toasts appear at once                                                                                                                                                                                                                                                                                                                                                                          |
| Keyboard       | Arrows select the nearest Node, Enter moves focus into the Inspector and places a part in hand, `L` links the selected Node, `Shift+T` tidies, `Shift+F` fits, `G` opens the Glossary, `C` collects, Tab reaches a Node list that opens any Node and the Dashboard's scroll area                                                                                                                                                                                                                               |
| Contrast       | Light `--ok` at L 0.50 and `--danger` at L 0.52, so status text is at least 4.5\:1 on wells                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Achievements   | 40 of the 42 are detected each tick in a Company, never in a Sandbox or Challenge; Serial founder and Five Nines come from an Exit                                                                                                                                                                                                                                                                                                                                                                             |
| Glossary       | Every entry of the glossary catalog; the wiki's `/glossary` pages and the panel share it, and a test checks its references; met entries carry a check; card terms open it                                                                                                                                                                                                                                                                                                                                      |
| Dashboard      | Five annotation groups, each with a switch; yesterday's line under the Traffic and Latency series; a Request kind and a Region that narrow the per-kind and per-region panels; a table view for every time series; Cash per second among the Overview's stats, from the Samples' `cash`; an App Server row of copies and busy workers; an SLO row of availability this week, the error budget gauge, the SLA credit and the burn rate. Research marks read the Inbox, since no field on the Game dates a Study |
| Incident loop  | The pager and its Ignored rules; a postmortem card per run with MTTD, MTTA and MTTR beside each other, a dash where the Game has no time; the Incidents row's three tables; and a timeline that splits each lane at its first signal and its acknowledgement, so the not-seen and awaiting-ack spans show beside the SEV-coloured run, the running Incident last. The HUD adds an SLA row under the runway while the credit pays                                                                               |

axe-core 4.11 (WCAG 2.0/2.1 A and AA plus best practices), before and after the contrast fix:

| Screen                  | Before                                                    | After   |
| ----------------------- | --------------------------------------------------------- | ------- |
| Title                   | 0 violations                                              | 0       |
| Lab, Team panel open    | 0 violations; `aria-hidden-focus` incomplete (build dock) | 0; none |
| Lab, panel closed       | 1 violation                                               | 0       |
| Daily drill (Challenge) | 1 serious `color-contrast` (`.text-ok`, 3.64\:1)          | 0       |

## Insight by Era

Measured at Simulation version 17, before the catalog grew, on seed 1 at 130 minutes, with the
Balanced bot's own Design and a larger Analytics tap. The first column is research available in each
Era then, and the last column is how long the tap took to buy all of it. The second column is the
current catalog's total for the Era, summed from `packages/simulation/src/catalog/research.ts`. It is
not a measurement, so the time column does not describe it.

| Era      | Research in the Era (measured at version 17) | Research in the Era (current catalog) | Time to buy all of it (measured at version 17)                       |
| -------- | -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| Garage   | 455 ◇                                        | 455 ◇                                 | ~8 min at size 1, the Era is ~11 min                                 |
| Pre-seed | 2,580 ◇                                      | 2,880 ◇                               | 20–33 min at size 1, the Era is ~17 min                              |
| Seed     | 11,150 ◇                                     | 20,750 ◇                              | ~22 min at size 4 and 10%, for 6% of revenue; the Era is ~21 min     |
| Series A | 59,000 ◇                                     | 161,800 ◇                             | ~4 min at size 8 and 50% (the 512 samples/s cap), the Era is ~38 min |
| Series B | 78,000 ◇                                     | 409,000 ◇                             | ~5 min at the cap                                                    |

### Calibration

Measured at Simulation version 17, before the catalog grew. Two bots, five seeds each, 130 minutes. The Balanced bot follows its priority list with
2 Studies queued and no Spikes. The Skilled probe (not committed) queues 8 Studies, spikes every
priority Study, and fills the queue with the cheapest open items. Each cell is when the Era's last
priority item completes, as a share of the Era, and how much of the Era's catalog was done in it.

| Era      | Balanced: last priority item | Balanced: catalog | Skilled: last priority item | Skilled: catalog |
| -------- | ---------------------------- | ----------------- | --------------------------- | ---------------- |
| Garage   | 47%                          | 7/15              | 48%                         | 15/15            |
| Pre-seed | 42–59%                       | 7–9/21            | 65–81%                      | 11–15/21         |
| Seed     | 45–81%                       | 9/20              | 53–78% (one seed 146%)      | 11–20/20         |
| Series A | 94–109%                      | 6–7/21            | 65–149%                     | 10–15/21         |

The catalog counts in the denominators are the version 17 counts. The current catalog has 15 items in
the Garage, 22 in Pre-seed, 36 in Seed and 58 in Series A, so the shares of the catalog above are not
comparable with it.

Open points from the calibration:

- `tiered-caching` costs `media`, and Video ships late in Series A, so it often completes in Series
  B. That is the recipe working as designed, but it pushes the Series A tail past 100%.
- Series B's priority items (`hosted-models`, `data-warehouse`) need `ai` and `report`, which arrive
  with their Features. The bots stop at 130 minutes before they ship.
- Postmortems: an action item goes first in the queue, so incidents slow other research.
