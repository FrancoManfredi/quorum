---
title: SLOs and error budgets
summary: Pick a reliability target users would notice, treat the failures it allows as a budget, and let the remaining budget decide whether to ship or to harden.
section: patterns
group: Operate and observe
order: 702
aliases: slo, sla, sli, error budget, burn rate, reliability target, availability target
---

An SLO states how reliable a service must be, and the error budget is the unreliability that target still permits.

## Use it when

- Product wants features, operations wants stability, and neither has a number to argue with.
- Outages are rare enough that nobody can say whether the service is "good enough".
- You need to decide whether a risky deploy can go out this week.

## How it works

An **SLI** is a measured ratio, such as the share of requests answered in under 300 ms without an error. The **SLO** is the target for it over a window, say 99.9% over 28 days. The **SLA** is the contract with penalties, and it should be looser than the SLO.

A 99.9% target over 30 days allows 43 minutes of full outage, or the same share of failed requests spread thin. That allowance is the budget. While plenty is left, ship faster. Once it is spent, freeze risky changes until the service recovers.

Alert on the **burn rate**, the share of requests failing against the share the SLO allows. A rate of 1 spends the budget exactly at the window's end. The Google SRE workbook pages at 14.4 over one hour, which burns 2% of a 30-day budget.

## What it costs

Each extra nine costs far more than the last, because it means removing causes that were rare enough to ignore. A target tighter than users can feel wastes money, and a loose one lets quality decay unnoticed. Counting every request equally is the usual mistake, since a failed checkout matters more than a failed avatar.

## In Quorum

The game holds an SLO for each Era and measures it per calendar week. [SLO dashboards](/research/slo-dashboards) put the budget on the HUD, and [Error budgets](/research/error-budgets) tie it to the Team: budget left speeds Features up, and a spent budget slows them. A real user the WAF blocks does not spend the budget. Set an [Alerting](/research/alerting) rule on budget burn. The glossary has [SLO, SLA and SLI](/glossary/slo-sla-sli), [error budget](/glossary/error-budget) and [burn rate](/glossary/burn-rate), and [Insight and observability](/explanation/observability) covers the Dashboard.
