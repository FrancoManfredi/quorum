---
title: WAF and bot management
summary: Filter hostile traffic at the edge with a firewall that blocks known attack patterns, and challenge suspicious clients instead of blocking them so real users still get through.
section: patterns
group: Security and edge
order: 802
aliases: waf, web application firewall, modsecurity, owasp, paranoia level, under attack mode, bot, bots, scraper, ddos, challenge, captcha
---

A web application firewall inspects each request and drops the ones that match attack rules, before they cost your servers any work.

## Use it when

- Bots or scrapers make up a large share of traffic, and the app servers burn CPU on them.
- You see SQL injection or path traversal probes in the logs.
- A flood starts, and you need a switch that sheds hostile traffic fast.

## How it works

A WAF applies rules such as the OWASP Core Rule Set. Its **paranoia level** runs from 1 to 4. Level 1 has few rules and rarely blocks a real user, and each level up catches more attacks and flags more real requests.

**Bot management** scores the client first. A suspicious one gets a challenge (a proof of work or a CAPTCHA) instead of a block, so a real user it misjudged can still pass. **Under attack mode**, as Cloudflare names it, challenges everyone for a while. It stops nearly all junk during a flood, and costs real users an extra step.

Example: a login form on level 4 blocks more injection probes, but a customer whose password contains `'--` may be blocked too and call support.

## What it costs

More rules mean more CPU and a little latency on every request, and a false positive is a lost customer. Start at a low level and raise it by evidence. A WAF buys time while you patch a vulnerable app and never replaces the patch.

## In Quorum

Place a WAF in front of the servers, as below.

::Design{id="waf-tuned"}

The paranoia level is a trade: more bots blocked, more real users blocked, more CPU per request. **Under attack** is a switch on the WAF card that raises the block rate and adds latency, so use it during a flood and turn it off after. A real user the WAF blocks gets a client error, which does not spend the error budget. [Web application firewall](/research/waf) unlocks the [WAF](/components/waf), and [Bot management](/research/bot-management) halves its false positives. The [Bot surge](/incidents/bot-surge) and [DDoS](/incidents/ddos) incidents are the test, and the glossary defines the [WAF](/glossary/waf-web-application-firewall) and [bot management](/glossary/bot-management).
