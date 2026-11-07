---
title: Data residency
summary: Keep a region's personal data on servers in that region, and route its users there, so local law and customer contracts are met without a separate product.
section: patterns
group: Security and edge
order: 806
aliases: data residency, data sovereignty, gdpr, eu data, regional data, geo routing, schrems, data localization
---

Data residency means a user's data stays in a named place, and everything that touches it, including backups and replicas, stays there too.

## Use it when

- European customers or contracts ask for EU-only storage.
- A regulator or sector rule limits where personal data may be processed.
- You open a region for latency and must not copy its users into your home region.

## How it works

Route each user to their region at the edge, with GeoDNS or an account's home region. Run a full stack there, with its own database, so a request never reaches across the border. Then audit what leaks: backups, analytics, logs and a global user table are the usual offenders.

GDPR itself does not forbid leaving the EU. It requires a lawful basis for the transfer, such as standard contractual clauses. Many enterprise contracts ask for more, so residency is often a sales requirement before it is a legal one.

Example: a German hospital customer requires that patient records never reach a US server. A global replica for disaster recovery breaks that promise, even if nobody reads from it.

## What it costs

You run the stack once per region, and a feature that needs all users together, such as global search or a leaderboard, gets harder. Cross-region calls pay latency and transfer fees. The common mistake is fixing the primary database and forgetting its logs.

## In Quorum

The game checks the same chain as one line of the IPO checklist. [Data residency controls](/research/gdpr-residency) and [GeoDNS](/research/geo-dns) must be researched, an EU region must be open with an EU Users Node, and every data Node reachable from it must sit in the EU, or be a store that spreads across regions. Separately, the Data residency Feature, built with Dev Hours once an EU region is open, lets the Company grow in that market at all from the Pre-IPO Era on. Open the region with [Multiple regions](/research/multi-region), and see [Go global](/guides/go-global) for the steps and the glossary on [data residency](/glossary/data-residency) and [GeoDNS](/glossary/geodns).
