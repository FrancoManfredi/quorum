import { Effect, Schema } from 'effect'
import { Command, type Update } from 'foldkit'
import { defineView } from 'foldkit/submodel'
import { defineMessageUnion } from 'foldkit/message'
import { cn } from 'cn'
import { ERAS } from '@quorum/simulation/catalog'
import { FIGURE } from '@quorum/ui/game/bits'

/* The spoiler filter: the last Era the reader reached. Pages about later Eras fold. Kept in the browser. */

/** Every Era: content from any Era shows. */
export const ALL_ERAS = -1

export const Model = Schema.Struct({ era: Schema.Finite })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  Chosen: { era: Schema.Finite },
  Loaded: { era: Schema.Finite },
  Saved: {},
})
export type Message = typeof Message.Type

const KEY = 'quorum.wiki.era'

export const init: Model = { era: ALL_ERAS }

export const Load = Command.define('LoadEra', {
  messages: [Message.Loaded],
  execute: Effect.sync(() => {
    const stored = Number(globalThis.localStorage?.getItem(KEY) ?? ALL_ERAS)
    return Message.Loaded({ era: Number.isInteger(stored) ? stored : ALL_ERAS })
  }),
})

const Save = Command.define('SaveEra', {
  args: { era: Schema.Finite },
  messages: [Message.Saved],
  execute: ({ era }) =>
    Effect.sync(() => {
      globalThis.localStorage?.setItem(KEY, String(era))
      return Message.Saved()
    }),
})

export const update = (model: Model, message: Message): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    Chosen: ({ era }) => ({ model: { era }, commands: [Save({ era })] }),
    Loaded: ({ era }) => ({ model: { era } }),
    Saved: () => ({ model }),
  })

/** A page about `era` folds for this reader. */
export const hides = (model: Model, era: number | null): boolean =>
  era !== null && model.era !== ALL_ERAS && era > model.era

/** The control at the foot of the sidebar: "All", then one step per Era, filled up to the Era reached. */
export const view = defineView<Model, Message>((model, h) => {
  const all = model.era === ALL_ERAS
  const reached = all ? 'All Eras show' : `Hiding after ${ERAS[model.era]?.name ?? ''}`
  const step = 'h-7 min-w-0 flex-1 cursor-pointer rounded-md text-[12px] transition-colors'
  return h.div(
    [h.Class('border-t border-border pt-3')],
    [
      h.div(
        [h.Class('flex items-baseline justify-between gap-2')],
        [
          h.span([h.Class('text-[12px] font-semibold text-foreground')], ['Spoilers']),
          h.span([h.Class('truncate text-[12px] text-muted-foreground')], [reached]),
        ],
      ),
      h.div(
        [
          h.Role('group'),
          h.AriaLabel('Hide content after the Era you reached'),
          h.Class('mt-2 flex gap-1'),
        ],
        [
          h.button(
            [
              h.Type('button'),
              h.AriaPressed(all ? 'true' : 'false'),
              h.Title('Show every Era'),
              h.OnClick(Message.Chosen({ era: ALL_ERAS })),
              h.Class(
                cn(
                  step,
                  'max-w-9 flex-[1.4]',
                  all
                    ? 'bg-foreground font-medium text-background'
                    : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                ),
              ),
            ],
            ['All'],
          ),
          ...ERAS.map((era, index) =>
            h.button(
              [
                h.Key(era.name),
                h.Type('button'),
                h.AriaPressed(model.era === index ? 'true' : 'false'),
                h.AriaLabel(`Hide after ${era.name}`),
                h.Title(`Up to ${era.name}`),
                h.OnClick(Message.Chosen({ era: index })),
                h.Class(
                  cn(
                    step,
                    FIGURE,
                    all || index <= model.era
                      ? cn(
                          'text-foreground',
                          model.era === index
                            ? 'bg-foreground text-background'
                            : 'bg-muted hover:bg-muted/70',
                        )
                      : 'border border-dashed border-border text-muted-foreground hover:bg-muted',
                  ),
                ),
              ],
              [String(index)],
            ),
          ),
        ],
      ),
    ],
  )
})
