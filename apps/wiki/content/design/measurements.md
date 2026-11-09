## Recorded by hand

These sections record what the bots cannot take: replay timings, the state of the interface, and the
research calibration. They were taken at Simulation version 17 and describe that build. The pacing
tables above come from the current one.

### Challenges

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

### Polish

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
| Keyboard       | Arrows select the nearest Node, Enter moves focus into the Inspector and places a part in hand, `L` links the selected Node, `Shift+T` tidies, `Shift+F` fits, `C` collects, Tab reaches a Node list that opens any Node and the Dashboard's scroll area                                                                                                                                                                                                                                                       |
| Contrast       | Light `--ok` at L 0.50 and `--danger` at L 0.52, so status text is at least 4.5\:1 on wells                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Achievements   | 40 of the 42 are detected each tick in a Company, never in a Sandbox or Challenge; Serial founder and Five Nines come from an Exit                                                                                                                                                                                                                                                                                                                                                                             |
| Glossary       | Every entry of the glossary catalog and every CVE, as a page on the wiki, and a test checks its references; a term chip on a Tradeoff card, a Research item or a Security advisory opens its page in a new tab                                                                                                                                                                                                                                                                                                 |
| Dashboard      | Five annotation groups, each with a switch; yesterday's line under the Traffic and Latency series; a Request kind and a Region that narrow the per-kind and per-region panels; a table view for every time series; Cash per second among the Overview's stats, from the Samples' `cash`; an App Server row of copies and busy workers; an SLO row of availability this week, the error budget gauge, the SLA credit and the burn rate. Research marks read the Inbox, since no field on the Game dates a Study |
| Incident loop  | The pager and its Ignored rules; the postmortem Mail per run with MTTD, MTTA and MTTR beside each other, a dash where the Game has no time; the Incidents row's three tables; and a timeline that splits each lane at its first signal and its acknowledgement, so the not-seen and awaiting-ack spans show beside the SEV-coloured run, the running Incident last. The HUD adds an SLA row under the runway while the credit pays                                                                             |

axe-core 4.11 (WCAG 2.0/2.1 A and AA plus best practices), before and after the contrast fix:

| Screen                  | Before                                                    | After   |
| ----------------------- | --------------------------------------------------------- | ------- |
| Title                   | 0 violations                                              | 0       |
| Lab, Team panel open    | 0 violations; `aria-hidden-focus` incomplete (build dock) | 0; none |
| Lab, panel closed       | 1 violation                                               | 0       |
| Daily drill (Challenge) | 1 serious `color-contrast` (`.text-ok`, 3.64\:1)          | 0       |

### Insight by Era

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

#### Calibration

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

## Data tier

Taken on 9 November 2026, before and after the Read Replica rebalance. A Design of one App Server
and one Database, at the Pre-seed mix with every Node running, is given one fix. The table gives
the most users it keeps at an Apdex of 0.95 or better and an error share of 2% or less, and what the
fix adds to the Burn. The App Server is at its largest size, so the Database is the limit. "Small"
is a Database one size above the smallest; "medium" is one size above that.

| Database | Fix               | Users before | Users after | Burn added before | Burn added after |
| -------- | ----------------- | ------------ | ----------- | ----------------- | ---------------- |
| Small    | none              | 2,645        | 2,645       | 0                 | 0                |
| Small    | One size up       | 5,571        | 5,571       | $0.20/s           | $0.20/s          |
| Small    | Cache             | 5,181        | 5,181       | $0.24/s           | $0.24/s          |
| Small    | One Read Replica  | 4,596        | 4,791       | $0.20/s           | $0.14/s          |
| Small    | Two Read Replicas | 5,961        | 6,156       | $0.40/s           | $0.28/s          |
| Medium   | none              | 5,571        | 5,571       | 0                 | 0                |
| Medium   | One size up       | 11,033       | 11,033      | $0.40/s           | $0.40/s          |
| Medium   | Cache             | 8,692        | 8,692       | $0.24/s           | $0.24/s          |
| Medium   | One Read Replica  | 9,277        | 9,472       | $0.40/s           | $0.28/s          |
| Medium   | Two Read Replicas | 8,107        | 11,423      | $0.80/s           | $0.56/s          |

The stale reads a replica adds fell from 3.2 to 0.8 a second at the Medium row, and from 3.2 to 1.5
with two replicas. Before, the second replica made the Design worse, because every replica added
stale errors faster than it added capacity. The replicas now cost 0.7× the box, so one replica adds
about 13,900 users for each dollar a second against 13,700 for a size step and 13,000 for the Cache.
