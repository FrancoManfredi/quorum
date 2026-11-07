---
title: Read a Node card
summary: Every row, gauge and mark on a Node card, what the four status shapes mean, the BOTTLENECK tag, and the footer button that you hold to buy.
section: play
order: 6
aliases: node card, card, status shape, load bar, bottleneck tag, footer, hold to buy, collect, stranded, limit row
gdd: /design/15-ui-ux
---

A Node card shows what the Node receives, how full it is, and what it sends on. Read the **Load** row first: it tells you how close the Node is to its limit.

::Component{id="server"}

![A Node card on the Board: the header, the rows, and the footer button.](/play/node-card.png)

Look at the header, then the **Load** bar, then the footer at the bottom edge.

## The header

The header holds a medallion with the Component's icon, the Node's name and ordinal, size pips, and a small line of context. That line can hold a copy count such as **×3**, a zone letter, and for a Node in another region, the region and the round trip, such as **EU 90 ms**.

The corner of the medallion carries the status mark.

| Shape    | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| Dot      | The Node is healthy.                                                         |
| Triangle | It runs at 70% of its capacity or more, or requests are stranded or refused. |
| Square   | It runs at 90% of its capacity or more.                                      |
| Cross    | The Node is down.                                                            |

A Node with no traffic shows no mark. Each shape has its own colour, but the shape alone is enough. A player who cannot tell colours apart reads the same Board.

## The rows

Rows differ by Component. These appear on most Nodes, in this order.

| Row         | What it shows                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inbound** | Requests per second that reach the Node. It turns red when the Node drops some.                                                                                                                                                               |
| **Load**    | A bar and text such as **72% of 40/s**: Utilization, and the Capacity it is measured against. **idle** means no traffic. The bar turns amber from 70% and red from 90%. After the `metrics` Research, a small trend line sits in the row.     |
| **Limit**   | Appears after the `profiling` Research. It names the resource that caps the Node: **CPU 22%**, **RAM 80%**, **Workers 20/20**, **Network 40%**, **CPU credits**, **Connections 90/100**, **Disk IOPS**, **Throughput**, or **Nothing tight**. |
| Stack row   | App Servers and Workers show their runtime and framework.                                                                                                                                                                                     |
| **Latency** | The time the Node adds. With the `percentiles` Research it reads **12 ms · p99 40 ms**.                                                                                                                                                       |
| **Out**     | Requests per second sent on along its Links. When some requests have no Link that accepts them, the row becomes a red **Stranded** with the rate that is lost.                                                                                |

**Stranded** is the row to chase. Requests that reach a Node with no outbound Link that takes them count as errors, so link the Node to something that accepts them.

A low **Load** bar is not the whole story: read **Limit** beside it, because a Node at 40% **Load** can still be capped by **Connections**.

Some Components swap rows for their own:

- **Users** show **Users**, **Apdex** and **Requests**.
- **Payments** show **Revenue** and **Drawer**, the Cash waiting to be collected. After the Stripe Research the row reads **Stripe**.
- **Analytics** shows **Sampling**, **Kept** and the top Insight rows.
- A **Database** shows **Engine**, **Volume** and **Connections**.
- A **Cache** shows **Hit ratio**.

## The BOTTLENECK tag

The Simulation picks the one Node whose extra Capacity would earn the most Revenue right now. That Node gets a pulsing amber outline and an amber **BOTTLENECK** tag above its top edge.

![A Node card with the BOTTLENECK tag and the amber outline.](/play/node-card-bottleneck.png)

Look at the tag and the outline. The **Load** bar on that card is usually amber or red, and the **Limit** row names what to fix.

The tag moves when you fix the Node: if it jumps to a new Node, the first one is no longer the limit, and if no Node has it, nothing limits Revenue. The tag marks where Cash helps most, so check it before you buy size elsewhere.

## The footer

The strip at the bottom of the card is a button. What it does depends on the Node.

| Footer text                 | What it does                                         |
| --------------------------- | ---------------------------------------------------- |
| A size name and a price     | Buys the next size. You must hold it.                |
| **Samples** and a price     | On Analytics: buys more sampling. You must hold it.  |
| **Collect** and an amount   | On Payments: collects the drawer. One click does it. |
| **Drawer empty**            | Nothing to collect. The button is off.               |
| **Collected automatically** | Payments after the Stripe Research.                  |
| **Largest size**            | The Node cannot grow further.                        |
| **Replace** and a price     | The Node stopped. Pay to bring it back.              |

### Hold to buy

A size costs Cash, so the card asks for intent: press the footer and keep the button down while a fill crosses it. At about 0.6 seconds the buy lands, and the card plays a short burst.

A quick click buys nothing, so keep the pointer down while the fill moves, and drag off the button to cancel. If you keep holding after the first buy, the card buys another size every quarter of a second until you let go, run out of Cash, or reach the largest size. A refusal such as **Out of Cash: no placement, upgrade, or hire until Cash is above zero.** ends the hold with one toast.

The Inspector's **Larger** button is different. A single click buys one size there, and a hold repeats. See [The Inspector](/play/the-inspector).

::Component{id="payments"}

The Payments card above shows a footer that collects with one click. Compare it with the App Server footer, which asks for a hold.
