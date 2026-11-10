import { Application, Container, Graphics, Point, type RendererPreference } from 'pixi.js'
import { COMPONENTS, KINDS, type ComponentId } from '@quorum/simulation/catalog'
import { has, replicationPairsOf, zoned, zoneMs } from '@quorum/simulation/lookups'
import { type Game, type GameNode } from '@quorum/simulation/state'
import { type SeatActivity } from '@quorum/simulation/room'
import {
  CARD_W,
  HEAD,
  PORT_R,
  boxOf,
  freeSpot,
  heightOf,
  inPort,
  layoutOf,
  outPort,
  route,
  type Box,
  type Pt,
  type Route,
} from './geometry.ts'
import { compute } from './compute.ts'
import { flowMarks, placeLabel } from './flows.ts'
import { CHIP_NONE, chipAt, rowsAt } from './lod.ts'
import { type RoutedLink, type RoutedNode, type Wire } from './routing.ts'
import { footerOf } from './card.ts'
import { COMPONENT_ICONS } from '../game/icons.ts'
import { packetShapeOf } from '../game/packets.ts'
import { CursorOverlay, type SeatCursor } from './cursors.ts'
import { type BoardEvents, type BoardState } from './types.ts'
import { type Palette, palette, mix } from './palette.ts'
import { silhouette, badgeGlyph } from './shapes.ts'
import {
  easeOut,
  DRAW_IN_S,
  GLOW_S,
  CUT_S,
  RETRACT_S,
  CURSOR_MS,
  reducedMotion,
  follow,
} from './motion.ts'
import { glyph, paint } from './glyphs.ts'
import {
  footerRect,
  BADGE_X,
  BADGE_Y,
  BADGE_R,
  TITLE_X,
  medallion,
  headerBand,
} from './card-parts.ts'
import {
  lengthOf,
  pointOn,
  distanceTo,
  laneUnder,
  routeOf,
  SLACK,
  bent,
  midOf,
  partOf,
  traceOf,
  dashed,
} from './paths.ts'
import { BELT, SPLITTER_W, beltSpeed, arrowAt, pointAndDirection } from './marks.ts'
import { SANS, label } from './text.ts'
import { MIN_FIT_SCALE, MIN_FIT_SCALE_PHONE, NodeView } from './node-view.ts'
import {
  DIM,
  QUIET,
  CHEVRON_SCALE,
  PLACE_LIFT,
  BeltView,
  type Mouth,
  mouthsOf,
  portalsOf,
} from './belt-view.ts'
import { ChevronLayer, PacketLayer, particleColor, NoteLayer } from './layers.ts'

type Mutable<T> = { -readonly [K in keyof T]: T[K] }

/** The phone: narrow in portrait, short in landscape (the `compact` variant in theme.css). */
const isPhone = (): boolean => matchMedia('(max-width: 639px), (max-height: 499px)').matches

const inFooter = (node: GameNode, point: Pt): boolean => {
  if (!layoutOf(node.type).footer) return false
  const rect = footerRect(node.type)
  const x = point.x - node.x
  const y = point.y - node.y
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
}

/** Buying a size is held, not clicked: the fill crosses the button, and the buy lands at the end. */

/** The footer buys a size, so it asks to be held. */
const holds = (game: Game, node: GameNode): boolean => {
  const footer = footerOf(game, node)
  return !!footer && footer.enabled && (footer.glyph === 'resize' || footer.glyph === 'more')
}

type Gesture =
  /** `cut` is the link under a finger that went down on it: a tap cuts it, a drag only pans. */
  | {
      kind: 'pan'
      x: number
      y: number
      moved: boolean
      cut: Readonly<{ from: string; to: string }> | null
    }
  | {
      kind: 'node'
      id: string
      dx: number
      dy: number
      x: number
      y: number
      moved: boolean
      /** Grabbed by the selection frame, not by a card: a tap changes nothing. */
      frame?: boolean
    }
  | { kind: 'link'; from: string; at: Pt }
  | { kind: 'box'; from: Pt; at: Pt }
  | null

export class BoardController {
  private readonly app = new Application()
  private readonly world = new Container()
  /**
   * The belts, one BeltView per link in the Model's order, under the splitters. Each
   * belt draws in three shared layers, so a busy Design draws in a few batches, not
   * a few per link: bodies, then the moving chevrons in a render group of their own
   * (they change every frame, the rest does not), then the mouths.
   */
  private readonly wires = new Container()
  private readonly bodies = new Container()
  private readonly chevrons = new ChevronLayer()
  private readonly mouths = new Container()
  private readonly belts = new Map<string, BeltView>()
  private beltLinks: ReadonlyArray<unknown> = []
  private beltOrder = ''
  private readonly splitters = new Graphics()
  private splittersKey = ''
  /** The tunnel portals, redrawn only when a mouth moves or the focus changes. */
  private readonly portals = new Graphics()
  /** The mouths the portals were last drawn for, and the colour they were drawn in. */
  private mouthsDrawn: ReadonlyArray<Mouth> = []
  private portalInk = -1
  private readonly packets = new PacketLayer()
  /** The still arrows reduced motion shows in place of the packets. */
  private readonly arrows = new Graphics()
  /** The rate labels on still belts: reduced motion's stand-in for moving packets. */
  private readonly notes = new NoteLayer()
  /** The round trip a link between regions pays, under its belt. */
  private readonly places = new NoteLayer()
  private readonly cards = new Container()
  /** The boxes drawn around Nodes, under the belts, and their names. */
  private readonly boxLayer = new Container()
  private readonly boxes = new Graphics()
  /** Replication copies, drawn as dashed lines and never as Links. */
  private readonly replication = new Graphics()
  private readonly boxNames = new Container()
  private boxesKey = ''
  private replicationKey = ''
  private readonly overlay = new Graphics()
  private readonly ghost = new Container()
  private readonly views = new Map<string, NodeView>()
  /** The Nodes as they are drawn this frame, and the views that follow their cards. */
  private readonly shownCards = new Map<string, GameNode>()
  private readonly drawnCards = new Map<string, { source: GameNode; drawn: Mutable<GameNode> }>()
  /** Cards fading out after their Node left the Design. */
  private leaving: Array<NodeView> = []
  /** False until the first sync, so a loaded board does not animate in. */
  private seeded = false
  /** The Node whose card button is held down. */
  private pressed: string | null = null
  /** When the held footer button went down, in ms. */
  private holdSince = 0
  /** The Node whose footer bought once and stays down, so the host repeats it. */
  private holding: string | null = null
  private state: BoardState | null = null
  private gesture: Gesture = null
  private hoverLink: Readonly<{ from: string; to: string }> | null = null
  /** The link a click picked: Delete or its × badge cuts it. A click never cuts by itself. */
  private selectedLink: Readonly<{ from: string; to: string }> | null = null
  /** The Node under the pointer: with the selected one, it lights its whole path. */
  private hoverNode: string | null = null
  private pointer: Pt = { x: 0, y: 0 }
  /** Fingers and pens on the board, in client coordinates. Two of them pinch. */
  private readonly touches = new Map<number, Pt>()
  private pinch: Readonly<{ distance: number; center: Pt }> | null = null
  /** The last pointer to move was a finger or a pen, which has no hover and a wide tip. */
  private coarse = false
  /** Local positions while a node is dragged, ahead of the Model. */
  private dragged: Readonly<{ id: string; x: number; y: number }> | null = null
  private droppedAt = 0
  /** Where the held card, new Node or Playbook lands: the nearest spot that keeps clear. */
  private landing: Pt | null = null
  private landingKey = ''
  /** Routed links, the Nodes where they were routed, and the layout key asked for last. */
  private routed = new Map<string, Wire>()
  private routedNodes = new Map<string, Pt>()
  private routedFor = ''
  /** The Game and drag the routes were last checked against. */
  private routedGame: Game | null = null
  private routedDrag: BoardController['dragged'] = null
  /** The layout to route next, the one routed last, and whether the worker has one. */
  private routeWanted: Readonly<{
    key: string
    nodes: Array<RoutedNode>
    links: Array<RoutedLink>
  }> | null = null
  private routeDone = ''
  private routing = false
  /**
   * While a held card sits on another card, its links run to the spot where it
   * will land, and they stay there while the dropped card glides into it.
   */
  private heldLanding: Map<string, Pt> | null = null
  private ghostType: ComponentId | null = null
  private ghostLocale = 'en'
  /** The drawn end of a wire being pulled. It eases onto a port it snaps to. */
  private wireEnd: Pt | null = null
  /** The Node a pulled wire is snapped to, and how far its highlight has come in. */
  private snapTo: string | null = null
  private snapGlow = 0
  /** A wire let go over nothing, drawing back into its port. */
  private retract: { path: Route; t: number } | null = null
  /** Links that just arrived, by key, with their age in seconds. */
  private readonly fresh = new Map<string, number>()
  /** The link the last wire drag asked for: it is already drawn, so it does not draw in. */
  private wired: string | null = null
  /** Links that just left, fading where they were. */
  private cuts: Array<{ path: Route; t: number }> = []
  private readonly abort = new AbortController()
  /** The other Seats' pointers, drawn over the Board. */
  private readonly cursorLayer = new CursorOverlay()
  /** A pointer position waiting to go out, and when the last one went. */
  private cursorWaiting = false
  private cursorSentAt = 0
  /** The panel this Seat is in, sent with its last position so the pointer stays put. */
  private activity: SeatActivity | null = null
  /** Whether the pointer has been on the Board, so there is a spot to keep. */
  private pointerKnown = false
  /** Whether the pointer is over the Board now. */
  private over = false
  /** Writes an activity key in this Board's language. */
  private activityOf: (activity: SeatActivity) => string = (activity) => activity
  private readonly resize: ResizeObserver
  /** Watches whether the board is on screen: a board scrolled out of view draws nothing. */
  private readonly sight: IntersectionObserver
  private onScreen = true
  private phase = 0
  private started = false
  private fitted = false
  /** The host width the view was fitted to: a wider or narrower screen refits, a taller one does not. */
  private fittedWidth: number | null = null
  private destroyed = false

