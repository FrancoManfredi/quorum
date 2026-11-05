---
title: 15. Interface and game feel
summary: The board, Node cards, feedback, bulk actions, and accessibility.
section: design
order: 15
---

This document applies [pillar 4: the board is the dashboard](/design/01-vision#pillar-4-the-board-is-the-dashboard)
and [pillar 5: respect the player](/design/01-vision#pillar-5-respect-the-player).

## Interface rules

1. **Information over decoration.** Squares on the board carry numbers. Illustrations appear only on
   the title screen, Era transitions, and Exit screens.
2. **No helper text.** No taglines, subtitles, or secondary labels. If a screen needs them to make
   sense, the layout is wrong. Explanations live in Tradeoff cards and the glossary, opened on demand.
3. **One click to the cause.** From any red number, one click opens the Node or link that causes it.
4. **Real units.** rps, ms, MB, $/s, users. No abstract points on the board.
5. **Fullscreen.** The board fills the window. Panels slide over it and close with Escape.
6. **Show only what the player can use.** A control appears when the game state makes it useful
   ([Progressive disclosure](#progressive-disclosure)). A locked control is not shown before its Era.

## Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ HUD: Cash (net $/s) · Users (growth) · Apdex · p99 · Error % · Insight · DH · Date    │
├──────────────────────────────────────────────────────────────────────────────┬───────┤
│                                                                              │       │
│                                   BOARD                                       │ Inspector
│   Users ──► [DNS] ──► [LB] ──► [App] [App] ──► [Pool] ──► [SQL] ──► [Replica] │ (slides │
│                                   │                    └──► [Cache]          │  in)   │
│                                   └──► [Queue] ──► [Worker] ──► [S3]          │       │
│                                                                              │       │
│   [Payments]                      [Analytics]                                │       │
├──────────────────────────────────────────────────────────────────────────────┴───────┤
│ Dock: Edge · Compute · Data · Ops                             Research · Team · Cost  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

The layout shows every element. A new Company starts with fewer
([Progressive disclosure](#progressive-disclosure)).

## Progressive disclosure

The Garage Era is the tutorial ([Progression](/design/10-progression#era-0-garage)), so its screen must
not show the whole game. A new Company starts with the Board, the build dock, the Inbox, pause and
speed, and four HUD rows: Cash, Users, Apdex, and Latency. Every other element appears the first
time the game state makes it useful.

### Rules

1. **Once shown, always shown.** An element stays for the rest of the Company. Controls that hide
   again are harder to learn than controls that never hid.
2. **The reveal is the cue.** A newly shown element animates in once and glows until the player uses
   it, for at most 30 seconds at any speed. There is no text, toast, or arrow. With reduced motion,
   the glow holds still.
3. **One reveal at a time.** When two triggers fire together, the second element waits until the
   player uses the first or 30 seconds pass.
4. **The save keeps the revealed set.** A save without the set reveals everything.
5. **Experienced players see everything.** The Sandbox, Challenges, and every Company after the first
   Exit show every element in the table below. The build dock and the Research screen follow their
   own rules for every player.
6. **How to play never opens by itself.** It stays on `H` for the player who looks for it. The
   reveals and the mentor's Mail ([Mail](/design/18-mail)) teach the Garage.

### Triggers

| Element                            | Appears when                                                      |
| ---------------------------------- | ----------------------------------------------------------------- |
| Undo and redo                      | The player makes the first Board action                           |
| Collect glow on Payments           | The drawer is half full for the first time                        |
| Resize glow on a Node card         | The Node is the bottleneck for the first time                     |
| Insight HUD row and Research (`R`) | Any pool reaches the cost of the cheapest available Research item |
| Errors HUD row                     | The first request fails                                           |
| Team (`T`) and the Feature HUD row | The first Feature is built                                        |
| Hiring in the Team panel           | The Pre-seed Era starts                                           |
| Engineering in the Team panel      | The first memory leak or the first tech debt                      |
| Autopilot in the Team panel        | The backlog holds two items                                       |
| Glossary (`G`)                     | The first Tradeoff card opens                                     |
| Dashboard (`D`)                    | Metrics is researched                                             |
| The pager                          | Alerting is researched                                            |
| Postmortems                        | The first incident ends                                           |
| Playbooks (`P`)                    | The first Exit                                                    |
| Region tabs                        | The Series C Era starts                                           |

### The build dock

- A group lists the Components the player can place, then at most one locked Component: the one with
  the cheapest available Research item. Other locked Components do not show.
- A group with nothing to place and nothing one Research item away does not show.
- The number keys follow the visible order.

## The board

- Flow goes left to right: Users on the left, the data tier on the right, Payments and Analytics at the
  bottom. The board does not enforce this, but new Nodes snap to the matching column.
- Pan with drag, zoom with the wheel. Zoomed out, a card first drops its rows, then becomes a chip:
  its block, its name and a ring of the load it carries, so a large Design still reads as named
  blocks. Up close it is a whole card again.
- Cards never overlap. Each card keeps 24 px clear around it. A card dropped on others moves to the
  nearest free spot, preferring its column, and an outline shows that spot while the card is held.
- Links are belts. They run around cards in orthogonal lanes. Links into one Node merge into one
  trunk; links out of one port keep separate lanes and leave through a splitter. Where two belts
  cross, the vertical one goes underground: a gap with a mouth at each end.
- Chevrons on a belt point the way it runs and move at its speed. Requests ride on it as items. A
  busier belt runs faster; an idle belt is grey and still.
- A link with errors turns red. A belt that crosses zones has orange rails: its calls pay the
  cross-zone latency and Egress. A belt between two regions carries a plate under its midpoint with
  the round trip its calls pay, such as `75 ms`, in the amber of the cross-zone badge; a link into a
  global Component pays no place, so it shows no plate.
- From Series C, each region is a tab with its own board.
- Node groups: the player can box a set of Nodes as a Service. The box shows the Service's name, team,
  and Stack. **Not built yet:** the build ties a Service to the Features it carries, not to a box of
  Nodes; the Team panel shows the Services and splits one (see [Panels](#panels)).

## Node cards

Each card is a small window, like Upload Labs. The card is the main information surface.

```text
┌─ APP · PHP-FPM · Laravel ─────── L3 ┐
│ Inbound     420 rps                  │
│ Capacity    ▓▓▓▓▓▓▓▓░░  82% of 512   │
│ Limit       workers 20/20            │   ← after research `profiling`
│ Latency     38 ms   p99 210 ms       │   ← p99 after research `percentiles`
│ Out         900/s                    │
│ [Upgrade $1.2k]                      │
└──────────────────────────────────────┘
```

Not built yet: the `Limit` row (after research `profiling`). The gauges that explain the limit live in
the Inspector: a goal bar names the tightest limit, and a bar follows for every limit the Ledger can
measure — CPU, RAM, worker slots, connections, CPU credits, and the network card. A limit it cannot
measure, such as disk IOPS or a flat Component's throughput, is named with no bar.

| Element      | Rule                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| Code chip    | Three or four letters (`APP`, `SQL`, `KV`, `CDN`). Color by group.                                                    |
| Status mark  | A shape on the medallion's corner: a dot when ok, a triangle above 70%, a square above 90%, a cross when down.        |
| Stack        | Runtime variant and framework for compute Nodes. Engine and mode for data Nodes.                                      |
| Load bar     | Utilization of the limiting resource.                                                                                 |
| Stranded row | Red, replaces Out, when requests have nowhere to go.                                                                  |
| Bottleneck   | A pulsing outline on the one Node with the highest lost revenue ([Simulation](/design/04-simulation#the-bottleneck)). |

## Feedback after a change

The Factorio pleasure of watching a system settle is a feature
([Influences](/design/02-influences#factorio)).

1. The player makes a change.
2. The HUD pill names the action, such as "Resized App Server", while queues drain and caches warm,
   with a small progress ring. It never says "Settling".
3. When rates stop changing (less than 1% change over 3 seconds), the pill shows **Stable** for 2
   seconds.
4. A delta pill compares before and after: "+$1.40/s (+18%) · p99 −120 ms · errors −2.1%", with a
   green dot.
5. A change that made things worse gets a red dot, not a red pill. Undo sits beside the delta for a
   good change too.

Undo and redo cover every board action for the last 50 actions. Undo refunds the full cost if the
action was less than 30 seconds ago, so experimenting is cheap. After 30 seconds, undo settles Cash
at normal prices: a Node it removes refunds like a sale, a Node it brings back costs its price, and a
resize refunds nothing. Undo and redo never gain Cash. Undo keeps what time did to each Node, such as
credits, a leak, or an incident outage.

Rates count as stopped when revenue and served requests agree within 1%, and the error share within
0.1 points, over 12 UI ticks (about 3 seconds). A change that has not settled after 30 sim seconds
shows its delta anyway.

## Tradeoff cards

A Tradeoff card appears when the player chooses an option: a runtime, a variant, a cache strategy, a
replication mode, a deploy strategy, a pricing model.

```text
┌ Runtime: PHP-FPM → Node.js (cluster) ─────────────────────────────────┐
│        Throughput ●────────○         Radar of the six axes            │
│              Tail ●──○                                                │
│            Memory ○──────●                                            │
│          Velocity ●○                                                  │
│        Resilience ●──────○                                            │
│       Operability ○──●                                                │
│                                                                       │
│ On your design (preview):  +$0.80/s · p99 +40 ms (login blocks loop)  │
│ Cost: 120 DH migration · 4 calendar days                              │
│ [Glossary: event loop] [Glossary: process per request]   [Confirm]    │
└───────────────────────────────────────────────────────────────────────┘
```

- **Preview** runs a ghost copy of the simulation for 10 sim seconds with the option applied and
  shows the result. The player sees the effect on their own design before they pay.
- The card names the real behavior behind each axis and links to the
  [engineering glossary](/design/glossary).
- After the first time, the card collapses to one line with the preview numbers.
- The preview shows the settled effect: the changed Nodes start up and warm. The restart is stated
  on its own, as "restarts cold for N s".
- Hovering an option shows its card. Clicking pins it with Confirm and Cancel. Once an option set
  has been confirmed, a click applies the option at once.
- The radar is drawn for every option set. Runtimes and frameworks use the six axes
  [Runtimes](/design/06-runtimes#the-six-axes) defines. An instance family reads the same six axes
  from its RAM per vCPU and its price per vCPU, which 05's family table carries: throughput is vCPU
  per dollar, memory is RAM per vCPU, and a Burstable box loses tail, resilience, and operability to
  its credit throttle. Velocity sits neutral, because the Stack sets it, not the family.
- Glossary terms on a card are buttons that open the glossary at that entry.

## Bulk actions

The fix for Upload Labs click fatigue ([Influences](/design/02-influences#why-players-quit)).

| Tool                 | Available from | Effect                                                                                                                                                                                                                                                                              |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buy ×1, ×10, Max     | Start          | Buy ×1 buys one size; ×10 buys up to ten at once, and Max buys to the largest affordable size.                                                                                                                                                                                      |
| Hold to repeat       | Start          | Holding a card's footer button, the Inspector's Upgrade, or its Larger buys one size, then one more every UI tick (250 ms, 4 a second) until the pointer lifts, Cash runs out, or the Node reaches its largest size. A stalled frame repeats once, never in a burst.                |
| Upgrade all of type  | Start          | The Inspector's Upgrade all buys one size on every Node of that Node's kind on the board, in board order. It skips the Nodes at their largest size and stops at the first one Cash cannot pay for; the toast names how many grew and what stopped it. One undo entry, one log line. |
| Multi-select         | Start          | Drag a box; act on all                                                                                                                                                                                                                                                              |
| Copy and paste       | Start          | Duplicate a selection with its links and settings, including links to Nodes outside it. A paste keeps links inside the selection and to Users, Payments, and Analytics |
| Autoscaler           | Series A       | Capacity follows demand ([Components](/design/05-components#autoscaler))                                                                                                                                                                                                            |
| Policies (Autopilot) | Legacy         | Rules such as "keep App Servers below 70% at peak" and "queue the cheapest Study"                                                                                                                                                                                                   |
| Playbooks            | Legacy         | Place a saved design in one action ([Exit and Legacy](/design/13-prestige#playbooks))                                                                                                                                                                                               |

Rule: no action needs more than five repeated clicks without a bulk alternative.

## Panels

| Panel     | Opens with   | Contents                                                                                                                             |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Inspector | Click a Node | All numbers for the Node, its options, its history, and its Tradeoff cards                                                           |
| Research  | `R`          | The tree by track ([Research screen](#research-screen))                                                                              |
| Dashboard | `D`          | Charts over time, with its template variables, compare line and table view ([Observability](/design/12-observability#the-dashboard)) |
| Team      | `T`          | Teams, engineers, the Services and the split, the backlog, policies, DORA metrics                                                    |
| Cost      | `$`          | Burn by line, Revenue, and the margin ([Economy](/design/09-economy#the-cloud-bill))                                                 |
| Inbox     | `I`          | Mail: advice, offers, and reports ([Mail](/design/18-mail))                                                                          |
| Incidents | `D`          | The running Incident and its Postmortems with their three times, as a Dashboard row ([below](#company-and-incidents-panels)).        |
| Glossary  | `G`          | The engineering glossary, with discovered entries highlighted                                                                        |
| Company   | `D`          | Cash, runway, the Team's shape, and the funding history, as a Dashboard row ([below](#company-and-incidents-panels))                 |
| Churn     | Users on HUD | The [Churn breakdown](/design/12-observability#the-churn-breakdown) by region                                                        |

### The Services card

The Team panel opens with the Company's Services ([Services](/design/08-team-and-velocity#services)),
one row per codebase: its name, a badge naming the team that owns it, its KLOC and tech debt, and the
Features it carries. The row rings when an incident names it, and a `Paged` badge marks the Service
whose code broke. The starting Service's row reads that it carries every Feature no other Service
names, so a Company with one Service shows one row and no split form.

With Service boundaries, the card holds the split's form: a name, a select of the teams, and a chip
per live Feature no other Service carries. The button says what the split costs (`Split · 48 DH`),
and while the form breaks a rule, such as moving nothing, it is disabled and says why. The split
takes effect at once, so the new row appears with its owner, and its Dev Hours arrive on the backlog
as a split item the owner's team builds. The build has no Service filter on the Dashboard: the
Services row still draws one row per request kind ([Observability](/design/12-observability#the-dashboard)).

## Company and Incidents panels

Both are rows of the [Dashboard](/design/12-observability#the-dashboard), not panels with keys of
their own. They use the Dashboard's vocabulary, a table with coloured cells and an LCD bar, so the
player reads the Company beside the charts of its system. They add no Chart and no new
metric: every figure comes from the Game, the Ledger, or the Inbox. Two figures are derived: runway,
Cash divided by net Burn, which [Economy](/design/09-economy#runway-and-running-out-of-cash) defines,
and the SLA credit, 10% of subscription revenue while the trailing week misses the target the Venture
signed ([Incidents](/design/11-incidents#slos-and-error-budgets)).

**The Company row** does not appear in a Sandbox or a Challenge, because neither has a Company.

| Panel   | Shows                                                                                                                                                                                                                                                                                 | Reads                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Money   | Cash and its series over the Dashboard's range, Revenue per second, Burn per second, their net, Payroll, Equity, Runway in 30-day months (∞ while revenue covers the bill), SLA credits while an SLA is paying them, and while Cash is short, the bridge's grant, dilution and Accept | `Game.cash`, `Game.equity` and `Game.bridge`; the Ledger's `revenue`, `burn`, `salaries` and `subscriptions`; the Samples' `cash` |
| Team    | Each Team's kind, headcount with the founder included, effective engineers, velocity, and Dev Hours per real minute, with a layoff's morale hit named while it runs                                                                                                                   | `Game.teams`, `Game.engineers` and `Game.moraleUntil`; the Ledger's `velocity` and the Team's own output                          |
| Funding | Every round the Company entered, newest first: the Users milestone, the grant and dilution after its Mutators and perks, the answer, and when it happened                                                                                                                             | `Game.stage` and `Game.founding`; the Era catalog; the Inbox's term-sheet Thread                                                  |

The funding row's time and answer come from the Inbox, the only record the client keeps of when a
round happened. The Game holds no round time, and a round raised from the funding offer panel
leaves no answer, so that row reads "—". The Game records whether the current Era began with a
declined round and nothing about past rounds. The last row is the IPO: its grant reads "Public
market" and its answer "Listed", because it pays Burn rather than a fixed grant and cannot be
declined. Not built yet: the round time and answer on the Game, which would make the funding history
independent of the Inbox.

The Money card carries the Cash series under its figures: one point per Sample, on the Dashboard's
time range, so the player sees Cash fall through the Garage and step up at a round. The last point is
the Cash the row above it shows. A Sample from a save made before the field holds no Cash and reads
0, so a loaded save's oldest series starts flat and fills in as the clock runs.

**The Incidents row** appears when an Incident is running or the Game holds a Postmortem.

| Panel             | Shows                                                                                                                                                                                              | Reads                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Running Incident  | The incident's kind, SEV, target, elapsed and total run as an LCD bar, MTTD and MTTA so far, MTTR so far, users lost, revenue lost, and failed requests                                            | `Game.incident`, `Game.time` and `Game.users`                                                                            |
| Incident history  | One row per Postmortem, newest first: incident, SEV, target, run, MTTD, MTTA, MTTR, users lost, revenue lost, failed requests, and the action item with whether it is owned                        | `Game.postmortems` and `Game.researched`                                                                                 |
| Postmortem        | The chosen row's cause, run, MTTD, MTTA, MTTR, cost, prevention, and the action item's state                                                                                                       | The chosen `Postmortem`, the incident catalog, and the research catalog                                                  |
| Incident timeline | One lane per Postmortem, from the second its run began to the one it ended at, split at its first signal and its acknowledgement and tinted by its SEV, with the running Incident as the last lane | `Game.postmortems` (`endedAt`, `duration`, `mttd` and `mtta`), `Game.incident` and `Game.time`; the rows the Charts draw |

Choosing a row is Dashboard view state: it changes no Game state, adds no undo entry, and writes no
log line. The Game keeps its last four Postmortems, so the history reaches back that far.

Below the two cards, the Incident timeline places each Postmortem on the Dashboard's time axis: one
lane per Postmortem, named for its Incident and tinted by its SEV, from the second its run began to
the one it ended at. A lane splits where the incident loop does. The span before the first signal is
grey and reads "not seen": the Company was failing requests and nobody had noticed. The span from
that signal to the acknowledgement is blue and reads "awaiting ack". The rest of the run keeps its
SEV colour, so the player reads at a glance how much of a run was missed, how much went unanswered,
and how much was worked. Each block's tooltip names its phase and its length, and the legend carries a
swatch for each phase and each SEV on the axis. Its axis is the rows the Charts above draw, so a run
lines up with the traffic beside it and slides left as time passes; a save that kept no Chart history
has no axis, so the lane reads "No run in this range." until the Charts fill. A run that ended before
the axis began is left out, and so is a Postmortem from a save made before the field, which has no end
time to place; the Game keeps its last four Postmortems, so the history reaches back no further than
them. The running Incident is the last lane, drawn from where it started to now, and its phase
follows the loop live: grey until its first signal lands, blue until a player or the rotation
answers, its SEV colour after that.

Neither row needs a key of its own, and neither is a panel: `D` opens the Dashboard that holds them,
beside the charts of the system. The Dashboard's scroll area takes focus when the panel opens, and
`Tab` reaches it too, so a keyboard player scrolls down to these last rows; a focus ring shows where
the keyboard is.

The three times come from the Game: an Incident records the second its first signal landed and the
second it was acknowledged, so the Postmortem keeps an MTTD and an MTTA beside its MTTR
([Incidents](/design/11-incidents#the-incident-loop)). A run that never signalled shows a dash for
MTTD, and one nobody answered a dash for MTTA, as does a Postmortem from a save made before the
fields. A Postmortem from such a save, or one whose times the Game never recorded, draws one SEV bar
for the whole run, so the lane never invents a phase. The card, the two tables and the timeline's two
leading spans all read the same fields, so they agree.

Not built yet: `anomaly-detection`, which would warn before the peak.

## Research screen

- A fullscreen tree that scrolls. Each track is a tree that grows up from its root, through one
  band per Era. Items with no prerequisite in their track branch off the track's trunk.
- Locked items are visible and greyed, with their requirements, so the player can plan ahead.
  Items beyond the next Era are faded. The screen opens scrolled to the focused item.
- Each item shows its cost as one chip per recipe pool, with the pool's icon and amount, its
  duration, its effect in one line, and what it unlocks.
- A queue of up to 8 Studies. The running Study shows its progress, and the pool that limits it.

### Insight pools

Each Insight pool has its own icon, like a Factorio science pack, so the player reads a recipe at a
glance instead of reading labels.

- The icon's colour is the request kind's particle colour on the board, so a `buy` particle and
  `buy` Insight look the same. Failure Insight has its own colour, which no request kind uses.
- Each icon also has its own shape, so pools differ without colour. Its accessible name is the
  pool's name, such as "Checkout Insight".
- The same icon appears everywhere a pool appears: recipe chips, the HUD, the Analytics card, and
  Mail.

## Notifications

Advice and offers are Mail ([Mail](/design/18-mail)). The rules below cover what stays on the Board.

- Banners share one lane at the top of the board and several can stack at once. Incidents take
  priority.
- No sounds or popups for routine events. A short sound for an incident and for an Era milestone,
  both mutable.
- Era transitions use a full-screen card with the new kinds and the new problem in one sentence. One
  click to continue. Not built yet: the illustration.

## Offline return

A single card: time away, users then and now, Cash and Dev Hours earned, the Studies that completed, the peak hour and
its worst utilization, and one suggestion if users were lost at peak.

## Accessibility

- Request kind colors pass contrast checks, and each kind's packets also carry one of four shapes
  (circle, square, triangle, diamond), so colour is not the only cue. Kinds that share a colour
  share a shape, and the Inspector's request list draws the same mark beside each name.
- Status uses icons and shapes as well as color: a dot, a triangle, a square, and a cross on the
  medallion.
- Reduced motion: particles stop, and every busy link shows still arrows with the rate it carries
  ("420/s") on a small plate. A still belt draws the arrows in place of its chevrons, so its flow
  is read once, not twice.
- Most actions have a keyboard shortcut, and the board supports keyboard navigation between Nodes.
  A list that the canvas cannot give names every Node on the board — its kind, its size, and its
  load — in board order; it stays hidden until a keyboard player tabs into it, and each entry is a
  button that opens that Node's Inspector. So the board is usable without seeing the canvas.
  The keyboard also places: with a part in hand, `Enter` drops it in the next free spot, as a click
  on the board does. `L` starts a link from the selected Node, the arrows pick the other end, and
  `Enter` or `L` joins them; `Esc` cancels. `Shift+T` tidies by zone, `Shift+F` fits the board, and
  `Enter` confirms a pinned Tradeoff card that has a preview.
- The Dashboard's Table view turns each time series into the table of the figures it plots: one row
  per time, one column per series, formatted as the Chart formats them, under a caption naming the
  Chart and its unit. A screen reader reads the numbers a plot cannot say, and any player reads an
  exact figure. Its Controls are in [Observability](/design/12-observability#controls).
- Text at 150%. Settings › Text at 150% multiplies the interface's type by 1.5 through the
  `--type-scale` token, so rows, panels, and the HUD keep their boxes while their text grows. The
  board's cards scale with the board's zoom instead, because they are drawn on the canvas. The
  Research tree is the exception: its Node boxes and the spacing between them grow by the same 1.5,
  and a name too long for one line wraps onto a second inside the taller box.

## Save

- Autosave to local storage every 10 seconds and on every Era change, per Company.
- The player names each Company and picks its logo before founding it.
- Any number of Companies are kept; the Companies page lists them and opens, or deletes, one.
- The single save from the build before Company files is never deleted. Settings offers a hidden
  "Recover previous save" action that imports it into the Companies list. This action is temporary.
- Export and import as text: Settings › Copy save as text puts the save on the clipboard as one line
  (`QSV1:` and base64url JSON), and Settings › Import a save asks for one and opens it; the title
  screen's settings carry the same two rows. The line carries the Simulation's version in front, so
  a string from another build is refused with the two versions named instead of being read as this
  build's. An import replaces the open Company's game, and is refused in a Sandbox or a Challenge, which
  have no save.
