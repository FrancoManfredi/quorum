---
title: Graceful degradation
summary: When a system cannot do everything, switch off the costly features first, so the core of the product keeps working.
section: patterns
group: Resilience
order: 508
aliases: degrade, degraded mode, fallback, brownout, feature shedding
---

Graceful degradation drops optional work on purpose when the system is under stress, so users keep the part that matters.

## Use it when

- Some features cost far more than they earn, such as recommendations, exports or reports.
- A spike or a failing dependency threatens the whole page.
- You can show something useful without the feature, like a default or a cached copy.

## How it works

Each feature gets a rank, and under pressure the system turns off the highest-cost, lowest-need ones first. A shop page can render without the recommendation panel, so when the recommender is slow, the page skips it after a short deadline. Netflix shows a generic row when personalization is down. The user sees less, not nothing.

## What it costs

Someone has to decide which features may go, and that is a product call, not an engineering one. Degraded paths need testing, because a path that has never run tends to fail the first time it matters. A degraded system can also look healthy while it quietly loses value, so count how often it runs.

## In Quorum

::Design{id="degrade-dearest"}

**Drop dearest** sits under **Overload** on an App Server. Past its load line, the App Server drops the request kinds that cost the most CPU first, so the cheap kinds keep their latency. Against [Load shedding](/patterns/load-shedding), which drops the lowest-value kinds, this keeps more of the Users happy when the expensive kinds are the cause. Check both captions: the Apdex is higher here and the errors fall, though the dropped kinds still count as errors. If a Node has both, it degrades first. [Graceful degradation](/research/graceful-degradation) needs [Feature flags](/research/feature-flags). The glossary defines [graceful degradation](/glossary/graceful-degradation).