  constructor(
    private readonly host: HTMLElement,
    private readonly events: BoardEvents,
  ) {
    this.resize = new ResizeObserver(() => this.onResize())
    this.sight = new IntersectionObserver((entries) => {
      const entry = entries.at(-1)
      if (!entry) return
      this.onScreen = entry.isIntersecting
      if (this.started) this.run()
    })
  }

  /** Draws while the board is on screen and not suspended. */
  private run(): void {
    if (this.onScreen && !this.state?.suspended) this.app.start()
    else this.app.stop()
  }

  async start(initial: BoardState | undefined): Promise<void> {
    this.state = initial ?? null
    const preferred: Array<RendererPreference> = ['webgpu', 'webgl']
    await this.app.init({
      autoStart: false,
      // Opaque, in the colour the host shows behind it. A transparent WebGPU canvas is composited
      // as premultiplied alpha, and on Android Chrome that tinted the whole board yellow.
      backgroundAlpha: 1,
      backgroundColor: palette().canvas,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      width: Math.max(1, this.host.clientWidth),
      height: Math.max(1, this.host.clientHeight),
      preference: preferred,
    })
    await Promise.all([
      document.fonts.load('600 13px "Geist"'),
      document.fonts.load('500 10px "Geist Mono"'),
    ]).catch(() => undefined)
    if (this.destroyed) {
      this.app.destroy(true, { children: true })
      return
    }
    this.host.append(this.app.canvas)
    this.cursorLayer.mount(this.host)
    this.app.stage.addChild(this.world)
    this.chevrons.init(this.app.renderer)
    this.packets.init(this.app.renderer)
    this.wires.addChild(this.bodies, this.chevrons.root, this.mouths, this.portals, this.splitters)
    this.boxLayer.addChild(this.boxes, this.replication, this.boxNames)
    this.boxLayer.isRenderGroup = true
    this.world.addChild(
      this.boxLayer,
      this.wires,
      this.packets.root,
      this.arrows,
      this.notes.root,
      this.places.root,
      this.cards,
      this.overlay,
      this.ghost,
    )
    // Pixi rebuilds a render group's batches whenever a Graphics in it changes. The
    // chevrons, packets and overlay change every frame, the cards on each tick: in
    // groups of their own, a frame does not repack every card.
    this.wires.isRenderGroup = true
    this.cards.isRenderGroup = true
    // These sit outside the card batch. Batching each layer by hand stops a
    // multi-shape layer from costing one draw per shape.
    for (const part of [this.overlay, this.arrows, this.splitters, this.portals, this.boxes])
      part.context.batchMode = 'batch'
    this.ghost.alpha = 0.55
    this.ghost.visible = false
    this.bindPointer()
    this.app.ticker.add((ticker) => this.animate(ticker.deltaMS / 1000))
    this.started = true
    this.resize.observe(this.host)
    this.sight.observe(this.host)
    this.onResize()
    this.run()
  }

  draw(state: BoardState): void {
    if (this.started && this.seeded) this.diffLinks(state)
    this.state = state
    this.activityOf = state.translateActivity ?? ((activity) => activity)
    const dragged = this.dragged
    if (dragged && this.gesture?.kind !== 'node') {
      const node = state.game.nodes.find((entry) => entry.id === dragged.id)
      // If the move was refused, the card goes back once the drop is old news.
      const stale = performance.now() - this.droppedAt > 250
      if (!node || (node.x === dragged.x && node.y === dragged.y) || stale) this.dragged = null
    }
    if (!this.started) return
    if (state.suspended) {
      this.app.stop()
      return
    }
    if (!this.fitted) this.fit()
    this.syncCards()
    this.syncGhost()
    this.run()
  }

  /** New links draw in from their port; removed ones fade where they were. */
  private diffLinks(next: BoardState): void {
    const keyOf = (link: Readonly<{ from: string; to: string }>) => `${link.from}>${link.to}`
    const before = this.state?.game.links ?? []
    const was = new Set(before.map(keyOf))
    const now = new Set(next.game.links.map(keyOf))
    for (const link of next.game.links) {
      const key = keyOf(link)
      if (was.has(key)) continue
      // A wire the player just drew is already on screen: it only glows.
      this.fresh.set(key, key === this.wired ? DRAW_IN_S : 0)
    }
    this.wired = null
    const shown = this.shown()
    for (const link of before) {
      if (now.has(keyOf(link))) continue
      const from = shown.get(link.from)
      const to = shown.get(link.to)
      if (from && to) this.cuts.push({ path: this.wireOf(from, to).path, t: 0 })
    }
  }

  /** Rebuilds the cards and the ghost, which keep the colours they were drawn in. */
  repaint(): void {
    for (const view of this.views.values()) view.root.destroy({ children: true })
    this.views.clear()
    this.ghostType = null
    this.app.renderer.background.color = palette().canvas
    if (this.state) this.draw(this.state)
  }

  destroy(): void {
    if (this.destroyed) return
    // Leaving the screen with the pointer down still ends the hold.
    this.endHold()
    this.destroyed = true
    this.abort.abort()
    this.resize.disconnect()
    this.sight.disconnect()
    this.cursorLayer.destroy()
    this.events.onCursorGone?.()
    if (this.started) this.app.destroy(true, { children: true })
  }

  private onResize(): void {
    const { clientWidth: w, clientHeight: h } = this.host
    if (w === 0 || h === 0) return
    this.app.renderer.resize(w, h)
    // A rotation or a window resize fits the Design again; a phone's URL bar changing the height
    // does not, so a panned view stays where the player left it.
    if (!this.fitted || this.fittedWidth === null || Math.abs(w - this.fittedWidth) > 32) this.fit()
  }

  fit(): void {
    const nodes = this.state?.game.nodes ?? []
    const { clientWidth: w, clientHeight: h } = this.host
    if (nodes.length === 0 || w === 0 || h === 0) return
    const pad = this.state?.pad ?? 80
    const minX = Math.min(...nodes.map((node) => node.x)) - pad
    const minY = Math.min(...nodes.map((node) => node.y)) - pad
    const maxX = Math.max(...nodes.map((node) => node.x + CARD_W)) + pad
    const maxY = Math.max(...nodes.map((node) => node.y + heightOf(node.type))) + pad
    // Keep clear of the HUD above and the build dock below, unless the host says what to keep clear of.
    const phone = isPhone()
    const short = matchMedia('(max-height: 499px)').matches
    const inset = this.state?.inset
    const top = inset ? inset.top : short ? 120 : phone ? 160 : 120
    const bottom = inset ? inset.bottom : short ? 70 : phone ? 90 : 210
    const room = Math.max(1, h - top - bottom)
    // The stats panel sits on the left on desktop: keep cards out from under it.
    const left = inset ? inset.left : phone || short ? 0 : 380
    // Without an inset the board keeps 24px clear on the right; a host that sets one owns the edges.
    const across = Math.max(1, w - left - (inset ? 0 : 24))
    // Below this zoom the card text is too small to read; pan to see the rest.
    const scale = Math.max(
      phone ? MIN_FIT_SCALE_PHONE : (this.state?.minScale ?? MIN_FIT_SCALE),
      Math.min(1.1, Math.min(across / (maxX - minX), room / (maxY - minY))),
    )
    this.world.scale.set(scale)
    // A Design wider than the phone starts at its left edge, where the Users are.
    const x =
      phone && (maxX - minX) * scale > w
        ? -minX * scale
        : left + across / 2 - ((minX + maxX) / 2) * scale
    this.world.position.set(x, top + room / 2 - ((minY + maxY) / 2) * scale)
    this.fitted = true
    this.fittedWidth = w
  }

  /** Centers a Node in the room the HUD, dock, and Inspector leave free. */
  focus(nodeId: string): void {
    const node = this.state?.game.nodes.find((entry) => entry.id === nodeId)
    if (!node) return
    const { clientWidth: w, clientHeight: h } = this.host
    if (w === 0 || h === 0) return
    const phone = isPhone()
    const top = phone ? 160 : 120
    const bottom = phone ? 90 : 210
    const left = phone ? 0 : 380
    const right = phone ? 0 : 380
    const roomW = Math.max(1, w - left - right)
    const roomH = Math.max(1, h - top - bottom)
    const scale = Math.max(this.world.scale.x, phone ? MIN_FIT_SCALE_PHONE : MIN_FIT_SCALE)
    this.world.scale.set(scale)
    this.world.position.set(
      left + roomW / 2 - (node.x + CARD_W / 2) * scale,
      top + roomH / 2 - (node.y + heightOf(node.type) / 2) * scale,
    )
    this.fitted = true
    this.fittedWidth = w
  }

