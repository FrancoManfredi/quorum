The Push Provider stands for Amazon SNS and SES: services that deliver push notifications and email for you.

## When to place it

- Place it when you ship the Push notifications Feature on the [Team](/team#features) page. Without it, push messages have nowhere to go.

It unlocks with the [Notifications](/research/notifications) Research.

## How it works

Delivery takes a moment, but users do not wait for it. Push messages come in and it links to nothing downstream. It is a Managed Component, so it costs nothing to place, serves every region, and bills for each message. Its throughput limit is high, and each size step doubles it.

Notifications reach it from your code. A Notify request does most of its work asynchronously. With a [Queue](/components/queue) linked, a [Worker](/components/worker) sends the push message. Without one, the App Server sends it itself. Link whichever Node sends them to the Push Provider.

## How it fails

- Past its limit, it drops messages. With its high limit, that takes a very large audience.
- Its cost grows with every message. Watch third-party costs in the Ledger.
- Push notifications raise growth and also raise churn a little, because users tire of them. That cost comes from the Feature, not the Component. See [Users and growth](/explanation/users-and-growth).

### [Instance failure](/incidents/instance)

- **Signs:** The Push Provider's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Place a second Push Provider, so it no longer stands alone.

### [Zone outage](/incidents/zone)

- **Signs:** Every Node in one zone goes grey at once.
- **Do now:** Nothing brings the zone back sooner. **Fail over** promotes a **Standby**, and this Component keeps none, so it ends on its own after at most 120 s.
- **Prevent:** Research [Multiple zones](/research/multi-az), then put copies in different zones with the Zone setting.

## Tips

- Send notifications through a Queue and Workers, so a slow send never holds an App Server slot.

:::Note{tone="real"}
Real queues deliver at least once, so a notification can arrive twice. Real teams make sending idempotent. See [at-least-once delivery](/glossary/at-least-once-delivery).
:::
