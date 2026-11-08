The Autoscaler adds and removes copies of a server as load changes, as an AWS Auto Scaling group.

## When to place it

- Place it when demand swings through the day and you either pay for idle copies at night or run hot at peak. It unlocks with [Autoscaling](/research/autoscaling).

## How it works

It changes how many copies of each linked App Server or Worker run, one Node at a time. No traffic passes through it: you link a Node into it, and from then on it scales on its own. When the Node runs above the target, the Autoscaler asks for more copies. When it idles well below the target, it gives one back. See [autoscaling](/glossary/autoscaling).

New copies are not instant. A VM takes minutes to boot, while a pod in a [Kubernetes Cluster](/components/cluster) takes seconds. Between two scaling actions on one Node the Autoscaler waits a cooldown. New copies also start cold, so a JIT runtime runs them slowly at first. See [cold start](/glossary/cold-start).

## Options

::Options{id="autoscaler"}

- **Signal**: what it reads. CPU suits a CPU-bound runtime. Load reads the Node's tightest limit, so it suits a runtime that waits on I/O and fills its workers while CPU stays low. The request rate follows the traffic whatever the runtime. Queue depth suits a Worker that a Queue feeds.
- **Target**: the utilization each copy holds. A higher target packs more work into each copy and leaves less room for a spike. A lower target keeps headroom and costs more.
- **Min copies**: the floor. Keep it high enough to survive the first minutes of a spike, because a new copy takes time to boot and warm.
- **Max copies**: the ceiling, and your cost guard. No max lets a runaway loop bill without end.
- **Schedule**: with [Scheduled scaling](/research/scheduled-scaling), the Autoscaler provisions for the daily peak a couple of hours before it arrives, so the copies are warm when demand lands. On load waits for the load instead.

A Node that no Queue feeds reads zero on queue depth, so pick a signal its traffic moves. A scaled Node also needs a [Load Balancer](/components/lb) in front to share traffic across its copies, or something else that spreads the work.

## How it fails

- A spike faster than the boot time still hurts. A [Traffic spike](/incidents/spike) can be over before new VMs serve.
- CPU is the wrong signal for runtimes that wait on I/O, since their CPU stays low while their workers are full. Use load.
- Scale-up under load can make p99 worse at first, while cold copies warm.

### [Runaway bill](/incidents/runaway-bill)

- **Signs:** Burn rises with no extra revenue, and the Autoscaler's copies climb to its max, or as far as they go with no max.
- **Do now:** Pick a lower **max** on the Autoscaler card.
- **Prevent:** Keep a low **max** on every Autoscaler, never **no max**, and read the cloud bill line by line. [Autoscaling](/research/autoscaling) is the Research the postmortem names.

## Tips

- Put scaled App Servers in a Cluster to cut reaction time.
- Keep the min high enough to survive the first minutes of a spike.
