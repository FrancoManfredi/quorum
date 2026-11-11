# Storage

Quorum keeps a Company in the browser. The API Worker keeps Rooms in Durable Objects, and the Exit
survey in D1. Nothing else is stored on a server. Once the game is public, the browser keys and the
save format are a compatibility surface: rename a key or change the format only with a migration.

## Browser keys

`apps/web/src/game/storage.ts` names every key below and is the only module that reads and writes
them. A blocked or full browser gets `null` from a read and `false` from a write, so each caller
decides what a lost value costs.

| Key                     | Holds                                                     | Read by                       | Lifecycle                                   |
| ----------------------- | --------------------------------------------------------- | ----------------------------- | ------------------------------------------- |
| `quorum.saves.v1`       | The Company list: `current` and one file per Company      | `LoadSaves`                   | Written with every autosave                 |
| `quorum.save.v3.<id>`   | One Company file: the Game, disclosure, Dashboard, Inbox  | `LoadCompany`, `SaveImported` | Written with that Company's autosave        |
| `quorum.prefs.v1`       | Settings: sound, motion, language, text, theme, consent   | `LoadPrefs`, Sentry           | Written on every Settings change            |
| `quorum.founder.v1`     | Founder record: Legacy, Perks, Playbooks, achievements    | `LoadFounder`                 | Written on every Founder change             |
| `quorum.sandbox.v1`     | Passed guided Sandboxes and the free Sandbox board        | `LoadSandboxStore`            | Written on Sandbox progress                 |
| `quorum.agent.rooms`    | A write key and Room id per Company, with Agent access on | `agent-room.ts`               | Written when a Room is first needed         |
| `quorum.room.name`      | The display name other Seats see                          | `room-socket.ts`              | Written when the player sets it             |
| `quorum.analytics.v1`   | The monthly and session event budget                      | `analytics-budget.ts`         | Written per captured event                  |
| `quorum.playlog.v1`     | The last 2,000 support log lines                          | `playlog.ts`, developer panel | Capped, written after a batch               |
| `quorum.save.broken.v1` | The last Company file this build could not read           | Nothing; a support copy       | Replaced by a failure, cleared by an import |

`quorum.room.seat` lives in `sessionStorage`: it names this tab's Seat and dies with the tab.

The keys above are the only localStorage keys Quorum writes. `quorum.save.v1` and `quorum.save.v2` were the pre-public single saves. `sweepLegacyStorage` removes them on boot. `PruneSaves` removes Company files and Agent Room records that the index does not name, so a failed index write or a deleted Company cannot leak storage.

## Reading rules

- The index decodes with `SaveIndex`. A broken list is kept under `quorum.save.broken.v1`, and the
  page does not prune Company files when the list cannot be read.
- A Company file must carry `format`. `SAVE_FORMAT` is 1, and a file with another format is kept
  aside with a warning. The format is not the build's git hash.
- A Company that cannot open leaves the list, and its file is removed. An unreadable file is copied
  to `quorum.save.broken.v1` first, so the warning shows once instead of on every load.
- Settings, the Founder, Sandbox progress, the agent Rooms, and the analytics budget decode with
  their schemas or guards. A bad value falls back to the default rather than throwing.
- The support log is filtered to well-formed lines and capped at 2,000. It shares the quota with
  the saves, so it does not grow without bound.

## Save format

`apps/web/src/game/save-file.ts` owns `SAVE_FORMAT` and the stored shape. The text export wraps the
same JSON in `QSV1:` with base64url encoding, and carries the same format. **Download save file**
writes that line to a file, and **Import a save file** reads one back. Import also takes a stored
Company file as it is, so a player can move one by hand. It checks the format before decoding the
Game; a mismatch leaves the open Company untouched, and a successful import clears the copy under
`quorum.save.broken.v1`.

A later format change bumps `SAVE_FORMAT` and adds one migration from the previous format. No other
module learns about an old shape ([ADR 0023](adr/0023-a-company-save-has-a-format.md)).

## Server storage

- **RoomObject.** One Durable Object per Room. It stores the Room state under `room` and deletes all
  of it when the Room ends or its alarm fires. A Room whose `simVersion` is not this build's is
  dropped on load, so a deploy cannot feed an old Game to the new Simulation.
- **AgentRoom.** One Durable Object per exposed Company. It stores `meta`, `head`, `inbox`, sample
  chunks, and per-node samples, deletes all of it when the write key is cleared, and expires after
  24 hours without a write.
- **D1.** The `survey_responses` table holds one Exit survey row per device and Exit. The
  `results` table was dropped when Challenges moved to local scoring.
