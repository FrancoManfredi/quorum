# Patterns draw Designs on the real board

Players asked for system design patterns they can learn without playing, and for a way to see a
pattern as a Design. A screenshot would go stale the moment the game changed, and a hand-written
settings list would drift from the Simulation.

## Decision

1. `patterns` is a section of its own, beside the Diátaxis kinds. Pages sit under headings set by a
   `group` frontmatter field: Foundations, the scaling steps, one group per pattern family, and
   Outside the game.
2. The `::Design{id}` directive draws a Design on the game's own board, read-only, and solves it
   with the Simulation. Designs live in `apps/wiki/src/patterns/designs`. Each setting is written
   once, with its reason, and the page's settings table and caption are read back from the same
   object.
3. The wiki's rule against typing game numbers holds for Patterns prose. Numbers appear only in
   the table and caption, which the build derives.
4. A pattern the game cannot build has no Design. It goes under Outside the game, with references.

## Consequences

- `designs.test.ts` fails when a Design does not solve, has overlapping cards, names a field the
  game lacks, or has no page.
- A change to the Simulation that alters a Design's result changes its caption, not its prose.
  Claims in the prose that depend on a result still need a human read.
- The Design files grow with the Patterns section, so a new pattern is a page and, when buildable, one
  entry.
