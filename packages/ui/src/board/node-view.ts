import { isDown, leftOf, warmOf } from '@quorum/simulation/life'
import { Container, Graphics, Sprite, Text } from 'pixi.js'
import { COMPONENTS, POOLS, type BuildGroup, type ComponentId } from '@quorum/simulation/catalog'
import { POOL_ICONS } from '../game/pools.ts'
import { type Ledger, type NodeStatus } from '@quorum/simulation/ledger'
import { type Game, type GameNode, type Region } from '@quorum/simulation/state'
import {
  CARD_W,
  HEAD,
  PORT_R,
  ROW,
  heightOf,
  layoutOf,
  rowMid,
  rowTop,
  type Pt,
} from './geometry.ts'
import { FOOT_ICONS, ROW_ICONS, footerOf, levelOf, rowsOf, sizePips, type RowTone } from './card.ts'
import { COMPONENT_ICONS } from '../game/icons.ts'
import { type Palette, mix, gradient } from './palette.ts'
import { silhouette, badgeGlyph } from './shapes.ts'
import { easeOut, ENTER_S, EXIT_S, reducedMotion, follow } from './motion.ts'
import { glyph, paint, paintLogo } from './glyphs.ts'
import {
  footerRect,
  BADGE_X,
  BADGE_Y,
  BADGE_R,
  TITLE_X,
  medallion,
  headerBand,
  pipsWidth,
  pips,
} from './card-parts.ts'
import { MONO, SANS, fitText, label } from './text.ts'
import { DIM } from './belt-view.ts'

/** The smallest zoom Fit uses, so card text stays readable. */
export const MIN_FIT_SCALE = 0.85
/** A phone has pinch-zoom, so fit may go smaller to show the whole Design. */
export const MIN_FIT_SCALE_PHONE = 0.7

export class NodeView {
  readonly root = new Container()
  /** A deeper shadow, shown while the card is lifted. */
  private readonly shadow = new Graphics()
  /** The selection ring, outside the card's edge. */
  private readonly ring = new Graphics()
  private readonly frame = new Graphics()
  /** The medallion and status mark, over the card's edge. */
  private readonly medal = new Graphics()
  private readonly bars = new Graphics()
  private readonly ports = new Graphics()
  private readonly mark = glyph(12)
  /** Zoomed far out, the card gives way to this chip: its block, its name and the load it carries. */
  private readonly chip = new Graphics()
  private readonly chipTitle = label(15, SANS, '600')
  private chipKey = ''
  /** What the chip draws, from the last update. */
  private chipName = ''
  private chipHue = 0
  private chipStatus: NodeStatus = 'idle'
  private chipLoad = 0
  private readonly title = label(15, SANS, '700')
  private readonly level = label(10.5, MONO)
  private readonly ordinal = label(9, MONO, '700')
  private readonly glyphs: Array<Sprite> = []
  private readonly names: Array<Text> = []
  private readonly values: Array<Text> = []
  private readonly valueMarks: Array<Sprite> = []
  private readonly rows = new Container()
  /**
   * The parts a tick changes: the rows and their bars, then the chip. Pixi rebuilds a
   * whole render group when a Graphics in it is redrawn or a Text gets new words, so
   * these sit in groups of their own: a new figure rebuilds one card's rows, not every card.
   */
  private readonly live = new Container()
  private readonly chipLayer = new Container()
  private readonly foot = label(12, SANS, '600')
  private readonly footMark = glyph(14)
  /** Whether the card has a footer button, so the level of detail shows its icon only then. */
  private footed = false
  /** A ring round the footer icon of a held button; it fills clockwise as the hold does. */
  private readonly markRing = new Graphics()
  private ringAt: Readonly<{ x: number; y: number; ink: number }> | null = null
  private ringKey = ''
  private holdShare = 0
  /** The hold's fill across the footer button. */
  private readonly holdFill = new Graphics()
  private holdKey = -1
  /** The celebration after a bought size: seconds in, or -1 when idle. */
  private cheer = -1
  private readonly burst = new Graphics()
  private digest = ''
  /** What each layer was last drawn for. */
  private frameKey = ''
  private medalKey = ''
  private barsKey = ''
  private stranded: boolean | null = null
  private shadowDrawn = false
  /** Seconds since the card arrived; Infinity when it was already on the board. */
  private age = Number.POSITIVE_INFINITY
  /** Seconds into the exit, or -1 while the Node lives. */
  private leaving = -1

