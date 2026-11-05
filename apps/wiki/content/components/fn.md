## What it does

The Serverless Function stands for AWS Lambda, Google Cloud Functions, and Azure Functions: your code run per request, with no box of your own.

It takes every request kind and answers it the way an [App Server](/components/server) does, turning it into the backend calls it makes. It also runs your Service's Stack, so its runtime decides how fast a request runs and how long a cold start takes. There is no instance type and no size to pick.

Three things make it different from an App Server:

- **It bills per use.** Nothing stands while it idles. Each request pays a request price plus a price for the GB-seconds its execution ran, and the whole bill lands on the Requests line of the [cloud bill](/design/09-economy#the-cloud-bill). A slow call to the Database makes each execution longer, so the bill rises with the data tier's latency.
- **It scales from zero to a cap.** One execution environment holds one request at a time, so the function serves as many requests a second as 1,000 concurrent executions allow. Past the cap the provider throttles: the excess is dropped, not queued.
- **It starts cold.** An environment that sat idle is gone, and the next invocation boots a new one. See [cold start](/glossary/cold-start). The game charges it on a share of requests: nearly all of them at a trickle, almost none under steady load.

Because nothing is resident, a function is cheap at low and spiky volume. Above about 30% steady utilization of an equal VM it costs more than the VM, because the VM's Burn does not grow with the work it does.

## When to place it

Place it when traffic is spiky, or when one endpoint needs its own capacity without a second box. It unlocks with [Serverless](/research/serverless) in Series A, for 3,500 ◇, and has no placement cost.

## How it fails

- **The cap.** A spike above 1,000 concurrent executions is throttled, and the requests are lost.
- **Cold starts after a quiet minute.** A Java function can pay two seconds before its code runs; Go and Rust pay 50 ms. A trickle of traffic pays it most often.
- **Connections.** Every concurrent execution opens its own database connections. Without a [Connection Pooler](/components/pooler), a spike exhausts Postgres.
- **Duration.** The design cuts an execution off after 15 minutes, so long `job` work belongs on a [Worker](/components/worker) behind a [Queue](/components/queue). The build never reaches that limit: no request kind lasts long enough, so the cutoff is not modelled.

## Tips

- Put a [CDN](/components/cdn) or a [Cache](/components/cache) in front: a function pays for every request that reaches it.
- A steady base load on App Servers with functions for the peaks is the mix the design teaches: reserved boxes for the floor, per-use capacity for the spike.
