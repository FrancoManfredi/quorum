---
title: Mail, Dashboard, Glossary, pager, region tabs
summary: Read the Inbox, the Dashboard, the Glossary and the pager, and switch between region tabs.
section: play
order: 10
aliases: inbox, mail, spam, thread, dashboard, metrics, glossary, pager, alerts, incident bar, postmortem, region tabs, mirror
gdd: /design/15-ui-ux
---

Press `I` for Mail and `D` for the Dashboard. The pager and the region tabs sit on the board itself, so you never open them.

## The Inbox

The Inbox is a button at the bottom right of the board, and its badge counts unread Mail. The badge turns red when a message waits for your decision. Press `I` to open the panel and `Esc` to close it.

![The Inbox with its folders on the left and a message open on the right](/play/mail.png)

Look at the folders at the top: **Needs action**, **FYI**, **Spam** and **Trash**. Needs action holds Mail with a button that changes something and has no answer yet. FYI holds the rest.

Each row shows the sender's coloured badge, the sender, the time and the subject. The badge shape and glyph tell you the kind of sender: a cloud provider, a monitoring tool, a vendor, a teammate, an investor and so on. The colour comes from the company the sender parodies, so read the kind label too. Colour is never the only signal.

Mail about one thing from one sender is a **Thread**, and a repeat joins it and shows a count instead of a new row. A thread resolves when its cause is gone, though it stays as a record.

To answer a message:

1. Select a row. The reader opens on the right.
2. Read the body, then the buttons under it. **Show on Board** selects the Node the message is about.
3. Click an action button, or press its number key. `1` presses the first button, `2` the second, and so on.

A number key fires its button even on a message you have not read, and that button runs a real action such as a resize or a raise, so read first.

| Key   | Effect in the Inbox           |
| ----- | ----------------------------- |
| `J`   | Next message                  |
| `K`   | Previous message              |
| `E`   | Delete, or restore from Trash |
| `S`   | Report spam, or Not spam      |
| `Esc` | Close the Inbox               |

Spam is mail no real sender would write. Opening it costs nothing, but acting on a trap does. When more than eight threads are unread, the oldest FYI threads fold into one **Digest** row. Nothing is lost, and the Digest lists each one.

## The Dashboard

The Dashboard opens with `D`, after you research `metrics`. It is a full-screen set of Charts that show the Design over time.

![The Dashboard with the time range buttons, the switches and the golden signals](/play/dashboard.png)

Read it from the top:

1. **Time range.** Pick **1h**, **6h**, **1d**, **7d** or **30d**. These are calendar times, so one hour is about a minute of play at 1× speed.
2. **Variables.** The selects narrow every chart by request kind, and by Service and region when you have more than one.
3. **Compare** draws a faint line for yesterday on each time series.
4. **Table** turns each chart into a table of its values.
5. **Annotation switches.** **Design change**, **Deploy**, **Incident**, **Company** and **Research** each draw a coloured vertical marker on every time series. Turn one off when the markers crowd the line.

The first row holds the golden signals: Users, Cash per second, Apdex, the hottest Node, the error rate and p99. Below it you find a row for each Component, then Company and Incidents rows. To see why a line bent, turn on the switches and look for the marker just before the bend. Read [Read p99 and tail latency](/guides/read-p99) for the latency charts.

More charts appear with each visibility Research, and a chart without its Research says which one it needs.

## The Glossary

The game links each engineering term to its page on the [Glossary](/glossary) of this wiki. The book button in the toolbar opens the hub, after you meet your first Tradeoff card.

A term chip on a Tradeoff card, a `?` chip on a Research item, and a CVE id in a Security advisory all open their page in a new tab. Security advisories are listed under **Security** on the hub.

Each page says what the term means at work and what it does in Quorum, with related terms and sources to read next.

## The pager and the incident bar

Alerts need the `alerting` Research. After that, the top lane of the board carries two notices, and only one of them is loud.

The **incident bar** is red because one click ends the incident: it names the incident, its severity, and the click that stops it. It carries one incident at a time, and a crosshair button selects the Node the incident hit. A cascade adds a line inside the bar, such as "Followed Slow query, which was left alone", so the second page reads as a second page.

Below it, the **alert chip** stays quiet while a rule fires. It counts the rules, names the first symptom, and holds two buttons. The check mark acknowledges every firing rule, which folds the chip to a count until one of them clears. **Alerts** opens the Alerts row of the Dashboard.

![The red incident bar and the quiet alert chip on the top lane](/play/pager.png)

Tuning lives in the Dashboard. The Alerts row holds each rule's three thresholds, what the rule reads now, how long it has held, and its state. A rule that cried wolf too often shows **Ignored** on the chip and in that row; pick another threshold there to switch it on again.

The incident bar holds one button, the one-click fix for the incident it shows:

- **Roll back**, on Bad deploy. It is greyed until you research CI.
- **Renew**, **Fence leader**, **Cancel migration**, **Pin and redeploy**, **Restore**, **Restart**, **Restart Nodes**, **Fail over**, **Throttle connects** and **Move login**. Each ends a matching incident.

Postmortems are Mail. After the incident ends a teammate asks what happened, and that message holds **File** and the action item beside it. Leaving the action item open keeps that incident twice as likely.

Read [Your first incident](/tutorials/first-incident) for a full walk-through.

## Region tabs

From Series C, with `multi-region` researched, a **Regions** bar shows on the top lane. Each open region is a tab with a short name such as NA or EU. Click one to see that region's Board. A closed region reads "+ EU". Click it to open the region, and hover first to read its price.

With infra-as-code researched, a **Mirror** button joins the bar, and [Go global](/guides/go-global) covers what it copies. An amber dot on a tab means that region has drifted from its source.
