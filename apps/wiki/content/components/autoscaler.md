The Autoscaler adds and removes copies of a server as load changes, as an AWS Auto Scaling group.

## When to place it

- Place it when demand swings through the day and you either pay for idle copies at night or run hot at peak. It unlocks with [Autoscaling](/research/autoscaling).

## How it works

It changes how many copies of each linked App Server or Worker run, one Node at a time. No traffic passes through it: you link a Node into it, and from then on it scales on its own. When the Node runs above the target, the Autoscaler asks for more copies. When it idles well below the target, it gives one back. See [autoscaling](/glossary/autoscaling).

New copies are not instant. A VM takes minutes to boot, while a pod in a [Kubernetes Cluster](/components/cluster) takes seconds. Between two scaling actions on one Node the Autoscaler waits a cooldown. New copies also start cold, so a JIT runtime runs them slowly at first. See [cold start](/glossary/cold-start).

## Options

Settings on its card:

- **Signal**: CPU, load (the Node's tightest limit), request rate, or queue depth.
- **Target**: the utilization to hold. Lower is safer and costs more.
- **Min and max copies**: the max is your cost guard.

The signal can be CPU, the Node's whole load, the requests a second each copy takes, or the tasks waiting in the Queues that feed it. CPU misreads a runtime that waits on I/O, because its workers fill while its CPU stays low. Request rate follows the traffic whatever the runtime.

Queue depth suits a Worker. It adds copies when the backlog grows, and a Node no Queue feeds reads zero on it.

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
