Feature Flags turn a piece of behaviour on for a share of users without a new deploy, as LaunchDarkly and Unleash do.

## When to place it

- Place it as soon as you ship often and roll back rarely, because the flag makes every Feature its own small canary. It unlocks with [Feature flags](/research/feature-flags) in Seed, for 800 ◇, after [Continuous delivery](/research/ci).
- Skip it when you have no Features worth staging. It is cheap and carries nothing, so that is the only question.

## How it works

It limits how far a [Bad deploy](/incidents/bad-deploy) reaches, one Feature at a time. No traffic passes through it. A bad deploy fails **8% of App Server requests for each Feature** its batch shipped, up to the ceiling its deploy strategy sets. A Feature behind a flag only breaks the share of users the flag has reached.

Each shipped Feature has a rollout: **dark, 5%, 25%, 50%, or every user**. A Feature with no step set is live for everyone, which is what a Design with no Feature Flags Node does with all of them.

| Deploy strategy | Ceiling on the blast radius | Thirteen Features with no flags | Thirteen Features at 5%     |
| --------------- | --------------------------- | ------------------------------- | --------------------------- |
| Recreate        | 100%                        | everything breaks               | 5.2% breaks                 |
| Rolling         | 40%                         | 40% breaks                      | 5.2% breaks                 |
| Blue-green      | 10%                         | 10% breaks                      | 5.2% breaks                 |
| Canary          | 5%                          | 5% breaks                       | 5% breaks (its own ceiling) |

The flag is a ceiling of its own, so it wins over the strategy: Recreate cannot outrun a 5% rollout.

## Options

- **Rollout step**: dark, 5%, 25%, 50%, or every user, set per Feature. A lower step limits the blast radius and nothing else.

## How it fails

- **The code still ships.** A deploy ships the code around its Features too. A batch with no Feature still breaks one Feature's worth, and a Design whose Features are all dark still runs the code that is not behind a flag.
- **The rollout is not a load switch.** A Feature still earns and still costs capacity at 5%. Only the blast radius follows the flag.
- **No lift, no holdout.** The users without the Feature do not measure it yet. That waits on `ab-testing`.
- **Flags left behind.** A Feature turned off still pays its upkeep, and a flag at 100% is dead weight. Remove takes the code out for good and ends the upkeep.

### [Bad deploy](/incidents/bad-deploy)

- **Signs:** The **Bad deploy** bar appears at the top of the board, and the error rate jumps right after a deploy.
- **Do now:** Set the Features in the last deploy to **Off** on the Feature Flags card, so a bad deploy of them breaks nobody. Click **Roll back** on the bar too, if you own [Continuous delivery](/research/ci).
- **Prevent:** Keep new Features at 5% for a deploy before you move them on, and research [Automated tests](/research/testing-culture).

## Tips

- Keep a Feature at 5% for a deploy, then move it on. A flag at 100% is a flag you can delete.
- Turn a Feature **Off** when a Bad deploy's bar names it. That is the one click the mitigation toolbox promises.
- Remember that a flag on a Feature that is not in the current batch changes nothing until the next deploy ships it.
