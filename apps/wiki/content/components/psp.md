The Payment Provider stands for Stripe: the third party that charges your customers' cards.

## When to place it

- Place it when you ship the Checkout Feature. Without it, checkouts have nowhere to charge.
- Resize it before a spike, because past its tier's rate it drops charges.

It unlocks with the [Checkout](/research/checkout) Research.

## How it works

Link an App Server to it, and each checkout sends one charge. It is a Managed Component, so it costs nothing to place, serves every region, and takes a fee from each successful checkout. Each charge waits a long, fixed time, which shows in the Checkout p99. Each size step is a usage tier that doubles how many charges per second it takes.

Do not confuse it with [Payments](/components/payments), the drawer where your revenue waits. Checkouts are the highest-value request kind, so the Payment Provider sits on your most important path.

## How it fails

- Past its tier's rate, it drops charges. Resize it before a spike.

### [Payment provider outage](/incidents/psp-outage)

- **Signs:** Its Inspector reads "Their outage, not yours. Every checkout fails." and `buy` fails as `upstream`.
- **Do now:** Press **Switch provider**. It costs Cash, and the second provider keeps serving at once. Nothing else ends it before its run of at most 60 s.
- **Prevent:** Set the **Provider** to **Second** before an outage. The second provider charges more per checkout. No Research prevents the outage itself.

### [Double charge](/incidents/double-charge)

- **Signs:** Charges slow down, `duplicate` errors appear, and refunds follow.
- **Do now:** Set the charge Link's retries to **No retries** in the App Server's Calls section. With no retrying Link into the provider, the incident ends.
- **Prevent:** Research [Idempotency keys](/research/idempotency-keys) and do the Idempotency keys task. Do not turn on retries on the charge Link before then. See [idempotency](/glossary/idempotency).

### [Flash sale](/incidents/flash-sale)

- **Signs:** E-commerce only. `buy` demand runs at ×20 for minutes, and the Database and the Payment Provider saturate.
- **Do now:** Resize the Payment Provider up, because its tier sets how many charges it takes. Nothing else adds capacity here.
- **Prevent:** Put a [Queue](/components/queue) in front of the checkout work, and research [Autoscaling](/research/autoscaling) and [Priority load shedding](/research/load-shedding).

### [Instance failure](/incidents/instance)

- **Signs:** The Payment Provider's card goes grey, its Inspector reads "The host under this VM died. It still bills.", and the requests sent to it are stranded.
- **Do now:** Press **Replace** in its Inspector and pay the price. It comes back cold.
- **Prevent:** Place a second Payment Provider, so it no longer stands alone.

## Tips

- Do not turn on retries on the charge link until you own Idempotency keys.
- Give the charge link a timeout longer than a normal charge.

:::Note{tone="real"}
Stripe lets a client send an idempotency key with each charge, so a retry returns the first result instead of charging again.
:::
