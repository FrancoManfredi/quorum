---
title: Canary the edge rules: Cloudflare
summary: A single WAF rule took every Cloudflare edge CPU to 100%, and the fix was a canary before the global rollout.
section: patterns
group: Ran in production
order: 959
aliases: cloudflare, waf, regex, outage, canary, edge, postmortem
---

On 2 July 2019, Cloudflare deployed a new WAF managed rule at `13:42`. The rule contained a regular expression that backtracked on long inputs, and every CPU core that served HTTP and HTTPS went to 100%. The network served 502 errors for 27 minutes, and the fix was to disable the rule.

## The system

Cloudflare's edge is anycast: every point of presence runs the same proxy, WAF, and cache, and a rule deployed globally reaches all of them at once. That is the strength and the failure mode. The postmortem says the rule was a minor change to XSS detection, deployed through an automatic process, and the first page came three minutes later. The team had a kill switch, which is why the outage ended in 27 minutes rather than hours.

## The board

::Design{id="cloudflare-edge-rule"}

The DNS is the anycast entry, the WAF is the managed rule layer, the CDN is the edge cache, and the Edge Function is a Worker. The App Server and Database sit behind them. The board runs the game's [Regex backtracking](/incidents/regex) incident on the WAF, so the caption shows what one bad rule does to the request path.

## Why it works

The shape puts one rule in front of every request, so a rule that costs CPU costs it everywhere. A canary sends the rule to one point of presence first, and a kill switch ends a bad rollout without a deploy. [Blue-green and canary](/patterns/blue-green-and-canary) and [WAF and bot management](/patterns/waf-and-bot-management) are the two controls.

## Where the game stops

The game's Regex incident costs a slice of the traffic. The real rule took the whole network down for 27 minutes. The board has one WAF, not a global anycast fleet, and it cannot show a kill switch. The caption is the game's incident, not Cloudflare's outage.

## Sources

- [Details of the Cloudflare outage on July 2, 2019, Cloudflare](https://blog.cloudflare.com/details-of-the-cloudflare-outage-on-july-2-2019): the timeline, the regex, the 27 minutes, and the kill switch.
- [Cloudflare outage caused by bad software deploy, Cloudflare](https://blog.cloudflare.com/cloudflare-outage/): the first postmortem and the immediate remediation.
- [Cloudflare Global Network, Cloudflare](https://www.cloudflare.com/network/): how one rule reaches every point of presence.
