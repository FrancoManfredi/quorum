---
title: A queue in front of the queue: Slack
summary: Slack put Kafka in front of Redis, so a burst of jobs waited in a durable log instead of filling the queue's memory.
section: patterns
group: Ran in production
order: 955
aliases: slack, kafka, redis, job queue, background jobs, jqrelay
---

By 2017, Slack's job queue ran on Redis, and every action that could not finish inside a web request went through it: unfurling a link, sending a notification, indexing a message. A Redis cluster ran out of memory, and the queue could not take new work. The team added Kafka in front of Redis instead of replacing it.

## The system

A small service called Kafkagate writes each job to Kafka and acknowledges it. A stateless relay, JQRelay, reads the Kafka topic and writes the job to the Redis cluster that runs it. The change kept the existing scheduling and de-duplication code and added a durable buffer for bursts. At the time, the system carried 1.4 billion jobs a day across 50 Redis clusters and 1,600 Kafka partitions.

## The board

::Design{id="slack-queue-in-front"}

The Event Stream is Kafka: a durable log that holds a job after the web tier has acknowledged it. The Queue is Redis, the Worker is the job runner, and the Database holds the state the job reads and writes. The web tier only enqueues, so the user waits for the enqueue and not the work.

## Why it works

The two hops do different jobs. Kafka absorbs a burst and keeps the job until a consumer reads it. Redis holds the short-lived scheduling state that the workers poll. [Slow work to a queue and workers](/patterns/slow-work-to-a-queue-and-workers) and [queue load leveling](/patterns/queue-load-leveling) describe the two effects.

## Where the game stops

The board has one Event Stream and one Queue, not 50 Redis clusters and 1,600 partitions. It does not show JQRelay or the rate limits it reads from Consul. The caption is Quorum's result, not Slack's 1.4 billion jobs a day.

## Sources

- [Scaling Slack's Job Queue, Slack Engineering](https://slack.engineering/scaling-slacks-job-queue): the Redis incident, Kafkagate, JQRelay, and the scale figures.
- [Building self-driving Kafka clusters using open source components, Slack Engineering](https://slack.engineering/building-self-driving-kafka-clusters-using-open-source-components): the Kafka fleet, the throughput, and the operational work.
- [Apache Kafka documentation](https://kafka.apache.org/documentation/): partitions, consumer groups, and acknowledgements.
