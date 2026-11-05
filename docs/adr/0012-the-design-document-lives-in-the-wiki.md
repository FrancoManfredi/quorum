# The design document lives in the wiki

Players asked to read the design document, and the document had drifted from the build. Keeping it
outside the wiki meant it could only be read in the repository, and it grew a 450-line divergence log
that recorded every drift instead of the documents changing. [ADR 0009](./0009-the-wiki-is-a-prerendered-app.md)
kept the GDD out of the wiki because it mixes targets, roadmap, and rules.

## Decision

1. The design document moves from `docs/gdd` into `apps/wiki/content/design`, one page per document,
   rendered by the same Markdown pipeline as the rest of the wiki. `apps/wiki/content/design/index.md`
   is the section hub.
2. `design` is a section of its own, beside the four Diátaxis kinds. It appears in the header, the
   sidebar, and search, and stays out of the guided paths and the Era spoiler filter.
3. The build owns every number. The design pages describe what the game does, in the present tense. This is the one place in
   `apps/wiki/content` that may state a number by hand, because it is the design record rather than
   player reference ([AGENTS.md](../../AGENTS.md)).
4. Links out of the section that point at material which did not move (`CONTEXT.md`, `docs/adr`,
   `docs/research`, `docs/accessibility-checklist.md`) go to the repository on GitHub. Links inside
   the section use wiki paths, such as `/design/04-simulation#time`.

## Consequences

- `docs/gdd` no longer exists. The in-game Glossary is built from `packages/simulation`'s catalog,
  and `glossary.test.ts` reads the wiki page to keep the two in sync.
- The design section is public. It is written for developers, so it names simplifications, open
  questions, and unbuilt mechanics; the hub says so at the top.
- A design page is a wiki page: it needs frontmatter, and its links must resolve or the wiki build
  fails.
- The divergence log is gone. Live tuning and what the checks cover replace it in
  `16. Balancing`, and the measurements move to their own page, stamped with the `SIM_VERSION` they
  were taken at.
- What would change it: if players should not see a document, it moves back out of the wiki and the
  page links to the repository instead.
