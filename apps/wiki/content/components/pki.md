## What it does

Secrets and Certificates stands for Let's Encrypt with ACME, HashiCorp Vault, and AWS Secrets
Manager: the place the keys live, and the automation that renews the certificate before it runs out.

It takes no traffic. What it owns is the calendar:

- The first Step with one live **issues** the certificate, and its card counts what is left of it.
- It renews the certificate **two thirds of the way through** its life, which is where an ACME client
  renews with a third still to go.
- A certificate lasts **90 calendar days**, and **45 from Series C**, following the industry maximum
  as it shrinks.

Selling the Node or leaving it down does not reset the clock: the certificate it issued keeps running
down.

## When to place it

Place it in Seed, with [Certificate automation](/research/cert-automation). It costs 80 to place and
0.005 a second.

Without it, the "Certificate expired" incident is an ordinary director incident that can still
strike; the research makes it much less likely. With it, renewal is automatic and the incident has no
cause left, unless the manager itself stops.

## How it fails

- **An expired certificate.** Past its expiry date every browser refuses the site: every request from
  Users fails as `down`. The incident starts again after it ends until a manager is live or the
  player presses Renew, because the certificate is still expired.
- **A manager that is down renews nothing.** A restart, an OOM kill or a sold Node is enough to stop
  renewal, and the countdown does not care.
- **A shorter life every Era.** 45 days from Series C is half the room manual renewal had.
- **One certificate.** It covers the Company, so every Node that terminates TLS goes down
  together when it expires.

## Tips

- Watch the certificate's card, not the pager: "in 3 d" is the warning, and "expired" is the outage.
- Renew from the incident's bar when it fires, even with a manager on the way: the certificate is
  issued again now.
- Keep the Node out of harm's way: no single-zone box, no Spot pricing, no room for an OOM.
- Secrets management research is the other half of the Component's name: it keeps the keys out of a
  phishing page's reach, so the Credential leak incident cannot start.
