---
title: Place Components
summary: Pick a Component from the build dock, put it on the Board with a click or the Enter key, and read what the game says when it refuses.
section: play
order: 3
aliases: place, build, build dock, add a node, buy a component, dock, placing, place a node
---

To place a Component, open a group in the build dock, pick the Component, and click the Board. The Node appears under your pointer and the Company pays its price.

![The build dock with the Edge group open.](/play/dock.png)

_Look at the open list above the group icons. Each row shows a name, one line about it, a price, and a number key._

## Place a Node

1. Find the group icons in the build dock at the bottom of the screen. Hover one to read its name and number, such as **Data (3)**.
2. Click a group, or press its number key. A list of Components opens above the dock.
3. Read the rows. Each shows the Component's name, a short line about it, and its price. A price in red means you cannot afford it now. A row with a lock names the research that opens it.
4. Click a row, or press its number key. The list closes. The dock now shows the Component's name, **Click the board**, and an X button.
5. Click an empty spot on the Board. The card appears centred on your pointer, and the Cash row on the HUD drops by the price.
6. Look at the right side of the screen. The Inspector opens on the new Node, because placing also selects.

Press `Enter` instead of clicking in step 5 to drop the part in the next free spot. That is the keyboard way to place.

A wrong placement is cheapest to fix at once: press `Z` within 30 seconds and the refund is exact, as [Clock, undo, and saves](/play/clock-undo-saves) explains.

A placed Node is not connected to anything yet, so it costs Cash and carries no traffic until you add a Link. [Wire Nodes with Links](/play/wire-nodes) covers the drag.

::Component{id="database"}

_A Database as it looks on the Board right after you place it. Nothing is wired to it yet._

## One part per pick

The part in your hand is used up by one placement, so to place a second Database you pick it from the dock again. That is on purpose: a stray click on the Board never buys something, and a second click does not place a second Node.

To put a part back without placing it, press `Esc` or click the X button on the dock.

## If the spot is taken

You can click anywhere clear. If the spot overlaps a card, the Node slides to the nearest free place. You can drag it later: [Move, select, copy, sell](/play/move-and-select).

## What the game refuses

A refusal appears as a toast, and the part stays in your hand. Click a clear spot or press `Esc`.

| Message                                                                 | Cause                                                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `<Component> costs $<price>.`                                           | Your Cash is below the price. Wait, collect, or choose a cheaper part.  |
| `Out of Cash: no placement, upgrade, or hire until Cash is above zero.` | Cash is zero or below. Sell a Node or collect revenue first.            |
| `<Component> needs <Research>.`                                         | The Component is locked. Open **Research** and study the item it names. |
| `Open that region first.`                                               | You tried to place in a region you have not opened.                     |
| `<Mutator>: no <Component>.`                                            | A Mutator on your Company bans that Component.                          |

Locked rows in the dock are not dead ends. Click one and a slip above the dock names the Research and its Insight price, with a **Research** button that opens it. The slip waits until you take it or dismiss it. A row in red is the same warning one step early: the toast will repeat the price, so read it before you click the Board.

## Try it

Place an App Server and a Database on the practice board below. Pick each from the dock on the board, then click the board to drop it. Nothing you do here touches a Company.

::Practice{id="place"}
