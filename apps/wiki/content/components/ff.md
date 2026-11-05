## What it does

Feature Flags stand for LaunchDarkly and Unleash: a switch in the code, controlled at runtime, that
turns a piece of behaviour on for a share of users without a new deploy.

It carries no traffic. What it changes is how far a [Bad deploy](/incidents/bad-deploy) reaches. A
bad deploy fails **8% of App Server requests for each Feature** its batch shipped, up to the ceiling
its deploy strategy sets. A Feature behind a flag only breaks the share of users the flag has reached.

Each shipped Feature has a rollout: **dark, 5%, 25%, 50%, or every user**. A Feature with no step set
is live for everyone, which is what a Design with no Feature Flags Node does with all of them.

| Deploy strategy | Ceiling on the blast radius | Thirteen Features with no flags | Thirteen Features at 5%     |
| --------------- | --------------------------- | ------------------------------- | --------------------------- |
| Recreate        | 100%                        | everything breaks               | 5.2% breaks                 |
| Rolling         | 40%                         | 40% breaks                      | 5.2% breaks                 |
| Blue-green      | 10%                         | 10% breaks                      | 5.2% breaks                 |
| Canary          | 5%                          | 5% breaks                       | 5% breaks (its own ceiling) |

The flag is a ceiling of its own, so it wins over the strategy: Recreate cannot outrun a 5% rollout.

## When to place it

Place it as soon as you ship often and roll back rarely: the flag makes every Feature its own small
canary. It unlocks with [Feature flags](/research/feature-flags) in Seed, for 800 ◇, after
[Continuous delivery](/research/ci).

It is cheap and it carries nothing, so the only question is whether you have Features worth staging.

## How it fails

- **It is not free of the code.** A deploy ships the code around its Features too. A batch with no
  Feature still breaks one Feature's worth, and a Design whose Features are all dark still runs the
  code that is not behind a flag.
- **The rollout is not a load switch.** In this build a Feature still earns and still costs capacity
  at 5%: only the blast radius follows the flag.
- **No lift, no holdout.** The users without the Feature do not measure it yet: that waits on
  `ab-testing`.
- **Flags left behind.** Nothing removes a Feature's code, so flags accumulate in the real world;
  the build has no Remove item to model that.

## Tips

- Keep a Feature at 5% for a deploy, then move it on. A flag at 100% is a flag you can delete.
- Turn a Feature **Off** the moment a Bad deploy's bar names it: that is the one click the mitigation
  toolbox promises.
- A flag on a Feature that is not in the current batch changes nothing until the next deploy ships it.
