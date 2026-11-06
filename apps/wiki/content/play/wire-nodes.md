---
title: Wire Nodes with Links
summary: Drag from a Node's out port to another Node to make a Link, read the refusals, then select, edit, and cut Links with the mouse or the keyboard.
section: play
order: 4
aliases: link, links, wire, wiring, connect, connect nodes, out port, port, cut a link, remove a link, delete a link, keyboard link, link rules
---

To make a Link, press on the out port at the right edge of a Node's card, drag to another Node, and let go over its card. Requests then flow from the first Node to the second. The Link has a direction, and a Node with no Link out of it passes nothing on.

## The out port

Every card has two ports. The in port is on the left edge, where Links arrive. The out port is on the right edge, level with the **Out** row, where Links leave.

Only the out port starts a Link. You never aim at the in port: letting go anywhere over the target card is enough. Pressing on any other part of a card drags the card instead, so aim for the port.

::Component{id="server"}

_An App Server as it looks on the Board. Its out port is the circle on the right edge._

## Make a Link

1. Place both Nodes. See [Place Components](/play/place-components).
2. Move the pointer onto the out port of the Node that sends. The cursor changes.
3. Press and drag. A wire follows the pointer.
4. Drag over the Node that receives. Its card glows.
5. Release. The Link appears, and a belt of requests starts to move along it.

If the Link works, the change pill at the top names it, such as **Linked App Server to Database**. Press `Z` to undo it.

If you release over empty space, or over the Node you started from, the wire springs back and nothing happens. The game shows no message for that.

The first Link from an App Server that still runs PostgreSQL on its own box to a Database moves PostgreSQL off. The game says **Postgres moved off the App Server to its own Database.** The same happens for a Link to a Pooler or a Cache.

## What a Link needs

A Link is allowed when all of these hold:

- The sending Node sends something. Users, App Servers, and Load Balancers do. A Database, Analytics, and Payments do not.
- The receiving Node takes at least one kind of request the sender sends. A Database takes queries, not page views.
- The two Nodes differ, the Link does not exist, and it would not make a loop.
- The sender has a free Link. Users have one, and a few Components have a fixed number.

Analytics is the exception to the first and last rules. Link any Node except Payments into it and it samples that Node's traffic, whatever the Node sends. This Link does not use up a free Link. Payments needs no Link at all: revenue reaches its drawer by itself.

## What the game refuses

A refusal appears as a toast. The Link is not made, and nothing is charged.

| Message                                                                             | Cause                                                                            |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `Already linked.`                                                                   | The Link exists. Select it to see it.                                            |
| `<Receiver> takes <kinds>. <Sender> sends <kinds>.`                                 | The receiver accepts none of what the sender sends. Both lists are in the toast. |
| `<Sender> sends nothing on. Link it into Analytics to sample it.`                   | The sender has no output, such as a Database or Payments.                        |
| `<Receiver> has no input.`                                                          | Nothing can be sent to it. Users is an example.                                  |
| `<Sender> takes <n> links.`                                                         | The sender has all the Links it can have.                                        |
| `A domain resolves to one host. Put DNS or a Load Balancer in front to reach more.` | A second Link out of Users.                                                      |
| `That link would make a loop.`                                                      | The receiver already leads back to the sender, through other Links.              |
| `<Sender> has no traffic to sample.`                                                | You linked Payments or Analytics into Analytics.                                 |

The control Components have their own messages:

- `Link App Servers or Workers into the <Component>.` appears when you link something else into an Autoscaler or a Kubernetes Cluster.
- `<Sender> already has a <Component>.` appears when an App Server or Worker has an Autoscaler or a Cluster already.
- `Link a Database into the <Component>: it reads its write log.` appears for a CDC Connector.

Another refusal text, `Link two different Nodes.`, covers a Link to the Node itself. The pointer never produces it, because releasing on the starting card cancels.

## Select, edit, and cut a Link

A click on a Link selects it. It never cuts it.

1. Hover a Link. The cursor becomes a pointer.
2. Click it. Any selected Node is deselected, and a **×** badge shows in the middle of the Link.
3. To cut it, click the **×** badge, or press `Delete` or `Backspace`.
4. To keep it, press `Esc` or click empty space.

You will see the belt stop and the Link vanish. The change pill reads **Cut** with the two Node names, and `Z` brings the Link back. A right click selects a Link too, and on a touch screen a tap does.

Check what is selected before you press `Delete`. With a Node selected, `Delete` asks to sell the Node, so click the Link first.

A Link has no panel of its own. Its settings live on the Node that sends. Select the sender and open the **Calls** section of the Inspector. For each Link out of it, you can set:

- A timeout of **1 s**, **5 s**, or **30 s**.
- Retries: **No retries**, **Retry 3×**, or **Backoff**.
- **No breaker** or **Breaker**.
- **No bulkhead** or **Bulkhead**.
- **One copy** or **Hedge**.

The **Calls** section needs the Timeouts and retries research. Each further option needs its own. [The Inspector](/play/the-inspector) explains the section.

## Link with the keyboard

The keyboard can make a Link too. It needs the focus on the Board, not in a text field.

1. Select the sending Node. Click it, or move with the arrow keys.
2. Press `L`. The game remembers the sender.
3. Press the arrow keys until the receiving Node is selected. Each arrow selects the nearest Node in that direction.
4. Press `Enter` or `L` again. The Link is made, or a toast says why not.

After a refusal the sender stays remembered, so try another Node. Press `Esc` to forget it.

## Mistakes to avoid

- Do not drag from the card body to make a Link. That moves the card. Start on the out port.
- Do not click a Link to cut it. A click selects it, and the cut takes the **×** badge or `Delete`.
- Do not link Database to App Server. Data Nodes do not send on, so the Link points the other way: App Server to Database.
- Do not link a Node into Analytics and expect Insight at once. Analytics only samples traffic that arrives, so the sender needs traffic.
- Do not leave a Node with no Link out of it, unless it is a data Node or Analytics. The card shows a red **Stranded** row, and the requests that reach it count as errors.

## Try it

Make three Links on the practice board below: Users to the App Server, the App Server to the Database, and the App Server to Analytics. Drag from each out port to the next card. Then select one Link, cut it with the **×** badge, and make it again.

Two Load Balancers wait at the bottom. Link the first to the second, then drag from the second back to the first. The game refuses with **That link would make a loop.**, and the last goal ticks off once you have read it. Nothing you do here touches a Company.

::Practice{id="wire"}

Next: [Move, select, copy, sell](/play/move-and-select).
