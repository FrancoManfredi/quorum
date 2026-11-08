Analytics records what your requests did, as an OpenTelemetry collector with a tracing backend.

## When to place it

- Place it when Insight for a kind grows slowly, or when a new Component carries traffic you have not sampled yet. Link that Node into it.
- Resize it when its card shows it at full throughput.

The Garage board starts with one Analytics Node linked to the App Server.

## How it works

Analytics is a tap. Link any Node into it and it receives a copy of that Node's traffic, not a share of it. It samples the copy at the sample rate you set, and each sample earns Insight in the pool of its request kind. A request that fails or frustrates its user also earns Failure Insight, which teaches more than a healthy one.

Insight grows with the square root of samples, counted per Component type and kind. Tapping many different Components therefore teaches more than tapping one large one. [Insight and observability](/explanation/observability) covers the full model.

Analytics keeps a limited number of samples per second, and each size step doubles it. Past that it drops samples evenly.

## Options

- **Sample rate**: how much of the tapped copy it samples. A high rate adds CPU and latency to every tapped Node and multiplies storage Burn.
- **Retention**: how long it keeps traces. A longer window costs more Burn.

## How it fails

Analytics never breaks a request, and no incident targets it. It has costs:

- Overloaded, it drops samples, and Insight slows.
- A high sample rate adds CPU and latency to every tapped Node.
- Without Analytics you earn no Insight from traffic, and Research stalls.
- Traffic that reaches no tap is unclassified: the Design carries it, it earns nothing, and you cannot see what it is. The Analytics card and the Research screen show that share, and a tap on the path fixes it.

:::Note{tone="real"}
Real tracing systems sample too. Keeping every trace is expensive, and a small sample already shows the common paths. See [distributed tracing](/glossary/distributed-tracing) and [observability](/glossary/observability).
:::

## Tips

- Tap one Node of each Component type before you raise the sample rate.
- Lower the sample rate on hot App Servers if p99 matters more than Insight.
