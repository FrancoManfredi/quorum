---
title: Encryption in transit and at rest
summary: Encrypt data on the wire with TLS and on disk with keys you control, and automate certificate renewal so an expiry date never takes the site down.
section: patterns
group: Security and edge
order: 803
aliases: tls, https, ssl, certificate, certificate expiry, acme, lets encrypt, encryption at rest, kms, mtls, soc 2
---

Encrypt every link between machines with TLS, encrypt every disk and backup, and let software renew the certificates.

## Use it when

- Traffic crosses a network you do not fully control, which includes your own cloud network.
- A customer, auditor or SOC 2 report asks how data is protected.
- A certificate expiry has already surprised you once.

## How it works

**In transit**, TLS gives each connection confidentiality and proves the server's identity with a certificate. Terminate it at the edge for browsers. Use it again, or mutual TLS, between services, so a packet sniffer inside the network sees nothing.

**At rest**, the storage layer encrypts each block, usually with AES-256, under a data key that a key management service wraps. A stolen disk or backup is then noise. It does not protect against an app that reads data with valid credentials.

Certificates expire, and lifetimes keep shrinking. Under CA/Browser Forum ballot SC-081, public certificates move from 398 days to 47 days by 2029. At that rate, renewal by hand is a monthly outage waiting for a holiday, so use ACME, the protocol Let's Encrypt runs.

## What it costs

TLS adds a handshake and some CPU, which keep-alive and HTTP/2 mostly hide. At-rest encryption adds a key service to run and to restore from. The usual mistake is treating a certificate as set-and-forget.

## In Quorum

Components that terminate TLS, such as the Load Balancer, CDN, WAF and Gateway, each hold a certificate. A Secrets and Certificates Node renews them, as below.

::Design{id="tls-renewed"}

With no such Node live, a certificate runs out on the Calendar and the site goes down. The [Certificate expired](/incidents/certificate) incident shows it, and its fix is the Renew action, then [Certificate automation](/research/cert-automation) so it never returns. Certificate lifetimes shorten in later Eras. [TLS everywhere](/research/tls-everywhere) and [Encryption at rest](/research/encryption-at-rest) are Research that the SOC 2 item in the IPO checklist requires, and they set no option on a Node. Read the [Secrets and Certificates](/components/pki) page, and the glossary entries for [TLS certificates](/glossary/tls-certificate) and [encryption at rest](/glossary/encryption-at-rest).
