import * as Effect from 'effect/Effect'
import * as Queue from 'effect/Queue'
import * as Stream from 'effect/Stream'
import { Mount } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { attachBoard } from '@quorum/ui/board/board'
import { copy } from '@/i18n/messages.ts'
import { Message } from './message.ts'
import { play } from './sound.ts'
import { hideCursor, sendCursor } from '@/platform/room-socket.ts'

type BoardMessage =
  | ReturnType<typeof Message.NodeTapped>
  | ReturnType<typeof Message.NodeMoved>
  | ReturnType<typeof Message.LinkRequested>
  | ReturnType<typeof Message.LinkCut>
  | ReturnType<typeof Message.NodePlaced>
  | ReturnType<typeof Message.EmptyTapped>
  | ReturnType<typeof Message.FooterPressed>
  | ReturnType<typeof Message.NodeToggled>
  | ReturnType<typeof Message.SelectionBoxed>

const BoardMounted = Mount.defineStream('BoardMounted', {
  args: {},
  messages: [
    Message.NodeTapped,
    Message.NodeMoved,
    Message.LinkRequested,
    Message.LinkCut,
    Message.NodePlaced,
    Message.EmptyTapped,
    Message.FooterPressed,
    Message.NodeToggled,
    Message.SelectionBoxed,
  ],
  execute: ({ element }) =>
    Stream.callback<BoardMessage>((queue) =>
      Effect.gen(function* () {
        const offer = (message: BoardMessage) => Queue.offerUnsafe(queue, message)
        yield* Effect.acquireRelease(
          Effect.sync(() =>
            attachBoard('board', element as HTMLElement, {
              onNodeTap: (nodeId) => offer(Message.NodeTapped({ nodeId })),
              onNodeMove: (nodeId, x, y) => offer(Message.NodeMoved({ nodeId, x, y })),
              onFooter: (nodeId) => offer(Message.FooterPressed({ nodeId })),
              onLink: (from, to) => offer(Message.LinkRequested({ from, to })),
              onUnlink: (from, to) => offer(Message.LinkCut({ from, to })),
              onPlace: (x, y) => offer(Message.NodePlaced({ x, y })),
              onEmptyTap: () => offer(Message.EmptyTapped()),
              onNodeToggle: (nodeId) => offer(Message.NodeToggled({ nodeId })),
              onBox: (ids, mode) => offer(Message.SelectionBoxed({ ids: [...ids], mode })),
              // Presence, not a Message: 25 frames a second never repaints the Board.
              onCursor: sendCursor,
              onCursorGone: hideCursor,
              onSound: play,
            }),
          ),
          (detach) => Effect.sync(detach),
        )
        return yield* Effect.never
      }),
    ),
})

export const boardHost = (h: HtmlBuilder<Message>): Html => {
  const t = copy(h)
  return h.div(
    [h.Key('board'), h.Class('absolute inset-0 bg-canvas'), h.OnMount(BoardMounted({}))],
    [
      h.div(
        [h.Class('board-unavailable'), h.Role('status')],
        [
          h.p([h.Class('board-unavailable-webgl')], [t.panels.webglUnavailable]),
          h.a(
            [
              h.Class('board-unavailable-webgl'),
              h.Href('https://get.webgl.org'),
              h.Target('_blank'),
              h.Rel('noreferrer noopener'),
            ],
            [t.panels.webglHelp],
          ),
          h.p([h.Class('board-unavailable-error')], [t.panels.boardFailed]),
        ],
      ),
    ],
  )
}
