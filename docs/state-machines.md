# State machines

A state machine makes a flow predictable: its states are a closed set, its events are a closed set,
and every event that does not apply leaves the state unchanged. This page lists every flow that has
one, how the state is stored, and how to add the next one.

## When a flow gets a machine

A machine pays for itself when all three hold:

1. The flow has two or more exclusive phases, and a phase needs data the other phases cannot have.
2. More than one event moves it, including events that can arrive late or twice.
3. An illegal combination is possible today, or a transition is easy to miss.

A number the solver integrates is not a phase. `credits`, `leak`, `depth`, `replicas`, and `warm`
inside `Warming` stay payload. A selection, such as the open panel or the chosen tool, is a value,
not a flow. A progress counter with one transition is a work item, not a state machine.

## The machine library

The flows below use `@typeonce/effect-machine`, except the two lifecycle flows that keep their tagged unions. A machine is a root with one active child. Its states and
events are Effect `Schema` tagged unions, so a phase that needs a field cannot be built without it.

The app uses the library's pure planners, not its runtime. `Machine.plan` and `Machine.planInitial`
run through `Effect.runSync` in `planState` (`apps/web/src/game/machine.ts` and
`packages/simulation/src/machine.ts`). That keeps a Foldkit update and a Simulation Step
synchronous, with no service layer and no fiber.

The stored value is the tagged state, not `Machine.Snapshot`. A snapshot is an experimental
debugging shape with completion and history metadata, and a `Game` is saved, hashed, and replayed.
`planState` rebuilds the small root snapshot from the stored tag on each plan.

## The machines

| Flow              | Source                                            | States                                                          | Stored in                                             |
| ----------------- | ------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| Boot              | `apps/web/src/game/boot-machine.ts`               | `Shut`, `Clocking`, `Ready`, `Connecting`                       | `Model.boot`                                          |
| Room              | `apps/web/src/game/room-machine.ts`               | `Idle`, `Connecting`, `Online`, `Reconnecting`, `Closed`        | `Model.room.phase`                                    |
| Board session     | `apps/web/src/game/session-machine.ts`            | `Company`, `Sandbox`, `Challenge`                               | `Board.session`                                       |
| Challenge run     | `apps/web/src/game/challenge-machine.ts`          | `Building`, `Running`, `Result`                                 | `Board.session.run`                                   |
| Company           | `apps/web/src/game/company-machine.ts`            | `None`, `Opening`, `Open`, `Exited`                             | `Model.companyPhase`                                  |
| Exit survey       | `apps/web/src/game/survey-machine.ts`             | `Open`, `Sending`, `Sent`, `Failed`, `Skipped`                  | `Model.survey.phase`                                  |
| Clock             | `apps/web/src/game/clock-machine.ts`              | `Running`, `PausedByPlayer`, `PausedByBlur`, `PausedByIncident` | `Board.clock.mode`                                    |
| Board interaction | `apps/web/src/game/board-machine.ts`              | `Idle`, `Placing`, `Stamping`, `Linking`, `ConfirmingSell`      | `Board.flow`                                          |
| Tradeoff          | `apps/web/src/game/tradeoff-machine.ts`           | `Closed`, `Hovering`, `Pinned`                                  | `Board.tradeoff`                                      |
| Change            | `apps/web/src/game/change-machine.ts`             | `Idle`, `Settling`, `Settled`, `Lasting`                        | `Board.change`                                        |
| Hold              | `apps/web/src/game/hold-machine.ts`               | `Idle`, `Held`                                                  | `Board.hold`                                          |
| Delete confirm    | `apps/web/src/game/confirm-delete-machine.ts`     | `List`, `Confirming`                                            | `Model.saveConfirm`                                   |
| Disclosure        | `apps/web/src/game/disclosure-machine.ts`         | `Idle`, `Queued`, `Cueing`                                      | `Board.disclosure`                                    |
| Mail              | `apps/web/src/game/mail-machine.ts`               | `Active`, `Answered`, `Resolved`                                | `Mail.phase`                                          |
| Node lifecycle    | `packages/simulation/src/life.ts`                 | `Running`, `Warming`, `Restarting`, `Stopped`                   | `GameNode.life`                                       |
| Stack migration   | `packages/simulation/src/migration.ts`            | `Building`, `Ready`, `Finishing`                                | `Service.migration`                                   |
| Bridge            | `packages/simulation/src/bridge-machine.ts`       | `None`, `Offered`, `Taken`                                      | `Game.bridge`                                         |
| Drill             | `packages/simulation/src/drill-machine.ts`        | `Running`, `Recovered`, `Failed`                                | `Game.drill`                                          |
| Quarter           | `packages/simulation/src/quarter-machine.ts`      | `AwaitingGuidance`, `Running`                                   | `Game.quarter`                                        |
| Feature           | `packages/simulation/src/feature-machine.ts`      | `Awaiting`, `Live`                                              | `Game.features[id]`                                   |
| Hire              | `packages/simulation/src/hire-machine.ts`         | `Pending`, `Joined`                                             | `Hire.phase`                                          |
| Breaker           | `packages/simulation/src/breaker-machine.ts`      | `Closed`, `Open`                                                | `GameLink.fuse`                                       |
| Autoscaler        | `packages/simulation/src/autoscaler-machine.ts`   | `Steady`, `Scaling`                                             | `GameNode.scaler`                                     |
| Era round         | `packages/simulation/src/era-round-machine.ts`    | `Waiting`, `Offered`, `Raised`, `Declined`                      | `Game.round`                                          |
| Data move         | `packages/simulation/src/data-move-machine.ts`    | `Building`, `Copying`, `Landed`                                 | `Service.reshard.phase`, `Service.engineChange.phase` |
| Study             | `packages/simulation/src/study-machine.ts`        | `Queued`, `Running`, `Completed`                                | `Study.phase`                                         |
| Node service      | `packages/simulation/src/node-service-machine.ts` | `InService`, `Draining`, `Shut`                                 | `GameNode.service`                                    |
| Work item         | `packages/simulation/src/work-item-machine.ts`    | `Free`, `Blocked`, `Approved`                                   | `WorkItem.block`                                      |
| Incident          | `packages/simulation/src/incident-machine.ts`     | `Quiet`, `Responded`, `Announced`, `Acknowledged`               | `Game.incident.phase`                                 |
| Mirror            | `packages/simulation/src/mirror-machine.ts`       | `Applying`, `InSync`, `Drifted`                                 | `Mirror.sync`                                         |

