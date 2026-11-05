import type { Html, HtmlBuilder } from 'foldkit/html'
import { BACKEND_KINDS, KINDS, REQUEST_KINDS, type Kind } from '@quorum/simulation/catalog'
import { cn } from 'cn'

/* ==========================================================================
   A packet's shape (15 "Accessibility"): colour is not the only cue. Each
   request kind keeps its colour and takes one of four shapes, so a player who
   cannot tell the colours apart can still tell the kinds apart. Kinds that
   share a colour share a shape, so the two cues never disagree.
   ========================================================================== */

/** The four shapes, in the order the design names them. */
export const PACKET_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export type PacketShape = (typeof PACKET_SHAPES)[number]

/** Kinds in catalog order, so the shapes are stable across builds and saves. */
const KINDS_IN_ORDER: ReadonlyArray<Kind> = [...REQUEST_KINDS, ...BACKEND_KINDS]

/** Shape by kind, by the colour's place in the catalog: the 17th colour starts the shapes again. */
export const PACKET_SHAPE_OF: Readonly<Record<Kind, PacketShape>> = (() => {
  const colours = new Map<number, PacketShape>()
  const shapes: Record<string, PacketShape> = {}
  for (const kind of KINDS_IN_ORDER) {
    const colour = KINDS[kind].color
    const known = colours.get(colour)
    const shape = known ?? PACKET_SHAPES[colours.size % PACKET_SHAPES.length]!
    if (known === undefined) colours.set(colour, shape)
    shapes[kind] = shape
  }
  return shapes as Record<Kind, PacketShape>
})()

/** The shape a kind's packets are drawn in. */
export const packetShapeOf = (kind: Kind): PacketShape => PACKET_SHAPE_OF[kind]

/** A kind's colour as CSS. */
export const packetColor = (kind: Kind): string =>
  `#${KINDS[kind].color.toString(16).padStart(6, '0')}`

/**
 * The kind's mark for a legend: its shape filled in its colour, beside the kind's name.
 * Decorative, because the name it stands next to already carries the kind.
 */
export const packetMark = <M>(kind: Kind, size: number, h: HtmlBuilder<M>): Html => {
  const shape = packetShapeOf(kind)
  const box = `size-[${size}px]`
  return h.span(
    [
      h.Class(
        cn(
          'inline-block shrink-0',
          box,
          shape === 'circle' ? 'rounded-full' : '',
          shape === 'square' ? 'rounded-[1.5px]' : '',
          shape === 'triangle' ? '[clip-path:polygon(50%_0,100%_100%,0_100%)]' : '',
          shape === 'diamond' ? 'rotate-45 rounded-[1px]' : '',
        ),
      ),
      h.Style({ background: packetColor(kind) }),
      h.AriaHidden(true),
    ],
    [],
  )
}
