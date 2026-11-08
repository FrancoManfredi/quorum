# Full-text search for the wiki

Researched 2026-11-08 against primary documentation and a measured build of this checkout. Every
number below is a cost in the reader's browser, because the wiki is prerendered and has no API
([ADR 0009](../adr/0009-the-wiki-is-a-prerendered-app.md)).

The recommendation is **MiniSearch**, with an index built at build time and fetched when the reader
opens search. Pagefind is the runner-up: it wins on excerpts and loses on aliases, ranking, and
typo tolerance. A server-side index is not worth an API for 713 pages.

## What the wiki has

| Fact                   | Value                                | Source                                              |
| ---------------------- | ------------------------------------ | --------------------------------------------------- |
| Pages                  | 713                                  | HTML files after `pnpm --filter @quorum/wiki build` |
| Reference pages        | 523 of 713                           | `PAGES` grouped by section                          |
| Body text in the index | 117,000 words                        | `page.text` over `PAGES`                            |
| Unique terms           | 9,354                                | Pagefind build report                               |
| Aliases                | 2,608 on 691 pages                   | `page.aliases`                                      |
| Current index          | 919 KB in memory, built at page load | `indexOf(PAGES)` before this change                 |
| Search index now       | 1.1 MB, 256 KB gzip, 188 KB brotli   | `dist/client/search-index.json`                     |
| App chunk              | 4.2 MB raw, 772 KB brotli            | `dist/client/assets/app-*.js`                       |
| A typical page         | 47 KB HTML, 9.5 KB brotli            | `/components/lb/`                                   |
| Current query time     | 1.0 to 1.7 ms                        | 50 runs per query over 713 pages                    |

`indexOf(PAGES)` ran at module scope in `src/components/header.ts`, so every reader built the index
at page load. The page text is in the app chunk either way, because client-side navigation needs
every page body; the old index cost startup work and memory, not extra bytes. Query speed was never
the problem: a linear scan of 713 pages takes about a millisecond.

The alias count is the important number. Readers arrive with "lb", "k8s", "p99", or a glossary term,
not with a full page title, and 691 pages define those alternate names.

## What docs sites use now

| Site or framework   | Search                                                                       | Source                               |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| Astro Starlight     | Pagefind, built in, no configuration                                         | [S1]                                 |
| Nextra 4            | Pagefind, built in (migrated from FlexSearch)                                | [N1, N2]                             |
| Bun docs            | Pagefind                                                                     | `bun.com/docs` markup                |
| VitePress           | MiniSearch in the browser, `fuzzy: 0.2`, `prefix: true`, boosted fields      | [V1]                                 |
| Docusaurus          | Algolia DocSearch is the official option; local search is a community plugin | [D1]                                 |
| MkDocs and Material | lunr.js, built in                                                            | [K1]                                 |
| Hugo                | No built-in search; themes wire Fuse.js or Pagefind                          | [H1]                                 |
| Tailwind CSS docs   | Algolia DocSearch                                                            | `tailwindcss.com` markup             |
| Cloudflare docs     | Cloudflare AI Search                                                         | `developers.cloudflare.com` requests |

Two patterns. A prerendered site runs a static index in the browser, and the default engines are
Pagefind (Starlight, Nextra, Bun) or MiniSearch (VitePress). A site with many properties or a search
team sends queries to a hosted service. The hosted services charge per query, need an account, or
both, and a single wiki does not need one.

## Options measured on this wiki

Each option was built from the same 713 pages on this checkout.

| Option               | Index on disk                  | Transferred on the first search | Typo tolerance         | Excerpts        | Heading anchors |
| -------------------- | ------------------------------ | ------------------------------- | ---------------------- | --------------- | --------------- |
| Current scorer       | None, built at page load       | 0 extra bytes                   | None                   | No              | Sometimes       |
| MiniSearch, all text | 1.1 MB, 188 KB brotli          | 188 KB brotli                   | Edit distance, `fuzzy` | No              | Own logic       |
| Pagefind 1.6         | 736 KB index, 3.0 MB fragments | 162 KB compressed               | None                   | Yes, with marks | Yes, automatic  |

