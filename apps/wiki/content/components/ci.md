The CI/CD Pipeline takes finished work and puts it into production, as GitHub Actions, GitLab CI, or Argo CD do.

## When to place it

- Place it as soon as you ship more than a Feature a day. A Pipeline cuts deploy time from 30 minutes to minutes, so the Team's Features reach users sooner. It unlocks with [Continuous delivery](/research/ci), which also lets you roll a Bad deploy back.

## How it works

It changes how a deploy happens: how often the Team can ship, what the Pipeline costs while it exists, and how far a [Bad deploy](/incidents/bad-deploy) reaches. It carries no traffic, so you link nothing into it or out of it.

Every deploy ships the Features that finished since the last one. Without a Pipeline a deploy is manual and takes 30 minutes. With one it takes as long as its strategy says, and the strategy sets the rest.

More deploys mean smaller batches, and a smaller batch is a smaller bad deploy. That is the best reason to place a Pipeline early.

## Options

::Options{id="ci"}

The card has one setting. Rolling is the default.

| Deploy strategy | Deploy time | Bad deploy blast radius | Burn              |
| --------------- | ----------- | ----------------------- | ----------------- |
| Recreate        | 2 min       | Up to 100%              | 1× the Pipeline   |
| Rolling         | 5 min       | Up to 40%               | 1× the Pipeline   |
| Blue-green      | 7 min       | Up to 10%               | 2× the Pipeline   |
| Canary          | 10 min      | Up to 5%                | 1.5× the Pipeline |

A bad deploy fails 8% of App Server requests for each Feature its batch shipped, and the strategy sets the ceiling on that:

- Recreate swaps every server at once, so nothing holds the bug back. It is fastest and cheapest, and the worst one to be wrong under.
- Rolling replaces a slice at a time and can be stopped.
- Blue-green serves from the old fleet while the new one comes up, so only its slice sees the bug. It pays for the second fleet.
- Canary sends 5% of traffic first and waits. It is the safest and ships least often.

Deploy times and Burn multipliers are this game's own numbers, chosen to make the trade real.

## How it fails

- A slow strategy ships fewer Features a day: 10-minute Canary deploys against Move fast's 16 a day lose a fifth of them.
- Recreate has no ceiling. A batch of a dozen Features breaks every request until you roll back.
- Blue-green and Canary cost more Burn every second they exist, not only while they deploy.
- A Pipeline without a [Kubernetes Cluster](/components/cluster) or a Platform team still pays the slow part, because the Stack's build time is untouched.
- Canary is worth its Burn only if you watch the Bad deploy bar and roll back. The bug sits in 5% of traffic until you act.

### [Bad deploy](/incidents/bad-deploy)

- **Signs:** The **Bad deploy** bar appears at the top of the board, and the error rate jumps right after a deploy.
- **Do now:** Click **Roll back** on the bar. It is locked until you research [Continuous delivery](/research/ci).
- **Prevent:** Pick a strategy with a smaller blast radius, such as Canary or Blue-green, ship smaller batches, and research [Automated tests](/research/testing-culture).

## Tips

- Pick the strategy by what a bad deploy costs you.
- Pair Rolling with a Cluster: a Cluster's deploy stops after its first batch of pods, so a bad deploy breaks a quarter of the Rolling ceiling.