  private toWorld(event: PointerEvent | WheelEvent): Pt {
    const rect = this.host.getBoundingClientRect()
    const local = this.world.toLocal(new Point(event.clientX - rect.left, event.clientY - rect.top))
    return { x: local.x, y: local.y }
  }

  private nodes(dragged = this.dragged): ReadonlyArray<GameNode> {
    const nodes = this.state?.game.nodes ?? []
    if (!dragged) return nodes
    const lead = nodes.find((node) => node.id === dragged.id)
    const group = this.groupOf(dragged.id)
    const dx = lead ? dragged.x - lead.x : 0
    const dy = lead ? dragged.y - lead.y : 0
    return nodes.map((node) =>
      node.id === dragged.id
        ? { ...node, x: dragged.x, y: dragged.y }
        : group.includes(node.id)
          ? { ...node, x: node.x + dx, y: node.y + dy }
          : node,
    )
  }

  /** The frame around a multi-selection, with room around the cards. */
  private selectionFrame(): Readonly<{ x: number; y: number; w: number; h: number }> | null {
    const selection = this.state?.selection ?? []
    if (selection.length < 2) return null
    const cards = this.shown()
    const members = selection.flatMap((id) => cards.get(id) ?? [])
    if (members.length < 2) return null
    const pad = 14
    const left = Math.min(...members.map((node) => node.x)) - pad
    const top = Math.min(...members.map((node) => node.y)) - pad
    return {
      x: left,
      y: top,
      w: Math.max(...members.map((node) => node.x + CARD_W)) + pad - left,
      h: Math.max(...members.map((node) => node.y + heightOf(node.type))) + pad - top,
    }
  }

  /** The Nodes that move with this one: the whole selection when it is part of it. */
  private groupOf(id: string): ReadonlyArray<string> {
    const selection = this.state?.selection ?? []
    return selection.length > 1 && selection.includes(id) ? selection : [id]
  }

  /** The Nodes where their cards are drawn, so wires stay attached while cards glide. */
  private shown(): Map<string, GameNode> {
    // A GameNode carries a hundred fields, so spreading one per card per frame costs
    // more than the joins it feeds. A view of the node inherits every field and owns
    // only the two that follow the card.
    const out = this.shownCards
    out.clear()
    for (const node of this.nodes()) {
      const at = this.views.get(node.id)?.at
      if (!at) {
        out.set(node.id, node)
        continue
      }
      let drawn = this.drawnCards.get(node.id)
      if (!drawn || drawn.source !== node) {
        // Own, writable x and y: assigning through the prototype throws when the node is frozen.
        const own = { writable: true, enumerable: true, configurable: true }
        drawn = {
          source: node,
          drawn: Object.create(node, {
            x: { ...own, value: at.x },
            y: { ...own, value: at.y },
          }) as Mutable<GameNode>,
        }
        this.drawnCards.set(node.id, drawn)
      }
      drawn.drawn.x = at.x
      drawn.drawn.y = at.y
      out.set(node.id, drawn.drawn)
    }
    return out
  }

  private nodeAt(point: Pt): GameNode | null {
    return (
      this.nodes().findLast(
        (node) =>
          point.x >= node.x &&
          point.x <= node.x + CARD_W &&
          point.y >= node.y &&
          point.y <= node.y + heightOf(node.type),
      ) ?? null
    )
  }

  /** Whether a point is on a card's footer button. A chip has no footer, so a tap on it selects. */
  private footerAt(node: GameNode, point: Pt): boolean {
    return this.world.scale.x >= CHIP_NONE && inFooter(node, point)
  }

  private outPortAt(point: Pt): GameNode | null {
    const reach = PORT_R + (this.coarse ? 16 : 6) / this.world.scale.x
    return (
      this.nodes().findLast((node) => {
        if (layoutOf(node.type).outRow === null) return false
        const port = outPort(node)
        return Math.hypot(port.x - point.x, port.y - point.y) <= reach
      }) ?? null
    )
  }

  private selectLink(link: Readonly<{ from: string; to: string }>): void {
    this.selectedLink = link
    this.events.onEmptyTap()
  }

  /** Whether the point is on the × badge in the middle of the selected link. */
  private onBadge(point: Pt): boolean {
    const link = this.selectedLink
    const from = link && this.shown().get(link.from)
    const to = link && this.shown().get(link.to)
    if (!from || !to) return false
    const mid = pointOn(this.wireOf(from, to).path, 0.5)
    return (
      Math.hypot(mid.x - point.x, mid.y - point.y) <= (this.coarse ? 16 : 11) / this.world.scale.x
    )
  }

  private linkAt(point: Pt): Readonly<{ from: string; to: string }> | null {
    const byId = new Map(this.nodes().map((node) => [node.id, node]))
    const reach = (this.coarse ? 14 : 7) / this.world.scale.x
    // Lanes in one channel run a few pixels apart, so the nearest belt wins, not the first.
    let nearest: Readonly<{ from: string; to: string }> | null = null
    let closest = reach
    for (const link of this.state?.game.links ?? []) {
      const from = byId.get(link.from)
      const to = byId.get(link.to)
      if (!from || !to) continue
      const apart = distanceTo(this.wireOf(from, to).path, point)
      if (apart > closest) continue
      nearest = link
      closest = apart
    }
    return nearest
  }

  /**
   * Asks the compute worker to route every link once per change to the layout,
   * with held cards where they are dragged. One layout is on the worker at a
   * time: when it answers, the newest layout asked for since goes next, so a long
   * drag on a big board still gets routes as fast as the worker makes them.
   */
  private routes(): Map<string, Wire> {
    const game = this.state?.game
    if (!game || (game === this.routedGame && this.dragged === this.routedDrag)) return this.routed
    this.routedGame = game
    this.routedDrag = this.dragged
    // A held card on top of another card has no way out, so it is routed where it will land.
    const held = this.gesture?.kind === 'node' ? this.dragged : null
    const landing = held && this.landingOf()
    const blocked = held && landing && (landing.x !== held.x || landing.y !== held.y)
    const placed = blocked ? this.nodes({ id: held.id, x: landing.x, y: landing.y }) : this.nodes()
    if (blocked) {
      const group = this.groupOf(held.id)
      this.heldLanding = new Map(
        placed
          .filter((node) => group.includes(node.id))
          .map((node) => [node.id, { x: node.x, y: node.y }]),
      )
    } else if (held) this.heldLanding = null
    const links = [
      ...game.links.map(({ from, to }) => ({ from, to })),
      ...this.replicationLinks(game),
    ]
    const key = `${placed.map((node) => `${node.id}:${node.type}:${node.x}:${node.y}`).join('|')}#${links.map((link) => `${link.from}>${link.to}`).join('|')}`
    if (key !== this.routedFor) {
      this.routedFor = key
      this.routeWanted = {
        key,
        nodes: placed.map(({ id, type, x, y }) => ({ id, type, x, y })),
        links,
      }
      this.askRoute()
    }
    return this.routed
  }

  /** The dashed replication cables the router places with the other lanes, one set per Data Group. */
  private replicationLinks(game: Game): ReadonlyArray<RoutedLink> {
    const region = this.state?.region
    if (!region) return []
    return replicationPairsOf(game)
      .filter((pair) => pair.from.region === region && pair.to.region === region)
      .map((pair) => ({ from: pair.from.id, to: pair.to.id }))
  }

  private askRoute(): void {
    const wanted = this.routeWanted
    if (this.routing || !wanted || wanted.key === this.routeDone) return
    this.routing = true
    void compute('route', { nodes: wanted.nodes, links: wanted.links }).then((wires) => {
      this.routing = false
      if (this.destroyed) return
      this.routeDone = wanted.key
      if (wires) {
        this.routed = wires
        this.routedNodes = new Map(wanted.nodes.map((node) => [node.id, node]))
      }
      this.askRoute()
    })
  }

  /**
   * A link's wire between Nodes where they are drawn. A card that eases toward
   * where it was routed bends the routed wire to stay on its port. When a card is
   * further away, as when the worker is behind a fast drag, the link takes the
   * quick route until its routes arrive. A held card on another card has its
   * links drawn to its landing spot instead (see heldLanding).
   */
  private wireOf(drawnFrom: GameNode, drawnTo: GameNode): Wire {
    // A GameNode carries a hundred fields. Spreading one per link per frame costs more
    // than everything else the board draws, so a held card makes only the three fields
    // that a route reads.
    const fromAt = this.heldLanding?.get(drawnFrom.id)
    const toAt = this.heldLanding?.get(drawnTo.id)
    const from = fromAt ? { type: drawnFrom.type, x: fromAt.x, y: fromAt.y } : drawnFrom
    const to = toAt ? { type: drawnTo.type, x: toAt.x, y: toAt.y } : drawnTo
    const wire = this.routes().get(`${drawnFrom.id}>${drawnTo.id}`)
    const a = this.routedNodes.get(drawnFrom.id)
    const b = this.routedNodes.get(drawnTo.id)
    if (wire && a && b) {
      const da = { x: from.x - a.x, y: from.y - a.y }
      const db = { x: to.x - b.x, y: to.y - b.y }
      const off = Math.max(Math.abs(da.x), Math.abs(da.y), Math.abs(db.x), Math.abs(db.y))
      if (off === 0) return wire
      if (off <= SLACK) {
        const path = bent(wire.path, da, db)
        return { path, pieces: [path], tunnels: [] }
      }
    }
    const path = routeOf(from, to)
    return { path, pieces: [path], tunnels: [] }
  }