  private readonly group: BuildGroup
  readonly height: number
  /** Where the card is drawn. It follows its Node, so a move, a drop on the grid
   *  and an undo glide instead of jumping. */
  at: Pt | null = null
  private target: Pt = { x: 0, y: 0 }
  /** Picked up by a drag: the card rises, grows a little and casts a deeper shadow. */
  lifted = false
  private lift = 0
  /** Pressed: the card sinks a little under the pointer. */
  held = false
  private hold = 0
  private selected = false
  /** Off the focused path: the card fades back. */
  dim = false
  private selection = 0
  private accent = 0

  constructor(
    readonly type: ComponentId,
    enter: boolean,
  ) {
    const layout = layoutOf(type)
    this.group = COMPONENTS[type].group
    this.height = heightOf(type)
    // Scale around the card's center, so it grows in place.
    this.root.pivot.set(CARD_W / 2, this.height / 2)
    if (enter) {
      this.age = 0
      this.root.alpha = 0
      if (!reducedMotion()) this.root.scale.set(0.96)
    }
    this.shadow.alpha = 0
    // Unbatched, each larger shape would cost a draw call per card. The card layer
    // rebuilds only when a card changes, on a tick, not on every frame.
    for (const part of [
      this.shadow,
      this.ring,
      this.frame,
      this.chip,
      this.holdFill,
      this.burst,
      this.bars,
      this.ports,
      this.medal,
      this.markRing,
    ])
      part.context.batchMode = 'batch'
    this.chipLayer.addChild(this.chip)
    this.root.addChild(
      this.shadow,
      this.ring,
      this.frame,
      this.chipLayer,
      this.holdFill,
      this.burst,
      this.ports,
      this.medal,
      this.mark,
      this.title,
      this.level,
      this.ordinal,
      this.foot,
      this.footMark,
      this.markRing,
      this.chipTitle,
    )
    this.chipTitle.anchor.set(0.5, 0.5)
    this.chipLayer.visible = false
    this.chipTitle.visible = false
    const glyphSize = badgeGlyph(this.group, BADGE_R)
    this.mark.setSize(glyphSize)
    this.mark.position.set(BADGE_X - glyphSize / 2, BADGE_Y - glyphSize / 2)
    this.title.anchor.set(0, 0.5)
    this.title.position.set(TITLE_X, HEAD / 2)
    this.level.anchor.set(1, 0.5)
    this.ordinal.anchor.set(1, 0)
    this.ordinal.position.set(CARD_W - 10, 3)
    for (let index = 0; index < layout.rows; index += 1) {
      const mark = glyph(13)
      const name = label(11, SANS, '500')
      const value = label(11, MONO, '500')
      name.anchor.set(0, 0.5)
      value.anchor.set(1, 0.5)
      mark.position.set(13, rowMid(index) - 7.5)
      name.position.set(32, rowMid(index) - 1)
      value.position.set(CARD_W - 14, rowMid(index) - 1)
      const valueMark = glyph(13)
      valueMark.visible = false
      this.glyphs.push(mark)
      this.names.push(name)
      this.values.push(value)
      this.valueMarks.push(valueMark)
      this.rows.addChild(mark, name, value, valueMark)
    }
    this.live.addChild(this.bars, this.rows)
    this.root.addChild(this.live)
    this.foot.anchor.set(0, 0.5)
  }

  /** Level of detail: zoomed far out the rows fade, then the whole card becomes a chip. */
  detail(rows: number, chip: number, colors: Palette): void {
    const full = 1 - chip
    // A hidden render group is skipped, where an empty one still splits the cards' batch.
    this.live.visible = full > 0
    this.rows.visible = rows > 0
    this.rows.alpha = rows * full
    this.bars.alpha = full
    for (const part of [this.frame, this.title, this.level, this.foot, this.markRing]) {
      part.visible = full > 0
      part.alpha = full
    }
    // Setting `visible` back and forth makes Pixi rebuild every card, so it is set once.
    this.footMark.visible = full > 0 && this.footed
    this.footMark.alpha = full
    this.chipLayer.visible = chip > 0
    this.chip.alpha = chip
    this.chipTitle.visible = chip > 0
    this.chipTitle.alpha = chip
    if (chip > 0) this.drawChip(colors)
  }

