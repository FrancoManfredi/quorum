The WAF stands for a web application firewall such as ModSecurity with the OWASP Core Rule Set.

## When to place it

- Place it when bots take a large share of your traffic and load your App Servers, or when logins spike from bots. It unlocks with [Web application firewall](/research/waf).
- Turn on Under attack mode only while a DDoS lasts.

The [Bots](/sandboxes/bots) Sandbox shows the symptom.

::Sandbox{id="bots"}

## How it works

Place it in front of your App Servers. It takes every request kind and sends on what it lets through. It blocks a share of bots, and a smaller share of real users with them. Blocked users fail as `blocked`. See [WAF](/glossary/waf-web-application-firewall).

Each size step doubles its capacity. It spans every zone.

## Options

- **Paranoia level:** sets the tradeoff. A higher level blocks more bots, blocks more real users, and costs more CPU per request, so the WAF handles less traffic.
- **Under attack mode:** challenges every request. It blocks nearly all junk, blocks some real users, and adds latency.

## How it fails

- Overloaded, it drops requests before they reach the App Servers. A high paranoia level makes this happen sooner.
- A high level blocks real users and costs revenue.

Without a WAF, [Bot surge](/incidents/bot-surge), [Credential stuffing](/incidents/stuffing), and [DDoS](/incidents/ddos) hit harder and more often.

### [Regex backtracking](/incidents/regex)

- **Signs:** Its Inspector reads "A rule backtracks. CPU at 100%." Every WAF runs out of CPU. See [ReDoS](/glossary/redos-regular-expression-denial-of-service).
- **Do now:** Press **Disable rule**.
- **Prevent:** No Research prevents it. A WAF always carries the risk of a bad rule.

### [DDoS](/incidents/ddos)

- **Signs:** Its Inspector reads "A flood of junk traffic." and demand runs at ×50 of junk.
- **Do now:** Press **Under attack** on the WAF. It challenges every request and adds latency.
- **Prevent:** Keep a WAF and a CDN at the edge: [Web application firewall](/research/waf) and [Content delivery](/research/cdn). Turn Under attack mode off when it ends.

### [Instance failure](/incidents/instance)

- **Signs:** The WAF's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Run a second copy: [Load balancing](/research/load-balancing) puts the copies behind a Load Balancer, and [Health checks](/research/health-checks) skip the dead host.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Start at the default level and raise it only when bots still get through.
- Turn Under attack mode off when the DDoS ends.
