---
title: Backends for frontends
summary: Backends for frontends gives each kind of client, such as web, iOS and Android, its own small backend instead of one shared API.
section: patterns
group: Outside the game
order: 1006
aliases: bff, backend for frontend, backends for frontends, mobile backend, api per client, edge service
---

Backends for frontends (BFF) puts one purpose-built backend between each type of client and your services, so a mobile app and a web app do not have to share an API shaped for neither.

Use it when clients want different things from the same data. Sam Newman, who named the pattern in 2015, started from mobile: a phone shows less on screen, wants fewer and smaller calls, and has a different release cycle from the web app. A general API serves both badly, since each team asks for changes that the other must review. With a BFF, the mobile team owns a backend that calls three services and returns exactly one trimmed payload.

The cost is more code to run. Each BFF needs deploys, monitoring and an owner, and logic that every client needs, such as auth rules, tends to be copied between them. Azure advises against it when all interfaces make the same calls. The usual rule is that one team owns both a client and its BFF, and shared behavior belongs in the services underneath.

## Nearest in Quorum

The game has the front door, not one per client. The [API Gateway](/components/gw) is one entry point that rate-limits and routes each request kind to the App Server group you choose, which splits traffic by request kind, not by client. Read [API gateway patterns](/patterns/api-gateway-patterns) for where the BFF fits, and Research [API gateway](/research/api-gateway) to unlock the Component.

## References

- [Backends For Frontends, Sam Newman](https://samnewman.io/patterns/architectural/bff/): the original write-up, with the mobile motivation.
- [Backends for Frontends pattern, Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends): when to use it, and the drawbacks of duplicated code.
- [API Gateway / Backends for Frontends, microservices.io](https://microservices.io/patterns/apigateway.html): compares a single gateway with one per client.
