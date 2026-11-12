/* The wiki's fixed facts: where it lives, where the game lives, and where its source is. */

export const WIKI_ORIGIN = 'https://wiki.playquorum.dev'
export const GAME_ORIGIN = 'https://playquorum.dev'
export const REPOSITORY = 'https://github.com/elianiva/quorum'
/** The repository's public record: stars, forks, issues, license, and language. */
export const REPOSITORY_API = 'https://api.github.com/repos/elianiva/quorum'
export const KOFI = 'https://ko-fi.com/elianiva'

/** A link to a file in the repository, for "Edit on GitHub" and GDD sources. */
export const editUrl = (file: string): string => `${REPOSITORY}/edit/main/${file}`
