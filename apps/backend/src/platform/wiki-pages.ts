import sources from 'virtual:quorum-wiki'
import { wikiPages } from '@quorum/agent/wiki'

/** The wiki pages the MCP endpoint serves as resources, built once per isolate. */
export const WIKI_PAGES = wikiPages(sources)
