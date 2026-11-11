import type { Ledger } from '@quorum/simulation/ledger'
import { HOLD_S, inFooter } from './card-parts.ts'
import { Application, Container, Graphics, Point, type RendererPreference } from 'pixi.js'
import { COMPONENTS, type ComponentId } from '@quorum/simulation/catalog'
import { replicationPairsOf } from '@quorum/simulation/lookups'
import { type Game, type GameNode } from '@quorum/simulation/state'
import { type SeatActivity } from '@quorum/simulation/room'
import {
  CARD_W,
  HEAD,
  PORT_R,
  boxOf,
  freeSpot,
  heightOf,
  layoutOf,
  outPort,
  route,
  type Placed,
  type Pt,
  type Route,
} from './geometry.ts'
import { compute } from './compute.ts'
import { CHIP_NONE } from './lod.ts'
import { type RoutedLink, type RoutedNode, type Wire } from './routing.ts'
import { COMPONENT_ICONS } from '../game/icons.ts'
import { CursorOverlay, type SeatCursor } from './cursors.ts'
import { animate } from './frame.ts'
import { bindPointer } from './pointer.ts'
import { type BoardEvents, type BoardState } from './types.ts'
import { type Palette, palette } from './palette.ts'
import { silhouette, badgeGlyph } from './shapes.ts'
import { DRAW_IN_S, CURSOR_MS, HOVER_SETTLE_MS } from './motion.ts'
import { glyph, paint } from './glyphs.ts'
import { BADGE_X, BADGE_Y, BADGE_R, TITLE_X, medallion, headerBand } from './card-parts.ts'
import { pointOn, distanceTo, laneUnder, routeOf, SLACK, bent, dashed } from './paths.ts'
import { SANS, label } from './text.ts'
import { MIN_FIT_SCALE, MIN_FIT_SCALE_PHONE, NodeView } from './node-view.ts'
import { BeltView, linkKey, type Mouth } from './belt-view.ts'
import { ChevronLayer, PacketLayer, NoteLayer } from './layers.ts'

type Mutable<T> = { -readonly [K in keyof T]: T[K] }

/** The phone: narrow in portrait, short in landscape (the `compact` variant in theme.css). */
const isPhone = (): boolean => matchMedia('(max-width: 639px), (max-height: 499px)').matches

