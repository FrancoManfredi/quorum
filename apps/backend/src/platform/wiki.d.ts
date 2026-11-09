declare module 'virtual:quorum-wiki' {
  /** The Markdown of each wiki page an agent can read, by `section/page` path. */
  const sources: Readonly<Record<string, string>>
  export default sources
}
