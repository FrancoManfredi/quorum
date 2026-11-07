---
title: Sticky sessions
summary: Sticky sessions make a load balancer send a client back to the server it used first, so that server's memory can hold the client's state.
section: patterns
group: Outside the game
order: 1010
aliases: sticky sessions, session affinity, ip hash, cookie affinity, session persistence, load balancer
---

Sticky sessions, also called session affinity, make a load balancer route a client to the same backend on each request, usually by a cookie it issues or by hashing the client address.

Use them when a backend keeps per-client state in memory that is costly to rebuild. A chat or game server holds a socket and recent messages, and an app keeps a warm per-user cache. An AWS Application Load Balancer can set a cookie, and traffic then sticks to that instance for a set duration. nginx offers the same with its `ip_hash` and `sticky` directives. Cookies are more precise than IP hashing, since many users can share one office address.

The costs follow from pinning. Load goes uneven, because long sessions stay on the old servers and a new server only gets new clients. A server that dies or is drained takes its sessions with it, so users are logged out or lose work. Autoscaling helps less. The usual fix is to keep session state in a shared store and run stateless servers ([Stateless app servers](/patterns/stateless-app-servers)). Use affinity only as an optimization, never as the only copy of the state.

## Nearest in Quorum

The game builds this directly. The [Load Balancer](/components/lb) has a sticky sessions switch that pins users to the target they reached first, which helps in-process caches and realtime clients and skews the load. A sticky Load Balancer also sends clients back to the Hub they had, so a restarted [Realtime Hub](/components/ws) takes only its own share of the reconnects. Read [Load balancing algorithms](/patterns/load-balancing-algorithms) and [Websockets tier for realtime](/patterns/websockets-tier-for-realtime).

## References

- [Sticky sessions with load balancer generated cookies, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/load-balancer-stickiness/alb-cookies-stickiness.html): how an ALB cookie pins traffic for a set duration, with a worked example.
- [ngx_http_upstream_module, nginx](https://nginx.org/en/docs/http/ngx_http_upstream_module.html): the `ip_hash`, `hash` and `sticky` directives and how they interact with weights.
- [RFC 6265: HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265): the cookie standard that cookie-based affinity relies on.
