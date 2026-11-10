# A Company save carries a format version

A Company lives in the browser, and the player can copy it as text. The stored file and the copy
need a version that changes only when the format changes. The build's git hash is not that version:
it changes on every deploy, so a backup copied today would be refused tomorrow.

Before the public launch, the save text carried `SIM_VERSION`, and the loader upgraded old JSON
through `save-migration.ts`. That kept a playtest save alive across a summer of schema changes. It
also meant every schema change needed migration code, and a copied backup stopped working on the
next deploy.

## Decision

1. `SAVE_FORMAT` in `apps/web/src/game/save-file.ts` is the version of a Company save. It starts at
   1, and the number is not shown to the player.
2. A stored Company file carries `format` beside the Game. A file without this format is not read.
   The board keeps it under the broken-save key and says the Company could not be read.
3. The text from **Copy save as text** carries the same `format`. **Import a save** refuses another
   format with a message instead of decoding it, and the open Company stays as it was.
4. There is no migration path from the pre-public saves. The old single save keys are removed on
   boot, and the old file format gets no reader.
5. A later format change bumps `SAVE_FORMAT` and adds one function that turns the previous format
   into the new one. The rest of the game keeps reading the current shape only.

## Consequences

- A player's backup opens in a later build while the format stays the same. A deploy no longer
  invalidates it.
- A save from another format is refused, not guessed at. The player sees why, and the current
  Company does not change.
- The game no longer carries migration code for shapes that no player can produce. The first public
  format is the baseline.
- The Simulation's own version stays on replays, Challenge results, and Rooms, where results from
  different builds must never be compared. It is not a save version.