  /** The chip a card collapses to at low zoom: its name, and a ring of the load it carries. */
  private drawChip(colors: Palette): void {
    const load = Math.round(this.chipLoad * 20) / 20
    const key = `${this.chipName}:${this.chipHue}:${this.chipStatus}:${load}`
    if (key === this.chipKey) return
    this.chipKey = key
    this.chip.clear()
    silhouette(this.chip, this.group, 0, 0, CARD_W, this.height).fill(
      mix(colors.card, this.chipHue, 0.08),
    )
    silhouette(this.chip, this.group, 0, 0, CARD_W, this.height).stroke({
      color: mix(this.chipHue, colors.shade, 0.25),
      width: 1.5,
      alignment: 1,
    })
    // The load ring: the share of the limiting resource, as the card's load bar shows it.
    const ring = BADGE_R + 9
    this.chip.circle(BADGE_X, BADGE_Y, ring).stroke({ color: colors.well, width: 3 })
    if (load > 0)
      this.chip
        .moveTo(BADGE_X, BADGE_Y - ring)
        .arc(BADGE_X, BADGE_Y, ring, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * load)
        .stroke({
          color:
            this.chipStatus === 'danger' || this.chipStatus === 'down'
              ? colors.danger
              : load >= 0.9
                ? colors.danger
                : load >= 0.7
                  ? colors.warn
                  : colors.accent,
          width: 3,
          cap: 'round',
        })
    this.chipTitle.style.fill = this.chipStatus === 'down' ? colors.danger : colors.ink
    this.chipTitle.position.set(CARD_W / 2, this.height / 2)
    fitText(this.chipTitle, this.chipName, CARD_W - 24)
  }

  leave(): void {
    this.leaving = 0
  }

  private drawMarkRing(): void {
    const at = this.ringAt
    // A redrawn Graphics makes Pixi rebuild every card, so it is redrawn only when it changes.
    const key = at ? `${at.x}:${at.y}:${at.ink}:${this.holdShare}` : ''
    if (key === this.ringKey) return
    this.ringKey = key
    this.markRing.clear()
    if (!at) return
    this.markRing.circle(at.x, at.y, 12).stroke({ color: at.ink, width: 1.5, alpha: 0.35 })
    if (this.holdShare > 0)
      this.markRing
        .moveTo(at.x, at.y - 12)
        .arc(at.x, at.y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.holdShare)
        .stroke({ color: at.ink, width: 2.5 })
  }

  /** Fills the footer button from the left as the player holds it; 0 clears it. */
  setHold(share: number): void {
    const key = Math.round(share * 200)
    if (key === this.holdKey) return
    this.holdKey = key
    this.holdShare = share
    this.drawMarkRing()
    this.holdFill.clear()
    if (share <= 0) return
    const { x, y, w, h } = footerRect(this.type)
    this.holdFill
      .roundRect(x, y + 2, Math.max(16, w * share), h, 8)
      .fill({ color: 0xffffff, alpha: 0.32 })
  }

  /** A bought size: a gold ring blooms out of the card and the button flashes. */
  celebrate(): void {
    this.cheer = 0
  }

  private drawCheer(seconds: number, still: boolean): void {
    if (this.cheer < 0) return
    this.cheer += seconds
    const t = Math.min(1, this.cheer / CHEER_S)
    this.burst.clear()
    if (t >= 1 || still) {
      this.cheer = -1
      return
    }
    const out = easeOut(t)
    const fade = 1 - t
    const grow = 6 + 34 * out
    silhouette(
      this.burst,
      this.group,
      -grow,
      -grow,
      CARD_W + grow * 2,
      this.height + grow * 2,
      4 + grow / 2,
    ).stroke({
      color: 0xf5b82e,
      width: 4 * fade + 0.5,
      alpha: 0.9 * fade,
    })
    const { x, y, w, h } = footerRect(this.type)
    this.burst.roundRect(x, y + 2, w, h, 8).fill({ color: 0xffe08a, alpha: 0.7 * fade * fade })
  }