  private landingOf(dragged = this.gesture?.kind === 'node' ? this.dragged : null): Pt | null {
    const state = this.state
    if (!state) return null
    const pointer = { x: Math.round(this.pointer.x), y: Math.round(this.pointer.y) }
    const key = `${this.routedFor}/${dragged?.id}:${dragged?.x}:${dragged?.y}/${state.placing}/${state.stamp ? 'stamp' : ''}/${pointer.x}:${pointer.y}`
    if (key === this.landingKey) return this.landing
    this.landingKey = key
    const group = dragged ? this.groupOf(dragged.id) : []
    const others = state.game.nodes.filter((node) => !group.includes(node.id)).map(boxOf)
    const held = state.game.nodes.find((node) => node.id === dragged?.id)
    const members = state.game.nodes.filter((node) => group.includes(node.id))
    // The group lands as one box, and the lead card keeps its place inside it.
    const left = Math.min(...members.map((node) => node.x))
    const top = Math.min(...members.map((node) => node.y))
    this.landing =
      dragged && held
        ? (() => {
            const spot = freeSpot(others, {
              x: left + dragged.x - held.x,
              y: top + dragged.y - held.y,
              w: Math.max(...members.map((node) => node.x + CARD_W)) - left,
              h: Math.max(...members.map((node) => node.y + heightOf(node.type))) - top,
            })
            return { x: held.x + spot.x - left, y: held.y + spot.y - top }
          })()
        : state.stamp
          ? freeSpot(others, {
              x: pointer.x,
              y: pointer.y,
              w: Math.max(...state.stamp.map((entry) => entry.dx)) + CARD_W,
              h: Math.max(...state.stamp.map((entry) => entry.dy + heightOf(entry.type))),
            })
          : state.placing
            ? freeSpot(others, {
                x: pointer.x - CARD_W / 2,
                y: pointer.y - heightOf(state.placing) / 2,
                w: CARD_W,
                h: heightOf(state.placing),
              })
            : null
    return this.landing
  }

  /** The two fingers on the board: how far apart, and where between them. */
  private pinchOf(): Readonly<{ distance: number; center: Pt }> {
    const [a, b] = [...this.touches.values()]
    if (!a || !b) return this.pinch ?? { distance: 1, center: { x: 0, y: 0 } }
    return {
      distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
  }

  /** Zoom by how the fingers spread and pan by how their midpoint moved. */
  private zoomTo(next: Readonly<{ distance: number; center: Pt }>): void {
    const last = this.pinch
    this.pinch = next
    if (!last) return
    const rect = this.host.getBoundingClientRect()
    const from = this.world.toLocal(new Point(last.center.x - rect.left, last.center.y - rect.top))
    const scale = Math.min(
      1.6,
      Math.max(0.25, (this.world.scale.x * next.distance) / last.distance),
    )
    this.world.scale.set(scale)
    this.world.position.set(
      next.center.x - rect.left - from.x * scale,
      next.center.y - rect.top - from.y * scale,
    )
  }

  private bindPointer(): void {
    const canvas = this.app.canvas
    const { signal } = this.abort
    canvas.style.touchAction = 'none'
    canvas.addEventListener('contextmenu', (event) => event.preventDefault(), { signal })

    canvas.addEventListener(
      'pointerdown',
      (event) => {
        this.coarse = event.pointerType !== 'mouse'
        if (this.coarse) {
          this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
          canvas.setPointerCapture(event.pointerId)
          if (this.touches.size === 2) {
            // A second finger turns the gesture into a pinch.
            this.letGo()
            this.gesture = null
            this.dragged = null
            if (this.pressed) {
              this.pressed = null
              this.syncCards()
            }
            this.pinch = this.pinchOf()
            return
          }
          if (this.touches.size > 2) return
        }
        const point = this.toWorld(event)
        this.pointer = point
        this.over = true
        this.pointerKnown = true
        // A press on the Board is board work, not the panel the cursor last announced.
        this.activity = null
        if (event.button === 2) {
          const link = this.linkAt(point)
          if (link) this.selectLink(link)
          return
        }
        if (event.button !== 0) return
        canvas.setPointerCapture(event.pointerId)
        if (this.state?.readOnly) {
          this.gesture = {
            kind: 'pan',
            x: event.clientX,
            y: event.clientY,
            moved: false,
            cut: null,
          }
          return
        }
        if (this.state?.stamp) {
          this.events.onPlace(Math.round(point.x / 8) * 8, Math.round(point.y / 8) * 8)
          return
        }
        if (this.state?.placing) {
          this.events.onPlace(point.x - CARD_W / 2, point.y - heightOf(this.state.placing) / 2)
          return
        }
        const port = this.outPortAt(point)
        if (port) {
          this.hoverLink = null
          this.gesture = { kind: 'link', from: port.id, at: point }
          this.wireEnd = outPort(this.shown().get(port.id) ?? port)
          this.snapTo = null
          this.snapGlow = 0
          this.events.onSound?.('pull', 1, true)
          return
        }
        const node = this.nodeAt(point)
        if (node) {
          if (this.footerAt(node, point)) {
            this.pressed = node.id
            this.holdSince = this.state && holds(this.state.game, node) ? performance.now() : 0
            this.syncCards()
          } else {
            const view = this.views.get(node.id)
            if (view) view.held = true
          }
          this.gesture = {
            kind: 'node',
            id: node.id,
            dx: point.x - node.x,
            dy: point.y - node.y,
            x: event.clientX,
            y: event.clientY,
            moved: false,
          }
          return
        }
        if (event.shiftKey) {
          this.gesture = { kind: 'box', from: point, at: point }
          return
        }
        if (this.selectedLink && this.onBadge(point)) {
          this.events.onUnlink(this.selectedLink.from, this.selectedLink.to)
          this.selectedLink = null
          return
        }
        // Inside the frame of a multi-selection, a drag takes the whole group.
        const frame = this.selectionFrame()
        const lead = this.nodes().find((entry) => this.state?.selection[0] === entry.id)
        if (
          frame &&
          lead &&
          point.x >= frame.x &&
          point.x <= frame.x + frame.w &&
          point.y >= frame.y &&
          point.y <= frame.y + frame.h
        ) {
          this.gesture = {
            kind: 'node',
            id: lead.id,
            dx: point.x - lead.x,
            dy: point.y - lead.y,
            x: event.clientX,
            y: event.clientY,
            moved: false,
            frame: true,
          }
          return
        }
        if (this.hoverLink) {
          this.selectLink(this.hoverLink)
          return
        }
        this.gesture = {
          kind: 'pan',
          x: event.clientX,
          y: event.clientY,
          moved: false,
          cut: this.coarse ? this.linkAt(point) : null,
        }
      },
      { signal },
    )

    canvas.addEventListener(
      'pointermove',
      (event) => {
        if (this.touches.has(event.pointerId)) {
          this.touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
          if (this.pinch) {
            this.zoomTo(this.pinchOf())
            return
          }
        }
        const point = this.toWorld(event)
        this.pointer = point
        // Back on the Board: the pointer moves again, so it stops saying what the panel was.
        this.over = true
        this.pointerKnown = true
        this.activity = null
        this.cursorWaiting = true
        const gesture = this.gesture
        if (gesture?.kind === 'pan') {
          const dx = event.clientX - gesture.x
          const dy = event.clientY - gesture.y
          if (!gesture.moved && Math.hypot(dx, dy) < 4) return
          gesture.moved = true
          this.world.position.x += dx
          this.world.position.y += dy
          gesture.x = event.clientX
          gesture.y = event.clientY
          canvas.style.cursor = 'grabbing'
          return
        }
        if (gesture?.kind === 'node') {
          if (
            !gesture.moved &&
            Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 4
          )
            return
          const view = this.views.get(gesture.id)
          if (!gesture.moved && view) {
            // Picked up: it rises above the other cards.
            view.held = false
            view.lifted = true
            this.cards.addChild(view.root)
            this.events.onSound?.('lift', 1, true)
          }
          gesture.moved = true
          const last = this.dragged
          this.dragged = {
            id: gesture.id,
            x: Math.round((point.x - gesture.dx) / 8) * 8,
            y: Math.round((point.y - gesture.dy) / 8) * 8,
          }
          // Each grid line it crosses is a faint detent.
          if (last && (last.x !== this.dragged.x || last.y !== this.dragged.y))
            this.events.onSound?.('detent')
          this.syncCards()
          canvas.style.cursor = 'grabbing'
          return
        }
        if (gesture?.kind === 'link' || gesture?.kind === 'box') {
          gesture.at = point
          const target = this.nodeAt(point)
          const next = target && target.id !== gesture.from ? target.id : null
          if (next !== this.snapTo) {
            if (next) this.events.onSound?.('snap')
            else this.events.onSound?.('detent', 0.7)
            this.snapTo = next
          }
          canvas.style.cursor = 'crosshair'
          return
        }
        if (this.state?.stamp) {
          canvas.style.cursor = 'copy'
          return
        }
        if (this.state?.placing) {
          canvas.style.cursor = 'copy'
          return
        }
        // A port wins over the link leaving it: pulling a wire is not a cut.
        this.hoverLink = this.nodeAt(point) || this.outPortAt(point) ? null : this.linkAt(point)
        this.hoverNode = this.nodeAt(point)?.id ?? null
        canvas.style.cursor = this.outPortAt(point)
          ? 'crosshair'
          : this.nodeAt(point)
            ? this.footerAt(this.nodeAt(point) as GameNode, point)
              ? 'pointer'
              : 'move'
            : this.hoverLink
              ? 'pointer'
              : 'grab'
      },
      { signal },
    )

    const finish = (event: PointerEvent, cancelled: boolean) => {
      this.endHold()
      this.touches.delete(event.pointerId)
      if (this.pinch) {
        // The pinch ends with its first finger; the other one does nothing until it lifts.
        if (this.touches.size < 2) this.pinch = null
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
        return
      }
      const gesture = this.gesture
      this.gesture = null
      this.letGo()
      this.holdSince = 0
      if (this.pressed) {
        this.pressed = null
        this.syncCards()
      }
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      canvas.style.cursor = 'grab'
      if (!gesture || cancelled) {
        if (gesture?.kind === 'link') this.springBack(gesture.from)
        this.dragged = null
        return
      }
      const point = this.toWorld(event)
      if (gesture.kind === 'pan' && !gesture.moved) {
        if (gesture.cut) this.selectLink(gesture.cut)
        else {
          this.selectedLink = null
          this.events.onEmptyTap()
        }
      }
      if (gesture.kind === 'node') {
        const node = this.nodes().find((entry) => entry.id === gesture.id)
        // A dropped card keeps its place until the Model has it (see draw), so it
        // does not glide back toward where it was for a frame.
        if (gesture.moved && this.dragged) {
          this.droppedAt = performance.now()
          // The card settles where the Model will put it, clear of the others.
          const landing = this.landingOf(this.dragged) ?? this.dragged
          this.dragged = { id: gesture.id, x: landing.x, y: landing.y }
          this.syncCards()
          this.events.onNodeMove(gesture.id, landing.x, landing.y)
        } else if (gesture.frame) {
          this.dragged = null
        } else {
          this.dragged = null
          if (event.shiftKey) this.events.onNodeToggle(gesture.id)
          // A size is bought by holding (see animate), so letting go early buys nothing.
          else if (node && this.footerAt(node, point)) {
            if (!this.state || !holds(this.state.game, node)) this.events.onFooter(gesture.id)
          } else this.events.onNodeTap(gesture.id)
        }
      }
      if (gesture.kind === 'link') {
        const target = this.nodeAt(point)
        if (target && target.id !== gesture.from) {
          this.wired = `${gesture.from}>${target.id}`
          this.wireEnd = null
          this.snapTo = null
          this.events.onLink(gesture.from, target.id)
        } else this.springBack(gesture.from)
      }
      if (gesture.kind === 'box') {
        const left = Math.min(gesture.from.x, point.x)
        const right = Math.max(gesture.from.x, point.x)
        const top = Math.min(gesture.from.y, point.y)
        const bottom = Math.max(gesture.from.y, point.y)
        this.events.onBox(
          this.nodes()
            .filter(
              (node) =>
                node.x < right &&
                node.x + CARD_W > left &&
                node.y < bottom &&
                node.y + heightOf(node.type) > top,
            )
            .map((node) => node.id),
          event.altKey ? 'subtract' : event.ctrlKey || event.metaKey ? 'add' : 'replace',
        )
      }
    }
    canvas.addEventListener('pointerup', (event) => finish(event, false), { signal })
    canvas.addEventListener('pointercancel', (event) => finish(event, true), { signal })
    canvas.addEventListener(
      'pointerleave',
      () => {
        this.over = false
        this.hoverLink = null
        this.hoverNode = null
        // A panel is open: the pointer stays on the Board and says what this Seat is doing.
        if (this.activity !== null) {
          this.emitCursor()
          return
        }
        this.cursorWaiting = false
        this.events.onCursorGone?.()
      },
      { signal },
    )
    // A hidden window takes the pointer with it, and a cursor left on the
    // Board would keep pointing at a spot nobody is looking at.
    window.addEventListener(
      'blur',
      () => {
        this.over = false
        this.cursorWaiting = false
        this.events.onCursorGone?.()
      },
      { signal },
    )
    window.addEventListener(
      'keydown',
      (event) => {
        const link = this.selectedLink
        if (!link) return
        if (event.key === 'Escape') this.selectedLink = null
        if (event.key !== 'Delete' && event.key !== 'Backspace') return
        const target = event.target as HTMLElement | null
        if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
        this.selectedLink = null
        this.events.onUnlink(link.from, link.to)
      },
      { signal },
    )

    canvas.addEventListener(
      'wheel',
      (event) => {
        // A board on a page lets the page scroll; Ctrl or Cmd zooms it.
        if (this.state?.readOnly && !event.ctrlKey && !event.metaKey) return
        event.preventDefault()
        const rect = this.host.getBoundingClientRect()
        const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top }
        const before = this.toWorld(event)
        const scale = Math.min(
          1.6,
          Math.max(0.25, this.world.scale.x * Math.exp(-event.deltaY * 0.0015)),
        )
        this.world.scale.set(scale)
        this.world.position.set(screen.x - before.x * scale, screen.y - before.y * scale)
      },
      { signal, passive: false },
    )
  }

