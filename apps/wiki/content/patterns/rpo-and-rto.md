---
title: RPO and RTO
summary: Set two targets for every disaster, how much data you may lose and how long you may be down, and let them pick the backup and standby design.
section: patterns
group: Operate and observe
order: 707
aliases: rpo, rto, recovery point objective, recovery time objective, backup, pitr, point in time recovery, restore, restore drill, wal archiving
---

RPO is the most data you accept losing, measured in time. RTO is the longest you accept being down.

## Use it when

- Someone asks "are we backed up?" and the honest answer is "to when, and how fast can we get it back?"
- A bad migration or a dropped table has to be undone, and the last copy is a day old.
- You choose between nightly snapshots, log archiving and a standby.

## How it works

RPO is set by how often data leaves the primary. A nightly snapshot means an RPO of up to 24 hours. Point-in-time recovery archives the write-ahead log (WAL) continuously, so the RPO is minutes and you can restore to just before the bad statement. Synchronous replication brings it to zero, at the price of slower writes.

RTO is set by how long recovery takes. Restoring a snapshot and replaying a log grows with the size of the data, so a 1 TB database restores far slower than a 10 GB one. A hot standby skips the copy and takes over in seconds.

A standby does not undo a delete, because it copies the delete too. Only a backup with history does.

## What it costs

Log archiving and a standby each add storage and a second box. The usual mistake is trusting backups nobody has restored. A drill finds the bad one before the disaster does.

## In Quorum

Pick a Database's backup mode, as below. Nightly is the cheap floor, and PITR keeps minutes of RPO.

::Design{id="rpo-pitr"}

A backup nobody has restored may not restore, and [Restore drills](/research/restore-drills) test each backup as it is taken so that roll never fails. Pressing Restore after an [accidental delete](/incidents/accidental-delete) reads the backup, and the time grows with the rows. A Read Replica in another region sets the RPO by its lag, and a Spread store loses none. The [DR drill](/incidents/dr-drill) measures both numbers for the IPO checklist. See [Disaster recovery tiers](/patterns/disaster-recovery-tiers), and the glossary entries [RPO and RTO](/glossary/rpo-and-rto) and [point-in-time recovery](/glossary/point-in-time-recovery).
