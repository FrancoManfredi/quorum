import { Option } from 'effect'
import type { Combobox } from '@foldkit/ui'
import { childAttributes, type Html, type HtmlBuilder } from 'foldkit/html'
import { Check, ChevronDown, Lock } from 'lucide'
import {
  FRAMEWORKS,
  FRAMEWORK_IDS,
  LANGUAGES,
  RUNTIMES,
  RUNTIME_IDS,
  type RuntimeId,
} from '@quorum/simulation/catalog'
import { frameworkReady, runtimeReady } from '@quorum/simulation/lookups'
import type { GameNode } from '@quorum/simulation/state'
import { copy, type Messages } from '@/i18n/messages.ts'
import { Message } from '@/game/message.ts'
import type { Model } from '@/game/model.ts'
import { frameworkPicker, runtimePicker } from '@/game/stack-picker.ts'
import { icon } from '@quorum/ui/primitives/icon'
import { stackLogo } from '@quorum/ui/game/bits'
import { cn } from '@/lib/utils'

/** Accept unaccented keyboard input as well as the spelling shown in the list. */
const searchable = (text: string): string =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

type PickerConfig<Item extends string> = Readonly<{
  bundle: Combobox.Bundle<Item>
  picker: Combobox.Model
  slotId: string
  toParentMessage: (message: Combobox.Message) => Message
  current: Item
  currentLabel: string
  items: ReadonlyArray<Item>
  labelOf: (item: Item) => string
  searchOf: (item: Item) => string
  logoOf: (item: Item) => Html | null
  isReady: (item: Item) => boolean
  lockHintOf: (item: Item) => string
  proposed: Item | null
  /** Hovering a ready option previews it on a Tradeoff card. */
  previewOf: ((item: Item) => Message) | null
  t: Messages
  ariaLabel: string
}>

const pickerView = <Item extends string>(
  config: PickerConfig<Item>,
  h: HtmlBuilder<Message>,
): Html => {
  const query = config.picker.isOpen ? config.picker.inputValue.trim() : ''
  const visible =
    query === ''
      ? config.items
      : config.items.filter((item) => searchable(config.searchOf(item)).includes(searchable(query)))
  const logo = config.logoOf(config.current)
  return h.div(
    [h.Class('flex w-full flex-col gap-1')],
    [
      h.div(
        [h.Class('relative w-full')],
        [
          logo
            ? h.span(
                [h.Class('pointer-events-none absolute top-1/2 left-2.5 z-10 -translate-y-1/2')],
                [logo],
              )
            : h.empty,
          h.submodel({
            slotId: config.slotId,
            model: config.picker.isOpen ? config.picker : { ...config.picker, inputValue: '' },
            view: config.bundle.view,
            toParentMessage: config.toParentMessage,
            viewInputs: {
              items: visible,
              restingInputValue: config.currentLabel,
              maybeSelectedValue: Option.some(config.current),
              itemToValue: (item) => item,
              itemToDisplayText: (item) => config.labelOf(item),
              itemToConfig: (item, { isActive, isDisabled, isSelected }) => {
                const itemLogo = config.logoOf(item)
                return {
                  className: cn(
                    'flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[calc(12px*var(--type-scale))] outline-none',
                    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground',
                    isDisabled &&
                      'cursor-not-allowed text-muted-foreground/45 [&_svg]:opacity-45 [&_svg]:grayscale',
                  ),
                  content: h.div(
                    [
                      h.Class('flex w-full min-w-0 items-center gap-2'),
                      ...(isDisabled ? [h.Title(config.lockHintOf(item))] : []),
                      ...(config.previewOf && !isDisabled && !isSelected
                        ? [
                            h.OnMouseEnter(config.previewOf(item)),
                            h.OnMouseLeave(Message.OptionLeft()),
                          ]
                        : []),
                    ],
                    [
                      ...(itemLogo ? [itemLogo] : []),
                      h.span([h.Class('min-w-0 flex-1 truncate')], [config.labelOf(item)]),
                      config.proposed === item
                        ? h.span(
                            [h.Class('text-[calc(10px*var(--type-scale))] text-group-compute')],
                            [config.t.inspectorShared.proposed],
                          )
                        : h.empty,
                      isSelected ? icon(h, Check, 'size-3.5 text-primary') : h.empty,
                      isDisabled ? icon(h, Lock, 'size-3 text-muted-foreground/45') : h.empty,
                    ],
                  ),
                }
              },
              isItemDisabled: (item) => !config.isReady(item),
              inputPlaceholder: config.picker.isOpen
                ? config.t.inspectorShared.searchPlaceholder
                : config.currentLabel,
              ariaLabel: config.ariaLabel,
              inputClassName: cn(
                'h-8 w-full rounded-lg bg-well pr-8 text-[calc(12px*var(--type-scale))] font-medium text-foreground shadow-well outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                config.picker.isOpen
                  ? 'placeholder:text-muted-foreground'
                  : 'placeholder:text-foreground',
                logo ? 'pl-8' : 'pl-2.5',
              ),
              inputWrapperClassName: 'relative w-full',
              className: 'relative w-full',
              buttonContent: icon(h, ChevronDown, 'size-3.5 text-muted-foreground'),
              buttonClassName:
                'absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground outline-none',
              buttonAttributes: childAttributes([h.AriaLabel(config.ariaLabel)]),
              itemsClassName:
                'z-50 w-[var(--button-width)] rounded-xl border border-border bg-raised p-1 text-foreground shadow-lg outline-none',
              itemsScrollClassName: 'max-h-64 overflow-y-auto',
              backdropClassName: 'fixed inset-0 z-40',
              anchor: { placement: 'bottom-start', gap: 4, portal: true },
              openOnFocus: true,
            },
          }),
        ],
      ),
      config.picker.isOpen && visible.length === 0
        ? h.p(
            [h.Class('px-0.5 text-[calc(11px*var(--type-scale))] text-muted-foreground')],
            [config.t.inspectorShared.noMatches],
          )
        : h.empty,
    ],
  )
}