  /** Puts down whatever card is held or lifted. */
  /** Fills the held footer button and fires it at the end; dragging off it cancels. */
  private advanceHold(): void {
    const id = this.pressed
    const gesture = this.gesture
    if (this.holdSince && (gesture?.kind !== 'node' || gesture.moved || gesture.id !== id))
      this.holdSince = 0
    const share = this.holdSince
      ? Math.min(1, (performance.now() - this.holdSince) / 1000 / HOLD_S)
      : 0
    for (const [key, view] of this.views) view.setHold(key === id ? share : 0)
    if (share < 1 || !id) return
    this.holdSince = 0
    this.gesture = null
    this.pressed = null
    this.letGo()
    this.syncCards()
    this.views.get(id)?.celebrate()
    this.events.onFooter(id)
    // The pointer is still down: the host buys again every repeat until it lifts.
    this.holding = id
    this.events.onHoldStart?.(id)
  }

  /** The pointer lifted: the host stops repeating the held footer button. */
  private endHold(): void {
    const id = this.holding
    if (!id) return
    this.holding = null
    this.events.onHoldEnd?.(id)
  }

  private letGo(): void {
    for (const view of this.views.values()) {
      view.held = false
      view.lifted = false
    }
  }

  /** A wire let go over nothing draws back into its port. */
  private springBack(fromId: string): void {
    const from = this.shown().get(fromId)
    const end = this.wireEnd
    this.wireEnd = null
    this.snapTo = null
    if (!from || !end) return
    const lane = laneUnder(from, end.y)
    this.retract = { path: route(outPort(from), end, lane), t: 0 }
    this.events.onSound?.('release', 1, true)
  }

  private syncCards(): void {
    const state = this.state
    if (!state) return
    const colors = palette()
    const live = new Set<string>()
    const path = this.pathOf(state)
    for (const node of this.nodes()) {
      live.add(node.id)
      let view = this.views.get(node.id)
      if (!view || view.type !== node.type) {
        view?.root.destroy({ children: true })
        view = new NodeView(node.type, this.seeded)
        this.views.set(node.id, view)
        this.cards.addChild(view.root)
      }
      view.update(
        state.game,
        node,
        state.ledger,
        state.selected === node.id || state.selection.includes(node.id),
        this.pressed === node.id,
        colors,
        state.history[node.id] ?? [],
        state.ordinals[node.id] ?? 0,
        state.region,
        state.locale,
        state.translate,
      )
      view.dim = path !== null && !path.has(node.id)
    }
    for (const [id, view] of this.views) {
      if (live.has(id)) continue
      view.leave()
      this.leaving.push(view)
      this.views.delete(id)
      this.drawnCards.delete(id)
    }
    this.seeded = true
  }

  /** The Nodes upstream and downstream of the hovered or selected Node, itself included;
   *  null when none is in focus, so nothing is dimmed. */
  private pathOf(state: BoardState): ReadonlySet<string> | null {
    const focus = this.hoverNode ?? state.selected
    if (!focus || !state.game.nodes.some((node) => node.id === focus)) return null
    const reach = (next: (link: { from: string; to: string }) => readonly [string, string]) => {
      const seen = new Set([focus])
      const queue = [focus]
      for (let id = queue.pop(); id !== undefined; id = queue.pop())
        for (const link of state.game.links) {
          const [at, to] = next(link)
          if (at === id && !seen.has(to)) {
            seen.add(to)
            queue.push(to)
          }
        }
      return seen
    }
    const down = reach((link) => [link.from, link.to])
    const up = reach((link) => [link.to, link.from])
    return new Set([...down, ...up])
  }

