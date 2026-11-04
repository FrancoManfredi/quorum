---
title: Measurements
summary: Balance snapshots taken at a named simulation version.
section: design
order: 21
---

Recorded at `SIM_VERSION` 17, whose golden replay hashes to `0cb85ad1`, on 4 November 2026. These are
snapshots taken at that version; they are not claims about the current build. When the tuning changes,
the numbers are measured again and this page is stamped with the new version and date.

The bots run the real simulation through `packages/simulation/src/pacing.ts`. Seeds are the
simulation's seeds, not the random seeds of a playtest.

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
roadmap](/design/17-scope-and-roadmap#milestones)), which the Challenge pace reaches at 26.8–35.7 sim
minutes; nothing else in the table has a target.

Seed lasts 23–25 minutes because the Team's Features raise growth and the market: 5,000 to 25,000
users against a 35,000 market at `g` = 0.0016 takes 28 minutes on its own. The bot's autopilot builds
Features in catalog order, so Profile photos, which gates `upload`, has not shipped by Series A; its
Queue and Worker branch never runs in a Company, and the Seed Sandboxes play it instead.

Margin at Series A entry is 84–85% at the live prices and −120% to −126% at the design's Series A cost
index of 120: at that index the build's Seed Designs cannot pay their way. That is recorded, not
asserted; no bot checks the 25% to 45% target.

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
`report`, and `ai` do not, and `series-b.test.ts` and the Series B Sandboxes play them.

The bot spends its error budget many times over. A 99.9% week allows 10 seconds of full outage, and
the bot's incidents are not spread as the design intends. Churn after a long incident (a slow query,
a zone outage before Multiple zones) takes 30% to 50% of its users. These are recorded, not tuned.

## Series C to Public

The Balanced bot does not reach Series C. On seed 3 it ends at 130 sim minutes in Series B with
279,624 users, against the 10,000,000 that Series C needs; on seed 1 it holds 283,477.
`series-c.test.ts` and the Series C Sandboxes play the Series C to Public mechanics on built Designs.

The M6 exit check, an IPO in 9–12 hours, is not measured ([Known balance
gaps](/design/16-balancing#known-balance-gaps)).

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
replay takes under 2 s, and Five Nines (40,320 sim seconds at 60 s Steps) takes about 6 s. workerd and
browser times for the newer Challenges are not measured.

## Polish

Recorded state of the interface at this version.

| Topic          | Recorded                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Settings       | Mute and Reduce motion in `quorum.prefs.v1`; `M` toggles mute. No text scale: card text is fixed           |
| Sound          | Incident, Era, and achievement sounds, skipped when muted                                                  |
| Status         | Node cards mark ok, warn, danger, and down with a dot, a triangle, a square, and a cross as well as colour |
| Request kinds  | Packets are circles in the kind's colour                                                                   |
| Reduced motion | Packets hold still and the Bottleneck stops pulsing; panels and toasts appear at once                      |
| Keyboard       | Arrows select the nearest Node, Enter moves focus into the Inspector, `G` opens the Glossary, `C` collects |
| Contrast       | Light `--ok` at L 0.50 and `--danger` at L 0.52, so status text is at least 4.5\:1 on wells                |
| Achievements   | 23 of the 44 are detected, each tick in a Company, never in a Sandbox or Challenge                         |
| Glossary       | All 119 entries of `glossary.md`, kept in sync by a test; met entries carry a check; card terms open it    |

axe-core 4.11 (WCAG 2.0/2.1 A and AA plus best practices), before and after the contrast fix:

| Screen                  | Before                                                    | After   |
| ----------------------- | --------------------------------------------------------- | ------- |
| Title                   | 0 violations                                              | 0       |
| Lab, Team panel open    | 0 violations; `aria-hidden-focus` incomplete (build dock) | 0; none |
| Lab, panel closed       | 1 violation                                               | 0       |
| Daily drill (Challenge) | 1 serious `color-contrast` (`.text-ok`, 3.64\:1)          | 0       |

## Insight by Era

Measured on seed 1 at 130 minutes, with the Balanced bot's own Design and a larger Analytics tap:
research available in each Era, and how long the tap takes to buy all of it.

| Era      | Research in the Era | Time to buy all of it                                                |
| -------- | ------------------- | -------------------------------------------------------------------- |
| Garage   | 455 ◇               | ~8 min at size 1, the Era is ~11 min                                 |
| Pre-seed | 2,580 ◇             | 20–33 min at size 1, the Era is ~17 min                              |
| Seed     | 11,150 ◇            | ~22 min at size 4 and 10%, for 6% of revenue; the Era is ~21 min     |
| Series A | 59,000 ◇            | ~4 min at size 8 and 50% (the 512 samples/s cap), the Era is ~38 min |
| Series B | 78,000 ◇            | ~5 min at the cap                                                    |

### Calibration

Two bots, five seeds each, 130 minutes. The Balanced bot follows its priority list with
2 Studies queued and no Spikes. The Skilled probe (not committed) queues 8 Studies, spikes every
priority Study, and fills the queue with the cheapest open items. Each cell is when the Era's last
priority item completes, as a share of the Era, and how much of the Era's catalog was done in it.

| Era      | Balanced: last priority item | Balanced: catalog | Skilled: last priority item | Skilled: catalog |
| -------- | ---------------------------- | ----------------- | --------------------------- | ---------------- |
| Garage   | 47%                          | 7/15              | 48%                         | 15/15            |
| Pre-seed | 42–59%                       | 7–9/21            | 65–81%                      | 11–15/21         |
| Seed     | 45–81%                       | 9/20              | 53–78% (one seed 146%)      | 11–20/20         |
| Series A | 94–109%                      | 6–7/21            | 65–149%                     | 10–15/21         |

Open points from the calibration:

- `tiered-caching` costs `media`, and Video ships late in Series A, so it often completes in Series
  B. That is the recipe working as designed, but it pushes the Series A tail past 100%.
- Series B's priority items (`hosted-models`, `data-warehouse`) need `ai` and `report`, which arrive
  with their Features. The bots stop at 130 minutes before they ship.
- Postmortems: an action item goes first in the queue, so incidents now slow other research.