Pagefind splits its index into 24 chunks and fetches only the chunks a query needs. A first query for
"retry storm" fetched 235 KB raw: `pagefind.js`, its worker, the WebAssembly module, the metadata
file, two index chunks, and eight fragments. The WebAssembly module, index chunks, and fragments are
stored gzip-compressed, so the real transfer is about 162 KB. Later queries load the index chunks
their terms hash to, and the fragments for the results they show.

MiniSearch builds in 152 ms and answers in 0.1 to 2.4 ms. Pagefind indexes the same corpus in 1.1 s.
Both are fast enough that the build step does not matter. The file is 1.1 MB rather than the 933 KB
of the prototype because the built index also stores each result's heading ids and text, so a hit
can link to its section.

## Ranking on this corpus

MiniSearch ran with title 6, alias 5, heading 3, summary 2, body 1, `fuzzy: 0.2`, and prefix
matching [M2]. Pagefind ran with tuned metadata weights (`title: 10`, `aliases: 8`) and a lower
`pageLength`, which beat its defaults. Neither was tuned per query.

| Query                | Current scorer                | Pagefind (tuned)           | MiniSearch                    |
| -------------------- | ----------------------------- | -------------------------- | ----------------------------- |
| `lb`                 | Load Balancer                 | L4 load balancing          | Load Balancer                 |
| `grafana`            | 12. Observability and Insight | Annotation                 | 12. Observability and Insight |
| `postgres`           | The data tier                 | Read Replica               | Database                      |
| `willingness to pay` | Nothing                       | 18. Mail                   | Payments                      |
| `kubernets`          | Nothing                       | Kubernetes Cluster         | Kubernetes Cluster            |
| `autoscalr`          | Nothing                       | Autoscale the compute tier | Autoscaler                    |
| `prestij`            | Nothing                       | 117 prefix matches         | Nothing                       |

Pagefind's ranking prefers short pages. With 523 reference pages, most of them short, glossary and
research stubs outrank the component or guide page a reader wants. `lb` is the clearest case: the
field aliases are invisible to Pagefind, so the two words inside the Load Balancer page carry the
same weight as the same letters inside "L4 load balancing". Adding the aliases as
`data-pagefind-meta` and rebuilding moved the Load Balancer page to third, not first.

Pagefind has no typo tolerance. A transposition ("auotsclaer") and a dropped letter ("obsevability")
return nothing, and a misspelt prefix ("prestij") returns 117 pages that match "pre". The maintainer
closed the fuzzy search request as a duplicate and calls edit distance hard to add to a
bandwidth-restricted index [P8]. Prefix matching still covers a dropped suffix, so "kubernets" and
"autoscalr" find their pages.

## Why not a server

| Option                     | Why it does not fit here                                                                                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 with FTS5               | FTS5 is supported [C1], but the wiki would gain a Worker route and a deploy step that writes the index, against ADR 0009. `d1 export` also refuses databases with virtual tables [C2].                                                                                      |
| Durable Object with SQLite | FTS5 is supported [C3], but it adds a stateful primitive and pins a small index to one location.                                                                                                                                                                            |
| Cloudflare AI Search       | Crawls the deployed site and returns chunks, not ranked snippets with anchors. Included usage is 1,000 full-text and 1,000 semantic queries a month, then $0.10 and $0.75 per 1,000 [C4]. Billing starts 2026-12-01 per the pricing page; the release note says 2026-11-01. |
| Algolia DocSearch          | Free for public developer documentation and technical blogs, with the "Search by Algolia" logo and automatic DocSearchMCP enrollment [A1]. A game wiki is a weak fit for the program.                                                                                       |
| Typesense and Meilisearch  | A cluster or container from about $20 to $30 per month to serve 700 pages that fit in 200 KB [T1, T2].                                                                                                                                                                      |
| Orama                      | Has typo tolerance and stemming, but the open-source library releases slowly and the company now sells an enterprise AI platform rather than a docs search service [O1].                                                                                                    |

## Recommendation

Use MiniSearch 7.2.0 [M1]. It reads the page model the wiki already has, ranks aliases and headings
as fields, and fetches its index once for the readers who search.

1. Build the index in the existing post-build step (`staticFiles` in `apps/wiki/vite.config.ts`) and
   write `search-index.json` beside the pages. `JSON.stringify` calls MiniSearch's `toJSON`.