/** The Runtime on an App Server, Worker or Realtime Hub. */
export const runtimePickerView = (
  model: Model,
  node: GameNode,
  h: HtmlBuilder<Message>,
  proposed: RuntimeId | null,
  preview = true,
): Html => {
  const t = copy(h)
  const game = model.board.game
  return pickerView(
    {
      bundle: runtimePicker,
      picker: model.runtimePicker,
      slotId: 'stack-runtime',
      toParentMessage: (message) => Message.RuntimePickerChanged({ message }),
      current: node.runtime,
      currentLabel: t.catalog.runtimes[node.runtime].name,
      items: RUNTIME_IDS,
      labelOf: (id) => t.catalog.runtimes[id].name,
      searchOf: (id) =>
        [
          t.catalog.runtimes[id].name,
          RUNTIMES[id].name,
          LANGUAGES[RUNTIMES[id].language].name,
        ].join(' '),
      logoOf: (id) => stackLogo(RUNTIMES[id].language, 'size-4', h),
      isReady: (id) => runtimeReady(game, id),
      lockHintOf: (id) => t.inspectorShared.researchToUnlock(t.catalog.runtimes[id].name),
      proposed,
      previewOf: preview
        ? (id) => Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'runtime', id } })
        : null,
      t,
      ariaLabel: t.inspectorShared.runtime,
    },
    h,
  )
}

/** The Framework on an App Server or Worker, limited to the Runtime's language. */
export const frameworkPickerView = (
  model: Model,
  node: GameNode,
  h: HtmlBuilder<Message>,
): Html => {
  const t = copy(h)
  const game = model.board.game
  const runtime = RUNTIMES[node.runtime]
  const items = FRAMEWORK_IDS.filter(
    (id) => id === 'none' || FRAMEWORKS[id].language === runtime.language,
  )
  return pickerView(
    {
      bundle: frameworkPicker,
      picker: model.frameworkPicker,
      slotId: 'stack-framework',
      toParentMessage: (message) => Message.FrameworkPickerChanged({ message }),
      current: node.framework,
      currentLabel: t.catalog.frameworks[node.framework].name,
      items,
      labelOf: (id) => t.catalog.frameworks[id].name,
      searchOf: (id) => `${t.catalog.frameworks[id].name} ${FRAMEWORKS[id].name}`,
      logoOf: (id) => (id === 'none' ? null : stackLogo(id, 'size-4', h)),
      isReady: (id) => frameworkReady(game, id),
      lockHintOf: (id) => t.inspectorShared.researchToUnlock(t.catalog.frameworks[id].name),
      proposed: null,
      previewOf: (id) =>
        Message.OptionPreviewed({ nodeId: node.id, option: { kind: 'framework', id } }),
      t,
      ariaLabel: t.inspectorShared.framework,
    },
    h,
  )
}
