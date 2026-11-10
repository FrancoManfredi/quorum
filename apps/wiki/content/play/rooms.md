---
title: Play in a Room
summary: Take a Company online, invite people with a code, and decide what a Seat can do.
section: play
order: 12
aliases: room, online, multiplayer, co-op, coop, teammate, seat, invite, share a company
gdd: /design/17-scope-and-roadmap
---

A Room lets more than one person build the same Company. One player owns the Company, and everyone
else joins with a six-character code and takes a Seat. The Room keeps the Company for 24 hours after
the last Seat leaves.

## Take a Company online

1. Open a Company.
2. Press `Esc` to open the Menu, then select **Room**.
3. Select **Play online**. Quorum uploads the Company and shows a **Room code**.
4. Select **Copy link** and send it to the people you want to play with.
5. They open the link, choose a name, and join.

Anyone with the link can join. They do not need an account.

## What a Seat can do

A Seat builds on the Board, opens panels, and answers Incidents. The owner sets the speed and can
remove a Seat with **Remove**. Every Seat sees the others' cursors on the Board, so you can watch
someone wire a Link.

The owner can select **Take offline** at any time. The Company comes back to the owner's browser and
the Room closes.

## Votes

A funding round and the end of a session are votes. A vote passes when yes is more than half of the
connected Seats. A tie fails, and a Seat that leaves drops its vote. The owner starts a vote for a
round or to end the session. Anyone can answer an Incident.

## What a Room does not do

- A Company cannot Exit online. The session ends, the owner takes the Company offline, and the Exit
  stays a single-player act.
- Guests earn no achievements and keep no Company. Only the owner's browser keeps the file.
- Undo stays single-player, because every Seat shares one order of moves.
- A deploy ends a Room on an older build. The owner keeps the Company from when it went online, but
  progress made in the Room since then can be lost.
- The Room keeps the Company for 24 hours after the last Seat leaves, then reports it expired.

The [design record](/design/17-scope-and-roadmap#rooms) explains how the Room owns the Simulation.
