---
title: Unit economics and cost allocation
summary: Divide the bill by what it buys, so each request kind, service and team carries its own cost, and "the cloud bill went up" becomes a specific answer.
section: patterns
group: Cost
order: 903
aliases: unit economics, cost per request, cost allocation, showback, chargeback, tagging, finops, cost per customer, gross margin
---

Total spend tells you almost nothing. Cost per unit of work, and who owns it, tells you what to change.

## Use it when

- The bill grew 30% and revenue grew 10%, and nobody can say where the gap is.
- Teams do not see what their services cost, so nobody has a reason to trim them.
- You price a feature, or decide whether a customer is profitable.

## How it works

Pick a unit your users buy, such as a request, an order or an active customer, and divide the cost by it. Then split the cost by owner. Tag every resource with a team and a service, and let shared costs such as the network be spread by usage.

**Showback** reports each team's spend to it. **Chargeback** bills it to the team's budget. Start with showback, since it needs no accounting and still changes behavior.

Example: if search costs a tenth of a cent per query and earns a twentieth of a cent, every query loses money, and caching it is worth more than a bigger database.

## What it costs

Allocation is approximate. Shared databases, tagging gaps and untagged spend all force a rule, and teams argue about the rule. Keep it simple, review it quarterly, and do not let the model be so exact that nobody trusts a change to it.

## In Quorum

There is no Design to build here, because both are reports on a Design you already have. [Unit economics](/research/unit-economics) shows the cost per served request of each request kind, which splits Burn by each kind's share of demand. [Cost allocation](/research/cost-allocation) needs it first and rolls the same figures up per Service and per Team. [Rightsizing report](/research/rightsizing) finds the idle Nodes behind a bad figure, and [Cut the cloud bill](/guides/cut-the-cloud-bill) uses the reports. See [Money](/explanation/money) and the glossary on [operating margin](/glossary/operating-margin).
