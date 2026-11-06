import { Listbox } from '@foldkit/ui'
import { Effect, Option, Schema } from 'effect'
import { Command, Update } from 'foldkit'
import { Check, ChevronDown } from 'lucide'
import { icon } from '@quorum/ui/primitives/icon'
import { defineView } from 'foldkit/submodel'
import { defineMessageUnion } from 'foldkit/message'
import { ERAS } from '@quorum/simulation/catalog'

/* The spoiler filter: the last Era the reader reached. Pages about later Eras fold. Kept in the browser. */

/** Every Era: content from any Era shows. */
export const ALL_ERAS = -1

export const Model = Schema.Struct({ era: Schema.Finite, listbox: Listbox.Model })
export type Model = typeof Model.Type

export const Message = defineMessageUnion({
  ListboxChanged: { message: Listbox.Message },
  Loaded: { era: Schema.Finite },
  Saved: {},
})
export type Message = typeof Message.Type

const KEY = 'quorum.wiki.era'

export const init: Model = { era: ALL_ERAS, listbox: Listbox.init({ id: 'era' }) }

type Choice = Readonly<{ value: string; label: string }>

/** The choices of the picker: every Era, then each Era to stop at. Values are Era indexes as text. */
const CHOICES: ReadonlyArray<Choice> = [
  { value: String(ALL_ERAS), label: 'All Eras' },
  ...ERAS.map((era, index) => ({ value: String(index), label: `Up to ${era.name}` })),
]

const eraListbox = Listbox.create<Choice, string>()

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

const foldListbox = Update.foldChild({
  update: eraListbox.update,
  read: (model: Model) => Option.some(model.listbox),
  write: (model, listbox) => ({ ...model, listbox }),
  toParentMessage: (message) => Message.ListboxChanged({ message }),
  foldOutMessage:
    ({ value }) =>
    (model) => {
      const era = Number(value)
      return { model: { ...model, era }, commands: [Save({ era })] }
    },
})

export const update = (model: Model, message: Message): Update.Return<Model, Message> =>
  Message.match<Update.Return<Model, Message>>(message, {
    ListboxChanged: ({ message }) => foldListbox(model, message),
    Loaded: ({ era }) => ({ model: { ...model, era } }),
    Saved: () => ({ model }),
  })

/** A page about `era` folds for this reader. */
export const hides = (model: Model, era: number | null): boolean =>
  era !== null && model.era !== ALL_ERAS && era > model.era

export const view = defineView<Model, Message>((model, h) =>
  h.div(
    [h.Class('hidden lg:block')],
    [
      h.submodel({
        slotId: 'era-listbox',
        model: model.listbox,
        view: eraListbox.view,
        toParentMessage: (message) => Message.ListboxChanged({ message }),
        viewInputs: {
          items: CHOICES,
          itemToValue: (choice) => choice.value,
          itemToSearchText: (choice) => choice.label,
          maybeSelectedValue: Option.some(String(model.era)),
          ariaLabel: 'Hide content after an Era',
          anchor: { placement: 'bottom-end', gap: 6, portal: true },
          buttonClassName:
            'flex h-8 min-w-36 cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
          buttonContent: h.span(
            [
              h.Title('Spoilers: hide content after the Era you reached'),
              h.Class('flex w-full items-center justify-between gap-2'),
            ],
            [
              h.span(
                [],
                [CHOICES.find((choice) => choice.value === String(model.era))?.label ?? 'All Eras'],
              ),
              icon(h, ChevronDown, 'size-4 text-muted-foreground'),
            ],
          ),
          itemsClassName:
            'z-50 min-w-44 rounded-xl border border-border bg-raised p-1 text-foreground shadow-lg outline-none',
          itemsScrollClassName: 'max-h-72 overflow-y-auto',
          backdropClassName: 'fixed inset-0 z-40',
          itemToConfig: (choice, { isActive, isSelected }) => ({
            className: `flex min-h-8 cursor-pointer items-center rounded-lg px-2.5 text-[13px] outline-none ${isActive ? 'bg-muted text-foreground' : ''}`,
            content: h.span(
              [h.Class('flex w-full items-center justify-between gap-4')],
              [
                h.span([], [choice.label]),
                h.span(
                  [h.AriaHidden(true), h.Class(isSelected ? '' : 'invisible')],
                  [icon(h, Check, 'size-4 text-primary')],
                ),
              ],
            ),
          }),
        },
      }),
    ],
  ),
)
