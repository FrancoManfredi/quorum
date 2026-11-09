# The changelog is written from each day's commits

Players check `/about/changelog` to see what moved since their last Company. The page listed commit
subjects by day: "Wire the remaining game flows and migrate saves" says nothing to a player, and the
list grew with every internal commit. The weekly job also failed, because the repository does not let
`GITHUB_TOKEN` open pull requests, so no entry reached the wiki for a week at a time.

The changelog now holds one Markdown file per UTC day in `apps/wiki/changelog/`. A daily workflow
builds a brief from that day's commits, asks a model for a short player-facing entry, checks the
answer, and opens a pull request with the entry and the two rendered pages.

Facts stay in code. `apps/wiki/scripts/changelog.ts` picks the day's non-merge commits, reads their
subjects, bodies, file lists, and patches, and hands the model a brief. It then checks the answer:
links must name a commit from that day, the entry has no heading or frontmatter, and it stays under
the word limit. The model writes words; it cannot invent a hash or a link. The entry is a normal file
in the repository, so a writer can edit any sentence after the fact and the next render keeps it.

The model runs on Workers AI through its OpenAI-compatible endpoint, using the `CLOUDFLARE_API_TOKEN`
and `CLOUDFLARE_ACCOUNT_ID` secrets the deploy already needs. `CHANGELOG_API_URL`,
`CHANGELOG_API_KEY`, and `CHANGELOG_MODEL` point the writer at another provider without a code change.
Each entry follows Keep a Changelog: an `### Added`, `### Changed`, `### Fixed`, or another of its
sections, one bullet per change, and the commits at the end of each bullet. It talks to the player as
"you", in the active voice, gives each item enough detail to stand on its own, and keeps the
technical detail light. It picks what you would notice first and leaves the rest to the links.

A second call edits the draft. The writer sees the patches, so it names internals; the editor sees
only the draft, so it can cut those words without learning new ones. A failed edit keeps the draft.

Considered options:

- **Flue in the action.** Flue runs a one-file agent in CI, and its sandbox could read the diffs
  itself. It adds 225 packages to the lockfile (AWS SDK, Google GenAI, Express, MCP) for one prompt,
  and it does not fix the pull-request permission that made the old job fail. Rejected; the digest
  already gives the model the facts it needs.
- **Commit subjects from the merge history.** The old page. It is current and cheap, and unreadable
  to a player. Rejected.
- **A release-please style changelog from pull requests.** The repository merges pull requests, but
  its own commits are squashed from branches and titles describe implementation. It would still read
  as a developer log. Rejected.
- **Writing every entry by hand.** The best prose, and the first thing to be skipped on a busy day.
  Rejected.

## Consequences

- The `changelog` workflow needs "Allow GitHub Actions to create and approve pull requests" in the
  repository's Actions settings, or a token that can open pull requests. Without it the job fails
  with that message.
- The model needs Workers AI access on `CLOUDFLARE_API_TOKEN`, or the three `CHANGELOG_*` settings
  that name another endpoint.
- A day with nothing a player can see gets no file, so the page skips it.
- `changelog/all.md` lists every day that has an entry, not every commit. The commit history stays on
  GitHub.
- The contents rail lists the days, not their `###` sections, because the sections repeat on every
  day.
- The entry is a draft. A PR review is the last step, and editing `apps/wiki/changelog/<day>.md`
  before merging is expected.