  /** One belt per link, stacked in the Model's link order, with the splitters on top. */
  private syncBelts(links: ReadonlyArray<Readonly<{ from: string; to: string }>>): void {
    if (links === this.beltLinks) return
    this.beltLinks = links
    const keys = links.map((link) => `${link.from}>${link.to}`)
    const order = keys.join('|')
    if (order === this.beltOrder) return
    this.beltOrder = order
    const live = new Set(keys)
    for (const [key, belt] of this.belts) {
      if (live.has(key)) continue
      belt.destroy()
      this.belts.delete(key)
    }
    this.bodies.removeChildren()
    this.mouths.removeChildren()
    for (const key of keys) {
      let belt = this.belts.get(key)
      if (!belt) {
        belt = new BeltView()
        this.belts.set(key, belt)
      }
      this.bodies.addChild(belt.body)
      this.mouths.addChild(belt.mouths)
    }
  }

  private syncGhost(): void {
    const type = this.state?.placing ?? null
    const locale = this.state?.locale ?? 'en'
    if (type === this.ghostType && locale === this.ghostLocale) return
    this.ghostLocale = locale
    this.ghostType = type
    this.ghost.removeChildren().forEach((child) => child.destroy({ children: true }))
    this.ghost.visible = type !== null
    if (!type) return
    const colors = palette()
    const height = heightOf(type)
    const group = COMPONENTS[type].group
    const hue = colors.groups[group]
    const frame = new Graphics()
    silhouette(frame, group, 0, 0, CARD_W, height).fill(colors.card)
    headerBand(frame, group, hue, colors)
    silhouette(frame, group, 0, 0, CARD_W, height).stroke({ color: hue, width: 2 })
    medallion(frame, group, hue, colors)
    const name = label(15, SANS, '700')
    name.text = (this.state?.translate ?? String)(COMPONENTS[type].name)
    name.style.fill = colors.ink
    name.anchor.set(0, 0.5)
    name.position.set(TITLE_X, HEAD / 2)
    const size = badgeGlyph(group, BADGE_R)
    const mark = glyph(size)
    paint(mark, COMPONENT_ICONS[type], 0xffffff)
    mark.position.set(BADGE_X - size / 2, BADGE_Y - size / 2)
    this.ghost.addChild(frame, name, mark)
  }

  /** Draws a dashed box and a name around each group of Nodes, when one moved, came or went. */
  private drawBoxes(game: Game, colors: Palette): void {
    const pad = 18
    const found: Array<
      Readonly<{ name: string; x: number; y: number; w: number; h: number; hue: number }>
    > = []
    for (const box of game.boxes) {
      const members = game.nodes.filter((node) => box.nodes.includes(node.id))
      if (members.length < 2) continue
      const left = Math.min(...members.map((node) => node.x))
      const top = Math.min(...members.map((node) => node.y))
      const right = Math.max(...members.map((node) => node.x + CARD_W))
      const bottom = Math.max(...members.map((node) => node.y + heightOf(node.type)))
      found.push({
        name: box.name,
        x: left - pad,
        y: top - pad - 16,
        w: right - left + 2 * pad,
        h: bottom - top + 2 * pad + 16,
        hue: members.every(
          (node) => COMPONENTS[node.type].group === COMPONENTS[members[0]!.type].group,
        )
          ? colors.groups[COMPONENTS[members[0]!.type].group]
          : colors.accent,
      })
    }
    const key = `${this.state?.locale ?? 'en'}|${found.map((box) => `${box.name}:${box.x}:${box.y}:${box.w}:${box.h}:${box.hue}`).join(';')}`
    if (key === this.boxesKey) return
    this.boxesKey = key
    this.boxes.clear()
    this.boxNames.removeChildren().forEach((child) => child.destroy())
    for (const box of found) {
      this.boxes.roundRect(box.x, box.y, box.w, box.h, 16).fill({ color: box.hue, alpha: 0.05 })
      dashed(
        this.boxes,
        [
          { x: box.x, y: box.y },
          { x: box.x + box.w, y: box.y },
          { x: box.x + box.w, y: box.y + box.h },
          { x: box.x, y: box.y + box.h },
          { x: box.x, y: box.y },
        ],
        9,
        6,
      )
      this.boxes.stroke({ color: box.hue, width: 1.5, alpha: 0.55 })
      const name = label(12, SANS, '600')
      name.text = (this.state?.translate ?? String)(box.name)
      name.style.fill = box.hue
      name.position.set(box.x + 12, box.y + 6)
      this.boxNames.addChild(name)
    }
  }

  /** Dashed lines from each Data Group's primary to its Read Replicas, on the same lanes as the Links. */
  private drawReplication(state: BoardState, colors: Palette): void {
    const pairs = replicationPairsOf(state.game).filter(
      (pair) => pair.from.region === state.region && pair.to.region === state.region,
    )
    if (pairs.length === 0) {
      if (this.replicationKey !== '') {
        this.replicationKey = ''
        this.replication.clear()
      }
      return
    }
    const wires = pairs.map((pair) => ({
      replica: pair.to,
      wire: this.wireOf(pair.from, pair.to),
    }))
    const key = wires
      .map(
        ({ replica, wire }) =>
          `${replica.id}:${wire.path.map((point) => `${point.x},${point.y}`).join(' ')}`,
      )
      .join(';')
    if (key === this.replicationKey) return
    this.replicationKey = key
    this.replication.clear()
    for (const { wire } of wires)
      for (const piece of wire.pieces) dashed(this.replication, piece, 9, 6)
    this.replication.stroke({ color: colors.accent, width: 1.25, alpha: 0.45 })
  }