/** Buying a size is held, not clicked: the fill crosses the button, and the buy lands at the end. */

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
  readonly app = new Application()
  readonly world = new Container()
  /**
   * The belts, one BeltView per link in the Model's order, under the splitters. Each
   * belt draws in three shared layers, so a busy Design draws in a few batches, not
   * a few per link: bodies, then the moving chevrons in a render group of their own
   * (they change every frame, the rest does not), then the mouths.
   */
  readonly wires = new Container()
  readonly bodies = new Container()
  readonly chevrons = new ChevronLayer()
  readonly mouths = new Container()
  readonly belts = new Map<string, BeltView>()
  beltLinks: ReadonlyArray<unknown> = []
  beltOrder = ''
  readonly splitters = new Graphics()
  splittersKey = ''
  splitLinks: Game['links'] | null = null
  splitFresh = 0
  /** The tunnel portals, redrawn only when a mouth moves or the focus changes. */
  readonly portals = new Graphics()
  /** The mouths the portals were last drawn for, and the colour they were drawn in. */
  mouthsDrawn: ReadonlyArray<Mouth> = []
  portalInk = -1
  readonly packets = new PacketLayer()
  /** The still arrows reduced motion shows in place of the packets. */
  readonly arrows = new Graphics()
  /** The rate labels on still belts: reduced motion's stand-in for moving packets. */
  readonly notes = new NoteLayer()
  /** The round trip a link between regions pays, under its belt. */
  readonly places = new NoteLayer()
  readonly cards = new Container()
  /** The boxes drawn around Nodes, under the belts, and their names. */
  readonly boxLayer = new Container()
  readonly boxes = new Graphics()
  /** Replication copies, drawn as dashed lines and never as Links. */
  readonly replication = new Graphics()
  readonly boxNames = new Container()
  boxesKey = ''
  replicationKey = ''
  readonly overlay = new Graphics()
  readonly ghost = new Container()
  readonly views = new Map<string, NodeView>()
  /** The Nodes as they are drawn this frame, and the views that follow their cards. */
  readonly shownCards = new Map<string, GameNode>()
  readonly drawnCards = new Map<string, { source: GameNode; drawn: Mutable<GameNode> }>()
  /** Cards fading out after their Node left the Design. */
  leaving: Array<NodeView> = []
  /** False until the first sync, so a loaded board does not animate in. */
  seeded = false
  /** The Node whose card button is held down. */
  pressed: string | null = null
  /** When the held footer button went down, in ms. */
  holdSince = 0
  state: BoardState | null = null
  gesture: Gesture = null
  hoverLink: Readonly<{ from: string; to: string }> | null = null
  /** What the pointer just entered, and when: it lights after a rest, so a pass lights nothing. */
  hoverAim: Readonly<{
    node: string | null
    link: Readonly<{ from: string; to: string }> | null
    since: number
  }> | null = null
  /** The link a click picked: Delete or its × badge cuts it. A click never cuts by itself. */
  selectedLink: Readonly<{ from: string; to: string }> | null = null
  /** The Node under the pointer: with the selected one, it lights its whole path. */
  hoverNode: string | null = null
  pointer: Pt = { x: 0, y: 0 }
  /** Fingers and pens on the board, in client coordinates. Two of them pinch. */
  readonly touches = new Map<number, Pt>()
  pinch: Readonly<{ distance: number; center: Pt }> | null = null
  /** The last pointer to move was a finger or a pen, which has no hover and a wide tip. */
  coarse = false
  /** Local positions while a node is dragged, ahead of the Model. */
  dragged: Readonly<{ id: string; x: number; y: number }> | null = null
  droppedAt = 0
  /** Where the held card, new Node or Playbook lands: the nearest spot that keeps clear. */
  landing: Pt | null = null
  landingKey = ''
  /** Routed links, the Nodes where they were routed, and the layout key asked for last. */
  routed = new Map<string, Wire>()
  routedNodes = new Map<string, Pt>()
  private readonly wireMemo = new Map<
    string,
    {
      from: GameNode
      to: GameNode
      fx: number
      fy: number
      tx: number
      ty: number
      table: Map<string, Wire>
      held: Map<string, Pt> | null
      wire: Wire
    }
  >()
  private ratesFrom: Ledger['links'] | null = null
  private readonly rates = new Map<string, Ledger['links'][number]>()
  routedFor = ''
  /** The Game and drag the routes were last checked against. */
  routedGame: Game | null = null
  routedDrag: BoardController['dragged'] = null
  /** The layout to route next, the one routed last, and whether the worker has one. */
  routeWanted: Readonly<{
    key: string
    nodes: Array<RoutedNode>
    links: Array<RoutedLink>
  }> | null = null
  routeDone = ''
  routing = false
  /**
   * While a held card sits on another card, its links run to the spot where it
   * will land, and they stay there while the dropped card glides into it.
   */
  heldLanding: Map<string, Pt> | null = null
  ghostType: ComponentId | null = null
  ghostLocale = 'en'
  /** The drawn end of a wire being pulled. It eases onto a port it snaps to. */
  wireEnd: Pt | null = null
  /** The Node a pulled wire is snapped to, and how far its highlight has come in. */
  snapTo: string | null = null
  snapGlow = 0
  /** A wire let go over nothing, drawing back into its port. */
  retract: { path: Route; t: number } | null = null
  /** Links that just arrived, by key, with their age in seconds. */
  readonly fresh = new Map<string, number>()
  /** The link the last wire drag asked for: it is already drawn, so it does not draw in. */
  wired: string | null = null
  /** Links that just left, fading where they were. */
  cuts: Array<{ path: Route; t: number }> = []
  readonly abort = new AbortController()
  /** The other Seats' pointers, drawn over the Board. */
  readonly cursorLayer = new CursorOverlay()
  /** A pointer position waiting to go out, and when the last one went. */
  cursorWaiting = false
  cursorSentAt = 0
  /** The panel this Seat is in, sent with its last position so the pointer stays put. */
  activity: SeatActivity | null = null
  /** Whether the pointer has been on the Board, so there is a spot to keep. */
  pointerKnown = false
  /** Whether the pointer is over the Board now. */
  over = false
  /** Writes an activity key in this Board's language. */
  activityOf: (activity: SeatActivity) => string = (activity) => activity
  readonly resize: ResizeObserver
  /** Watches whether the board is on screen: a board scrolled out of view draws nothing. */
  readonly sight: IntersectionObserver
  onScreen = true
  phase = 0
  started = false
  fitted = false
  /** The host width the view was fitted to: a wider or narrower screen refits, a taller one does not. */
  fittedWidth: number | null = null
  destroyed = false

  constructor(
    readonly host: HTMLElement,
    readonly events: BoardEvents,
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
  run(): void {
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
  diffLinks(next: BoardState): void {
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
    this.destroyed = true
    this.abort.abort()
    this.resize.disconnect()
    this.sight.disconnect()
    this.cursorLayer.destroy()
    this.events.onCursorGone?.()
    if (this.started) this.app.destroy(true, { children: true })
  }

  onResize(): void {
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
    // Keep clear of the HUD above and the build dock below, unless the host says what to keep clear of.
    const phone = isPhone()
    const short = matchMedia('(max-height: 499px)').matches
    // A phone has no sidebar and little room to spare, so its Design gets a narrow margin.
    const pad = phone && this.state?.pad === undefined ? 24 : (this.state?.pad ?? 80)
    const minX = Math.min(...nodes.map((node) => node.x)) - pad
    const minY = Math.min(...nodes.map((node) => node.y)) - pad
    const maxX = Math.max(...nodes.map((node) => node.x + CARD_W)) + pad
    const maxY = Math.max(...nodes.map((node) => node.y + heightOf(node.type))) + pad
    const inset = this.state?.inset
    const top = inset ? inset.top : short ? 120 : phone ? 160 : 120
    const bottom = inset ? inset.bottom : short ? 70 : phone ? 90 : 210
    const room = Math.max(1, h - top - bottom)
    // The stats panel sits on the left on desktop: keep cards out from under it. A phone has no
    // panel, so it uses the full width and the design's own padding is the only margin.
    const left = inset ? inset.left : phone || short ? 0 : 380
    const edge = inset || phone || short ? 0 : 24
    const across = Math.max(1, w - left - edge)
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

  toWorld(event: PointerEvent | WheelEvent): Pt {
    const rect = this.host.getBoundingClientRect()
    const local = this.world.toLocal(new Point(event.clientX - rect.left, event.clientY - rect.top))
    return { x: local.x, y: local.y }
  }

  nodes(dragged = this.dragged): ReadonlyArray<GameNode> {
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
  selectionFrame(): Readonly<{ x: number; y: number; w: number; h: number }> | null {
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
  groupOf(id: string): ReadonlyArray<string> {
    const selection = this.state?.selection ?? []
    return selection.length > 1 && selection.includes(id) ? selection : [id]
  }

  /** The Nodes where their cards are drawn, so wires stay attached while cards glide. */
  shown(): Map<string, GameNode> {
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

  /**
   * The pointer entered a Node or a belt. Its light goes out at once, and the new one waits:
   * a pass across the Board lights nothing, and moving off clears without a delay.
   */
  aimHover(node: string | null, link: Readonly<{ from: string; to: string }> | null): void {
    const aim = this.hoverAim
    if (
      aim !== null &&
      aim.node === node &&
      aim.link?.from === link?.from &&
      aim.link?.to === link?.to
    )
      return
    const shown =
      node === this.hoverNode &&
      link?.from === this.hoverLink?.from &&
      link?.to === this.hoverLink?.to
    if (shown && aim === null) return
    this.hoverNode = null
    this.hoverLink = null
    this.hoverAim = node === null && link === null ? null : { node, link, since: performance.now() }
  }

  /** Lights the hover the pointer rested on. Called each frame, so it needs no timer. */
  settleHover(now: number): void {
    const aim = this.hoverAim
    if (aim === null || now - aim.since < HOVER_SETTLE_MS) return
    this.hoverNode = aim.node
    this.hoverLink = aim.link
    this.hoverAim = null
  }

  nodeAt(point: Pt): GameNode | null {
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
  footerAt(node: GameNode, point: Pt): boolean {
    return this.world.scale.x >= CHIP_NONE && inFooter(node, point)
  }

  outPortAt(point: Pt): GameNode | null {
    const reach = PORT_R + (this.coarse ? 16 : 6) / this.world.scale.x
    return (
      this.nodes().findLast((node) => {
        if (layoutOf(node.type).outRow === null) return false
        const port = outPort(node)
        return Math.hypot(port.x - point.x, port.y - point.y) <= reach
      }) ?? null
    )
  }

  selectLink(link: Readonly<{ from: string; to: string }>): void {
    this.selectedLink = link
    this.events.onEmptyTap()
  }

  /** Whether the point is on the × badge in the middle of the selected link. */
  onBadge(point: Pt): boolean {
    const link = this.selectedLink
    const from = link && this.shown().get(link.from)
    const to = link && this.shown().get(link.to)
    if (!from || !to) return false
    const mid = pointOn(this.wireOf(from, to).path, 0.5)
    return (
      Math.hypot(mid.x - point.x, mid.y - point.y) <= (this.coarse ? 16 : 11) / this.world.scale.x
    )
  }

  linkAt(point: Pt): Readonly<{ from: string; to: string }> | null {
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
  routes(): Map<string, Wire> {
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
  replicationLinks(game: Game): ReadonlyArray<RoutedLink> {
    const region = this.state?.region
    if (!region) return []
    return replicationPairsOf(game)
      .filter((pair) => pair.from.region === region && pair.to.region === region)
      .map((pair) => ({ from: pair.from.id, to: pair.to.id }))
  }

  askRoute(): void {
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
  wireOf(drawnFrom: GameNode, drawnTo: GameNode, key = `${drawnFrom.id}>${drawnTo.id}`): Wire {
    const table = this.routes()
    const held = this.heldLanding
    // A card's view is one object whose x and y change, so the memo compares them. The wire
    // stays the same object while nothing moved, which keeps its caches and its belt's body.
    let memo = this.wireMemo.get(key)
    if (
      memo &&
      memo.from === drawnFrom &&
      memo.to === drawnTo &&
      memo.fx === drawnFrom.x &&
      memo.fy === drawnFrom.y &&
      memo.tx === drawnTo.x &&
      memo.ty === drawnTo.y &&
      memo.table === table &&
      memo.held === held
    )
      return memo.wire
    // A GameNode carries a hundred fields. Spreading one per link per frame costs more
    // than everything else the board draws, so a held card makes only the three fields
    // that a route reads.
    const fromAt = held?.get(drawnFrom.id)
    const toAt = held?.get(drawnTo.id)
    const from = fromAt ? { type: drawnFrom.type, x: fromAt.x, y: fromAt.y } : drawnFrom
    const to = toAt ? { type: drawnTo.type, x: toAt.x, y: toAt.y } : drawnTo
    const wire = this.freshWire(table.get(key), drawnFrom.id, drawnTo.id, from, to)
    memo ??= { from: drawnFrom, to: drawnTo, fx: 0, fy: 0, tx: 0, ty: 0, table, held, wire }
    memo.from = drawnFrom
    memo.to = drawnTo
    memo.fx = drawnFrom.x
    memo.fy = drawnFrom.y
    memo.tx = drawnTo.x
    memo.ty = drawnTo.y
    memo.table = table
    memo.held = held
    memo.wire = wire
    this.wireMemo.set(key, memo)
    return wire
  }

  private freshWire(
    wire: Wire | undefined,
    fromId: string,
    toId: string,
    from: Placed,
    to: Placed,
  ): Wire {
    const a = this.routedNodes.get(fromId)
    const b = this.routedNodes.get(toId)
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

  /** The Ledger's rate per link key, rebuilt only when the Ledger hands over new links. */
  ratesFor(links: Ledger['links']): ReadonlyMap<string, Ledger['links'][number]> {
    if (links !== this.ratesFrom) {
      this.ratesFrom = links
      this.rates.clear()
      for (const link of links) this.rates.set(linkKey(link), link)
    }
    return this.rates
  }

  landingOf(dragged = this.gesture?.kind === 'node' ? this.dragged : null): Pt | null {
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
  pinchOf(): Readonly<{ distance: number; center: Pt }> {
    const [a, b] = [...this.touches.values()]
    if (!a || !b) return this.pinch ?? { distance: 1, center: { x: 0, y: 0 } }
    return {
      distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    }
  }

  /** Zoom by how the fingers spread and pan by how their midpoint moved. */
  zoomTo(next: Readonly<{ distance: number; center: Pt }>): void {
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

  bindPointer(): void {
    bindPointer(this)
  }

  /** Puts down whatever card is held or lifted. */
  /** Fills the held footer button and fires it at the end; dragging off it cancels. */
  advanceHold(): void {
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
    // One hold buys one size, even if the pointer stays down.
    this.events.onFooter(id)
  }

  letGo(): void {
    for (const view of this.views.values()) {
      view.held = false
      view.lifted = false
    }
  }

  /** A wire let go over nothing draws back into its port. */
  springBack(fromId: string): void {
    const from = this.shown().get(fromId)
    const end = this.wireEnd
    this.wireEnd = null
    this.snapTo = null
    if (!from || !end) return
    const lane = laneUnder(from, end.y)
    this.retract = { path: route(outPort(from), end, lane), t: 0 }
    this.events.onSound?.('release', 1, true)
  }

  syncCards(): void {
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
  pathOf(state: BoardState): ReadonlySet<string> | null {
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
  syncBelts(links: ReadonlyArray<Readonly<{ from: string; to: string }>>): void {
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

  syncGhost(): void {
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
  drawBoxes(game: Game, colors: Palette): void {
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
  drawReplication(state: BoardState, colors: Palette): void {
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

  animate(seconds: number): void {
    animate(this, seconds)
  }

  /** Sends the pointer to the other Seats: the latest spot, 25 times a second. */
  flushCursor(now: number): void {
    if (!this.cursorWaiting) return
    const state = this.state
    if (state === null || now - this.cursorSentAt < CURSOR_MS) return
    this.emitCursor()
  }

  /** Sends the pointer now, with what this Seat is doing: a position and its activity. */
  emitCursor(): void {
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
