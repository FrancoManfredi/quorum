---
title: Secrets management
summary: Keep keys, passwords and tokens in a vault that hands them out on demand, so none sits in code, in an image or on a phishing page's wish list.
section: patterns
group: Security and edge
order: 804
aliases: secrets, vault, hashicorp vault, kms, secret rotation, api keys, credentials, environment variables, credential leak, phishing
---

A secrets manager stores credentials once, controls who reads them, and rotates them, so a leaked repository does not leak the keys.

## Use it when

- Database passwords or API keys sit in source control, in `.env` files, or in container images.
- Nobody can say who has read a given key, or when it last changed.
- An engineer leaves, and you have to guess which secrets they knew.

## How it works

Services authenticate to the vault with a workload identity, such as a cloud role, and fetch what they need at start-up or per use. The vault logs every read. Dynamic secrets go further: the vault creates a database user that lives for an hour, so a stolen one expires on its own.

Rotation matters as much as storage. A key rotated every 90 days limits what an old leak is worth. Rotate on a schedule, and immediately after any suspected exposure.

Example: a password committed to a public repository is scraped within minutes. A vault reference in the same file exposes nothing.

## What it costs

The vault is now critical: if it is down, services cannot start. Keep a cache, run it in several zones, and plan its own recovery. The usual mistake is moving the secret into a vault and then pasting it into an environment variable that logs print.

## In Quorum

The player does not place a Node for this. [Secrets management](/research/secrets-management) is a Research item: with it, acting on a phishing Mail in the Inbox finds the credentials in the vault, so the page has nothing to take and no [Credential leak](/incidents/credential-leak) starts. Without it, that click costs Users and starts the incident. The game holds no secret of its own to rotate, so rotation is not modelled. The [Secrets and Certificates](/components/pki) Node deals with certificates, which is [encryption in transit](/patterns/encryption-in-transit-and-at-rest).
