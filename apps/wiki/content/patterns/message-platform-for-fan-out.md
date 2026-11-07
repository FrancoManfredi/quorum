---
title: Message platform for fan-out
summary: Send each notification through a Queue and Workers to a managed provider, so a slow or failing send never holds a request.
section: patterns
group: Stack ladder
order: 117
aliases: push notifications, sns, ses, email, pub sub, fan out, notification service, webhooks
---

Send a notification from a Worker to a managed provider, not from the App Server that took the request.

## Move up when

- Users expect push or email after an event, and each send holds an App Server slot.
- A provider's slow answer or outage shows up as slow pages.
- One event must reach many receivers, and the sends are growing.

## The Design

::Design{id="push-fan-out"}

The App Server enqueues the notification and returns. The Workers take it and call the Push Provider. That Link has a **Timeout** and a **Retries** policy, because the provider is a third party and the Worker has to protect itself from it.

## Why it works

The user never waits for the send. A stalled provider holds a Worker for seconds, not for the default wait, and the Queue absorbs the backlog while the provider recovers. Retries with backoff cover a short blip without hammering the provider.

A managed provider costs nothing to place and charges per message, so you pay for volume and run no sending fleet.

## What it costs

Delivery is at least once, so a notification can arrive twice unless the send is idempotent. The game has no topic with many subscribers, so this shows the simplest fan-out: one task, one provider. A real platform adds topics, and you can read about them on [Publish-subscribe](/patterns/publish-subscribe). Backoff delays a failed send, so urgent messages lose time.

## In Quorum

The [Push Provider](/components/msgp) needs [Notifications](/research/notifications), and it sits behind the [Queue](/components/queue) and [Worker](/components/worker) of the last rung. Both Link settings need [Timeouts and retries](/research/timeouts), and backoff needs [Backoff with jitter](/research/backoff-jitter). The [Timeouts](/patterns/timeouts) and [Retry with backoff](/patterns/retry-with-backoff) pages explain the two Link settings. The next rung covers spiky work with no box: [Functions for spiky jobs](/patterns/functions-for-spiky-jobs).