  private animate(seconds: number): void {
    const state = this.state
    if (!state) return
    const now = performance.now()
    this.flushCursor(now)
    this.cursorLayer.tick(
      now,
      { x: this.world.position.x, y: this.world.position.y, scale: this.world.scale.x },
      state.region,
      this.activityOf,
    )
    const colors = palette()
    // The phase is sim time: at 10× the belts carry ten times as many items per real second.
    if (!state.paused) this.phase += seconds * state.speed
    // Reduced motion: packets hold still along the pipe, and the bottleneck does not pulse.
    const still = reducedMotion()
    const zoom = this.world.scale.x
    const detailed = zoom >= CHEVRON_SCALE
    const rows = rowsAt(zoom)
    const chip = chipAt(zoom)
    // The chevrons and packets draw only for belts on screen. A card off screen is
    // hidden too, so the cards' render group does not draw a world the view cannot see.
    const scale = zoom
    const margin = 40 / scale
    const view: Box = {
      x: -this.world.position.x / scale - margin,
      y: -this.world.position.y / scale - margin,
      w: this.host.clientWidth / scale + 2 * margin,
      h: this.host.clientHeight / scale + 2 * margin,
    }
    for (const card of this.views.values()) {
      const at = card.at
      const shown =
        !at ||
        (at.x + CARD_W >= view.x &&
          at.x <= view.x + view.w &&
          at.y + card.height >= view.y &&
          at.y <= view.y + view.h)
      card.root.visible = shown
      // The card keeps following its Node while hidden, so it is already in place when
      // the view returns. Only its level of detail waits for the screen.
      card.tick(seconds, still)
      if (shown) card.detail(rows, chip, colors)
    }
    this.advanceHold()
    this.leaving = this.leaving.filter((view) => {
      if (view.tick(seconds, still)) return true
      view.root.destroy({ children: true })
      return false
    })
    const byId = this.shown()
    // Once the dropped cards are in their spots, their links follow them again.
    if (
      this.heldLanding &&
      this.gesture?.kind !== 'node' &&
      (performance.now() - this.droppedAt > 1000 ||
        [...this.heldLanding].every(
          ([id, spot]) => byId.get(id)?.x === spot.x && byId.get(id)?.y === spot.y,
        ))
    )
      this.heldLanding = null
    for (const [key, age] of this.fresh)
      if (age >= GLOW_S) this.fresh.delete(key)
      else this.fresh.set(key, age + seconds)
    const rates = new Map(state.ledger.links.map((link) => [`${link.from}>${link.to}`, link]))

    // Chevrons and packets draw only for belts on screen.
    this.chevrons.begin()
    const focus = this.pathOf(state)
    this.packets.begin()
    // Clearing marks the Graphics changed, so an empty one is left alone.
    if (this.arrows.context.instructions.length > 0) this.arrows.clear()
    this.notes.begin()
    this.places.begin()
    // Clearing marks the Graphics changed, so an empty one is left alone.
    if (this.overlay.context.instructions.length > 0) this.overlay.clear()
    const mouths: Array<Mouth> = []
    this.syncBelts(state.game.links)
    const picked = this.selectedLink
    if (picked && !state.game.links.some((l) => l.from === picked.from && l.to === picked.to))
      this.selectedLink = null
    // One belt is under the pointer or picked: it carries the answer, so the rest quiet down.
    const lit = this.hoverLink ?? this.selectedLink
    const litKey =
      lit && state.game.links.some((l) => l.from === lit.from && l.to === lit.to)
        ? `${lit.from}>${lit.to}`
        : null
    for (const link of state.game.links) {
      const key = `${link.from}>${link.to}`
      const belt = this.belts.get(key)
      const from = byId.get(link.from)
      const to = byId.get(link.to)
      if (belt && (!from || !to)) belt.show(false, 1)
      if (!belt || !from || !to) continue
      const picked = this.selectedLink?.from === link.from && this.selectedLink.to === link.to
      const hovered =
        picked || (this.hoverLink?.from === link.from && this.hoverLink.to === link.to)
      const quiet = litKey !== null && litKey !== key
      // Off the focused path, a belt fades back.
      const off = focus !== null && !(focus.has(link.from) && focus.has(link.to))
      // A lit belt rises above the channel it shares with the others, so nothing covers it.
      if (litKey === key) this.bodies.setChildIndex(belt.body, this.bodies.children.length - 1)
      const age = this.fresh.get(key)
      const wire = this.wireOf(from, to)
      // A new link draws out of its port before anything flows along it.
      const drawn = age === undefined ? 1 : easeOut(Math.min(1, age / DRAW_IN_S))
      const path = drawn < 1 ? partOf(wire.path, drawn) : wire.path
      // Where other lanes cross, a vertical lane runs through a tunnel under them.
      const pieces = drawn < 1 ? [path] : wire.pieces
      const seen = belt.onScreen(pieces, view)
      const flow = rates.get(key)
      const busy = (flow?.rate ?? 0) > 0.01
      const speed = busy && !still ? beltSpeed(flow?.rate ?? 0) : 0
      // Advance this belt by the distance it covered: sim seconds at its own speed.
      // A flow rate that changes under it then alters only the next frame's speed.
      if (!state.paused) belt.travel += seconds * state.speed * speed
      belt.show(seen, quiet ? QUIET : hovered ? 1 : off ? DIM : 1)
      // A belt the view cannot see draws nothing: not its body, its mouths or its items.
      if (!seen) continue
      const tap = COMPONENTS[to.type].tap
      // The packets' colour; the pipe under them is a pale tint of it, with no outline.
      const hue = flow?.failing
        ? colors.danger
        : tap
          ? colors.muted
          : flow && busy
            ? KINDS[flow.kind].color
            : colors.edge
      // A dark board sinks its wires toward the canvas, so saturated packets do not glare.
      const packet = mix(hue, colors.canvas, colors.wireMute)
      // Rails stand out only where they say something: on the focused path and on errors. A call
      // between zones pays cross-zone latency and Egress: its rails are orange in focus,
      // and at rest an orange tick marks the port it arrives on.
      const zonal = zoneMs(from, to) > 0
      const focused = focus !== null && !off
      const rail = hovered
        ? colors.accent
        : zonal && focused
          ? colors.warn
          : focused || flow?.failing
            ? mix(packet, colors.shade, 0.3)
            : // At rest a faint edge in the belt's own tint keeps the path's boundary.
              mix(packet, colors.canvas, busy ? 0.55 : 0.4)
      // Once zones are researched a link inside one zone takes that zone's tint.
      const zones = has(state.game, 'multi-az') && zoned(from) && zoned(to)
      const crossing = zones && from.zone !== to.zone
      const zoneHue = { a: colors.groups.edge, b: colors.groups.ops, c: colors.groups.data }
      const body =
        zones && !crossing && !hovered
          ? mix(zoneHue[from.zone], colors.canvas, busy ? 0.75 : 0.85)
          : mix(packet, colors.canvas, hovered ? 0.55 : busy ? 0.8 : 0.92)
      const width = hovered ? BELT + 1 : busy ? BELT : 3
      belt.draw(pieces, rail, body, width, zonal ? colors.warn : null)
      if (drawn >= 1) mouthsOf(pieces, width, off || quiet, mouths)
      // A lit belt marks both of its ports, so the lane shows which cards it joins.
      if (hovered && drawn >= 1) {
        for (const port of [outPort(from), inPort(to)])
          this.overlay
            .circle(port.x, port.y, 4.5)
            .fill(colors.accent)
            .stroke({ color: colors.card, width: 2 })
      }
      // A still, busy belt shows its arrows and rate instead of chevrons: one read, not two.
      // The items carry the flow; the chevrons are faint unless the belt is in focus.
      if (detailed && seen && busy && !still)
        this.chevrons.add(
          pieces,
          belt.travel,
          mix(packet, colors.canvas, 0.4),
          hovered ? 0.9 : quiet ? 0.05 : focus !== null && !off ? 0.75 : off ? DIM * 0.4 : 0.3,
          view,
        )
      // A link between regions says what its round trip costs, under the belt.
      const place = placeLabel(state.game, from, to)
      if (place && detailed && seen && drawn >= 1 && !quiet) {
        const mid = midOf(path)
        this.places.add(mid.x, mid.y, place, colors.ink, colors.warn, -PLACE_LIFT)
      }
      if (picked) {
        const mid = pointOn(path, 0.5)
        this.overlay.circle(mid.x, mid.y, 9).fill(colors.danger)
        this.overlay
          .moveTo(mid.x - 3.5, mid.y - 3.5)
          .lineTo(mid.x + 3.5, mid.y + 3.5)
          .moveTo(mid.x + 3.5, mid.y - 3.5)
          .lineTo(mid.x - 3.5, mid.y + 3.5)
        this.overlay.stroke({ color: colors.card, width: 2 })
      }
      if (age !== undefined) {
        const glow = 1 - easeOut(Math.min(1, age / GLOW_S))
        traceOf(this.overlay, path).stroke({
          color: colors.accent,
          width: 2 + 6 * glow,
          alpha: 0.35 * glow,
          cap: 'round',
          join: 'round',
        })
        if (drawn < 1) {
          const tip = path[path.length - 1]
          if (tip) this.overlay.circle(tip.x, tip.y, 4).fill(colors.accent)
          continue
        }
      }
      if (!flow || !busy || off || quiet || !seen) continue
      const length = lengthOf(path)
      const marks = flowMarks(still, flow.rate, length)
      const shape = packetShapeOf(flow.kind)
      const alpha = tap ? 0.6 : 0.95
      // Nothing shows on the belt while it runs through a tunnel.
      const underground = (t: number): boolean =>
        wire.tunnels.some(([start, end]) => t * length > start && t * length < end)
      if (marks.label === null) {
        // Items ride on the distance this belt has travelled, each in its kind's shape.
        const along = 1 / Math.max(1, length)
        const color = particleColor(packet, alpha)
        for (let index = 0; index < marks.packets; index += 1) {
          const t = (belt.travel * along + (index + 0.5) / marks.packets) % 1
          if (underground(t)) continue
          const at = pointOn(path, t, length)
          if (at.x < view.x || at.x > view.x + view.w || at.y < view.y || at.y > view.y + view.h)
            continue
          this.packets.add(shape, at.x, at.y, color)
        }
      } else {
        // Reduced motion: still arrows along the belt, under the rate they stand for.
        for (const t of marks.arrows) {
          if (underground(t)) continue
          const at = pointAndDirection(path, t)
          arrowAt(this.arrows, at.x, at.y, at.ux, at.uy, 4.2)
        }
        this.arrows.fill({ color: packet, alpha })
        const mid = midOf(path)
        this.notes.add(mid.x, mid.y, marks.label, hue, colors.card, tap ? 12 : 11)
      }
    }

    this.packets.end()
    this.notes.end()
    this.places.end()
    this.chevrons.end()
    this.drawBoxes(state.game, colors)
    this.drawReplication(state, colors)

    const portalColor = colors.edge
    const sameMouths =
      mouths.length === this.mouthsDrawn.length &&
      mouths.every((mouth, index) => {
        const before = this.mouthsDrawn[index] as Mouth
        return (
          mouth.x === before.x &&
          mouth.y === before.y &&
          mouth.across === before.across &&
          mouth.width === before.width &&
          mouth.off === before.off
        )
      })
    this.mouthsDrawn = mouths
    if (!sameMouths || portalColor !== this.portalInk) {
      this.portalInk = portalColor
      this.portals.clear()
      for (const portal of portalsOf(mouths))
        this.portals
          .roundRect(portal.x0, portal.y0, portal.x1 - portal.x0, portal.y1 - portal.y0, 1.25)
          .fill({ color: portalColor, alpha: portal.off ? DIM : 0.7 })
    }

    // A port that feeds several belts has a splitter over the point where they part.
    const fans = new Map<string, { x: number; top: number; bottom: number; belts: number }>()
    for (const link of state.game.links) {
      const from = byId.get(link.from)
      const to = byId.get(link.to)
      if (!from || !to || this.fresh.has(`${link.from}>${link.to}`)) continue
      const port = outPort(from)
      const fan = fans.get(link.from) ?? {
        x: port.x,
        top: port.y,
        bottom: port.y,
        belts: 0,
      }
      fan.belts += 1
      // The fan is the stretch out of the port before the belt runs straight up or down.
      const path = this.wireOf(from, to).path
      for (let index = 1; index < path.length; index += 1) {
        const point = path[index] as Pt
        const before = path[index - 1] as Pt
        if (point.x > port.x + SPLITTER_W || Math.abs(point.x - before.x) < 0.01) break
        fan.top = Math.min(fan.top, point.y)
        fan.bottom = Math.max(fan.bottom, point.y)
      }
      fans.set(link.from, fan)
    }
    const splitters = [...fans.values()].filter((fan) => fan.belts >= 2)
    const splittersKey = splitters.map((fan) => `${fan.x}:${fan.top}:${fan.bottom}`).join('|')
    if (splittersKey !== this.splittersKey) {
      this.splittersKey = splittersKey
      this.splitters.clear()
      const pad = BELT / 2 + 1.5
      for (const fan of splitters)
        this.splitters
          .roundRect(fan.x, fan.top - pad, SPLITTER_W, fan.bottom - fan.top + pad * 2, 3)
          .fill(colors.card)
          .stroke({ color: colors.edge, width: 1.5 })
    }

    // No global bottleneck marker: players read limiting-resource pressure from cards and diagnostics.

    // A disclosure cue: a ring around the one footer button to press next.
    const cue = state.cue ? byId.get(state.cue) : undefined
    if (cue) {
      const rect = footerRect(cue.type)
      const pulse = still ? 0.9 : 0.35 + 0.55 * Math.abs(Math.sin(this.phase * 2.4))
      this.overlay
        .roundRect(cue.x + rect.x - 3, cue.y + rect.y - 3, rect.w + 6, rect.h + 6, 10)
        .stroke({ color: colors.ok, width: 2.5, alpha: pulse })
    }

    // Cut links fade where they were, in the colour that warned before the cut.
    this.cuts = this.cuts.filter((cut) => {
      cut.t += seconds
      const fade = 1 - easeOut(Math.min(1, cut.t / CUT_S))
      traceOf(this.overlay, cut.path).stroke({
        color: colors.danger,
        width: 2.5,
        alpha: 0.9 * fade,
        cap: 'round',
        join: 'round',
      })
      return cut.t < CUT_S
    })

    // A wire let go over nothing draws back into its port.
    const retract = this.retract
    if (retract) {
      retract.t += seconds
      const left = 1 - easeOut(Math.min(1, retract.t / RETRACT_S))
      const path = partOf(retract.path, left)
      traceOf(this.overlay, path).stroke({
        color: colors.accent,
        width: 2.5,
        cap: 'round',
        join: 'round',
      })
      const tip = path[path.length - 1]
      if (tip) this.overlay.circle(tip.x, tip.y, 5 * Math.max(0.4, left)).fill(colors.accent)
      if (retract.t >= RETRACT_S) this.retract = null
    }

    const gesture = this.gesture
    const snapped = gesture?.kind === 'link' && this.snapTo ? byId.get(this.snapTo) : undefined
    this.snapGlow += ((snapped ? 1 : 0) - this.snapGlow) * follow(seconds, 26, still)
    if (gesture?.kind === 'link') {
      const from = byId.get(gesture.from)
      if (from) {
        // Free, the end rides the pointer; near a port it is pulled onto it.
        const aim = snapped ? inPort(snapped) : gesture.at
        const end = this.wireEnd ?? aim
        const k = follow(seconds, snapped ? 30 : 60, still)
        this.wireEnd = { x: end.x + (aim.x - end.x) * k, y: end.y + (aim.y - end.y) * k }
        const lane = laneUnder(from, snapped ? snapped.y + heightOf(snapped.type) : this.wireEnd.y)
        traceOf(this.overlay, route(outPort(from), this.wireEnd, lane)).stroke({
          color: colors.accent,
          width: 2.5,
          cap: 'round',
          join: 'round',
        })
        this.overlay
          .circle(this.wireEnd.x, this.wireEnd.y, 5 + 1.5 * this.snapGlow)
          .fill(colors.accent)
        if (snapped) {
          silhouette(
            this.overlay,
            COMPONENTS[snapped.type].group,
            snapped.x,
            snapped.y,
            CARD_W,
            heightOf(snapped.type),
            3 + 5 * (1 - this.snapGlow),
          ).stroke({ color: colors.accent, width: 2, alpha: this.snapGlow })
        }
      }
    }

    const frame = this.selectionFrame()
    if (frame) {
      this.overlay
        .roundRect(frame.x, frame.y, frame.w, frame.h, 6)
        .fill({ color: colors.accent, alpha: 0.04 })
        .stroke({ color: colors.accent, width: 1.5, alpha: 0.85 })
      // Square handles on the corners, as in a design tool.
      const size = 8
      for (const [cx, cy] of [
        [frame.x, frame.y],
        [frame.x + frame.w, frame.y],
        [frame.x, frame.y + frame.h],
        [frame.x + frame.w, frame.y + frame.h],
      ] as const)
        this.overlay
          .rect(cx - size / 2, cy - size / 2, size, size)
          .fill({ color: 0xffffff })
          .stroke({ color: colors.accent, width: 1.5 })
    }

    if (gesture?.kind === 'box') {
      const left = Math.min(gesture.from.x, gesture.at.x)
      const top = Math.min(gesture.from.y, gesture.at.y)
      this.overlay
        .rect(
          left,
          top,
          Math.abs(gesture.at.x - gesture.from.x),
          Math.abs(gesture.at.y - gesture.from.y),
        )
        .fill({ color: colors.accent, alpha: 0.08 })
        .stroke({ color: colors.accent, width: 1.5, alpha: 0.8 })
    }
    const landing = this.landingOf()
    if (state.stamp) {
      // The Playbook shows where it will land, clear of the cards already there.
      const x = landing?.x ?? Math.round(this.pointer.x / 8) * 8
      const y = landing?.y ?? Math.round(this.pointer.y / 8) * 8
      for (const entry of state.stamp) {
        silhouette(
          this.overlay,
          COMPONENTS[entry.type].group,
          x + entry.dx,
          y + entry.dy,
          CARD_W,
          heightOf(entry.type),
          0,
        )
          .fill({ color: entry.ghost ? colors.danger : colors.accent, alpha: 0.1 })
          .stroke({ color: entry.ghost ? colors.danger : colors.accent, width: 2, alpha: 0.85 })
      }
    }

    // A held card or new Node over others: an outline shows the free spot it will take.
    const held =
      gesture?.kind === 'node' && this.dragged
        ? byId.get(this.dragged.id)
        : state.placing && this.ghost.visible
          ? {
              type: state.placing,
              x: Math.round((this.pointer.x - CARD_W / 2) / 8) * 8,
              y: Math.round((this.pointer.y - heightOf(state.placing) / 2) / 8) * 8,
            }
          : undefined
    if (held && landing && (landing.x !== held.x || landing.y !== held.y)) {
      const group = gesture?.kind === 'node' && this.dragged ? this.groupOf(this.dragged.id) : []
      const from = state.game.nodes.find((node) => node.id === this.dragged?.id)
      const outlines =
        group.length > 1 && from
          ? state.game.nodes
              .filter((node) => group.includes(node.id))
              .map((node) => ({
                type: node.type,
                x: node.x + landing.x - from.x,
                y: node.y + landing.y - from.y,
              }))
          : [{ type: held.type, x: landing.x, y: landing.y }]
      for (const outline of outlines)
        silhouette(
          this.overlay,
          COMPONENTS[outline.type].group,
          outline.x,
          outline.y,
          CARD_W,
          heightOf(outline.type),
          0,
        )
          .fill({ color: colors.accent, alpha: 0.08 })
          .stroke({ color: colors.accent, width: 2, alpha: 0.7 })
    }

    if (this.ghost.visible)
      this.ghost.position.set(
        this.pointer.x - CARD_W / 2,
        this.pointer.y - heightOf(this.ghostType ?? 'server') / 2,
      )
  }

