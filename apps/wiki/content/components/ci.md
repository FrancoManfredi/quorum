## What it does

The CI/CD Pipeline stands for GitHub Actions, GitLab CI, or Argo CD: the machine that takes finished
work and puts it into production.

It takes no traffic and sends none on. You link nothing into it and nothing out of it. What it
changes is how a deploy happens: how often the Team can ship, what the Pipeline costs while it
exists, and how far a [Bad deploy](/incidents/bad-deploy) reaches.

Every deploy ships the Features that finished since the last one. Without a Pipeline a deploy is
manual and takes 30 minutes. With one it takes as long as its strategy says, and the strategy sets
the rest:

| Deploy strategy | Deploy time | Bad deploy blast radius | Burn              |
| --------------- | ----------- | ----------------------- | ----------------- |
| Recreate        | 2 min       | Up to 100%              | 1× the Pipeline   |
| Rolling         | 5 min       | Up to 40%               | 1× the Pipeline   |
| Blue-green      | 7 min       | Up to 10%               | 2× the Pipeline   |
| Canary          | 10 min      | Up to 5%                | 1.5× the Pipeline |

A bad deploy fails 8% of App Server requests for each Feature its batch shipped. The strategy sets
the ceiling on that: Recreate swaps every server at once, so nothing holds the bug back; Rolling
replaces a slice at a time and can be stopped; Blue-green serves from the old fleet while the new
one comes up and only its slice sees the bug; Canary sends 5% of traffic first and waits. Deploy
times and Burn multipliers are the build's own numbers, chosen to make the trade real.

Settings on its card:

- **Deploy strategy**: the four above. Rolling is the default, and the one an old save opens on.

## When to place it

Place it as soon as you ship more than a Feature a day: a Pipeline cuts deploy time from 30 minutes
to minutes, so the Team's Features reach users sooner. It unlocks with
[Continuous delivery](/research/ci), which also lets you roll a Bad deploy back.

Then pick the strategy by what a bad deploy costs you. Recreate is fastest and cheapest and the
worst one to be wrong under. Canary is the safest and ships least often. Blue-green sits between
them and pays for the second fleet.

## How it fails

- A slow strategy ships fewer Features a day: 10-minute Canary deploys against Move fast's 16 a day
  lose a fifth of them.
- Recreate has no ceiling: a batch of a dozen Features breaks every request until you roll back.
- Blue-green and Canary cost more Burn every second they exist, not only while they deploy.
- A Pipeline without a [Kubernetes Cluster](/components/cluster) or a Platform team still pays the
  slow part: the Stack's build time is untouched.

## Tips

- Canary is worth its Burn only if you watch the Bad deploy bar and roll back: the bug is in 5% of
  traffic, and it stays there until you act.
- Rolling and a Cluster add up: a Cluster's deploy stops after its first batch of pods, so a bad
  deploy breaks a quarter of the Rolling ceiling.
- More deploys mean smaller batches, and a smaller batch is a smaller bad deploy. That is the real
  reason to place a Pipeline early.
