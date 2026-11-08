import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type Commit = Readonly<{ hash: string; date: string; subject: string }>

const REPOSITORY = 'https://github.com/elianiva/quorum'
/** Days with changes that the short page shows. */
export const RECENT_DAYS = 7
/** Commits shown under a day on the short page. */
export const PER_DAY = 5

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

/** Merge commits only join branches, so the pages skip them. */
const worthListing = (commit: Commit): boolean => !commit.subject.startsWith('Merge ')

const frontmatter = (title: string, summary: string, order: number): string =>
  [
    '---',
    `title: ${title}`,
    `summary: ${summary}`,
    'section: about',
    `order: ${order}`,
    'aliases: changes, updates, release notes, patch notes, what is new',
    '---',
  ].join('\n')

const line = (commit: Commit): string =>
  `- ${commit.subject} ([${commit.hash.slice(0, 7)}](${REPOSITORY}/commit/${commit.hash}))`

const count = (n: number): string => `${n} ${n === 1 ? 'change' : 'changes'}`

const byDay = (commits: ReadonlyArray<Commit>): ReadonlyArray<readonly [string, Array<Commit>]> => {
  const days = new Map<string, Array<Commit>>()
  for (const commit of commits.filter(worthListing)) {
    const day = dayOf(commit.date)
    days.set(day, [...(days.get(day) ?? []), commit])
  }
  return [...days.entries()].sort(([a], [b]) => b.localeCompare(a))
}

/** The short page: the last few days, each cut to its first commits, and a link to the rest. */
export const renderRecent = (commits: ReadonlyArray<Commit>): string => {
  const sections = byDay(commits)
    .slice(0, RECENT_DAYS)
    .map(([day, list]) =>
      [
        `## ${longDate(day)}`,
        `${count(list.length)}.`,
        [
          ...list.slice(0, PER_DAY).map(line),
          ...(list.length > PER_DAY
            ? [`- [${list.length - PER_DAY} more](/about/changelog/all#${anchor(day)})`]
            : []),
        ].join('\n'),
      ].join('\n\n'),
    )
  const intro =
    'Quorum has no versions. It changes all the time, and this page lists the latest days, newest first, so you can see what moved since you last played. A page on this wiki can lag behind the game by a few days. Older days and every change are in the [full changelog](/about/changelog/all).'
  return `${[frontmatter('Changelog', 'What changed in Quorum over the last few days.', 3), intro, ...sections].join('\n\n')}\n`
}

/** The heading anchor of a day, as the wiki makes it from the heading text. */
const anchor = (day: string): string =>
  longDate(day)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

/** The full page: every day, every commit. */
export const renderAll = (commits: ReadonlyArray<Commit>): string => {
  const sections = byDay(commits).map(([day, list]) =>
    [`## ${longDate(day)}`, `${count(list.length)}.`, list.map(line).join('\n')].join('\n\n'),
  )
  const intro =
    'Every change to Quorum, by day, newest first. The [changelog](/about/changelog) shows only the latest days.'
  return `${[frontmatter('Full changelog', 'Every change to Quorum, by day, taken from the commits.', 4), intro, ...sections].join('\n\n')}\n`
}

const history = (): ReadonlyArray<Commit> =>
  execFileSync('git', ['log', '--format=%H%x09%aI%x09%s'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((row) => {
      const [hash = '', date = '', ...subject] = row.split('\t')
      return { hash, date, subject: subject.join('\t') }
    })

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const commits = history()
  writeFileSync(
    fileURLToPath(new URL('../content/about/changelog.md', import.meta.url)),
    renderRecent(commits),
  )
  writeFileSync(
    fileURLToPath(new URL('../content/about/changelog/all.md', import.meta.url)),
    renderAll(commits),
  )
}
