The Edge Function runs small handlers in the CDN, next to the user, as Cloudflare Workers and Fastly Compute do.

## When to place it

- Place it when users are far from your origin and the handler is small: a redirect, a header rewrite, a cached read, a personalized page. It unlocks with [Edge compute](/research/edge-compute) in Series C, after Content delivery, for 80,000 ◇.
- Skip it for CPU-heavy kinds, such as an upload's image resize, an export or a login's password hash. They belong on an App Server.
- Copy it when users in another region need it, since one Edge Function serves only its own region.

## How it works

It takes every request kind and serves it like an [App Server](/components/server), turning it into the backend calls it makes. A user in the Node's own region reaches it in 5 ms instead of the round trip to your origin, but a user in another region still pays that round trip. Cold starts barely register: a V8 isolate starts in under 5 ms, against the seconds a container or a JVM takes.

A live Edge Function also holds the edge key-value cache that a [CDN](/components/cdn) answers `read` from. That cache answers 30% of API reads, which the CDN alone answers at 0%.

It bills per request, on the Requests line of the [cloud bill](/design/09-economy#the-cloud-bill), and nothing while it idles.

## Options

Two ceilings stand in for an instance type:

- **CPU.** A request may spend 10 ms of CPU. Past it the handler is killed and the request fails as a timeout.
- **Memory.** A handler runs in 128 MB of isolate, which fits a small handler and its response but not a working set.

It runs your Service's Stack, so the Stack has to compile to the edge: JavaScript and TypeScript, or Rust and Go built to WebAssembly. A PHP, Ruby, Python, Java, C#, Elixir, Zig or Haskell Stack is refused there, and the card says so.

## How it fails

- **The CPU ceiling.** A request that needs more than 10 ms of CPU is killed mid-flight, so an upload, a report or an export does not belong here.
- **The Stack.** A Company that runs PHP cannot use the edge at all. The fix is a [migration](/design/08-team-and-velocity#migrations) to a Stack that compiles, not a second edge Node.
- **The data tier.** A handler that calls a Database on every request pays the round trip anyway, so it saves the user hop and not the query.

### [Certificate expired](/incidents/certificate)

- **Signs:** The **Certificate expired** banner appears, and every request through the Edge Function fails, as through every other TLS Node.
- **Do now:** Click **Renew** in the banner.
- **Prevent:** Research [Certificate automation](/research/cert-automation) and place a [Secrets and Certificates](/components/pki) Node, which renews the certificates before they run out.

### [Region outage](/incidents/region)

- **Signs:** One region's board goes grey and the Edge Function in it goes down.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region), keep a copy in a second region, and add [GeoDNS](/research/geo-dns) to send users there.

## Tips

- Pair it with a CDN, so the edge answers what the CDN cannot cache and the CDN answers the rest.
- Keep the handler small. Treat the isolate's ceiling as a design constraint, not a bug to work around.
