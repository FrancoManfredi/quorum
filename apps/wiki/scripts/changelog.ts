import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type Commit = Readonly<{
  hash: string
  date: string
  subject: string
  body: string
}>

/** One day of the changelog, as a reader reads it. */
export type Entry = Readonly<{ day: string; body: string }>

const REPOSITORY = 'https://github.com/elianiva/quorum'
const COMMIT_PREFIX = `${REPOSITORY}/commit/`
/** Days the short page shows. */
export const RECENT_ENTRIES = 7
/** Words one day's entry may hold. */
export const MAX_WORDS = 400
/** Characters of one commit's patch that the writer reads. */
const PATCH_PER_COMMIT = 1500
/** Characters of all patches that the writer reads. */
const PATCH_TOTAL = 24000
/** Characters of the whole commit list that the writer reads. */
const BRIEF_TOTAL = 60000

const ENTRY_DIR = new URL('../changelog/', import.meta.url)
const BRIEF_DIR = new URL('../.changelog/', import.meta.url)
const RECENT_PAGE = new URL('../content/about/changelog.md', import.meta.url)
const ALL_PAGE = new URL('../content/about/changelog/all.md', import.meta.url)

/** The UTC day, as `YYYY-MM-DD`, of an ISO date. */
export const dayOf = (iso: string): string => new Date(iso).toISOString().slice(0, 10)

const longDate = (day: string): string =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

const frontmatter = (title: string, summary: string, order: number): string =>
  [
    '---',
    `title: ${title}`,
    `summary: ${summary}`,
    'section: about',
    `order: ${order}`,
    'aliases: changes, updates, release notes, patch notes, what is new',
    // The entries carry their own section headings; the contents rail lists the days only.
    'toc: top',
    '---',
  ].join('\n')

const RECENT_INTRO =
  'Quorum has no versions. It changes all the time, and this page lists the latest days, newest first, so you can see what moved since you last played. A page on this wiki can lag behind the game by a few days. Older days are in the [full changelog](/about/changelog/all).'

const ALL_INTRO =
  'Every day that changed Quorum, newest first. The [changelog](/about/changelog) shows only the latest days.'

/** The short page: the latest entries, newest first. */
export const renderRecent = (entries: ReadonlyArray<Entry>): string => {
  const sections = entries
    .slice(0, RECENT_ENTRIES)
    .map((entry) => [`## ${longDate(entry.day)}`, entry.body.trim()].join('\n\n'))
  return `${[frontmatter('Changelog', 'What changed in Quorum over the last few days.', 3), RECENT_INTRO, ...sections].join('\n\n')}\n`
}

/** The full page: every entry, newest first. */
export const renderAll = (entries: ReadonlyArray<Entry>): string => {
  const sections = entries.map((entry) =>
    [`## ${longDate(entry.day)}`, entry.body.trim()].join('\n\n'),
  )
  return `${[frontmatter('Full changelog', 'Every day that changed Quorum.', 4), ALL_INTRO, ...sections].join('\n\n')}\n`
}

const entryName = (day: string): string => `${day}.md`

/** Every entry on disk, newest first. */
export const readEntries = (): ReadonlyArray<Entry> =>
  readdirSync(ENTRY_DIR)
    .filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .map((name) => ({
      day: name.slice(0, 10),
      body: readFileSync(new URL(name, ENTRY_DIR), 'utf8').trim(),
    }))
    .sort((a, b) => b.day.localeCompare(a.day))

const run = (args: ReadonlyArray<string>): string =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

const LOG_FORMAT = '%H%x1f%aI%x1f%s%x1f%b%x1e'

/** Every non-merge commit, newest first. */
const history = (): ReadonlyArray<Commit> =>
  run(['log', '--no-merges', `--format=${LOG_FORMAT}`])
    .split('\x1e')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [hash = '', date = '', subject = '', ...body] = row.split('\x1f')
      return { hash, date, subject, body: body.join('\x1f').trim() }
    })

