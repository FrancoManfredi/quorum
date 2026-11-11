import { Effect, Option, Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { pushUrl } from 'foldkit/navigation'
import { defineView } from 'foldkit/submodel'
import { defineMessageUnion } from 'foldkit/message'
import { cn } from 'cn'
import { Search as SearchIcon } from 'lucide'
import { icon } from '@quorum/ui/primitives/icon'
import { QUADRANTS } from '../components/quadrant.ts'
import { loadIndex, search, type Hit, type Index } from '../search.ts'

/* The search box in the header: the query, whether its results are open, and the index it loads
   on first use. The index is not a schema value, so it lives beside the model rather than in it. */

const INDEX_URL = '/search-index.json'

let index: Index | null = null

export const Model = Schema.Struct({
  query: Schema.String,
  open: Schema.Boolean,
  /** The result the arrow keys have reached; Enter opens it. */
  active: Schema.Finite,
  /** The index arrives once per page load, on the reader's first search. */
  status: Schema.Literals(['idle', 'loading', 'ready', 'failed'] as const),
})
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  QueryChanged: { query: Schema.String },
  Closed: {},
  Focused: {},
  Moved: { delta: Schema.Finite, count: Schema.Finite },
  Chosen: { href: Schema.String },
  IndexLoaded: {},
  IndexFailed: {},
  Settled: {},
})
export type Message = typeof Message.Type

export const init: Model = { query: '', open: false, active: 0, status: 'idle' }

const GoTo = Command.define('GoTo', {
  args: { href: Schema.String },
  messages: [Message.Settled],
  execute: ({ href }) => pushUrl(href).pipe(Effect.as(Message.Settled())),
})

const FocusSearch = Command.define('FocusSearch', {
  messages: [Message.Settled],
  execute: Effect.sync(() => {
    document.querySelector<HTMLInputElement>('#search')?.focus()
    return Message.Settled()
  }),
})

/** One fetch of the whole index, kept for the rest of the session. A failure leaves search
    unavailable rather than breaking the page. */
const LoadIndex = Command.define('LoadIndex', {
  messages: [Message.IndexLoaded, Message.IndexFailed],
  execute: Effect.promise(async () => {
    if (index !== null) return Message.IndexLoaded()
    try {
      const response = await fetch(INDEX_URL)
      if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`)
      index = loadIndex(await response.text())
      return Message.IndexLoaded()
    } catch {
      return Message.IndexFailed()
    }
  }),
})

export const update = (model: Model, message: Message): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    QueryChanged: ({ query }) => {
      const loading = query.trim() !== '' && model.status === 'idle'
      return {
        model: {
          query,
          open: query.trim() !== '',
          active: 0,
          status: loading ? 'loading' : model.status,
        },
        commands: loading ? [LoadIndex()] : [],
      }
    },
    Moved: ({ delta, count }) => ({
      model: { ...model, active: count === 0 ? 0 : (model.active + delta + count) % count },
    }),
    Chosen: ({ href }) => ({ model: { ...model, open: false }, commands: [GoTo({ href })] }),
    Closed: () => ({ model: { ...model, open: false } }),
    Focused: () => {
      const loading = model.status === 'idle' || model.status === 'failed'
      return {
        model: loading ? { ...model, status: 'loading' } : model,
        commands: loading ? [FocusSearch(), LoadIndex()] : [FocusSearch()],
      }
    },
    IndexLoaded: () => ({ model: { ...model, status: 'ready' } }),
    IndexFailed: () => ({ model: { ...model, status: 'failed' } }),
    Settled: () => ({ model }),
  })

export const view = defineView<Model, Message>((model, h) => {
  const hits = model.open && index !== null ? search(index, model.query) : []
  const hrefOf = (hit: Hit): string => (hit.heading ? `${hit.path}#${hit.heading}` : hit.path)
  const active = hits[model.active]
  const emptiness =
    model.status === 'loading'
      ? 'Searching…'
      : model.status === 'failed'
        ? 'Search is unavailable.'
        : 'No page matches.'
  return h.div(
    [h.Class('relative min-w-0 flex-1 sm:max-w-sm')],
    [
      h.label(
        [
          h.Class(
            'flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-muted-foreground transition-colors focus-within:border-foreground/30',
          ),
        ],
        [
          icon(h, SearchIcon, 'size-3.5 shrink-0'),
          h.input([
            h.Id('search'),
            h.Type('search'),
            h.Value(model.query),
            h.Placeholder('Search'),
            h.AriaLabel('Search the wiki'),
            h.Autocomplete('off'),
            h.Spellcheck(false),
            h.Class(
              'h-full min-w-0 flex-1 bg-transparent text-[16px] text-foreground sm:text-[13px] outline-none placeholder:text-muted-foreground',
            ),
            h.OnInput((query) => Message.QueryChanged({ query })),
            h.Role('combobox'),
            h.AriaExpanded(model.open),
            h.AriaControls('search-results'),
            h.AriaActiveDescendant(active ? `hit-${model.active}` : ''),
            h.OnKeyDownPreventDefault((key) => {
              if (key === 'Escape') return Option.some(Message.Closed())
              if (!model.open || hits.length === 0) return Option.none()
              if (key === 'ArrowDown')
                return Option.some(Message.Moved({ delta: 1, count: hits.length }))
              if (key === 'ArrowUp')
                return Option.some(Message.Moved({ delta: -1, count: hits.length }))
              if (key === 'Enter' && active)
                return Option.some(Message.Chosen({ href: hrefOf(active) }))
              return Option.none()
            }),
          ]),
          h.kbd(
            [
              h.Class(
                'hidden rounded border border-border px-1.5 font-mono text-[11px] leading-4 sm:block',
              ),
            ],
            ['/'],
          ),
        ],
      ),
      model.open
        ? h.div(
            [
              h.Id('search-results'),
              h.Role('listbox'),
              h.AriaLabel('Search results'),
              h.AriaBusy(model.status === 'loading'),
              h.Class(
                'fixed top-[52px] right-3 left-3 z-50 max-h-[70dvh] overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg sm:absolute sm:top-10 sm:right-0 sm:left-0 sm:max-h-none sm:overflow-hidden',
              ),
            ],
            hits.length === 0
              ? [h.p([h.Class('px-3 py-2.5 text-[13px] text-muted-foreground')], [emptiness])]
              : hits.map((hit, position) => {
                  return h.a(
                    [
                      h.Key(hit.path),
                      h.Id(`hit-${position}`),
                      h.Role('option'),
                      h.AriaSelected(position === model.active),
                      h.Href(hrefOf(hit)),
                      h.Class(
                        cn(
                          'block rounded-md px-3 py-2 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                          position === model.active && 'bg-muted',
                        ),
                      ),
                    ],
                    [
                      h.div(
                        [h.Class('flex items-baseline justify-between gap-3')],
                        [
                          h.span([h.Class('text-[14px] font-medium text-foreground')], [hit.title]),
                          h.span(
                            [h.Class('text-[12px] text-muted-foreground')],
                            [QUADRANTS[hit.section].label],
                          ),
                        ],
                      ),
                      h.p(
                        [h.Class('mt-0.5 line-clamp-1 text-[12px] text-muted-foreground')],
                        [hit.summary],
                      ),
                    ],
                  )
                }),
          )
        : h.empty,
    ],
  )
})
