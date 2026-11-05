## What it does

The Edge Function stands for Cloudflare Workers and Fastly Compute: small handlers that run in the CDN, next to the user.

It takes every request kind and serves it like an [App Server](/components/server), turning it into the backend calls it makes, but a user in the Node's own region reaches it in 5 ms instead of the round trip to your origin. A user in another region still pays that round trip, so place one Edge Function in each region whose users need it. There is no cold start to speak of: a V8 isolate starts in under 5 ms, against the seconds a container or a JVM takes.

Two ceilings stand in for an instance type:

- **CPU.** A request may spend 10 ms of CPU. Past it the handler is killed, and the request fails as a timeout, so CPU-heavy kinds (an upload's image resize, an export, a login's password hash) belong on an App Server.
- **Memory.** A handler runs in 128 MB of isolate. It is room for a small handler and its response, not for a working set.

It runs your Service's Stack, so the Stack has to compile to the edge: JavaScript and TypeScript, or Rust and Go built to WebAssembly. A PHP, Ruby, Python, Java, C#, Elixir, Zig or Haskell Stack is refused there, and the card says so.

A live Edge Function also holds the edge key-value cache that a [CDN](/components/cdn) answers `read` from: 30% of API reads, which the CDN alone answers at 0%.

It bills per request, on the Requests line of the [cloud bill](/design/09-economy#the-cloud-bill), and nothing while it idles.

## When to place it

Place it when users are far from your origin and the handler is small: a redirect, a header rewrite, a cached read, a personalized page. It unlocks with [Edge compute](/research/edge-compute) in Series C, after Content delivery, for 80,000 ◇.

## How it fails

- **The CPU ceiling.** A request that needs more than 10 ms of CPU is killed mid-flight. It is the wrong place for an upload, a report or an export.
- **The Stack.** A Company that still runs PHP cannot use the edge at all. The fix is a [migration](/design/08-team-and-velocity#migrations) to a Stack that compiles, not a second edge Node.
- **The data tier.** A handler that calls a Database on every request pays the round trip anyway, so it saves the user hop and not the query.

## Tips

- Pair it with a CDN: the edge answers what the CDN cannot cache, and the CDN answers the rest.
- Keep the handler small. The isolate's ceiling is a design constraint, not a bug to work around.
