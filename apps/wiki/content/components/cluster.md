The Kubernetes Cluster packs your services onto shared machines, as Kubernetes does.

## When to place it

- Place it when you run many App Servers and Workers, and Burn or scaling speed matters more than simplicity. It unlocks with [Container orchestration](/research/containers).

## How it works

It takes no traffic. Link App Servers or Workers into it and they run as pods. Pods pack onto shared nodes, so they cost less Burn for the same capacity. An [Autoscaler](/components/autoscaler) adds pods in seconds instead of booting VMs for minutes. See [container orchestration](/glossary/container-orchestration).

It also brings:

- **Rolling deploys**: a bad deploy stops after its first batch of pods, so only part of the traffic fails.
- **Self-healing**: when a pod's host dies, the Cluster reschedules it.

The costs:

- **Noisy neighbours**: pods share CPU, and busy neighbours add delay to a share of requests.
- **Platform work**: without a Platform team, each Cluster takes Dev Hours from your product teams. See [Team and velocity](/explanation/team-and-velocity).
- **Upgrades**: each Kubernetes version is supported for a limited time.

## How it fails

- If the Cluster goes down, its pods run as plain VMs again, with full Burn and slow scaling.
- Noisy neighbours raise p99 when the shared nodes run busy.

### [Forced cluster upgrade](/incidents/cluster-upgrade)

- **Signs:** The Cluster card reads "The provider is forcing an upgrade. Pods that use removed APIs crash." and the pods crash-loop.
- **Do now:** Click **Upgrade clusters** on the card. It queues a task of Dev Hours, and the incident ends when the Team finishes it.
- **Prevent:** Run the **Upgrade clusters** task each quarter, or staff a Platform team. See [Team tasks](/team#tasks).

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the Kubernetes Cluster in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

## Tips

- Use one Cluster for many services. It costs less platform time than several Clusters.
- Pair a Cluster with an Autoscaler. Fast pod scaling is most of its value.
