---
title: Why a Company ends
summary: Why each Company ends in an Exit, how an Exit becomes Legacy, and how Perks, Ventures, and Mutators make the next Company different.
section: explanation
order: 13
era: 3
aliases: win, goal, end game, exit, legacy, prestige, acqui-hire, acquisition, ipo, step down, perks, legacy shop, ventures, mutators, founder, reset, new company, playbooks
gdd: /design/13-prestige
---

Quorum is endless, but a single Company is not. At some point you sell it, list it, or step down, and
that is an **Exit**. The Exit pays **Legacy**, which stays with you as the Founder. Legacy buys
permanent Perks. Every Venture and Mutator is open when you found a Company, so the next Company can
play by different rules without waiting for a shop.

Incremental games call this pattern prestige. Each Company starts over, and the Perks you bought
with Legacy carry into it. A Venture or Mutator carries no cost: choose the rules you want to learn.

## The four Exits

| Exit        | Offered from | Pays on                   | Multiplier  | After it                |
| ----------- | ------------ | ------------------------- | ----------- | ----------------------- |
| Acqui-hire  | Series A     | Valuation, capped at $50M | 0.5         | The Company ends        |
| Acquisition | Series B     | Valuation                 | 1           | The Company ends        |
| IPO         | Pre-IPO      | Valuation at listing      | 1.5         | The Company goes Public |
| Step down   | Public       | Valuation                 | 1.5 + bonus | The Company ends        |

The payout is your Equity times the Valuation times the multiplier. An Acqui-hire is a fast way out
when you want to try a new Venture, and an Acquisition pays your full Valuation.

The IPO is the Pre-IPO funding round, so it does not appear on the Exit list. It needs the IPO
checklist, it pays Legacy at listing, and the Company goes on into the Public Era. Once you are
listed, Step down is the only way out. It pays only the Legacy you did not already get at the IPO, and
each quarter in your current streak of beaten guidance adds 0.1 to its multiplier, up to 1 more.
[Cash, Burn, and funding](/explanation/money) explains the Valuation and quarters.

## From payout to Legacy

```latex
\text{Legacy} = \operatorname{floor}\left(\sqrt{\text{payout} / \$1{,}000{,}000} \times \text{founding multiplier}\right)
```

A $1 million payout gives 1 Legacy. A $100 million payout gives 10, and $10 billion gives 100. The
square root means a better Exit pays more, but only a hundred times the payout buys ten times the
Legacy, so one huge run does not make the rest pointless. The founding multiplier comes from your
Venture and Mutators (see below).

:::Note{tone="real"}
Real founders face the same tradeoff. Equity is what you sell in every funding round, and your share
at the Exit decides what you take home. A founder who raised every round owns a small slice of a large
company, and one who declined owns a large slice of a smaller one.
:::

## What resets and what stays

An Exit ends the Company. Cash, Insight, Dev Hours, users, Research, the board, the team, and Equity
all reset, and you found a new Company in the Garage, or in Pre-seed with the Head start Perk.

The exited Company closes. Its file leaves the **Companies** list and you cannot continue it, while
every Company you have not exited stays on the list, and you can open them in any order.

The Founder keeps:

- Legacy, and the Perks it bought.
- Playbooks: saved parts of a Design that you can place again in one action.
- Achievements, Challenge results, and the glossary terms you met.
- The company history: one row per Exit, with its name, Venture, payout, Legacy, peak users, Stack,
  and a snapshot of the board.

## Perks

The Legacy shop sells Perks. Each has levels, and each level costs more Legacy than the last.
Examples:

- **Angel network** doubles your starting Cash per level.
- **Alumni network** adds an engineer who joins when hiring opens.
- **Institutional knowledge** keeps one Research item of your choice through the next Exit, per
  level.
- **Pattern recognition** adds 20% Insight per level. **Founder's reputation** adds 10% user growth.
- **Better terms** takes 2 points off the dilution of each round.
- **Night shift** adds 10% Dev Hours per level, because the team works a second shift.
- **Time dilation** unlocks faster Company speeds.
- **War stories** halves the extra weight that open action items give incidents.
- **Head start** founds the next Company in Pre-seed.

The [Prestige](/prestige#perks) reference lists every Perk with its prices.

## Ventures change the rules

A **Venture** is the kind of Company you found. Every Venture is open, and B2B SaaS is the default. A
Venture changes what your users send and when:

- **Consumer social** has twice the market and half the value per request, with more media.
- **Fintech** peaks in business hours and sends four times the purchases.
- **Streaming media** sends four times the media, so egress dominates the bill.
- **Game backend** sends four times the realtime traffic.
- **AI startup** has flat demand and three times the AI prompts.
- **E-commerce** doubles purchases and search.
- **Bootstrapped indie** takes no funding rounds, and its Equity stays at 100%. The Default Alive
  achievement still marks the run: reach IPO without raising a round.

Each Venture has its own Legacy multiplier, shown before you found it, and a harder Venture pays
more. The [Prestige](/prestige#ventures) reference has the details.

## Mutators make it harder for more Legacy

A **Mutator** is an optional rule that makes a Company harder. Each one adds to the founding
multiplier: the Venture's multiplier times one plus the sum of the Mutators' shares. Every Mutator is
open at founding, so the only reason to choose one is the Company you want to run.

Examples:

- **No caches** removes the Cache and the CDN.
- **Tight budget** halves funding grants.
- **One region forever** keeps the Company in one region.
- **Strict SLO** sets each Era's SLO one level higher.
- **Chaos Monkey** makes instance failures dominate from Seed.
- **Postgres for everything** asks how far one relational database can go, an argument among
  engineers.

Each one forces a different Design.

See the [Prestige](/prestige#mutators) reference for every Mutator and its share.

:::Note{tone="tip"}
A Company file stays in this browser. [Move a Company to another browser](/guides/move-a-company)
copies it as text before you clear site data.
:::

## When to take an Exit

There is no single right time. A later Exit usually pays more, but the Legacy curve flattens, so a
new Company with better Perks may earn more per hour. [Your first Exit](/tutorials/first-exit) walks
through one, and [Prepare for an Exit](/guides/prepare-for-an-exit) shows how to raise the payout
first.
