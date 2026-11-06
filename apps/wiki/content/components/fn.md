The Serverless Function runs your code per request, with no box of your own, as AWS Lambda, Google Cloud Functions, and Azure Functions do.

## When to place it

- Place it when traffic is spiky. It unlocks with [Serverless](/research/serverless) in Series A, for 3,500 ◇, and has no placement cost.
- Place it when one endpoint needs its own capacity without a second box.
- Skip it for steady load above about 30% utilization of an equal VM, where it costs more than the VM.
- Skip it for long `job` work. That belongs on a [Worker](/components/worker) behind a [Queue](/components/queue).

## How it works

It takes every request kind and answers it the way an [App Server](/components/server) does, turning it into the backend calls it makes. It runs your Service's Stack, so its runtime decides how fast a request runs and how long a cold start takes. There is no instance type and no size to pick.

It differs from an App Server in three ways:

- **It bills per use.** Nothing stands while it idles. Each request pays a request price plus a price for the GB-seconds its execution ran, and the whole bill lands on the Requests line of the [cloud bill](/design/09-economy#the-cloud-bill). A slow call to the Database makes each execution longer, so the bill rises with the data tier's latency.
- **It scales from zero to a cap.** One execution environment holds one request at a time, so the function serves as many requests a second as 1,000 concurrent executions allow. Past the cap the provider throttles, and the excess is dropped, not queued.
- **It starts cold.** An environment that sat idle is gone, and the next invocation boots a new one. See [cold start](/glossary/cold-start). The Simulation charges it on a share of requests: nearly all of them at a trickle, almost none under steady load.

Because nothing is resident, a function is cheap at low and spiky volume. Above about 30% steady utilization of an equal VM it costs more than the VM, because the VM's Burn does not grow with the work it does.

## How it fails

- **The cap.** A spike above 1,000 concurrent executions is throttled, and the requests are lost.
- **Cold starts after a quiet minute.** A Java function can pay two seconds before its code runs, while Go and Rust pay 50 ms. A trickle of traffic pays it most often.
- **Connections.** Every concurrent execution opens its own database connections. Without a [Connection Pooler](/components/pooler), a spike exhausts Postgres.
- **Duration.** A function stops an execution after 15 minutes. An export (`job`) runs 4 seconds for each GB the Databases hold, so past 225 GB it fails as `timeout`. Long `job` work belongs on a Worker behind a Queue, which has no limit.

## Tips

- Put a [CDN](/components/cdn) or a [Cache](/components/cache) in front, because a function pays for every request that reaches it.
- Aim for a steady base load on App Servers with functions for the peaks: reserved boxes for the floor, per-use capacity for the spike.
