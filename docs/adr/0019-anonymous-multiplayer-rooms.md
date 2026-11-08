# Anonymous multiplayer runs in a Room

A Company can go online. While it is, one Durable Object in the API Worker owns its Game and steps
it, and every browser renders snapshots and sends intents.

The Simulation already runs in workerd and produces identical hashes in every engine, so the
authority costs one alarm and one storage row, not a second model. A host browser would need the
same Durable Object for sockets anyway, and it would add host migration, background-tab throttling,
and a second code path. The Room is the smaller system.

The Company itself never leaves the player. The browser keeps the Company file and an owner token,
so taking the Company offline returns it to the same single-player game, with no account and no
shared save. Guests keep nothing. That is Factorio's shape: the owner hosts the save, other people
join it, and the save comes back when the host stops.

## The wire

A Seat sends an Intent: the name of a Simulation action and its arguments. The Room runs the same
action the board runs, through `applyIntent` in `packages/simulation/src/room.ts`, so it refuses
what the board refuses. A result that the `Game` schema cannot read is refused rather than
broadcast. The browser applies its Intent locally first, then replaces the Board with the next
snapshot, so a refusal costs one round trip and never a divergence.

Snapshots carry the Game without `history`, which is 95 percent of a save. The Room keeps the
Dashboard samples in their own list and sends each Seat only the samples it has not seen. At fifteen
minutes a snapshot is 9.5 KB of JSON instead of 200 KB, which is what makes a 500 ms cadence cheap.

An Intent is named at the call site without naming the action twice. `Actions`, `Work`, and
`Mirrors` in `apps/web/src/game/board-actions.ts` wrap the Simulation's modules and record, beside
each result, the Intent that produced it. `act()` sends that Intent while a Room is live, so the
hundreds of board handlers keep one call shape, and an action a Seat may not take, such as `raise`,
records nothing and is refused with a toast. `planOf` in the Simulation answers which names a Seat
may send and refuses arguments that cannot cross the wire.

The message schemas live beside the Simulation because their payloads are the Game and its Intents.
`packages/rpc` keeps the path constants and the two plain RPCs, `roomPublish` and `roomInfo`.

## The rules

- The owner token claims the owner Seat. It lives in the Company file and is never broadcast.
- A Company cannot Exit online. A passing `exit` vote ends the session, the owner takes the Company
  offline, and the Exit stays a single-player act, so its Legacy, Achievements, and survey never
  depend on a Room.
- A funding round and the end of a session are votes. A vote passes when yes is more than half of the
  connected Seats; a tie fails, and a Seat that leaves drops its ballot.
- The owner sets the speed and can remove a Seat. Anyone answers an incident.
- The Company runs while at least one Seat is connected and freezes when the Room empties. The Room
  keeps it for 24 hours, then reports it expired and leaves the owner the copy from when it went
  online.
- A deploy ends the Room with `stale` rather than handing back a Game the new build cannot read.
- A Room that no longer exists answers `roomInfo` with `exists: false`, and a link to one lands the
  browser on the title screen instead of an empty board.
- A passing `exit` vote sends the owner the final Game before the guests are told the session is
  over, so the online progress comes home with the Company.
- Undo stays single-player: the Room owns the Game, and the Seats' moves share one order.

## Considered options

- A host browser as the authority. Rejected: the Durable Object exists anyway, a closed tab would
  end the Room, and an anonymous host could rewrite the Game.
- Full Game snapshots. Rejected: 400 KB/s per Seat with `history`, 19 KB/s without it.
- Deterministic lockstep or CRDTs. Rejected: the Room already orders every change, so clients never
  need to agree among themselves.
- A fresh Company per Room. Rejected once the shape became "take your Company online": the owner
  would have two saves to reconcile.
- Cap'n Web for the transport. Rejected for now: it is experimental, it validates nothing at
  runtime, and it would add a second RPC stack beside Effect RPC. The trade-off is recorded in the
  plan and worth revisiting if the room API grows.

## Consequences

- The API Worker hosts the `RoomObject` Durable Object and binds one namespace. No other Cloudflare
  resource is added.
- `game.history` stays out of a Room's Game. Achievements read the sample history, so an online
  Company earns Achievements from the owner's snapshots only, and guests earn none.
- A Room's Game is saved by the owner's browser at the handover. A lost token, an expiry, or a deploy
  can lose the progress since the Company went online, which the title screen states.
- The Room's protocol is declared in `packages/simulation/src/room.ts`, not in `packages/rpc`, because
  both ends already import the Simulation and the payloads are the Game.