/** The commits a UTC day holds, newest first. */
export const commitsOn = (day: string): ReadonlyArray<Commit> =>
  history().filter((commit) => dayOf(commit.date) === day)

const filesOf = (hash: string): ReadonlyArray<string> =>
  run(['show', '--numstat', '--format=', hash])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t')[2] ?? '')
    .filter(Boolean)

/** A change a player can meet, rather than a test, a doc, or the build. */
const playerFacing = (files: ReadonlyArray<string>): boolean => {
  const code = files.filter(
    (file) =>
      !/\.(test|spec)\.tsx?$/.test(file) &&
      !file.endsWith('.snap') &&
      !file.startsWith('test/') &&
      !file.includes('/test/') &&
      !file.startsWith('.github/') &&
      !file.startsWith('docs/') &&
      !file.startsWith('apps/wiki/scripts/'),
  )
  return code.some(
    (file) =>
      file.startsWith('apps/web/') ||
      file.startsWith('apps/wiki/content/') ||
      file.startsWith('packages/ui/') ||
      file.startsWith('packages/simulation/src/'),
  )
}

const patchOf = (hash: string): string =>
  run(['show', '--format=', '--unified=1', '--no-color', hash])
    .replace(/^diff --git .*$/gm, '')
    .trim()
    .slice(0, PATCH_PER_COMMIT)

/** The commits a player could meet. The brief leaves the rest out so the writer can cover more. */
export const playerCommits = (day: string): ReadonlyArray<Commit> =>
  commitsOn(day).filter((commit) => playerFacing(filesOf(commit.hash)))

/** What the writer reads about one day: every player-visible commit, with a patch. */
export const briefOf = (day: string): string => {
  const commits = playerCommits(day)
  let budget = PATCH_TOTAL
  const blocks = commits.map((commit) => {
    const files = filesOf(commit.hash)
    const patch = budget > 0 ? patchOf(commit.hash) : ''
    budget -= patch.length
    return [
      `Commit: ${commit.hash}`,
      `Subject: ${commit.subject}`,
      ...(commit.body === '' ? [] : [`Body: ${commit.body}`]),
      `Files: ${files.join(', ')}`,
      ...(patch === '' ? [] : ['Patch:', patch]),
    ].join('\n')
  })
  return blocks.join('\n\n').slice(0, BRIEF_TOTAL)
}

/** The Keep a Changelog sections an entry may use. */
export const KINDS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'] as const

