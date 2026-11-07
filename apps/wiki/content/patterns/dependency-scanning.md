---
title: Dependency scanning
summary: Check every build's libraries against known-vulnerability lists, so a flawed or malicious package fails the pipeline before it reaches production.
section: patterns
group: Security and edge
order: 805
aliases: dependency scanning, sca, software composition analysis, dependabot, snyk, supply chain, sbom, cve, vulnerable dependency, lockfile
---

Dependency scanning reads your lockfile on each build and fails it when a library carries a known hole.

## Use it when

- Your app pulls in hundreds of transitive packages that nobody reviews.
- An auditor asks for an inventory of third-party code, or for SOC 2 evidence.
- A package you depend on has been hijacked or has a new CVE.

## How it works

A scanner matches each pinned package and version against advisory databases such as the GitHub Advisory Database and OSV. It runs in CI, so a pull request that adds a vulnerable version fails its check. An SBOM, a list of everything the build contains, lets you answer "are we affected?" within minutes when a new CVE lands.

Pin versions with a lockfile. A scanner can only judge the version you ship, and an unpinned `latest` changes under it. Automated update pull requests keep the pins from going stale.

Example: when Log4Shell was disclosed in December 2021, a team with an SBOM could query which services shipped the vulnerable library within minutes. A team without one searched repositories and images for days.

## What it costs

A scanner finds known problems only. A brand-new malicious release has no advisory yet, so pair it with a short delay before adopting new versions. Noise is the other cost: a flood of low-severity findings gets ignored, so set a severity threshold that fails the build.

## In Quorum

[Dependency scanning](/research/dependency-scanning) needs [CI](/research/ci) first. With it, a published backdoor is caught before the build installs it, so a [Supply-chain compromise](/incidents/supply-chain) becomes much less likely, and a fake advisory's patcher in the Inbox is stopped before it runs. It does not patch a disclosed CVE: that takes Dev Hours from the backlog before its deadline and grace period pass, or a data breach follows. The Research is also a SOC 2 requirement. It sets no option on a Node, because it is a Research item. The glossary defines [dependency scanning](/glossary/dependency-scanning) and [SOC 2](/glossary/soc-2).
