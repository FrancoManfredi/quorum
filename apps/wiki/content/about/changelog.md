---
title: Changelog
summary: What changed in Quorum over the last few days.
section: about
order: 3
aliases: changes, updates, release notes, patch notes, what is new
---

Quorum has no versions. It changes all the time, and this page lists the latest days, newest first, so you can see what moved since you last played. A page on this wiki can lag behind the game by a few days. Older days and every change are in the [full changelog](/about/changelog/all).

## Friday, 6 November 2026

10 changes.

- Run the slow whole-game simulation tests only under FULL_TESTS ([1b81f86](https://github.com/elianiva/quorum/commit/1b81f864a2853bbb8dce5702c880f210dbeb05f1))
- Fix audit gaps: Anycast and HTTP/2, recipes, How to play, loop practice ([cfb0fcb](https://github.com/elianiva/quorum/commit/cfb0fcbdda66048ca0ac1135ff3e796ebb4457d3))
- Correct docs and component pages to the real UI and mitigations ([bf9c36a](https://github.com/elianiva/quorum/commit/bf9c36a88333e7116fc8239f2f475b3cf64648e1))
- Add the Play the game section with practice boards ([b1c044e](https://github.com/elianiva/quorum/commit/b1c044e350e3a166f5a6980e32ac899479d2dcbe))
- Let the player restart, fail over, throttle reconnects and move login ([6fbd59b](https://github.com/elianiva/quorum/commit/6fbd59b944b31d2f56d55ab4542c03cda5a542a8))
- [5 more](/about/changelog/all#friday-6-november-2026)

## Thursday, 5 November 2026

42 changes.

- Build the runtime, framework and data-tier mechanics the design names and retire the remaining gap notes: libuv pool, recycled workers, runtime incidents, framework effects, durability, gateway options, GPU models, consistent hash, dominance test ([0d03e1d](https://github.com/elianiva/quorum/commit/0d03e1d881c45561bd7f8921e172d44ae93161d4))
- Build the Observability, Incidents, Exit, Interface and Mail gaps and retire the gap lists: Service filter, alert rules, Era marks, slow start, Autopilot, Head start, Shared tenancy, Venture rules, spam filter, backdoor, vendor demos, second provider ([00b9e94](https://github.com/elianiva/quorum/commit/00b9e94fa7651df6658061793b267237fa295907))
- Build the Components and Data tier gaps: sticky sessions, CDN purge and key, shard keys, sync replicas, Search and Object Storage options, stampede options, data volume time, per-request prices ([068397c](https://github.com/elianiva/quorum/commit/068397cda8a20b2f075bcb26200e1ab7bde543b3))
- Build the Features and Team gaps: market cap, engineering tasks, auth and engine moves, SOC 2 staffing ([95d16d4](https://github.com/elianiva/quorum/commit/95d16d465ffc0556a45425e0b8a85be4d923a0b4))
- Move the simulation tests and fixtures out of src ([b3cc3f4](https://github.com/elianiva/quorum/commit/b3cc3f496493f0cdab69aa9b820d8859c9f57d4c))
- [37 more](/about/changelog/all#thursday-5-november-2026)

## Wednesday, 4 November 2026

58 changes.

- Implement pricing, achievements, mail actions, and Dashboard rows ([565e9e5](https://github.com/elianiva/quorum/commit/565e9e5362a52aa22779f7c7bc33a354be9afe1e))
- Buy ten sizes at once, or up to the largest ([fc1541c](https://github.com/elianiva/quorum/commit/fc1541c127fa06596e5a28cc28b9cee59b91e7af))
- Add the Cost panel, splitting Burn into its lines ([ad30594](https://github.com/elianiva/quorum/commit/ad305940bf4dbe5d6f0489902032e5b2a435ea2d))
- Name the Challenge ruleset and drop the unused design indexes ([4ad8191](https://github.com/elianiva/quorum/commit/4ad81915b561d4ee8cd3ff1c5f52a33a701204e9))
- Move the design document into the wiki ([f97f6cf](https://github.com/elianiva/quorum/commit/f97f6cf0083636afd402b851a65092f456b1466a))
- [53 more](/about/changelog/all#wednesday-4-november-2026)

## Tuesday, 3 November 2026

61 changes.

- Group the board's clock and disclosure state into submodels ([80fe685](https://github.com/elianiva/quorum/commit/80fe68510b19a6c525ccca9fee2c7e0983758dc9))
- Split the Model into the session and the Board being played ([c2fd5ea](https://github.com/elianiva/quorum/commit/c2fd5ea75da2349ac93655f3be563ac05347c55a))
- Group the Dashboard panel's state into one submodel ([7987501](https://github.com/elianiva/quorum/commit/7987501a545042883ce327626369bb1fedf9cebe))
- Move the Inbox into its own submodel ([1c42fe5](https://github.com/elianiva/quorum/commit/1c42fe5325f96ed9eaec1c8a31f8b0ddcb6dfb7a))
- Group the Glossary panel's state into one submodel ([251f80d](https://github.com/elianiva/quorum/commit/251f80d6fa93f8062fad27357dc8feed9e0d84ba))
- [56 more](/about/changelog/all#tuesday-3-november-2026)

## Monday, 2 November 2026

27 changes.

- Design Features with real sizes, outcomes, rollouts, and upkeep ([8416e57](https://github.com/elianiva/quorum/commit/8416e57d17c81807d7d3f06676cb7817e8f48d45))
- Redesign the Team panel as a Linear-style board ([a055a55](https://github.com/elianiva/quorum/commit/a055a55300ce327b4ea3d37d68a9095735c4bdb5))
- Make Research a fullscreen tree per track ([c6734fa](https://github.com/elianiva/quorum/commit/c6734fac3daca7e43cba7bb092bc6bdd59851243))
- Give the step determinism test a 30 s timeout ([9858e7d](https://github.com/elianiva/quorum/commit/9858e7d1c2369d1212c092401d5c9d8ad6880381))
- Reveal controls when a first Company needs them ([87f7131](https://github.com/elianiva/quorum/commit/87f7131788a0b80d8f483bba3f1cc0848d6a929e))
- [22 more](/about/changelog/all#monday-2-november-2026)

## Sunday, 1 November 2026

20 changes.

- Add the M5 Series A Era: new runtimes, zones, SLOs and autoscaling ([c558c59](https://github.com/elianiva/quorum/commit/c558c5961fd9550bf396af574174af1e7e787142))
- Add the M5 Seed Era: search, uploads, queues, CDN, WAF and stampedes ([37aa546](https://github.com/elianiva/quorum/commit/37aa54655e9d4ff10ae22d5b3848cc00674ade03))
- Add M4 Team, Dev Hours, Features, deploys and migrations ([86f50f2](https://github.com/elianiva/quorum/commit/86f50f28b78f178d9c48ac3777dea8f4dbe1ebd6))
- Move the Simulation into packages/simulation and pin it with a golden hash ([326fa4f](https://github.com/elianiva/quorum/commit/326fa4f23761808b9c9acfd501f64476bde479de))
- Add M3 Tradeoff cards, preview, Settling and undo/redo ([88e25d0](https://github.com/elianiva/quorum/commit/88e25d0890c938e59c18c35704139ae69a10add1))
- [15 more](/about/changelog/all#sunday-1-november-2026)

## Saturday, 31 October 2026

15 changes.

- Drop to 1x speed when an incident starts and name the Replace button ([91fb61f](https://github.com/elianiva/quorum/commit/91fb61fbab4a340dd817b9d6a20f1a59e07392b4))
- Stop Burstable credit flapping and warn before credits run out ([433d8de](https://github.com/elianiva/quorum/commit/433d8dedb68ee92458bffb99e4dc08ac80a9fe52))
- Add the social card, icons, and search metadata ([0433de1](https://github.com/elianiva/quorum/commit/0433de1832a0486b07d37761d78bc907fe30c0dd))
- Deploy prod to quorum.elianiva.com from CI ([dce6591](https://github.com/elianiva/quorum/commit/dce659162214ad915b615be083cd039b6db11d3e))
- Run title packets along the bench cables and drop impact frames ([07468fa](https://github.com/elianiva/quorum/commit/07468fab7dc649365b583341992d9273b8d29512))
- [10 more](/about/changelog/all#saturday-31-october-2026)
