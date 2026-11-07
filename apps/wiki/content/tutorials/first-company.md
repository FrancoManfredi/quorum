---
title: Your first Company
summary: Start a Company in the Garage, read the board, collect your first revenue, and grow toward the first funding round.
section: tutorials
order: 1
era: 0
aliases: first run, start, new game, garage, collect, payments, drawer, hud
gdd: /design/03-game-loops
---

Ten minutes, and nothing to build. You found a Company, read the four cards on the board, and collect
the revenue your users already pay you. The Garage keeps the rest of the interface back until you
need it.

## Start the Company

1. Open Quorum. A badge reader shows on the screen.
2. Click the **Founder** badge to clock in. The main menu opens.
3. Select **Start a company**. The New company screen opens.
4. Type a name in **Company name** and select a logo. The logo appears on the title screen and in
   the game menu.
5. Leave **B2B SaaS** selected. It is the only Venture at the start. Mutators are locked until you
   earn them.
6. Select **Found** followed by your Company's name, at the bottom of the screen.

The board opens in the **Garage**, the first [Era](/eras/garage). The game shows only a few
controls at first. The rest appear one at a time, as they become useful.

## Read the board

Four Nodes sit on the board. Requests start at Users, cross the App Server and reach Analytics, left
to right. Payments stands alone, and nothing links to it.

- **Users** is where traffic starts. Its card shows your user count, your Apdex, and the requests
  per second that users send.
- **App Server** is your only box. It runs PHP under Apache, and the PostgreSQL database runs on
  the same box. It is a small, cheap Burstable machine.
- **Analytics** samples the App Server's traffic and turns it into Insight.
- **Payments** holds the revenue that your users pay.

::Component{id="server"}

Select the App Server, and the Inspector opens on the right with a **Load** row that says how much
of the box's capacity is in use. Under **Resources** sit the CPU, RAM and CPU credits gauges. Press
**Esc** to close it.

In the Garage, users send two request kinds: page views and API reads.

::Mix{era="0"}

## Read the HUD

The HUD is the panel at the top left. At the start it shows four rows:

- **Cash**: the money you can spend, and your net income per second.
- **Users**: your user count, and a ▲ or ▼ for the recent trend.
- **Apdex**: how satisfied your users are, from 0 to 1, next to the Era's target.
- **Latency**: the mean time to answer a request.

The top row shows the Era's name and the calendar time. One second of game time is one minute on
the calendar. The bar under it fills as your users approach the next funding round.

Your Company starts with 150 users and $300. Users grow while Apdex stays at or above the target, and
they leave when it falls below. For the reason, see [Apdex and revenue](/explanation/apdex-and-revenue).

## Collect your revenue

Revenue does not go to Cash by itself. It waits in the Payments drawer.

1. Wait about thirty seconds. Watch the Payments card. Its **Drawer** row fills.
2. Find the button at the bottom of the Payments card. It reads **Collect** and an amount.
3. Click **Collect**. A toast confirms the amount, and the Cash row on the HUD rises.

You can also press **C** anywhere on the board to collect.

The drawer holds about a minute of revenue, and anything past that spills and is lost, so collect at
least once a minute while you play. The game warns you when it spills.

:::Note{tone="tip"}
When the drawer is half full for the first time, the Collect button glows. The glow is the game's
only hint, and it stops once you use the button.
:::

## Control the clock

The clock runs at 1×, and only the menu or a window that loses focus stops it. To pause it yourself
or change its speed, turn on **Easy mode** in Settings:

- Press **Space** to pause and resume.
- Press **S** to change the speed. Each press moves to the next speed.

Nothing changes while the clock stops.

## Watch your users grow

1. Set the speed to a faster step.
2. Collect when the drawer fills.
3. Watch the **Users** row. The number climbs.
4. Watch the App Server's **Load** row. It climbs with your users.

As load grows the box moves toward its limit, and its row turns amber at 70% and red at 90%. Soon one
resource runs out, and the next lesson is about finding and fixing that limit.

## Know the goal

The Garage ends at 1,000 users. When you reach it, a button for the **Pre-seed offer** appears
under the Era name on the HUD. You raise that round in [Your first incident](/tutorials/first-incident).

Press **H** at any time to open **How to play**. It lists the keys and the six core actions. Press
**Esc** with nothing open to reach the **Menu**.

Quorum saves this Company every 5 sim seconds, and it stays in **Companies** when you start another
from the title screen. If you played the playtest build, [Import your playtest save](/guides/import-your-playtest-save)
moves it into the same list. [Your first bottleneck](/tutorials/first-bottleneck) picks up where this
one stops, when the box runs out of something.