`Node lifecycle` and `Stack migration` are tagged unions with total constructors in their own
modules. They predate the machine library and already have a closed state set, so they keep their
shape.

## Saving

The tagged state is what the save stores. The live schemas describe that state only; there is no
stored schema with a `decodeTo` transform.

A Company file carries `format`, the save format version, beside the Game. This build reads format
1 only. A file without that format is kept aside and the board says the Company could not be read.
The format changes only with one migration, and the build's git hash is not the format
([ADR 0023](../adr/0023-a-company-save-has-a-format.md)).

A field that only the solver integrates stays a number inside its phase. The phase is the only
place a caller can read it, so a phase that does not have the field cannot answer for it.

## Adding a flow

1. Put the state and event unions in `apps/web/src/game/<flow>-machine.ts` or
   `packages/simulation/src/<flow>-machine.ts`.
2. Define the machine with `Machine.make({ root, events }).handle({ initial, states })`.
3. Export a `step` wrapper that returns the stored state when the event does not apply.
4. Store the tagged state in the Model or the Game. Route every write through `step`; do not write
   the phase from anywhere else.
5. Read through selectors, never through a payload that another phase may not have.
6. If the encoded save changes, add the old shape to `save-migration.ts`. Do not add a stored schema
   and a `decodeTo` transform.
7. Cover the behaviour through the integration tests that use the flow. A test that only steps the
   machine duplicates the table and does not protect a caller.

## Properties each machine holds

| Property                                   | How it holds                             |
| ------------------------------------------ | ---------------------------------------- |
| Closed state set                           | `Schema.Union` of tagged structs         |
| Closed event set                           | the machine's `events` schema            |
| An event outside the table changes nothing | `planState` returns the input state      |
| Every transition keeps its payload         | each target declares the fields it needs |
| One writer per state                       | the flow's `step` wrapper                |
| Deterministic                              | no clock, no randomness, no runtime      |

The integration tests exercise these through the app: `update.test.ts`, `inbox.test.ts`,
`saves.test.ts`, and `feedback.test.ts` for the web flows, and the Simulation's
Step and replay tests for the Game flows.