/** Why an entry cannot ship, as the messages to hand back to the writer. */
export const problemsIn = (body: string, commits: ReadonlyArray<Commit>): ReadonlyArray<string> => {
  const text = body.trim()
  const problems: Array<string> = []
  if (text === '') problems.push('the entry is empty')
  if (/\bthe player\b/i.test(text))
    problems.push('the entry talks about "the player"; address the reader as "you"')
  if (/^---$/m.test(text.split('\n')[0] ?? '')) problems.push('the entry has frontmatter')
  if (/^#{1,2} /m.test(text) || /^#{4,6} /m.test(text))
    problems.push('the entry uses a heading other than a ### Keep a Changelog section')
  const headings = [...text.matchAll(/^### (.+)$/gm)].map((match) => (match[1] ?? '').trim())
  if (headings.length === 0) problems.push('the entry has no ### section headings')
  for (const heading of headings)
    if (!(KINDS as ReadonlyArray<string>).includes(heading))
      problems.push(
        `"${heading}" is not one of Added, Changed, Deprecated, Removed, Fixed, or Security`,
      )
  const parts = text.split(/^### .+$/m)
  if ((parts[0] ?? '').trim() !== '')
    problems.push('the entry has text before its first ### heading')
  for (const [index, part] of parts.slice(1).entries()) {
    const kind = headings[index] ?? 'section'
    const lines = part
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length === 0) problems.push(`the ${kind} section is empty`)
    else if (!(lines[0] ?? '').startsWith('- '))
      problems.push(`the ${kind} section is not a bullet list`)
  }
  const words = text.split(/\s+/).filter(Boolean).length
  if (words > MAX_WORDS) problems.push(`the entry has ${words} words; the limit is ${MAX_WORDS}`)
  for (const bullet of text.split('\n').filter((line) => line.startsWith('- ')))
    if (!/github\.com\/elianiva\/quorum\/commit\/[0-9a-f]{40}/.test(bullet))
      problems.push(`a bullet links no commit: ${bullet.slice(0, 60)}`)
  const links = [...text.matchAll(/github\.com\/elianiva\/quorum\/commit\/([0-9a-f]{40})/g)].map(
    (match) => match[1] ?? '',
  )
  if (links.length === 0) problems.push('the entry links no commit')
  const known = new Set(commits.map((commit) => commit.hash))
  for (const hash of links)
    if (!known.has(hash))
      problems.push(`the entry links ${hash.slice(0, 7)}, which is not one of the day's commits`)
  return problems
}

type Config = Readonly<{ url: string; key: string; model: string }>

const config = (): Config => {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const url =
    process.env.CHANGELOG_API_URL ||
    (account === undefined
      ? ''
      : `https://api.cloudflare.com/client/v4/accounts/${account}/ai/v1/chat/completions`)
  const key = process.env.CHANGELOG_API_KEY || process.env.CLOUDFLARE_API_TOKEN
  if (url === '' || key === undefined)
    throw new Error(
      'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN, or CHANGELOG_API_URL and CHANGELOG_API_KEY.',
    )
  return { url, key, model: process.env.CHANGELOG_MODEL || '@cf/openai/gpt-oss-120b' }
}

type Message = Readonly<{ role: 'system' | 'user'; content: string }>

const COMMIT_LINK =
  /\[([0-9a-f]{40})\]\((https:\/\/github\.com\/elianiva\/quorum\/commit\/[0-9a-f]{40})\)/g

/** The prompt asks for 7-character links and plain hyphens; make sure of both. */
export const tidy = (reply: string, commits: ReadonlyArray<Commit>): string => {
  const known = new Set(commits.map((commit) => commit.hash))
  return reply
    .replaceAll('\u2010', '-')
    .replaceAll('\u2011', '-')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(COMMIT_LINK, (_match, hash: string, url: string) => `[${hash.slice(0, 7)}](${url})`)
    .replace(/\[([0-9a-f]{40})\](?!\()/g, (match, hash: string) =>
      known.has(hash) ? `[${hash.slice(0, 7)}](${COMMIT_PREFIX}${hash})` : match,
    )
    .replace(/(?<!\/commit\/)\b([0-9a-f]{40})\b/g, (match, hash: string) =>
      known.has(hash) ? `[${hash.slice(0, 7)}](${COMMIT_PREFIX}${hash})` : match,
    )
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\s*—\s*/g, ', ')
    .replace(/\(\s+\[/g, '([')
    .replace(/\]\s+\)/g, '])')
    .replace(/\)\s+\)/g, '))')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

const ask = async (settings: Config, messages: ReadonlyArray<Message>): Promise<string> => {
  const response = await fetch(settings.url, {
    method: 'POST',
    headers: { authorization: `Bearer ${settings.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.2,
      max_tokens: 8192,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  const text = await response.text()
  if (!response.ok)
    throw new Error(`The model call failed (${response.status}): ${text.slice(0, 600)}`)
  const data = JSON.parse(text) as {
    choices?: ReadonlyArray<{ message?: { content?: string } }>
    errors?: ReadonlyArray<{ message?: string }>
  }
  const content = data.choices?.[0]?.message?.content?.trim() ?? ''
  if (content === '')
    throw new Error(
      `The model returned no text: ${JSON.stringify(data.errors ?? data).slice(0, 600)}`,
    )
  return content
}

const SYSTEM = `You write the changelog for Quorum, an incremental game about running the infrastructure of a growing startup. Players read it on the game's wiki.

Use the game's words: Company, Era, Users, Board, Design, Node, Link, Component, Request, apdex, Cash, Burn, Insight, Research, Study, Team, Feature, Rollout, Incident, SLO, Room, Seat, Challenge, Sandbox. A Room is one online Company with Seats; it is not another word for the game. CONTEXT.md holds the full vocabulary.

Write only what a player can see or feel in the game or on a wiki page they read: gameplay, balance, UI, controls, copy, and fixes. Leave out tests, refactors, formatting, dependencies, CI, tooling, protocol internals, and developer documents.

Write the entry as a Keep a Changelog list, at most 350 words. Use only these ### headings, in this order, and leave out each one with nothing under it:

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

Rules:
- Talk to the reader as "you", in the second person: "You can open the Dashboard in a Room." Never say "the player".
- Under each heading, one bullet per change, shaped like "- The Team panel now warns you when the team is too big, and its Approve button clears the block. ([abc1234](https://github.com/elianiva/quorum/commit/<full hash>))".
- Use the active voice: name the thing in the game that acts, or say what you do. Avoid weak openers such as "You can see", "You can rely on", "You can keep", and "You can receive". Avoid the passive voice too: write "Research opens as a full-height sidebar", not "has been redesigned".
- Give each bullet enough detail to stand on its own: name the panel or screen, say what it does now, and what you see or can do because of it. Two sentences and about 20 to 45 words are fine.
- State an effect in its own sentence. Do not end a bullet with an -ing clause: write "so you can find a page", not "making it easier to find a page".
- Describe what you see, not the data behind it: write "the charts fill as the Company runs", not "the Dashboard receives samples from the Room's messages".
- Write the screen, not the code. If a commit names a message, intent, event, handler, field, sample, snapshot, or schema, translate it into the panel, button, or setting you meet. Say "the Recycle workers setting", not "a RecycleChosen message".
- Use the labels on screen, such as "Dev Hours" and "Read Replica", and expand a shorthand the first time.
- Stop at the screen. Do not explain what a control sends, stores, or triggers inside the simulation.
- Keep the technical detail light. Name the thing you meet in the game, not its internals: no protocol names, library names, state machines, renderers, file paths, or code terms.
- Favor changes that alter what you can do or see. Leave out small restyles, internal fixes, and anything you would not notice. Use at most eight bullets in the whole entry.
- Put each change under one heading only. Do not list the same change twice, such as under both Deprecated and Removed.
- End each bullet with the commit that carried the change, in one parenthesis. Use only full hashes from the commits below. Put several commits in one parenthesis when they made one change.
- No other headings, no preamble, no closing summary, no emoji. Do not bold or italicise words.
- Do not state game numbers: costs, capacities, counts, sizes, rates, or durations. The catalog owns them and they change. Write "less memory", not "a fifth of the memory", and "when the team gets too big", not "eight engineers".
- No marketing words, no "not X, it is Y", no em dashes.
- Never invent behavior or hashes.

If no commit changes what a player sees or feels, reply with exactly SKIP and nothing else.`

const EDITOR = `You edit the Quorum changelog. Rewrite the entry below for a player. Keep its ### sections, its changes, and the commit link at the end of each bullet.

Rules:
- Talk to the reader as "you", in the second person.
- Use the active voice: name the thing in the game that acts, or say what you do. Cut weak openers such as "You can see", "You can rely on", "You can keep", and "You can receive". Cut the passive voice.
- Keep the detail in each bullet: name the panel or screen, say what it does now, and what you see or can do because of it. Do not turn it into a shortlist.
- Cut internal detail: no message, intent, event, handler, field, sample, snapshot, schema, protocol, library, renderer, state machine, or code name. Say what you see instead.
- Cut game numbers (costs, capacities, counts, sizes, rates, durations) and shorthands such as "DH". Use the label on screen.
- Cut a trailing -ing clause and commentary such as "This lets you see". State the effect directly if it matters.
- Keep the same ### headings and the same bullets or fewer. No preamble, no closing summary, no bold, no emoji.
- Never remove or merge a bullet, and never remove a commit link. Every bullet keeps the link at its end.
- Never invent behavior or a hash. Reply with the entry only.`

const entryFor = async (day: string, commits: ReadonlyArray<Commit>): Promise<string | null> => {
  const settings = config()
  const message = `Day: ${longDate(day)} (${day})

Commits:

${briefOf(day)}`
  const messages: Array<Message> = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: message },
  ]
  let reply = tidy(await ask(settings, messages), commits)
  if (/^skip\.?$/i.test(reply)) return null
  let problems = problemsIn(reply, commits)
  if (problems.length > 0) {
    messages.push(
      { role: 'user', content: reply },
      {
        role: 'user',
        content: `That entry cannot ship, for these reasons:\n- ${problems.join('\n- ')}\n\nWrite it again and reply with the entry only.`,
      },
    )
    reply = tidy(await ask(settings, messages), commits)
    if (/^skip\.?$/i.test(reply)) return null
    problems = problemsIn(reply, commits)
  }
  if (problems.length > 0) {
    mkdirSync(BRIEF_DIR, { recursive: true })
    writeFileSync(new URL(`${day}.rejected.md`, BRIEF_DIR), `${reply}\n`)
    throw new Error(`The entry for ${day} cannot ship: ${problems.join('; ')}`)
  }
  // The writer reads the patches and names their internals. The editor sees only the draft, so it
  // can trim the code words without learning new ones. A failed edit keeps the draft.
  const edited = tidy(
    await ask(settings, [
      { role: 'system', content: EDITOR },
      { role: 'user', content: reply },
    ]),
    commits,
  )
  const editProblems = problemsIn(edited, commits)
  if (editProblems.length === 0) return edited
  console.error(`The editor pass could not improve the entry: ${editProblems.join('; ')}`)
  return reply
}

/** Writes one day's entry, or returns null when the day has nothing to say. */
export const writeEntry = async (day: string, force = false): Promise<string | null> => {
  const target = new URL(entryName(day), ENTRY_DIR)
  if (existsSync(target) && !force) return null
  const commits = commitsOn(day)
  if (playerCommits(day).length === 0) return null
  mkdirSync(BRIEF_DIR, { recursive: true })
  writeFileSync(new URL(`${day}.txt`, BRIEF_DIR), `${briefOf(day)}\n`)
  const entry = await entryFor(day, commits)
  if (entry === null) return null
  mkdirSync(ENTRY_DIR, { recursive: true })
  writeFileSync(target, `${entry}\n`)
  return fileURLToPath(target)
}

/** Writes both pages from the entries on disk. */
export const renderPages = (): void => {
  const entries = readEntries()
  writeFileSync(RECENT_PAGE, renderRecent(entries))
  writeFileSync(ALL_PAGE, renderAll(entries))
}

const yesterday = (): string => {
  const now = new Date()
  now.setUTCDate(now.getUTCDate() - 1)
  return now.toISOString().slice(0, 10)
}

/** The day to write: the first argument, or yesterday in UTC. */
const dayArg = (value: string | undefined): string => {
  if (value === undefined) return yesterday()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`"${value}" is not a YYYY-MM-DD day`)
  return value
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command = 'render', ...args] = process.argv.slice(2)
  const rest = args.filter((arg) => arg !== '--')
  if (command === 'render') {
    renderPages()
  } else if (command === 'write') {
    const day = dayArg(rest[0])
    const written = await writeEntry(day, rest.includes('--force'))
    if (written === null) console.log(`No entry for ${day}.`)
    else {
      renderPages()
      console.log(`Wrote ${written} and rendered the changelog pages.`)
    }
  } else if (command === 'brief') {
    console.log(briefOf(dayArg(rest[0])))
  } else {
    throw new Error(`Unknown command "${command}": use render, write, or brief.`)
  }
}
