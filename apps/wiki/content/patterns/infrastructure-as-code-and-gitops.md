---
title: Infrastructure as code and GitOps
summary: Describe your infrastructure in files and apply it from version control, so every environment is the same and every change has a history.
section: patterns
group: Deploys and change
order: 605
aliases: iac, terraform, pulumi, drift, gitops, mirror, declarative, reconcile
---

Infrastructure as code keeps infrastructure in reviewed files, and GitOps makes the repository the one place changes are applied from.

## Use it when

- You run more than one environment or region and they must match.
- Console clicks by hand have caused outages nobody can explain.
- You need to rebuild a region from scratch in a disaster.

## How it works

You write the desired state, such as three servers and a database, in a tool like Terraform or Pulumi. The tool compares it with the real state and prints a plan: what it would create, change or destroy. You review and apply the plan. GitOps goes a step further: an agent such as Argo CD watches a Git repository and keeps the cluster matching it, so merging a pull request is the deploy. Drift is any change made outside the files, and the agent reverts it or reports it.

## What it costs

A bad change in the repository reaches every environment that follows it, and fast. Staged rollouts, with one region first, limit that. State files and credentials are sensitive, and a plan nobody reads is no review at all. Hand fixes during an incident create drift you must clean up afterward.

## In Quorum

The game has no Node or Link setting for this, so it has no Design. [Infrastructure as code](/research/infra-as-code) lets you pick an IaC tool and build a Mirror of a region in another region, then apply plans to keep it in sync. The tool sets how a plan finds hand changes. [GitOps](/research/gitops) syncs Mirrors on their own, all at once or staged. The [Bad config push](/incidents/config) incident shows why staged matters. The glossary defines [Mirror](/glossary/mirror), [drift](/glossary/drift), [IaC tool](/glossary/iac-tool) and [GitOps](/glossary/gitops).
