/* ==========================================================================
   The English copy of the Simulation's catalog tables. `copyOf` reads the text
   out of a table by id, so English has one source and cannot drift; each
   language then writes the same shape by hand, and a missing id fails
   typecheck.
   ========================================================================== */

type Table = Readonly<Record<string, object>>
type Needed<Field extends string> = { readonly [F in Field]: string }
type Maybe<Field extends string> = { readonly [F in Field]?: string }
type Lists = Readonly<Record<string, ReadonlyArray<string>>>
type ListCopy<L extends Lists> = {
  readonly [List in keyof L]: List extends 'objectives'
    ? ReadonlyArray<{ readonly goal: string; readonly watch?: { readonly label: string } }>
    : ReadonlyArray<{ readonly [F in L[List][number]]: string }>
}
type Copy<Need extends string, May extends string, L extends Lists> = Needed<Need> &
  Maybe<May> &
  ListCopy<L>

const read = (entry: object, fields: ReadonlyArray<string>): Record<string, string> =>
  Object.fromEntries(
    fields.flatMap((field) => {
      const value = (entry as Record<string, unknown>)[field]
      return typeof value === 'string' ? [[field, value]] : []
    }),
  )

const objective = (item: object) => {
  const watch = (item as { watch?: { label?: string } }).watch
  return { ...read(item, ['goal']), ...(watch?.label ? { watch: { label: watch.label } } : {}) }
}

const entryCopy = (
  entry: object,
  needed: ReadonlyArray<string>,
  maybe: ReadonlyArray<string>,
  lists: Lists,
) => ({
  ...read(entry, [...needed, ...maybe]),
  ...Object.fromEntries(
    Object.entries(lists).map(([list, fields]) => [
      list,
      ((entry as Record<string, ReadonlyArray<object> | undefined>)[list] ?? []).map((item) =>
        list === 'objectives' ? objective(item) : read(item, fields),
      ),
    ]),
  ),
})

/** The listed text fields of every entry in a table keyed by id. */
export const copyOf = <
  T extends Table,
  Need extends string,
  May extends string,
  L extends Lists = {},
>(
  table: T,
  needed: ReadonlyArray<Need>,
  maybe: ReadonlyArray<May>,
  lists?: L,
): { readonly [Id in keyof T]: Copy<Need, May, L> } =>
  Object.fromEntries(
    Object.entries(table).map(([id, entry]) => [id, entryCopy(entry, needed, maybe, lists ?? {})]),
  ) as never

/** The same for a table kept as a list: entries are keyed by their `id` or `key`. */
export const copyOfList = <
  T extends ReadonlyArray<object>,
  Field extends string,
  Need extends string,
  May extends string,
  L extends Lists = {},
>(
  table: T,
  idField: Field,
  needed: ReadonlyArray<Need>,
  maybe: ReadonlyArray<May>,
  lists?: L,
): { readonly [Id in Extract<T[number][Field & keyof T[number]], string>]: Copy<Need, May, L> } =>
  Object.fromEntries(
    table.map((entry) => [
      (entry as Record<string, string>)[idField],
      entryCopy(entry, needed, maybe, lists ?? {}),
    ]),
  ) as never

/** The same for a table kept as a list with no ids: entries are keyed by their place. */
export const copyOfIndexed = <
  T extends ReadonlyArray<object>,
  Need extends string,
  May extends string,
>(
  table: T,
  needed: ReadonlyArray<Need>,
  maybe: ReadonlyArray<May>,
): ReadonlyArray<Copy<Need, May, {}>> =>
  table.map((entry) => entryCopy(entry, needed, maybe, {})) as never
