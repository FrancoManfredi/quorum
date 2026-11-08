import { Schema } from 'effect'
import { defineMessageUnion } from 'foldkit/message'

/** The inline Runtime and Framework lists on an App Server, Worker, or Realtime Hub: the
 *  search query, and the row the arrow keys have reached (-1 for none). */
export const StackPicker = Schema.Struct({
  query: Schema.String,
  active: Schema.Finite,
})
export type StackPicker = typeof StackPicker.Type

export const StackPickerMessage = defineMessageUnion({
  /** The search box filters the list, which starts the arrow keys over. */
  Searched: { query: Schema.String },
  /** The arrow keys move the highlight; `count` is how many rows the search shows. */
  Moved: { delta: Schema.Finite, count: Schema.Finite },
})
export type StackPickerMessage = typeof StackPickerMessage.Type

export const initStackPicker = (): StackPicker => ({ query: '', active: -1 })

export const updateStackPicker = (picker: StackPicker, message: StackPickerMessage): StackPicker =>
  StackPickerMessage.match<StackPicker>(message, {
    Searched: ({ query }) => ({ query, active: -1 }),
    Moved: ({ delta, count }) => ({
      ...picker,
      active:
        count === 0
          ? -1
          : picker.active < 0
            ? delta > 0
              ? 0
              : count - 1
            : (picker.active + delta + count) % count,
    }),
  })