  /** Sends the pointer to the other Seats: the latest spot, 25 times a second. */
  private flushCursor(now: number): void {
    if (!this.cursorWaiting) return
    const state = this.state
    if (state === null || now - this.cursorSentAt < CURSOR_MS) return
    this.emitCursor()
  }

  /** Sends the pointer now, with what this Seat is doing: a position and its activity. */
  private emitCursor(): void {
    const state = this.state
    if (state === null || !this.pointerKnown) return
    this.cursorWaiting = false
    this.cursorSentAt = performance.now()
    this.events.onCursor?.({
      x: this.pointer.x,
      y: this.pointer.y,
      region: state.region,
      activity: this.activity,
    })
  }

  /**
   * A panel opened or closed. An open panel keeps the pointer where it last was,
   * so the other Seats see what this Seat is doing instead of an empty Board.
   */
  setCursorActivity(activity: SeatActivity | null): void {
    if (this.activity === activity) return
    this.activity = activity
    if (this.state === null || !this.pointerKnown) return
    // Back on the Board: resume normal movement. Elsewhere: the pointer is gone.
    if (activity !== null || this.over) {
      this.emitCursor()
      return
    }
    this.cursorWaiting = false
    this.events.onCursorGone?.()
  }

  /** Another Seat moved its pointer. */
  moveSeatCursor(cursor: SeatCursor): void {
    this.cursorLayer.move(cursor, performance.now())
  }

  /** A Seat's pointer left its Board, or the Seat did. */
  hideSeatCursor(seat: string): void {
    this.cursorLayer.remove(seat)
  }

  clearSeatCursors(): void {
    this.cursorLayer.clear()
  }
}

const HOLD_S = 0.6
