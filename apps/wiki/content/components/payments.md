Payments stands for the invoices and payouts that turn your users' activity into money in the bank.

## When to place it

- Payments is always on the board, so you only resize it.
- Resize it when a "Your payout drawer is full" banner shows. While the drawer is full, new revenue spills and is lost.
- Resize it when you cannot collect often enough, for example during a long session of building.
- Research [Stripe Billing](/research/stripe) when you want to stop collecting by hand.

## How it works

Every successful request earns revenue, and that revenue waits in the Payments drawer. Click Payments to collect it into Cash. The drawer holds about a minute of revenue at your current rate, and each size step doubles what it holds.

Payments takes no links and sends nothing. It does not slow requests and it cannot fail. The Stripe Billing Research collects revenue for you, so the drawer stops mattering. See [Cash, Burn, and funding](/explanation/money) for how revenue and Burn meet in the Ledger.

It is not the [Payment Provider](/components/psp). The Payment Provider charges cards for checkouts. Payments only holds the money you already earned.

## How it fails

A full drawer is the only failure. Revenue beyond its size is lost, and your Cash stops growing while Burn keeps falling on it. Your users notice nothing, so the loss is easy to miss. If Cash falls while Apdex is good, check the drawer first.

No incident targets Payments.

## Tips

- Collect before you leave a Company running for a while.
- Research Stripe Billing early: it is cheap and removes a chore for the rest of the run.
