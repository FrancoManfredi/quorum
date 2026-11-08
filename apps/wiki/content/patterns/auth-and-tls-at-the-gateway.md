---
title: Auth and TLS at the gateway
summary: Check each token once at the API Gateway, hand password hashing to an Auth Provider, and let a certificate manager renew TLS, so the front door stops costing the App Server and stops expiring.
section: patterns
group: Scaling steps
order: 123
aliases: authentication, jwt, token validation, tls termination, certificates, certificate renewal, password hashing, identity provider, auth0
---

Validate every token once at the API Gateway, keep password hashing off the App Server, and renew TLS certificates by machine.

## Move up when

- Every service re-checks the same token on every request, and the App Server's CPU shows it.
- Logins are among the most expensive request kinds, because a password hash costs far more than a page view.
- A **Certificate expired** banner has taken a Node down, because someone forgot a renewal date.

## The Design

::Design{id="gateway-auth-tls"}

Users reach the API Gateway, which checks the token and passes the request to the App Server. The App Server calls the Database for data and the Auth Provider for logins. The Secrets and Certificates Node carries no traffic. It owns the calendar for every certificate on the Board.

## Why it works

Every kind except anonymous pages and the login itself carries a token. Without the gateway check, each service validates it on every request. With **Auth at the edge**, the gateway validates it once and the services skip that step.

The Auth Provider is a Managed Component, so it hashes passwords for you and bills per user. The Gateway, Load Balancer, CDN, WAF, Realtime Hub and Edge Function each hold a certificate. The manager renews each one well before it expires.

## What it costs

The gateway adds a hop to every request and bills per request, so it is cheap when quiet and dear under load. The rate limit fails real users as throttled if you set it below demand. The Auth Provider is an outage you cannot fix, and a manager that is down renews nothing. The game has no key rotation or OAuth flow, so the Board shows only the check, the hash and the renewal.

## In Quorum

Place an [API Gateway](/components/gw), an [Auth Provider](/components/auth) and [Secrets and Certificates](/components/pki). Research [API gateway](/research/api-gateway), [Managed identity](/research/auth-provider) and [Certificate automation](/research/cert-automation). The [Certificate expired](/incidents/certificate) incident is the failure this prevents. See [bcrypt](/glossary/bcrypt) and [TLS certificates](/glossary/tls-certificate). The next step, [feature flags and CI](/patterns/feature-flags-and-ci-for-safe-deploys), limits what a bad deploy can break.
