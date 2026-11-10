import type { Html, HtmlBuilder } from 'foldkit/html'
import type { Message } from '@/game/message.ts'
import type { Toast } from '@/game/model.ts'

const TOAST_MARK: Record<Toast['tone'], string> = {
  plain: 'bg-muted-foreground',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  primary: 'bg-primary-strong',
}

/**
 * One toast surface. A new message replaces the text in place and the surface morphs to fit it, so
 * a run of messages never blinks; it leaves when the last one expires. The same message twice in a
 * row keeps one line and a count, and a danger is announced at once rather than when it ends.
 *
 * `dockRows` is the open build group's row count. The phone dock grows upward to fit its list, so
 * the toast moves above that height instead of covering the first row.
 */
export const toast = (
  value: Toast | null,
  overPanel: boolean,
  dockRows: number,
  h: HtmlBuilder<Message>,
): Html =>
  value
    ? h.div(
        [
          h.Key('toast'),
          h.Role(value.tone === 'danger' ? 'alert' : 'status'),
          h.DataAttribute('morph', 'notice'),
          h.DataAttribute('exit', 'notice'),
          // A panel can fill a short screen, so the toast moves above it rather than over its actions.
          h.Class(
            `pointer-events-none fixed bottom-[176px] left-1/2 z-50 flex max-w-[calc(100%-16px)] -translate-x-1/2 justify-center rounded-xl bg-surface px-3.5 py-2.5 text-[calc(13px*var(--type-scale))] shadow-float enter-toast compact:right-[max(8px,env(safe-area-inset-right))] compact:left-[max(8px,env(safe-area-inset-left))] compact:max-w-none compact:translate-x-0 compact:justify-start ${
              dockRows > 0
                ? `compact:bottom-[calc(max(8px,env(safe-area-inset-bottom))+min(${50 * dockRows + 70}px,calc(46dvh+68px)))]`
                : 'compact:bottom-[calc(max(8px,env(safe-area-inset-bottom))+72px)]'
            } ${
              overPanel
                ? 'short:top-[max(2px,env(safe-area-inset-top))]! short:right-auto! short:bottom-auto! short:left-1/2! short:max-w-[calc(100%-16px)]! short:translate-x-[-50%]! short:justify-center!'
                : ''
            }`,
          ),
        ],
        [
          h.div(
            [
              h.Key(`toast-${value.id}`),
              h.DataAttribute('exit', 'notice'),
              h.Class('swap flex w-max max-w-full shrink-0 items-center gap-2.5'),
            ],
            [
              h.span([h.Class(`size-2 shrink-0 rounded-full ${TOAST_MARK[value.tone]}`)], []),
              value.message,
              value.count > 1
                ? h.span(
                    [
                      h.AriaLabel(String(value.count)),
                      h.Class(
                        'ml-0.5 shrink-0 font-mono text-[calc(11.5px*var(--type-scale))] text-muted-foreground',
                      ),
                    ],
                    [`×${value.count}`],
                  )
                : h.empty,
            ],
          ),
        ],
      )
    : h.empty