2. Index five fields: `title`, `aliases`, `headings`, `summary`, `text`, with the boosts above.
   Tokenize on lowercase `[a-z0-9]+`, so "p99" stays one token and "l4-lb" indexes as "l4" and
   "lb".
3. Load the file on the first focus of the search box, keep it beside the model, and keep the
   existing keyboard handling in `src/submodels/search.ts`. Nothing loads for a reader who does not
   search.
4. Keep the heading anchor behavior: after a page result, pick the matching heading and link to
   `#id`.
5. In development, build the same index from `PAGES` in a Vite middleware, so `vite dev` has search
   without a build.

After this lands, send the query and the zero-result flag to PostHog, which the wiki already loads,
so ranking comes from real misses rather than guesses.

If highlighted excerpts matter more than ranking, choose Pagefind instead: add `data-pagefind-body`
to the article and `data-pagefind-meta="aliases"` to its header, run its Node API in the same
post-build step, and query it from the current search box. That is less client code, and the wiki
loses alias ranking and typo tolerance.

Dropping the body text from the index halved the file in the prototype (85 KB brotli), but it loses
body-only terms such as "grafana". Try it only after aliases and headings carry most queries.

## Sources

- [P1] Pagefind, indexing configuration and `data-pagefind-body`: <https://pagefind.app/docs/indexing>
- [P2] Pagefind, sub-results from heading ids: <https://pagefind.app/docs/sub-results>
- [P3] Pagefind, ranking parameters and metadata weights: <https://pagefind.app/docs/ranking>
- [P4] Pagefind, metadata fields: <https://pagefind.app/docs/metadata>
- [P5] Pagefind 1.6.0, MIT, published 2026-11-01: <https://registry.npmjs.org/pagefind>
- [P6] Pagefind 1.5.0 release notes, search worker, relevance, diacritics, CJK: <https://github.com/Pagefind/pagefind/discussions/1095>
- [P8] Pagefind issue 756, fuzzy search closed as duplicate: <https://github.com/Pagefind/pagefind/issues/756>
- [M1] MiniSearch 7.2.0, MIT: <https://registry.npmjs.org/minisearch>
- [M2] MiniSearch options, fuzzy, prefix, boosts, `processTerm`: <https://github.com/lucaong/minisearch>
- [V1] VitePress search, MiniSearch defaults: <https://vitepress.dev/reference/default-theme-search>
- [S1] Starlight site search, Pagefind by default: <https://starlight.astro.build/guides/site-search/>
- [N1] Nextra search, Pagefind: <https://nextra.site/docs/built-ins/search>
- [N2] Nextra 4 migration from FlexSearch to Pagefind: <https://the-guild.dev/blog/nextra-4>
- [D1] Docusaurus search, DocSearch is official: <https://docusaurus.io/docs/search>
- [K1] Material for MkDocs search, lunr.js: <https://squidfunk.github.io/mkdocs-material/plugins/search/>
- [H1] Hugo search tools, no built-in search: <https://gohugo.io/tools/search/>
- [A1] Algolia DocSearch program, terms and DocSearchMCP: <https://docsearch.algolia.com/docs/docsearch-program>, <https://www.algolia.com/policies/docsearch-plan-specific-terms>
- [O1] Orama releases and pricing: <https://github.com/oramasearch/orama/releases>, <https://www.orama.com/pricing>
- [C1] Cloudflare D1, FTS5 support: <https://developers.cloudflare.com/d1/best-practices/import-export-data/>
- [C2] Cloudflare D1, export does not support virtual tables: same page as C1
- [C3] Cloudflare Durable Objects, SQLite FTS5: <https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/>
- [C4] Cloudflare AI Search, limits and pricing: <https://developers.cloudflare.com/ai-search/platform/limits-pricing/>
- [C5] Cloudflare AI Search, release note with the earlier billing date: <https://developers.cloudflare.com/ai-search/platform/release-note/>
- [T1] Typesense Cloud pricing: <https://cloud.typesense.org/pricing>
- [T2] Meilisearch pricing: <https://www.meilisearch.com/pricing>

Measurements ran on Node 26 with the built site served from a local static server, and queries ran
in Chromium through `agent-browser`. Page load sizes come from `node:zlib` at default settings, so
they approximate what Cloudflare serves.
