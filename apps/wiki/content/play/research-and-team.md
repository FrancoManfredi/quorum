---
title: Research and Team panels
summary: Read the Research tree, start a Study, and use the Team panel to hire engineers, set policies, run the backlog, and deploy.
section: play
order: 9
aliases: research panel, team panel, start a study, hire, hire engineer, dev hours, backlog, autopilot, deploys, locked item, study queue
gdd: /design/15-ui-ux
---

Press `R` to open Research and spend Insight on a Study. Press `T` to open Team and spend Dev Hours on Features. Both panels fill the board, and `Esc` closes them.

## The Research panel

The Research button is in the toolbar at the top right. It shows up the first time your Insight can pay for an item, and a badge counts the items you can afford. Before that, `R` does nothing.

![The Research panel with the tree on the left and the detail sidebar on the right](/play/research-panel.png)

Look at the header chips. Each chip is one Insight pool and the amount you hold. Then look at the tree: each track grows up from its root, with one band per Era. The tracks are Infrastructure, Data, Reliability, Observability, Performance, Runtimes, Frameworks, Security, Product, and Cost.

### Read an item

Click an item to focus it. The detail sidebar on the right shows:

- **Cost**: one row per pool in the item's recipe. Each row shows the cost, how much you **held**, and the rate the pool earns per second. A held amount in amber means you cannot pay yet. A kind with a Product lever also shows that lever on its row: the step, the share of traffic the kind takes, and a **Build** button.
- **Requires**: the items you must own first. Click one to jump to it.
- **Leads to**: what the item opens.

The sidebar's main button says what you can do now:

| Button                | Meaning                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Start Study**       | You can start it. The button also shows how long it takes.                                                           |
| **Studying · n%**     | It runs now.                                                                                                         |
| **Study now**         | It waits in the queue. Select it to move it to the front, with any prerequisite it waits on.                         |
| **Opens in** Era      | The Era has not started yet.                                                                                         |
| **Study after** items | A prerequisite is missing. Select it to queue the missing prerequisites first, then the item. The button names them. |
| **Researched**        | You own it.                                                                                                          |

A locked item is not an error. It tells you what to do next: wait for the Era, or queue it and let its prerequisites run first. When a long chain is missing, the button counts the prerequisites instead of naming them. A warning in the sidebar says what a Study is waiting for: a pool that earns nothing, or a shape the Design does not show yet, such as a Cache that never hits or a Database that spends too little of its work on reads. The sidebar shows how far the Design is from the requirement, such as **47% of 60%**, and **Queue Study** puts the item in the queue to start when the requirement is met. For a chain, it names the first Study that waits. A pool stops filling at its cap, so Insight you hoard past that point earns nothing more. Read [Earn Insight and research](/tutorials/research-and-insight) for where Insight comes from.

### Start and queue a Study

1. Press `R`.
2. Click an item whose button reads **Start Study**.
3. Select **Start Study**. The Insight card on the HUD shows the Study's name and its percentage.
4. Press `Esc` to go back to the board. The Study keeps running.

To queue more, pick another item and select its button, or double-click it in the tree. The queue holds eight Studies, a chain counts every Study in it, and an unaffordable Study at the front holds every Study behind it, which the sidebar tells you. Each queue row has **Move up**, **Move down** and **Cancel** buttons, and you can drag a row to a new place. **Cancel** loses its progress.

A Study never moves above a prerequisite it needs. Its **Move up** button turns off, and a drag that would pass the prerequisite is refused with a toast that names it. Cancelling a prerequisite also cancels the queued Studies that need it.

### Raise a pool's supply

A pool that cannot keep up with a Study slows it down, and the fix can be a product change rather than more samples. Each Cost row for a kind with a **Product lever** shows the lever's line under the pool row.

1. Read the line before you build. It shows the step, **No lever** until you build one, the share of traffic that kind takes now, and the growth the built steps take off user growth.
2. Select **Build**. The step joins the Team backlog with the Dev Hours of that step, and a Team spends them on it.
3. Watch the Team panel until the item reaches **Shipping**. The next deploy lands the step, the kind's share changes, and the row offers the next step. A **Limits the Study** badge on the row marks the pool the running Study waits on.
4. To take a step back, select the **−** button on the row. It removes the last step and returns half its Dev Hours, and the share comes back to the other kinds.

The button is greyed when the Era has not opened that step, when a Venture caps the lever, or when a step already waits on the backlog. Hover it for the reason. A locked mix, such as a Challenge's, shows no lever line at all.

## The Team panel

The Team button appears after your first Feature ships. An amber dot on it means the backlog is empty. For the rules behind the numbers, read [Team and velocity](/explanation/team-and-velocity).

![The Team panel: Services and Teams on the left, the Board and the Features on the right](/play/team-panel.png)

The header shows your Dev Hours balance, its rate per minute, and the payroll per second. The panel has two halves.

### The floor (left)

The floor shows one card per Team. Each card lists its engineers, starting with **Founder** (labelled "You"). Each engineer shows a salary per second, or **Ramping** while they are new.

1. Select **Hire** on an empty seat. The seat's label names the language, for example "Hire Python engineer for $x". It reads **Locked** until Pre-seed, and it is greyed when you cannot pay the signing cost.
2. To move an engineer, drag them to another Team, or use the move button on their card.
3. To teach an engineer the language your Service runs, or the one a migration is moving to, hover their card and use its **Learn** button. The button shows the language and the price. The engineer works at half speed until their ring fills, then takes the language. The button is greyed when you cannot pay.
4. To lay someone off, hover their card and use its **Lay off** button.
5. Select **New team** to add a Team. A Team has a kind: Product, Platform, SRE, Data or Security.

A Product team has three policies: **Move fast**, **Balanced** and **Quality**. They trade speed against debt and bad deploys. The other kinds run the system and do not build Features: SRE holds the pager, Data runs the warehouse, Platform runs Clusters and deploys, and Security runs WAF rules, dependency scanning, and compliance. Hiring early to go faster backfires, because more engineers cost payroll every second and coordination slows a large Team, so read [Team and velocity](/explanation/team-and-velocity) before you hire a Team you do not need.

A team of eight engineers stops starting work. Every item it starts waits for your approval, and the Team board says **Waiting on you: team too big**. Approve the item, or move engineers to another team. On Core the founder is an extra person, so Core waits at nine people.

### The Board (right)

The Board has four columns: **Up next**, **In progress**, **Shipping** and **Live**.

1. Find a tile under **Features**. Select **Build** to add it to the backlog.
2. Watch it move to **In progress**. Teams spend Dev Hours on it.
3. A finished item waits in **Shipping**. The deploy card says **Deploy in** and a time, then the Feature goes **Live**.
4. Use the lightning button on a backlog item to **Rush** it with Dev Hours. Rushed work finishes now and adds tech debt to its Service. From Pre-seed, a rushed Feature makes its deploy likelier to ship a bug. Use **Cancel** to drop it.

Under **Engineering**, select **Queue** on a tile to pay down tech debt or fix a leak. The row appears when something needs fixing.

The deploy card also shows a **% bad deploys** line. A high figure means a deploy may break the App Servers. The bad deploy banner on the next page shows how to roll one back.

### Autopilot

The **Autopilot** switch in the Board header turns on the backlog's automatic mode. It shows once the backlog holds two items. Three more switches appear only when your Autopilot perk has the level for them:

- **Queue the cheapest Study**
- **Hire while payroll is under a quarter of revenue**
- **Buy the next size for App Servers above 70% load**

Because the perk is a [Legacy](/explanation/legacy) purchase, a new Company shows none of them.
