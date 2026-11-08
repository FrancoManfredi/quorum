The Realtime Hub stands for Phoenix Channels, Socket.IO, Centrifugo, or Pusher: the server that keeps a connection open for every online user.

## When to place it

- Place it when your App Servers run on a runtime that cannot hold connections ([PHP-FPM](/runtimes/php_fpm) and Gunicorn sync refuse `rt` outright). It unlocks with [WebSockets](/research/websockets).
- Place it when the open connections are eating the memory your requests need.
- Add Clustering when you need more than one box.

## How it works

Realtime differs from every other kind. A message does not make a request and wait for an answer. It keeps a connection open, 300 s for each message it carries. So a Hub that serves 100 messages a second holds 30,000 connections, and its capacity is counted in those connections rather than in requests. 320 messages a second is 96,000 open connections.

How many connections fit is the runtime's business. An 8 GB box holds about 1.6 million BEAM connections, 800,000 Go ones, 400,000 Node.js ones and 8,000 Java platform threads ([Runtimes](/design/06-runtimes#realtime-connections)). Each size step doubles the RAM it gives them.

It takes `rt` and nothing else, and sends nothing on: it answers the message itself. Put it behind the [Load Balancer](/components/lb) next to your [App Servers](/components/server), and set the Link that reaches it to carry only Realtime. Each runtime then takes the traffic it is good at.

## Options

::Options{id="ws"}

- **Runtime**: the server that holds the connections. The runtime sets how many a box fits, because one that keeps a worker per connection holds far fewer than an event loop or the BEAM. See [Runtimes](/runtimes).
- **Presence**: tracks who is online. It earns more per message for the social features that need it, and spends some of the box's CPU on joins and leaves, so a box holds fewer connections.
- **Reconnect backoff**: spreads the wave of clients that reconnect after a restart. Without it they come back at once, a [thundering herd](/glossary/thundering-herd), and the Hub refuses half of them while it warms.
- **Clustering**: gives several hubs a shared pub/sub backbone. It is needed above one box: without it only the first box takes connections, and the larger sizes add Burn and no room.

## How it fails

- A runtime that holds a worker or a thread per connection holds no connection, on a Hub as on an App Server. Those connections are refused.
- Past the connections its box fits, it drops the rest. The card's Connections row is the limit.
- A single box with Clustering off caps the Hub however large it is.

### [Instance failure](/incidents/instance)

- **Signs:** The Realtime Hub's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

### [Reconnect storm](/incidents/reconnect)

- **Signs:** A Hub that restarts comes back cold, every client reconnects at once, and without Reconnect backoff a restart drops half the clients that come back. The Hub refuses what it cannot take.
- **Do now:** Press **Throttle connects** on the banner or the Hub's card. The Hub then admits the wave at the rate it can take, as Reconnect backoff does, so it refuses nobody while it warms. It needs no research. Otherwise it ends when the Hub has warmed, after at most 20 s.
- **Prevent:** Set **Backoff with jitter** in the Clients section. A sticky Load Balancer sends each client back to the Hub it had, so a restarted Hub takes only its own half. Research [WebSockets](/research/websockets).

### [Split brain](/incidents/split-brain)

- **Signs:** Half of the Hub's realtime messages fail as `stale`. It strikes a busy Elixir Hub in a Distributed Erlang cluster.
- **Do now:** Press **Restart Hub** on the banner, or **Restart** on the Hub's card. The restart rejoins the cluster and ends the incident, and the Hub comes back cold, so its clients reconnect (see [Reconnect storm](#reconnect-storm)). Otherwise it ends on its own after at most 90 s.
- **Prevent:** Research [Chaos engineering](/research/chaos-engineering).

### [Launch day](/incidents/launch-day)

- **Signs:** Game backend only. `rt` demand runs at ×6 and every client connects at once.
- **Do now:** Size the Hub up. With Clustering off a larger size adds no room, so switch to **Clustered** first.
- **Prevent:** Size the Hub for the peak, set **Backoff with jitter**, and research [WebSockets](/research/websockets) and [Priority load shedding](/research/load-shedding).

## Tips

- Reach it through the Load Balancer and keep Realtime off the App Servers' Links: a mixed pool sends some realtime messages to a runtime that may refuse them.
- Upgrade the runtime, not the size: a BEAM box holds two hundred times what a Java platform thread box holds before you pay for a second box.
- Watch connections, not messages a second.