  /** Entrance 200ms and exit 150ms on --ease-out, from 0.96 scale; the follow,
   *  lift, press and selection ring on top. False once the exit ends. */
  tick(seconds: number, still: boolean): boolean {
    let scale = 1
    if (this.leaving >= 0) {
      this.leaving += seconds
      const t = easeOut(Math.min(1, this.leaving / EXIT_S))
      this.root.alpha = 1 - t
      scale = 1 - 0.04 * t
    } else if (this.age < ENTER_S) {
      this.age += seconds
      const t = easeOut(Math.min(1, this.age / ENTER_S))
      this.root.alpha = t
      scale = 0.96 + 0.04 * t
    }
    if (this.leaving < 0 && this.age >= ENTER_S)
      this.root.alpha += ((this.dim ? DIM : 1) - this.root.alpha) * follow(seconds, 16, still)
    // A held card stays under the pointer; a released one eases into its grid cell.
    const at = this.at ?? this.target
    const k = follow(seconds, this.lifted ? 38 : 16, still)
    const x = at.x + (this.target.x - at.x) * k
    const y = at.y + (this.target.y - at.y) * k
    this.at = {
      x: Math.abs(this.target.x - x) < 0.1 ? this.target.x : x,
      y: Math.abs(this.target.y - y) < 0.1 ? this.target.y : y,
    }
    this.root.position.set(this.at.x + CARD_W / 2, this.at.y + this.height / 2)
    this.drawCheer(seconds, still)
    this.lift += ((this.lifted ? 1 : 0) - this.lift) * follow(seconds, 20, still)
    this.hold += ((this.held ? 1 : 0) - this.hold) * follow(seconds, 32, still)
    this.shadow.alpha = this.lift
    if (!still) scale *= 1 + 0.03 * this.lift - 0.02 * this.hold
    this.root.scale.set(still ? 1 : scale)
    // Selection: the ring closes in from a little way out and comes up to full strength.
    const selection =
      this.selection + ((this.selected ? 1 : 0) - this.selection) * follow(seconds, 24, still)
    if (Math.abs(selection - this.selection) > 0.001) {
      this.selection =
        Math.abs(selection - (this.selected ? 1 : 0)) < 0.01 ? (this.selected ? 1 : 0) : selection
      this.drawRing()
    }
    return this.leaving < EXIT_S
  }

  private drawRing(): void {
    const e = this.selection
    this.ring.clear()
    this.ring.alpha = e
    if (e <= 0) return
    const pad = 2.5 + 5 * (1 - e)
    silhouette(this.ring, this.group, 0, 0, CARD_W, this.height, pad + 2).fill({
      color: this.accent,
      alpha: 0.07,
    })
    silhouette(this.ring, this.group, 0, 0, CARD_W, this.height, pad).stroke({
      color: this.accent,
      width: 2,
    })
  }

