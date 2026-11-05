---
title: 18. Mail
summary: Mail: colour-coded senders, threads, teammates, CVEs, and spam as the game's main channel.
section: design
order: 18
---

This document applies [pillar 4: the board is the dashboard](/design/01-vision#pillar-4-the-board-is-the-dashboard)
and [pillar 5: respect the player](/design/01-vision#pillar-5-respect-the-player). It changes the main
channel between the game and the player. The Board shows what the system is doing now. **Mail** tells
the player what happened, who is asking for what, and what to decide. It arrives in an **Inbox** that
works like an email app.

## Why

- A founder's day is email. The cloud provider warns about limits. Engineers ask for time. Investors
  write. A security list announces a vulnerability. Spam arrives all day. A game that shows these as
  one sentence in a pill feels like a tutorial. A game that shows them as email feels like a job.
- The source changes the meaning. "CPU is maxed" from the cloud provider is a capacity warning from a
  vendor. The same fact from a teammate is a request for help. The player learns who to trust and what
  to do with each kind of sender.
- An Inbox is a record. The player can reread a warning, find the offer from three Eras ago, and see
  what the team asked for before the outage.
- It scales. A new Era, incident, or system adds a sender and some templates. It does not add a
  panel.

## Rules

1. **Mail is the voice of the world.** Anything a person or a system tells the player, other than the
   direct answer to the last click, is Mail.
2. **The sender is the source of the fact.** A fact comes from the party that would know it in real
   life ([Senders](#senders)). No fact comes from "the game".
3. **Every sender has a colour and a shape** ([Colour code](#colour-code)). The player can read an
   Inbox by colour before reading a word.
4. **Mail never covers the Board.** One corner button shows the unread count. The Inbox is a small
   window docked above it that leaves the Board in view and clickable. `I` opens it, `Esc` closes it.
5. **Mail asks, the player answers with buttons.** Actions send the same Messages the old panels
   sent. There is no free text and no reply box.
6. **One click to the cause.** Mail about a Node or Link has a "Show on Board" button that selects it
   ([Interface rule 3](/design/15-ui-ux#interface-rules)).
7. **Mail stays until the player deletes it.** Deleted Mail goes to Trash and can be restored.
8. **Urgent Mail still interrupts.** An outage page stays a Board banner, because waiting to open an
   email costs the player money. The Mail that follows is the record.
9. **Gesture feedback stays a toast.** "Collected $16", refusals, and the change delta answer the
   click that just happened. They are not Mail.
10. **Mail never lies about the Simulation.** Spam and phishing lie about the world; they never change
    a number on the Board until the player acts on them.

## The Inbox

A compact two-pane email window, after Proton Mail, Superhuman, and Gmail.

```text
┌───────────────────────────────────────────────────────────────────────┐
│ ✉  Inbox 3   Spam 2   Trash                                        ✕  │
├───────────────────────┬───────────────────────────────────────────────┤
│ ■ Nimbus Cloud   3:33 │ Capacity warning: app-01 is at 100% CPU       │
│   Capacity warning…   │ (N) Nimbus Cloud <alerts@nimbus.cloud>   3:33 │
│ ■ Dana Okafor    3:20 │     to me                                     │
│   Rewrite checkout?   │                                               │
│ ■ Larch Ventures 2:58 │ app-01 has served 10.4 req/s against a limit  │
│   Pre-seed offer      │ of 0.7 req/s for 40 s. …                      │
│                       │ [ Show on Board ]  [ Resize to small $240 ]   │
└───────────────────────┴───────────────────────────────────────────────┘
```

- **Folders:** Needs action, FYI, Spam, Trash. Needs action holds Mail with a button that does something
  and no answer yet; its count is the open threads. FYI holds the rest and shows its unread count. Spam shows its own
  count so the player knows something is there.
- **List:** newest first, grouped by thread ([Threads](#threads)). Each row shows the sender's colour
  chip, the sender's kind label, the sender, the time, and the subject. Unread Mail has a dot and a
  bold subject, and Mail that wants the player carries the [priority bar](#pacing-and-volume) on its
  left edge: red while a clock runs, amber while a decision waits.
- **Reader:** the sender's kind as a label above the subject, the subject, the sender's name and
  address, the body, the sign-off, and the action buttons. The time appears only on a thread with
  more than one entry: a single letter shows no timestamp.
- **Labels:** each Mail has one label from its sender kind (Cloud, Team, Investor, Security, and so
  on). Labels are the filter chips above the list: `All`, then every kind the open folder holds, with
  its count. Choosing a chip shows that kind alone and selects the newest of them; choosing `All`
  brings the folder back. Changing folder clears the chip, so a folder is never quietly empty. A row
  carries the same label as the chip, so a filtered list reads the same in both places.
- **Hover:** a button names where it really goes. A game button names the control it opens ("Team: the
  patch goes to the top of the backlog"); a trap's names the site it leaves for (see
  [A button is a commitment](#spam-and-phishing)).
- Opening the Inbox always resets it to Needs action and selects the newest Mail in that folder, not
  the newest unread Mail. On a phone the two panes stack.
- Time is the Company clock.

## Senders

Each sender has one voice and one reason to write. All names and companies are fictional. A sender
has a **kind**, a **name**, an **address**, and a colour.

| Kind       | Examples                                                                      | Writes when                                                                                                                                                                                                                        | Actions                                                |
| ---------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Cloud      | AWOL Web Services, Gooble Cloud Platypus, Azzure Compute Services, Cloudscare | A Node nears or passes a hard limit: CPU credits, RAM, bandwidth, disk, quota; the monthly bill; a zone or region incident on the provider's side; Spot reclaim notices; maintenance windows                                       | Show on Board, Resize, Raise quota, Switch to Reserved |
| Monitoring | PagerDooty, Grafauna, Centry                                                  | An alert rule fires or clears: error rate, p99, saturation. It is the pager's inbox copy ([Observability](/design/12-observability))                                                                                               | Show on Board, Acknowledge, Mute for 1 h               |
| Vendor     | Swipe Payments, PayPaul                                                       | A managed Component has an outage, a price change, or a new limit                                                                                                                                                                  | Show on Board, Switch provider (when a second exists)  |
| Teammate   | Each hired engineer, by name                                                  | They finish work, hit a blocker, propose a rewrite, ask for a hire, or want to quit ([Team](#teammates))                                                                                                                           | Approve, Decline, Later                                |
| Investor   | Sand Hill Road Runner Capital, Sequel Capital, Why Combinator                 | A Milestone is met ([Economy](/design/09-economy#funding)); a term sheet changes; a board update is due                                                                                                                            | Raise, Decline                                         |
| Security   | Commonly Vulnerable & Exposed, National Vulnerability Dumpster                | A vulnerability is disclosed in something the Design runs ([CVEs](#cves-and-patches)); a patch is overdue; an audit finding                                                                                                        | Show on Board, Patch now, Rush patch                   |
| Finance    | QuickBroke Books, Zero Accounting                                             | A Quarter closes: **Guidance** met or missed; runway under 6 months                                                                                                                                                                | None                                                   |
| Customers  | Zenfail Support Desk, Intercomatose                                           | Users complain: slow checkout, errors, a lost region; a region's users fall for one calendar hour, with the top two rows of the [Churn breakdown](/design/12-observability#the-churn-breakdown); a big customer asks for a feature | Open Churn breakdown, Add to backlog                   |
| Mentor     | Dr. Leslie Lamportant, Prof. Edsger Dijkstrah, Grace Hoppertunity             | A strategic nudge the other senders would not give: research to open, a shape worth trying. She is the tutorial voice in the Garage and Pre-seed Eras and speaks rarely after                                                      | None                                                   |
| Spam       | Anyone ([Spam](#spam-and-phishing))                                           | Always                                                                                                                                                                                                                             | Usually none; a few are traps                          |

Every Mail that names a Node carries **Show on Board**, which selects that Node
([Interface rule 3](/design/15-ui-ux#interface-rules)): capacity Mail, out-of-CPU-credits and
out-of-memory Mail, an incident that names the Node it hit, and a CVE advisory. The rest of the
buttons follow the sender:

- **Resize**, **Raise quota**, and **Switch to Reserved** are Cloud's. Each selects the Node and
  opens its Inspector, because that is the one place a Node is resized, its limit raised, and its
  pricing model chosen. None of them answers the Mail: the warning stays in Needs action until the
  cause is gone. Switch to Reserved appears only where that control exists, on a sized compute Node
  from the Era that has pricing models ([Economy](/design/09-economy#pricing-models)); a Cloud Mail
  about anything else carries three buttons.
- **Acknowledge** marks the Mail read and dismisses its card above the Inbox button.
- **Mute for 1 h** silences that sender for one calendar hour: their Mail lands read, with no dot,
  no card above the Inbox button, and no chime, until the hour is up.
- **Add to backlog** queues the Feature a customer asks for at the end of the Team backlog, which is
  what the Team panel's own Queue does.

**Switch provider** lives on the Payment Provider itself, not on a vendor pitch: the Inspector's Provider setting moves its checkouts to a second provider, and while a Payment provider outage runs the Inspector's mitigation button does the same at once. A vendor pitch about anything else carries no Switch provider. A hire request offers Approve hire
and Later, not Decline: Later says the same thing to a teammate and keeps the door open.

Capacity facts that live in the Simulation today (`nextGoal`: out of CPU credits, out of RAM, workers
busy, connections, network) belong to **Cloud** or **Monitoring**, not to the Mentor. The bottleneck
tells the player what is wrong. The sender and its buttons tell the player what is possible.

## Colour code

A sender wears the app's own **badge**: the shape and glyph knocked out in white, as on the dock
([Interface](/design/15-ui-ux)). The shape and glyph say what kind of party wrote. The colour is the
brand colour of the real company the sender parodies, so AWOL is the orange of the cloud it mocks
and the joke reads before the name.

| Kind       | Shape (build group) | Glyph       | Colours                                                                                                                                 |
| ---------- | ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud      | Hexagon (Edge)      | Cloud       | AWOL Web Services `#FF9900`, Gooble Cloud Platypus `#4285F4`, Azzure Compute Services `#0078D4`, Cloudscare `#F38020`                   |
| Monitoring | Diamond (Ops)       | Pulse line  | PagerDooty `#06AC38`, Grafauna `#F46800`, Centry `#6C5FC7`                                                                              |
| Vendor     | Diamond (Ops)       | Credit card | Swipe Payments `#635BFF`, PayPaul `#0070E0`                                                                                             |
| Investor   | Chip (Compute)      | Trend line  | Sand Hill Road Runner Capital `#4B5FC8`, Sequel Capital `#00A36C`, Why Combinator `#FF6600`                                             |
| Finance    | Disc (Data)         | Ledger      | QuickBroke Books `#2CA01C`, Zero Accounting `#13B5EA`                                                                                   |
| Customers  | Hexagon (Edge)      | Life buoy   | Zenfail Support Desk `#2F7B80`, Intercomatose `#1F8DED`                                                                                 |
| Mentor     | Chip (Compute)      | Compass     | No brand, so a tribute: Dr. Leslie Lamportant `#008080`, Prof. Edsger Dijkstrah `#FF7F00`, Grace Hoppertunity `#2B5B9C`                 |
| Teammate   | Disc (Data)         | Person      | A green, shifted by a stable hash of their id                                                                                           |
| Security   | Diamond (Ops)       | Shield      | Commonly Vulnerable & Exposed `#1E6FBF`, National Vulnerability Dumpster `#3E78B2`                                                      |
| Spam       | Hexagon (Edge)      | Barred      | The brand it parodies: Datadug `#632CA6`, Slowflake Data Pillow `#29B5E8`, Chad from TalentBro `#0A66C2`, Incohere `#FF7759`, and so on |

Rules:

- Colour is never the only signal. The shape, the glyph, and the kind label repeat it
  ([Accessibility](/design/15-ui-ux#accessibility)).
- A sender's badge is the same everywhere: the list, the reader, and the "Show on Board" highlight.
- A brand colour too dark to read on the dark theme is lifted to a lighter shade of the same hue.
- Phishing copies a real sender's name, badge, colour, and subject but not its address. The address
  is the tell ([Phishing](#spam-and-phishing)).

## Threads

Mail groups by **thread**: one subject from one sender about one thing. A repeat of the same fact
joins its thread instead of adding a new row, and the row shows a count.

- A thread has a **key**: sender plus subject kind plus the thing it is about, such as
  `cloud:cpu:app-01`.
- A repeat bumps the thread to the top, marks it unread, and adds a dated line to the reader. It does
  not add a new row.
- A thread **resolves** when its cause is gone: the CPU warning resolves when `app-01` is below its
  limit. The reader shows "Resolved at 3\:41" and the thread stays in the Inbox as a record. The churn
  thread for a region, `customers:churn:eu`, resolves when that region's users grow again.
- A thread **reopens** if the cause returns after it resolved.
- Deleting a thread removes the whole thread. A later repeat starts a new one.
- A thread keeps its newest 20 entries. Older entries are dropped without a marker, so a long thread
  has no "N earlier messages" line and the reader shows no sign that anything is missing.

This replaces the "same text in the last six" rule of the first build, which could not tell a repeat
from a new problem.

## Teammates

People are the richest source of Mail. Each hired engineer is a named sender ([Team and
velocity](/design/08-team-and-velocity)). They write in a few fixed shapes, with a body drawn from their
language, seniority, and the state of the Design.

| Mail                 | Triggers on                                                                                        | Actions                                            |
| -------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Shipped              | A feature or task finishes                                                                         | Show on Board                                      |
| Blocked              | A task cannot move: waiting for a decision, an index, a database copy, or a hire                   | Approve, Later                                     |
| Rewrite proposal     | An engineer who knows a language well and sees a service with high **tech debt** or a slow runtime | Review \<language\> migration, Decline             |
| Hire request         | A team is past its coordination limit or its backlog is long                                       | Approve hire, Later                                |
| Incident follow-up   | An Incident resolved                                                                               | File postmortem, File and research the action item |
| Burnout and quitting | Long freeze, many pages, or a pay gap                                                              | Give time off, Raise salary, Accept resignation    |
| Proposal to patch    | A CVE affects a service the engineer owns                                                          | Patch now, Queue the patch, Open Team              |

The world event still draws only a hire request or a rewrite proposal; a block, a slump and a CVE
proposal come from the Step, not the event tick. Incident follow-up is built: the teammate's Mail carries File postmortem
and File and research the action item.

### Blocked

A backlog item can stop before its team does any work on it. The Simulation checks the four waits the
Team section names ([Team](/design/08-team-and-velocity#blocked)), and the first that holds is the
reason: an index the Service needs, a copy of a Database it shares, a hire its team has outgrown, or a
decision the player has to make. The engineer whose item it is writes; the item waits, its Dev Hours go
to the pool, and later items go ahead of it.

**Approve** clears the wait for good. **Later** keeps it waiting and brings the Mail back after a
calendar day, in the same thread, because the same thing is still true. A block never stops the same
item twice.

### Burnout and quitting

An engineer's mood falls with a long freeze, with every page an incident sends them, and with a pay
gap: they were hired at an Era's rate, and the salary index has climbed since
([Team](/design/08-team-and-velocity#pay-and-mood)). At 0.35 mood they write once, and the Mail says
which of the three it is, in their own words: the pages they have answered, or the gap between their
pay and the Era's rate.

| Answer                 | What it does                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| **Give time off**      | Three calendar days with no Dev Hours, and they come back content. The Team carries the backlog. |
| **Raise salary**       | Their pay rises to the Era's rate, and the payroll with it.                                      |
| **Accept resignation** | They leave, the payroll ends, and there is no layoff's morale hit.                               |

A slump that recovers, because the player answered or the freeze ended, lets a later one write again.
The Mail reports the count; a recruiter's pitch is still flavour without the hint it would carry.

### A proposal to patch

A CVE is filed as a patch ticket at the end of the backlog ([CVEs](#cves-and-patches)). The Simulation
names the engineer from the Service's owning team whose item it is, and they write: the ticket, its
deadline, and the choice. **Patch now** moves the ticket to the top of the backlog, ahead of the
product. **Queue the patch** leaves it where it is, behind the product, and the deadline runs either
way. **Open Team** shows the backlog it sits on. The Security advisory is a separate Mail from a
separate sender: one tells the player what is exposed, the other tells them who fixes it.

### Rewrite proposals

A rewrite proposal is how the "big rewrite" trap ([Team and velocity](/design/08-team-and-velocity#migrations))
becomes a decision with a person behind it.

- The proposal names the service, the target language, the DH cost from the migration table, and the
  engineer's own estimate, which is too low by a factor that grows with their enthusiasm.
- **Review \<language\> migration** opens the Tradeoff card for moving an App Server to that language,
  so the proposal is a decision the player makes with the migration's numbers in front of them.
  **Decline** keeps the service. There is no Later: a proposal carries two buttons.
- The engineer's mood moves with the answer. A declined senior engineer who has asked three times
  may write a resignation.
- A proposal that is right is common. A proposal that is wrong sounds just as sure. The player judges
  it from the numbers in the Mail and on the Board: p99, errors, tech debt, velocity.

## CVEs and patches

A **CVE** is a vulnerability disclosed in software the Design runs. It is the reason the Inbox needs
a Security sender and a spam folder together.

- **Disclosure.** The Simulation draws CVEs from the Company's seed. A CVE affects one thing the
  Design runs: a runtime and version, a framework, a database engine, a proxy, or a package set.
  Only a Design that runs the affected thing is exposed. Examples, all fictional: a request-smuggling
  bug in an HTTP proxy, a deserialization bug in a framework, a remote-code bug in a database engine.
- **Severity.** Each CVE has a score from 1 to 10 and a class (remote code, denial of service,
  data leak). The score sets the clock: how long until it is exploited in the wild.
- **Who tells the player.** Security mail names the CVE id, the score, the title, and the Component
  the vulnerability affects: an App Server, a Database, a Cache. Which of the player's Nodes run it
  is the **exposure gate**: with Dependency scanning researched the advisory names them, as the
  Dashboard names them (App Server, App Server 2), so a Design with two copies sees both, and Show
  on Board selects the first. Without Dependency scanning the Mail cannot tell, says "Check whether
  you run this", and carries no Show on Board: the gate would mean nothing if a button gave it away.
- **The patch** is an engineering task with a DH cost ([Team and velocity](/design/08-team-and-velocity#engineering-tasks)),
  often followed by a deploy. A **Patch now** button moves it to the top of the backlog, and a
  **Rush patch** button rushes it, and **Open Team** opens the backlog the ticket sits on. The
  reader shows every button a Mail carries ([Actions](#actions)), so an advisory with four of them
  keeps all four.
- **The ticket.** The Simulation files each disclosure as a **patch ticket** at the end of the Team
  backlog, owned by an engineer on the Service's owning team, who proposes the patch in their own Mail
  ([A proposal to patch](#a-proposal-to-patch)). A team does not build it until the player moves it up
  ("Patch now"), queues it on purpose, or rushes it: "Patch App Server, 5 DH, due in 3 min". A higher score means a bigger patch and a shorter
  deadline. The ticket turns red on the backlog and the HUD when it is overdue. A grace of 60 sim
  seconds later it expires: the ticket is gone and a SEV1 **Data breach** starts, which costs 15% of
  the Users. A breach waits while another incident runs. The ticket can be rushed but not cancelled.
  The advisory thread closes with the ticket, patched or exploited.
- **The clock (design).** While an exposed CVE is unpatched, its exploit chance rises each calendar day. When
  it fires, the **Data breach** incident starts: data loss, users lost, a Reputation hit, and a
  postmortem. Patching before the clock runs out removes the risk.
- **The cost of speed.** Patching in a hurry steals DH from features and risks a **Bad deploy**.
  Patching late risks a breach. The player trades these off from the Mail.
- **Supply chain.** The existing Supply-chain compromise incident ([Incidents](/design/11-incidents#catalog))
  arrives as a CVE with a false "safe" advisory first, then a correction: Security mail, then a
  second thread entry that says to pin and redeploy.

Two incidents are new, and both have catalog entries: **Data breach** (from an exploited CVE) and
**Credential leak** (from phishing). A Credential leak is SEV1, runs 90 sim seconds, and takes 10% of
the Users when it starts; those are its numbers. The director never
draws it: only a trap the player clicks starts one. Its postmortem opens the WAF as its action item,
when that research is ready.

The rate does not scale with the size of the stack. Every 420 sim seconds from Pre-seed the
Simulation discloses one CVE, drawn from those that affect something the Design runs. A bigger stack
does not attract more advisories; it only changes which one is drawn.

## Spam and phishing

Real inboxes are mostly noise. The Spam folder teaches the player to read, and it hides a few traps
and one gift.

- **Spam arrives from Pre-seed on, at a fixed rate.** Every 45 sim seconds the Company's seed draws
  one world event, and 45 of every 100 draws are spam. The rate does not grow with Users or press. It
  is flavour with a purpose: it fills the Inbox with sound.
- **The spam filter is a research.** `spam-filter` adds a Postbox setting, on by default once
  researched. With the filter on, every piece of spam is written straight into the Spam folder, and now
  and then a real security advisory goes with it. Without the research, spam lands in the folder
  its content belongs to, beside real Mail.
- **Kinds of spam.**

| Kind             | Looks like                                                                 | Effect                                                            |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Vendor pitch     | "10× your observability, book a demo"                                      | Noise. A few are real tools that unlock a research discount.      |
| Fake invoice     | An invoice from a cloud provider you do not use                            | Paying it costs Cash and teaches the lesson once.                 |
| Phishing         | A look-alike of a real sender: "Nimbus Cloud: verify your account in 24 h" | Acting on it leaks credentials: the **Credential leak** incident. |
| Fake CVE alert   | A real-looking advisory with a link and a "patch now" button               | Acting on it installs a backdoor. See below.                      |
| Recruiter        | Offers to your engineers                                                   | A hint that a teammate is unhappy.                                |
| Real CVE in Spam | A true advisory that the filter sorted wrongly                             | Ignoring it starts the CVE clock without a warning.               |

**Recruiter:** once an engineer's mood is low enough to write
([Burnout and quitting](#burnout-and-quitting)), the pitch's letter carries a line that hints one of
them is unhappy, without naming who; the player still reads the Team panel to find out.
**Fake CVE alert:** its button runs a patcher that leaves a backdoor in the Company, and the
Simulation records when. Five calendar minutes later the attacker uses it and a Data breach starts. A
Security team finds the backdoor in half that time and closes it, and Dependency scanning stops the
dropper before it runs. Its id is not in the Glossary, which is the tell that catches it before the
click. **Vendor pitch:** about one in four is a real demo of an unstudied Observability research, with a
Book the demo button; taking it takes a fifth off that item's Insight cost.

A phishing button starts the Credential leak incident and takes 10% of the Users, the pager writes about it, and the trap's thread keeps the line that says the
address was not the real one. A fake invoice and a domain notice charge the amount printed on them:
$4,812 (the Azzure invoice's $4,812.44, rounded) and $389, both refused when the Cash is not there.
Reporting a phishing Mail as spam takes its button away, so the risk goes with it.

- **How to tell.** Two tells. The first is the sender's address, which is on a lookalike domain
  (`billing@awol-cloud.support` against `no-reply@awol.cloud`). The second is the CVE id: a real
  advisory names one the Glossary lists (its advisory block carries every CVE the Simulation can
  disclose, with the score and the Components it affects), and a fake one names an id the Glossary
  does not know, so there is nothing to open. The reader marks a known id with "In the Glossary" and
  leaves an unknown one bare.
- **A button is a commitment.** A trap's action button looks normal, and clicking it is the player's
  act, not the game's. Every button names where it really goes when the player hovers: a game button
  names the control it opens, and a trap's names the off-site address it leaves for, on a cheap TLD.
  The two carry the same number key, and the hover is what separates them before the click.
- **Report spam.** Marking a Mail as spam teaches the filter and, for phishing, removes the risk.
  Reporting a real Mail as spam is a mistake the player can undo from Spam. A
  phishing Mail reported as spam loses its trap button for good.
- **Tone.** Spam is funny and plausible, never cruel. Real vendor names are not used.

Spam is pillar 5's mirror: the player is never punished for opening Mail, only for acting on a
trap. The cost is one click and one lesson.

## Actions

- An action is a button in the reader. Choosing it sends the Message the matching panel sends today
  and ends the question: the buttons are replaced by one line, such as "You raised $2,500 for 10%".
  A button that opens a control instead of answering, such as Show on Board, Resize, or Raise quota,
  leaves the question open, because the cause is still there.
- The reader shows **every** button its Mail carries, in the order the sender offers them, and wraps
  onto a second row when four of them do not fit. There is no third-button cap: an advisory keeps
  Patch now, Rush patch, Show on Board, and Open Team.
- A standing offer lasts while its condition holds. If Users fall below the Milestone, the offer
  expires and the thread says so.
- Mail the player has answered stays in the Inbox as the record.
- Every action has a keyboard shortcut in the reader: `1` to `9` press the buttons in order, `E` to
  delete, `J` and `K` to move, `S` to mark spam.

## What Mail replaces

| Today                              | With Mail                                                          |
| ---------------------------------- | ------------------------------------------------------------------ |
| Goal pill at the top of the Board  | Cloud, Monitoring, and Mentor Mail. Partly done: the pill is gone. |
| Funding round modal and pager chip | Investor Mail with Raise and Decline                               |
| Postmortem card                    | Teammate Mail with the file actions. Built.                        |
| Away card                          | A Mail from Finance and Monitoring, "While you were away". Built.  |
| Team panel requests                | Teammate Mail; the panel stays for the roster                      |
| Era card                           | Stays. An Era transition is a scene, not a message.                |
| Sandbox and Challenge objectives   | Stay on the Board. Mail belongs to a Company.                      |

## How it works

The Simulation emits **facts**: typed, deterministic records of things that happened or became true
(a limit reached, a task finished, a CVE disclosed). The web app turns each fact into Mail. See
[ADR 0006](https://github.com/elianiva/quorum/blob/main/docs/adr/0006-mail-is-client-state.md).

- Facts that change the game are Simulation state: a CVE and its exploit clock, a rewrite proposal
  and its answer, an open funding round. Their answers are Actions, so replays and the server's
  check see them.
- Mail text, sender style, spam, and phishing copy are client content. Spam and phishing are drawn
  from the seed so a Company is the same on every device, but they change no Simulation number
  until the player acts. The act is an Action.

## Pacing and volume

- **Quiet at the start.** The Garage Era sends at most one Mail a minute, mostly from the Mentor.
- **Priority.** Mail that needs a decision, such as an offer or a CVE with a clock, sits above the
  rest. Built: a coloured bar on the row's left edge marks it, in the design's tones. Red (`$danger`)
  while a clock is running, which is a CVE advisory; amber (`$warn`) while a decision waits; nothing
  on Mail that only informs, on Mail already answered or resolved, and on Spam, because noise is
  never something the Design needs.
- **Digest.** Built: when more than eight threads in a folder are unread, the oldest low-priority
  ones (FYI, so nothing that waits on a decision) fold into one "Digest" row where the newest of them
  was. Its reader lists them, and each line opens the Mail it stands for.
- **No guilt.** Unread Mail never expires a decision the player has not been told about, and never
  costs anything on its own. Clocks start when the Mail arrives and are shown in it.

## Open questions

| Question                                   | Current answer                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Does the Inbox survive a reload?           | Yes: the save keeps the Mail, the mutes, and the last event tick, and an older save opens with an empty Inbox.           |
| Does new Mail raise a sound or a toast?    | Offers, CVEs with a clock, and outages do: one short mutable chime. The rest only change the badge.                      |
| Should each Mail have a written subject?   | Yes. Every letter in `apps/web/src/game/copy/` writes its own subject; the Simulation supplies the topic and its values. |
| Does an unanswered offer cost the player?  | No. An Era that begins without a raise already runs at 0.7 × `g` ([Economy](/design/09-economy#funding)).                |
| Can the player reply?                      | No. No free text and no threads with replies.                                                                            |
| Are teammates procedurally named?          | Yes, from the seed, with a pool of names and a short bio each. A teammate keeps their name for life.                     |
| Is Spam only flavour in the first release? | Yes: spam and phishing ship with the CVE system, not before.                                                             |
| How many CVEs per hour of play?            | One every 420 sim seconds from Pre-seed, whatever the size of the stack. A balancing item.                               |
| Does the Mentor stay?                      | Yes, but rarely after Pre-seed. Her voice is the only one that is not about a fact.                                      |

## Names

Every name is a pun on something real, close enough that an engineer gets it a beat late and far
enough to stay fictional. The rule: **change one or two letters, keep the shape of the original,
and let the new meaning be the criticism.** The joke is the sender's reputation in one line.

### Senders

| Name in the game                  | Plays on                                    | Why it is funny                                                                                                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AWOL Web Services**             | AWS (Amazon Web Services)                   | "Absent without leave": the provider that vanishes when you need it. Its sign-off, "This inbox is not monitored. Neither is your bill", mocks no-reply mail and bill shock.                                                                                                               |
| **PagerDooty**                    | PagerDuty                                   | "Doody" is what the 3 a.m. page feels like. Its sign-off, "You are receiving this because you are awake", is how on-call works.                                                                                                                                                           |
| **Swipe Payments**                | Stripe                                      | One letter off: it swipes the card, then swipes a cut for itself. "We swipe the card. Then we swipe a little more." mocks the 2.9% + 30¢ off the top.                                                                                                                                     |
| **Sand Hill Road Runner Capital** | Sand Hill Road (the VC street), Road Runner | Venture firms on Sand Hill Road; the cartoon bird is fast and never caught. Sign-off "Beep beep" is how a term sheet arrives and leaves.                                                                                                                                                  |
| **QuickBroke Books**              | QuickBooks                                  | Accounting software that shows you are broke, quickly. "Reconciled to the nearest regret" mocks rounding in the books.                                                                                                                                                                    |
| **Zenfail Support Desk**          | Zendesk                                     | A zen desk that fails you. "Ticket #4,096. We take your feedback seriously" is the stock apology from a queue.                                                                                                                                                                            |
| **Commonly Vulnerable & Exposed** | CVE: Common Vulnerabilities and Exposures   | The real name, read as a description of your stack. "Unsubscribe by patching" is the only way off the list.                                                                                                                                                                               |
| **Dr. Leslie Lamportant**         | Leslie Lamport                              | He wrote Paxos, the logical clock, and "Time, Clocks, and the Ordering of Events". Add "important" and it is a distributed-systems in-joke. Address `lamport.clock`; sign-off "Sent at an unspecified time, in an unspecified order" is the problem he solved. The game is called Quorum. |

### Pools: more than one source per kind

A kind is not one company. Each Thread draws its sender from a pool by the Company's seed and the
Thread's key, so one Thread keeps one sender, and a Company hears from several.

| Kind       | Pool (name, and what it plays on, and why it is funny)                                                                                                                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud      | AWOL Web Services; **Gooble Cloud Platypus** (Google Cloud Platform; "We will sunset this feature in 6 to 8 weeks" is Google's habit); **Azzure Compute Services** (Azure; "400 regions, 3 of them up"); **Cloudscare** (Cloudflare; the bot check that doubts you. It sends only DDoS Mail: "Verifying you are human. We have our doubts.") |
| Monitoring | PagerDooty; **Grafauna** (Grafana; "Your graph has gone flat. That is not good." flatline is the alarm); **Centry** (Sentry; one letter off, and every event is billed by the cent: "Every event counts. Every event is billed.")                                                                                                            |
| Vendor     | Swipe Payments; **PayPaul** (PayPal; "Your funds are under review. Forever." is its account holds)                                                                                                                                                                                                                                           |
| Investor   | Sand Hill Road Runner Capital; **Sequel Capital** (Sequoia; every round has a sequel, and engineers say SQL as "sequel": "Every round deserves a sequel."); **Why Combinator** (Y Combinator; sign-off "Why not.")                                                                                                                           |
| Finance    | QuickBroke Books; **Zero Accounting** (Xero; one letter off, and the number on your balance: "Your balance, rounded to the nearest zero.")                                                                                                                                                                                                   |
| Customers  | Zenfail Support Desk; **Intercomatose** (Intercom; the chat widget in a coma: "Typically replies in a few business decades.")                                                                                                                                                                                                                |
| Mentor     | Dr. Leslie Lamportant; **Prof. Edsger Dijkstrah** (Dijkstra; "GOTO statements considered harmful, as are your SLOs"); **Grace Hoppertunity** (Grace Hopper; the nanosecond wire sign-off)                                                                                                                                                    |
| Security   | Commonly Vulnerable & Exposed; **National Vulnerability Dumpster** (the NVD; "Every advisory is critical until proven otherwise")                                                                                                                                                                                                            |

### Spam

| Name in the game                                   | Plays on                       | Why it is funny                                                                                                                                                                                  |
| -------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Datadug**                                        | Datadog                        | Dug in so deep you cannot leave. "Dashboards so deep you will never leave" mocks vendor lock-in and the bill.                                                                                    |
| **Slowflake Data Pillow**                          | Snowflake                      | A snowflake that is slow; a pillow in place of a lake. "Per-second billing, per-minute regret" mocks usage pricing.                                                                              |
| **/dev/null as a Service**                         | `/dev/null`, "X as a Service"  | The classic Unix joke that writes are fast because the data is discarded; "Fast. Durable. Webscale." is the old "MongoDB is web scale" meme. "Reads are an enterprise feature" is the punchline. |
| **Chad from TalentBro**                            | Recruiter spam, "bro" culture  | "Let us circle back on your circle back" is corporate speak turned in on itself.                                                                                                                 |
| **Incohere**                                       | Cohere, and AI startup pitches | An AI company whose product is the opposite of coherent. "Confidently wrong, at scale."                                                                                                          |
| **AWOL Web Services** at `awol-cloud.support`      | Phishing lookalike             | The tell is the domain, not the name: a real engineer checks the address. This is the lesson of Spam.                                                                                            |
| **Commonly Vulnerable & Exposed** at `cve-fyi.top` | Fake advisory                  | The same name on a `.top` domain, with a CVE id that the Glossary does not know.                                                                                                                 |

### Domains and sign-offs

| Domain                     | Plays on                                   | Why it is funny                                       |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `awol.cloud`               | AWS                                        | See above.                                            |
| `pagerdooty.io`            | `.io`, the default TLD for developer tools | Every dev tool is a `.io`.                            |
| `roadrunner.vc`            | `.vc`, the TLD of venture firms            | A real TLD that exists for exactly this.              |
| `lamport.clock`            | Logical clocks                             | A hostname that could only mean one person.           |
| `cve.fyi`                  | `.fyi`                                     | "For your information", which is all a CVE gives you. |
| `.top`, `.support`, `.wtf` | Cheap TLDs that mail filters distrust      | The TLD is the first sign that the mail is not real.  |

### Teammates

Teammates draw a name from a pool and keep it for life.

| Name              | Plays on                                          |
| ----------------- | ------------------------------------------------- |
| **Bobby Tables**  | The xkcd "Little Bobby Tables" SQL injection joke |
| **Rae Condition** | Race condition                                    |
| **Ned Pointer**   | Null pointer                                      |
| **Sue Doe**       | `sudo`, and "John Doe"                            |
| **Kay Ubernetes** | Kubernetes, shortened to K8s                      |
| **Seb Fault**     | Segmentation fault                                |
| **Pat Mutex**     | Mutex                                             |
| **Dee Bugger**    | Debugger                                          |

### Writing a new name

1. Pick a real company, product, person, or term that engineers know.
2. Change one or two letters or add one word, so it reads as the original at a glance.
3. Make the change a critique: what the thing is known for, or what it costs.
4. Give it a domain and a one-line sign-off that carries the same joke a second time.
5. Never name a real person or company in a cruel way. The target is the practice, not the people
   ([Tone](#spam-and-phishing)). Real people appear only as a tribute, as Lamport does.

## What exists today

- **Senders and colour:** the Simulation's `nextAdvice` names who would say each fact and a Thread
  key. Each sender wears an app badge: a shape, a glyph, and a colour.
- **Threads:** a repeat with the same key joins its Thread; a Thread resolves when advice moves on
  and reopens when it returns. Deleting removes the whole Thread.
- **Letters:** every Mail has about five hand-written letters in `apps/web/src/game/copy/`, each
  with its own subject, greeting, and close. The Simulation names the topic and its values; the
  Inbox picks a letter by the Company's seed, the Thread, and the time, so a Company reads the same
  on every device and a Thread rarely repeats itself. Each teammate has their own footer.
- **Folders and labels:** Needs action, FYI, Spam, Trash, with "Report spam" and "Not spam", and the
  sender-kind filter chips above the list. Each row carries its sender kind as a label, so the list
  says what the chip filters by, and Mail that wants the player wears the priority bar.
- **Hover destinations and the second tell:** every button names where it really goes, and a trap's
  names the off-site address it leaves for. The Glossary lists the CVEs the Simulation can disclose,
  so a real advisory's id opens an entry and a fake one has nothing to open.
- **Saving the Inbox:** the Company save keeps the Mail, the mutes, and the last event tick the world
  wrote for. A save from before the Inbox was saved opens with an empty Inbox rather than failing.
- **The Digest:** more than eight unread threads in a folder fold their oldest low-priority ones into
  one row, whose reader lists them.
- **Postmortems:** when an Incident resolves, a teammate writes with File postmortem and File and
  research the action item, which send the same Action the Dashboard's Incidents row sends. The
  Dashboard row still lists the Postmortems.
- **Away Mail:** on a return from away, Finance writes "While you were away" with users, Cash, Studies
  and Dev Hours, and the pager writes the peak load and what was lost. The Away panel still opens.
- **The Credential leak:** a phishing trap starts it, the pager writes about it, and the trap's Thread
  records the click. A fake invoice and a domain notice cost the Cash printed on them; reporting a
  phishing Mail as spam takes its button away.
- **Actions:** Show on Board wherever a Mail names a Node; Resize, Raise quota, and Switch to
  Reserved (cloud, which open the Node's Inspector and its pricing control); Acknowledge and Mute
  for 1 h (alerts, which the Inbox carries out itself);
  Raise and Decline (investor); Approve hire and Later (a teammate's hire request); Review
  \<language\> migration and Decline (a rewrite); Approve and Later (a blocked item); Give time off,
  Raise salary and Accept resignation (an unhappy engineer); Patch now and Queue the patch (a
  proposal to patch); Patch now, Rush patch, and Open Team (security); Open Churn breakdown and Add
  to backlog (customers); File postmortem and File and research the action item (a teammate, after an
  incident); and the phishing traps. Raise, Decline, Approve hire, Approve, Give time off, Raise
  salary, Accept resignation, Patch now, Queue the patch, Add to backlog, and the postmortem buttons
  send the real Messages. Every button is on screen and takes a number key from `1` to `9`.
- **Teammates' own threads:** a blocked item, an unhappy engineer, and a proposal to patch, each with
  its buttons (Approve and Later; Give time off, Raise salary and Accept resignation; Patch now,
  Queue the patch and Open Team). The Team panel shows each live Feature's adopted share and its
  measured lift, and the share of Dev Hours upkeep takes.
- **World events:** every 45 sim seconds from Pre-seed, the Company's seed draws spam, a
  teammate (hire request or rewrite proposal), or a customer: a slow-page ticket when a page is slow,
  and otherwise a Feature that a big customer asks for.
- **CVEs:** every 420 sim seconds the Simulation discloses one CVE that affects a Component the
  Design runs, as a patch ticket. Security writes the advisory; "Rush patch" sends the rush Action,
  and the Node list is behind Dependency scanning ("Check whether you run this" without it). Every
  CVE the Simulation can disclose is a Glossary entry, with its score and what it affects, so the
  advisory's id is one the player can look up.
- **Pause on SEV1 and SEV2:** an optional setting stops the clock when such an incident starts.
  The Company also has a 0.5× speed.
- **Switch provider:** a Payment Provider Node has a Provider setting, First or Second. Switching is a
  rush integration that costs Cash and ends a running Payment provider outage at once. The second
  provider keeps serving through an outage of the first and charges 15% more per checkout.
- **The recruiter's hint:** once an engineer's mood is low enough to write
  ([Burnout and quitting](#burnout-and-quitting)), the recruiter spam's letter carries a line that
  hints one of them is unhappy, without naming who.
- **The Security team's mail:** with a Security team, it writes the credential-leak and breach
  warnings itself instead of the pager.

Reviewing a rewrite proposal opens the Tradeoff card for the
migration, not Team. The reader's keys are built: `1` to `9` press a button, `E` deletes or
restores, `J` and `K` move, `S`
reports spam. The funding offer panel still exists beside the investor Mail.

## What happened in the Design

Step events (CPU credits gone, out of memory, drawer full, an alert fires, an incident starts or
ends, a hire, a deploy, a migration step) are Mail, not toasts. The party that would know writes:
the cloud for credits and memory, the alarm for alerts and incidents, the vendor for the drawer, a
teammate for hires and deploys. A repeat joins its Thread. Mail from a cloud, an alarm, or an
advisory plays the warning chime. Toasts remain for the click that just happened, and in a
Challenge, which has no Inbox.

## Mail bench (Sandbox)

Mail belongs to a Company, but a Sandbox shows the Inbox too, with a **bench** under the tabs for
trying Mail without waiting for it. Pick a sample and Send it, or send ×10 or ×50 random samples. The picker groups one sample per advice topic, one per Step event topic, each CVE and a CVE misfiled in Spam, the hire request, each rewrite language, the customer ticket, the customer's feature request, and every spam and trap sender, plus a **repeating thread** that reuses one key and a random world event. A topic without a sample fails typecheck. Each send picks another of the topic's letters. **Resolve threads** resolves open advice; **Clear** empties
the Inbox. Sandbox Mail follows the same rules as a Company's, and the Inbox keeps the newest 40,
so a ×50 burst also tests the cap. Challenges have no Inbox.

## Delivery order

1. **Senders and colour.** Give every fact a sender kind, move capacity facts to Cloud and Monitoring,
   add the colour chip and glyph, and keep Dr. Leslie Lamportant for strategy.
2. **Threads.** Group repeats, resolve and reopen threads, and replace the six-message rule.
3. **Offers and postmortems.** Move the funding round and the Postmortem into Investor and Teammate
   Mail with action buttons, and remove their panels.
4. **Teammates.** Named engineers, Shipped and Blocked mail, hire requests, and rewrite proposals.
5. **CVEs.** Disclosure, exposure, the patch task, the exploit clock, and the Data breach incident.
6. **Spam.** The folder, the filter, vendor pitches, fake invoices, phishing, and fake CVE alerts.
