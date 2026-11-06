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

- **Presence:** tracks who is online. It earns 25% more per message for the social features that need it, and spends 15% of the box's CPU on joins and leaves, so a box holds fewer connections.
- **Reconnect backoff:** spreads the wave of clients that reconnect after a restart. Without it they come back at once, a [thundering herd](/glossary/thundering-herd), and the Hub refuses half of them while it warms.
- **Clustering:** gives several hubs a shared pub/sub backbone. It is needed above one box: without it only the first box takes connections, and the larger sizes add Burn and no room.

## How it fails

- A runtime that holds a worker or a thread per connection holds no connection, on a Hub as on an App Server. Those connections are refused.
- Past the connections its box fits, it drops the rest. The card's Connections row is the limit.
- A single box with Clustering off caps the Hub however large it is.
- Without Reconnect backoff, a restart drops half the clients that come back.

## Tips

- Reach it through the Load Balancer and keep Realtime off the App Servers' Links: a mixed pool sends some realtime messages to a runtime that may refuse them.
- Upgrade the runtime, not the size: a BEAM box holds two hundred times what a Java platform thread box holds before you pay for a second box.
- Watch connections, not messages a second.
