---
title: One command removed the index: AWS S3
summary: A mistyped input removed the servers behind S3's index and placement subsystems, and us-east-1 lost S3 for about four hours.
section: patterns
group: When it broke
order: 971
aliases: aws, s3, outage, index subsystem, cells, postmortem, us-east-1
---

On 28 February 2017, an S3 team member ran a command to remove a few billing servers, and a mistyped input removed a larger set. The removed servers ran the index and placement subsystems for us-east-1, and S3 could not serve GET, LIST, PUT, or DELETE requests for about four hours.

## The system

The index subsystem holds the metadata and location of every object in the region. The placement subsystem allocates new storage and needs the index to work. The team was debugging a slow billing process and used a playbook to remove a few billing servers. The wrong input removed capacity the index and placement subsystems needed, and both required a full restart. The index had not been fully restarted in the region for years. Other AWS services failed, including EC2 launches and Lambda. The status dashboard also depended on S3.

## The board

::Design{id="s3-index-region"}

The Object Storage holds the bytes, and the Database is the index that locates them. The Load Balancer and App Server are the front end. The board runs the game's [Disk full](/incidents/disk-full) incident on the index Database, which stands for the index losing the capacity it needs.

## What broke

A single destructive command removed capacity that two critical subsystems needed. The index had no fast restart path at that size, and placement could not recover until the index did. The blast radius crossed service boundaries, and the status page sat inside it, so customers could not see the status. The event lasted from `09:37` to `13:54` Pacific.

## What changed

AWS reprioritized its work to split the index subsystem into smaller cells, so a failure stays inside one cell and recovery starts smaller. The game's [Multi-AZ](/research/multi-az) and [Multi-region](/research/multi-region) research are the closest guardrails, and [Bulkhead](/patterns/bulkhead) is the same idea for a service.

## Where the game stops

The game's Disk full incident takes the index's writes. S3 lost the servers that held the index, and the blast radius crossed into other services. The board has no cells, no playbook, and no status-dashboard dependency. The caption is the game's incident, not the 2017 outage.

## Sources

- [Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region, AWS](https://aws.amazon.com/message/41926): the command, the index and placement subsystems, the timeline, and the cells.
- [Reliability Pillar, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html): blast radius, recovery, and why a service is split into cells.
- [Static stability using Availability Zones, AWS Builders' Library](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/): why the status path must not depend on the system it reports on.
