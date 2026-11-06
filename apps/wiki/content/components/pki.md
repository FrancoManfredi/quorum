Secrets and Certificates stands for Let's Encrypt with ACME, HashiCorp Vault, and AWS Secrets Manager: the place the keys live, and the automation that renews the certificate before it runs out.

## When to place it

- Place it in Seed, with [Certificate automation](/research/cert-automation). It costs 80 to place and 0.005 a second.
- Place it when any Node that terminates TLS is on the board. A certificate that expires fails every request through that Node.

## How it works

It takes no traffic. What it owns is the calendar:

- Each Node that terminates TLS holds a certificate of its own: a Load Balancer, a CDN, a WAF, an API Gateway, a Realtime Hub or an Edge Function.
- The first Step with one live **issues** each certificate, and the card counts what is left of the soonest one.
- It renews every certificate **two thirds of the way through** its life, which is where an ACME client renews with a third still to go.
- A certificate lasts **90 calendar days**, and **45 from Series C**, following the industry maximum as it shrinks.

Selling the Node or leaving it down does not reset the clock. The certificates it issued keep running down.

Without it, the "Certificate expired" incident is an ordinary director incident that can still strike, and the research makes it much less likely. With it, renewal is automatic and the incident has no cause left, unless the manager itself stops.

Secrets management research is the other half of the Component's name. It keeps the keys out of a phishing page's reach, so the Credential leak incident cannot start.

## How it fails

- **A manager that is down renews nothing.** A restart, an OOM kill or a sold Node is enough to stop renewal, and the countdown does not care.
- **A shorter life every Era.** 45 days from Series C is half the room manual renewal had.
- **One clock per Node.** A Node placed late is issued late, and each certificate runs out on its own day, so one expired Load Balancer takes only the traffic that goes through it.

### [Certificate expired](/incidents/certificate)

- **Signs:** Past its expiry date every browser refuses that Node, and every request through it fails as `down`. A "Certificate expired" banner appears with a **Renew** button.
- **Do now:** Press **Renew** on the banner. The certificate is issued again at once, even with a manager on the way. The incident starts again after it ends until a manager is live or you press **Renew**, because the certificate is still expired.
- **Prevent:** Research [Certificate automation](/research/cert-automation) and keep its manager live.

### [Region outage](/incidents/region)

- **Signs:** Every Node in one region goes grey at once, and that region's board goes grey with them.
- **Do now:** Press **Fail over** on the banner. It needs [Multiple zones](/research/multi-az) and a second open region, and starts the Node again in the nearest other region, cold, for the price of a replacement. Otherwise it comes back when the incident ends: 180 sim seconds in the catalog, 60 once the error budget counts.
- **Prevent:** Research [Multiple regions](/research/multi-region) and [GeoDNS](/research/geo-dns), then run a copy of it in a second region.

## Tips

- Watch the certificate's card, not the pager: "in 3 d" is the warning, and "expired" is the outage.
- Renew from the incident's bar when it fires, even with a manager on the way, because the certificate is issued again at once.
- Keep the Node out of harm's way: no single-zone box, no Spot pricing, no room for an OOM.