  update(
    game: Game,
    node: GameNode,
    ledger: Ledger,
    selected: boolean,
    pressed: boolean,
    colors: Palette,
    history: ReadonlyArray<number>,
    ordinal: number,
    region: Region | null,
    locale: string,
    t: (text: string) => string,
  ): void {
    const own = ledger.nodes[node.id]
    if (!own) return
    const def = COMPONENTS[node.type]
    const layout = layoutOf(node.type)
    const rows = rowsOf(game, node, ledger, history)
    const footer = footerOf(game, node)
    // What the chip says at low zoom, kept from the update so the zoom need not read the Game.
    this.chipName = t(def.name)
    this.chipHue = colors.groups[this.group]
    this.chipStatus = own.status
    this.chipLoad = Math.min(1, own.utilization)
    this.target = { x: node.x, y: node.y }
    this.at ??= this.target
    if (this.selected !== selected || this.accent !== colors.accent) {
      this.selected = selected
      this.accent = colors.accent
      this.drawRing()
    }
    const digest = JSON.stringify([
      locale,
      pressed,
      rows,
      footer,
      node.size,
      own.status,
      selected,
      Math.ceil(leftOf(node.life)),
      warmOf(node.life) < 1,
      levelOf(game, node, region),
      ordinal,
    ])
    if (digest === this.digest) return
    this.digest = digest

    const height = heightOf(node.type)
    const toneOf = (tone: RowTone | undefined) =>
      tone === 'danger'
        ? colors.danger
        : tone === 'warn'
          ? colors.warn
          : tone === 'ok'
            ? colors.ok
            : tone === 'muted'
              ? colors.muted
              : colors.ink
    const status =
      own.status === 'down' || own.status === 'danger'
        ? colors.danger
        : own.status === 'warn'
          ? colors.warn
          : own.status === 'ok'
            ? colors.ok
            : colors.border
    // Selection is the ring outside the card (drawRing), so the edge keeps its status.
    const edge = own.status === 'danger' || own.status === 'down' ? colors.danger : colors.border

    const group = this.group
    const hue = colors.groups[group]
    const badgeTone = node.life._tag === 'Stopped' ? colors.muted : hue
    const rect = footerRect(node.type)
    const sink = footer && pressed && footer.enabled && footer.tone !== 'muted' ? 2 : 0
    // Each layer is redrawn only when what it shows changes; values change every tick.
    const frameKey = `${edge}:${isDown(node.life)}:${footer?.tone}:${sink}:${selected}`
    if (frameKey !== this.frameKey) {
      this.frameKey = frameKey
      this.frame.clear()
      // Depth: a wide soft shadow and a tight contact shadow under the card.
      silhouette(this.frame, group, 1, 3, CARD_W - 2, height).fill({
        color: colors.shade,
        alpha: 0.035,
      })
      silhouette(this.frame, group, 0, 1, CARD_W, height).fill({ color: colors.shade, alpha: 0.05 })
      silhouette(this.frame, group, 0, 0, CARD_W, height).fill(colors.card)
      headerBand(this.frame, group, hue, colors)
      for (let index = 1; index < layout.rows; index += 1) {
        this.frame
          .moveTo(10, rowTop(index))
          .lineTo(CARD_W - 10, rowTop(index))
          .stroke({ color: colors.border, width: 1, alpha: 0.55 })
      }
      if (isDown(node.life))
        silhouette(this.frame, group, 0, 0, CARD_W, height).fill({
          color: colors.danger,
          alpha: 0.07,
        })
      if (footer) {
        const fill =
          footer.tone === 'ok'
            ? colors.ok
            : footer.tone === 'danger'
              ? colors.danger
              : footer.tone === 'accent'
                ? colors.accent
                : colors.track
        const { x, y, w, h } = rect
        if (footer.tone === 'muted') {
          // Disabled: sunk into the card instead of raised.
          this.frame.roundRect(x, y + 1, w, h, 8).fill(fill)
          this.frame
            .roundRect(x, y + 1, w, h, 8)
            .stroke({ color: colors.shade, width: 1, alignment: 1, alpha: 0.06 })
          this.frame
            .moveTo(x + 8, y + 1.5)
            .lineTo(x + w - 8, y + 1.5)
            .stroke({ color: colors.shade, width: 1, alpha: 0.06 })
        } else {
          const top = footer.tone === 'accent' ? colors.fillTop : mix(fill, 0xffffff, 0.16)
          const bottom = footer.tone === 'accent' ? colors.fillBottom : mix(fill, 0x000000, 0.08)
          // Raised: soft drop, a darker lip, a top-lit body and a glossy top edge.
          // Pressed, the body sinks onto its lip and the drop shadow goes.
          const lifted = y + sink
          if (!sink)
            this.frame.roundRect(x, y + 3, w, h, 8).fill({ color: colors.shade, alpha: 0.12 })
          this.frame.roundRect(x, y + 2, w, h, 8).fill(mix(bottom, 0x000000, 0.28))
          this.frame.roundRect(x, lifted, w, h, 8).fill(gradient(top, bottom))
          this.frame
            .roundRect(x, lifted, w, h, 8)
            .stroke({ color: mix(bottom, 0x000000, 0.3), width: 1, alignment: 1, alpha: 0.7 })
          this.frame
            .moveTo(x + 8, lifted + 1.5)
            .lineTo(x + w - 8, lifted + 1.5)
            .stroke({ color: 0xffffff, width: 1, alpha: 0.28 })
        }
      }
      silhouette(this.frame, group, 0, 0, CARD_W, height).stroke({
        color: edge,
        width: 1,
        alignment: 1,
        alpha: 0.8,
      })
      // The selection is the board's focus: a ring outside the card, as on a focused control.
      if (selected)
        silhouette(this.frame, group, 0, 0, CARD_W, height, 4).stroke({
          color: colors.accent,
          width: 2.5,
          alpha: 0.55,
        })
    }
    this.footed = Boolean(footer)
    if (footer) {
      const { x, y, w, h } = rect
      const ink =
        footer.tone === 'muted' ? colors.muted : footer.tone === 'accent' ? colors.onFill : 0xffffff
      this.foot.text = t(footer.text)
      // Center the glyph and text together.
      // A held button's icon sits in a ring that reaches 5px past it on each side.
      const ringed = footer.enabled && (footer.glyph === 'resize' || footer.glyph === 'more')
      const pad = ringed ? 5 : 0
      const start = x + pad + (w - (14 + 6 + this.foot.width + pad * 2)) / 2
      const mid = y + h / 2 + (footer.tone === 'muted' ? 1 : sink)
      paint(this.footMark, FOOT_ICONS[footer.glyph], ink)
      this.footMark.position.set(start, mid - 7)
      this.ringAt = ringed ? { x: start + 7, y: mid, ink } : null
      this.drawMarkRing()
      this.foot.position.set(start + 20 + pad, mid)
      this.foot.style.fill = ink
    } else {
      this.foot.text = ''
      this.ringAt = null
      this.drawMarkRing()
    }
    // The lifted shadow: drawn once, faded in by the lift.
    if (!this.shadowDrawn) {
      this.shadowDrawn = true
      silhouette(this.shadow, group, 6, 18, CARD_W - 12, height - 6, 10).fill({
        color: colors.shade,
        alpha: 0.05,
      })
      silhouette(this.shadow, group, 2, 9, CARD_W - 4, height - 2, 3).fill({
        color: colors.shade,
        alpha: 0.08,
      })
    }
    // Status is a shape as well as a colour: a dot, a triangle, a square, a cross. It sits
    // on the medallion's corner, on a disc of the card's colour.
    const medalKey = `${badgeTone}:${own.status}`
    if (medalKey !== this.medalKey) {
      this.medalKey = medalKey
      this.medal.clear()
      medallion(this.medal, group, badgeTone, colors)
      if (status !== colors.border) {
        const sx = BADGE_X + 15
        const sy = BADGE_Y + 15
        this.medal.circle(sx, sy, 6).fill(colors.card)
        if (own.status === 'ok') this.medal.circle(sx, sy, 3.5).fill(status)
        else if (own.status === 'warn')
          this.medal.poly([sx, sy - 4, sx + 4.2, sy + 3.2, sx - 4.2, sy + 3.2]).fill(status)
        else if (own.status === 'danger') this.medal.rect(sx - 3.3, sy - 3.3, 6.6, 6.6).fill(status)
        else
          this.medal
            .moveTo(sx - 3.5, sy - 3.5)
            .lineTo(sx + 3.5, sy + 3.5)
            .moveTo(sx + 3.5, sy - 3.5)
            .lineTo(sx - 3.5, sy + 3.5)
            .stroke({ color: status, width: 2.2, cap: 'round' })
      }
    }

    paint(this.mark, COMPONENT_ICONS[node.type], 0xffffff)
    const title =
      node.life._tag === 'Stopped'
        ? t(`${def.name} · failed`)
        : node.life._tag === 'Restarting'
          ? t(`${def.name} · restart`)
          : warmOf(node.life) < 1 && (def.sized || node.type === 'cache')
            ? t(`${def.name} · cold`)
            : t(def.name)
    this.title.style.fill = isDown(node.life) ? colors.danger : colors.ink
    const size = sizePips(node)
    const barsKey = JSON.stringify([size, badgeTone, rows.map((row) => row.trend ?? row.bar)])
    const bars = barsKey !== this.barsKey
    this.barsKey = barsKey
    if (bars) this.bars.clear()
    // Right to left: the size pips, then the zone and copies, then the title takes the rest.
    let right = CARD_W - 12
    if (size) {
      const width = pipsWidth(size.total)
      if (bars)
        pips(
          this.bars,
          right - width,
          HEAD / 2 - 4.5,
          size.filled,
          size.total,
          badgeTone,
          colors.well,
        )
      right -= width + 7
    }
    this.ordinal.text = ordinal > 0 ? `#${ordinal}` : ''
    this.ordinal.visible = ordinal > 0
    this.ordinal.style.fill = colors.muted
    this.level.text = t(levelOf(game, node, region))
    this.level.style.fill = colors.muted
    this.level.position.set(right, HEAD / 2)
    if (this.level.text) right -= this.level.width + 8
    // A long title gives way to the level: it is cut with an ellipsis before the two touch.
    fitText(this.title, title, right - 4 - this.title.x)

    rows.forEach((row, index) => {
      const mark = this.glyphs[index]
      const name = this.names[index]
      const value = this.values[index]
      const valueMark = this.valueMarks[index]
      if (!mark || !name || !value || !valueMark) return
      if (row.logo) paintLogo(mark, row.logo, colors.ink)
      else if (row.pool) paint(mark, POOL_ICONS[row.pool], POOLS[row.pool].color)
      else paint(mark, ROW_ICONS[row.glyph], colors.muted)
      name.style.fill = row.logo ? colors.ink : colors.muted
      value.text = t(row.value)
      value.style.fill = toneOf(row.tone)
      // A long name gives way to the value: it is cut with an ellipsis before the two touch.
      fitText(name, t(row.name), value.x - value.width - (row.valueLogo ? 22 : 0) - 10 - name.x)
      valueMark.visible = row.valueLogo !== undefined
      if (row.valueLogo) {
        paintLogo(valueMark, row.valueLogo, colors.ink)
        valueMark.position.set(value.x - value.width - 18, rowMid(index) - 7.5)
      }
      if (!bars) return
      if (row.trend) {
        // Load over the last day: a sparkline in place of the bar.
        const bottom = rowTop(index) + ROW - 1
        const width = CARD_W - 28
        const points = row.trend
        const at = (i: number) => {
          const x = 14 + (width * i) / (points.length - 1)
          return [x, bottom - 6 * Math.min(1, points[i] ?? 0)] as const
        }
        const [x0, y0] = at(0)
        this.bars.moveTo(x0, y0)
        for (let i = 1; i < points.length; i += 1) this.bars.lineTo(...at(i))
        const peak = Math.max(...points)
        this.bars.stroke({
          color: peak > 0.95 ? colors.danger : peak > 0.8 ? colors.warn : colors.accent,
          width: 1.25,
        })
      } else if (row.bar !== undefined) {
        const y = rowTop(index) + ROW - 4
        const tone = row.bar > 0.95 ? colors.danger : row.bar > 0.8 ? colors.warn : colors.accent
        const share = Math.max(0, Math.min(1, row.bar))
        this.bars.roundRect(14, y, CARD_W - 28, 3, 1.5).fill(colors.well)
        if (share > 0)
          this.bars.roundRect(14, y, Math.max(3, (CARD_W - 28) * share), 3, 1.5).fill(tone)
      }
    })

    const stranded = own.stranded > 0.01
    if (stranded === this.stranded) return
    this.stranded = stranded
    this.ports.clear()
    if (layout.inRow !== null) {
      const y = rowMid(layout.inRow)
      this.ports.circle(0, y, PORT_R).fill(colors.card).stroke({ color: colors.edge, width: 1.5 })
      this.ports.circle(0, y, 2).fill(colors.edge)
    }
    if (layout.outRow !== null) {
      const y = rowMid(layout.outRow)
      this.ports
        .circle(CARD_W, y, PORT_R)
        .fill(stranded ? colors.danger : colors.groups[this.group])
      this.ports.circle(CARD_W, y, 2).fill(colors.card)
    }
  }
}

const CHEER_S = 0.8
