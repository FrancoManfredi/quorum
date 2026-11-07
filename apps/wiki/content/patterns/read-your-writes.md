---
title: Read your writes
summary: After a user writes, send that user's reads to the primary for a while, so they never see data older than their own change.
section: patterns
group: Scaling data
order: 308
aliases: read after write, session consistency, stale read, replica lag, sticky primary, monotonic reads
---

Read-your-writes guarantees that a user who just saved something sees it on the next page.

## Use it when

- Reads go to replicas that lag the primary, and users edit something they then view.
- A checkout or a settings page reads back what it just wrote.
- Stale answers from other users' writes are fine, but your own are not.

## How it works

The app notes when a user last wrote, and for a short window after it sends that user's reads to the primary. A common window is a few seconds, longer than the usual replica lag. Other reads go to replicas as before. Another way is to carry the log position of the write and read only from a replica that has reached it.

If a user saves a profile and 200 ms later reloads, a lagging replica may return the old one. With the rule, the reload goes to the primary and shows the new one.

## What it costs

Reads after a write land on the primary, so a write-heavy user adds load there. The rule works per user or session and does not stop one user seeing another's older data. It also needs a clock or a position the app can trust, and a user on two devices has two sessions. Windows that are too short still show stale data.

## In Quorum

::Design{id="ryw-routed-reads"}

The routing switch sits on the [App Server](/components/server). With it on, checkout reads go to the primary and never come back stale, and most other stale reads go away. It needs [Read-your-writes routing](/research/ryw-routing) after [Read replicas](/research/replication).

It makes the [Replication lag](/incidents/repl-lag) incident much rarer, and the [Stale read](/incidents/stale-read) incident lists it as one fix. A [Synchronous replica](/patterns/replication-strategies) is the costlier fix. The glossary defines [read-your-writes consistency](/glossary/read-your-writes-consistency).
