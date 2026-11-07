---
title: Runbooks and on-call
summary: Put one person on call at a time, write down the fix for each failure the team has already handled, and automate the ones that repeat.
section: patterns
group: Operate and observe
order: 705
aliases: runbook, playbook, on-call, pager, pagerduty, rotation, mttd, mtta, mttr, incident response, sre
---

An on-call rotation makes sure someone answers the page, and a runbook makes the answer the same every time.

## Use it when

- An alert fires at night and nobody knows who owns it.
- The same incident returns, and each time one engineer rediscovers the fix.
- Response time depends on who happens to be awake.

## How it works

The rotation names one primary and one backup for a service, usually for a week. The page goes to the primary, who acknowledges it. The time from the failure to the first signal is the MTTD, from the signal to an acknowledgement the MTTA, and the whole recovery the MTTR. A runbook cuts the last by turning "think" into "follow".

A good runbook has a trigger (the alert that links to it), the checks that confirm the cause, the safe action, and how to know it worked. Write it after handling the incident by hand once, while the steps are fresh. The next step is to turn the runbook into a script, so the page resolves itself and a person reviews it later.

Example: a certificate-expiry runbook says check the expiry date, renew, reload the proxy, confirm with a request. A script can do all four.

## What it costs

On-call costs sleep, and a noisy rotation burns people out faster than outages do. A runbook goes stale as the system changes, and nobody notices until the night it fails. Review each one after every use.

## In Quorum

[Alerting](/research/alerting) sends the page, and [On-call rotation](/research/on-call) makes a rotation acknowledge it, so the incident starts being handled in minutes. [Runbooks](/research/runbooks) let the team write a runbook for an incident kind it has handled by hand before, and from then on that kind resolves itself. Breaches, credential leaks and DR drills have no runbook, since they have no response to automate. A runbook also needs an [SRE team](/research/sre-team) with an engineer on it to keep it current. See [Incidents](/explanation/incidents), and the glossary entries for [runbook](/glossary/runbook), [on-call](/glossary/on-call), [MTTD and MTTA](/glossary/mttd-and-mtta) and [MTTR](/glossary/mttr).
