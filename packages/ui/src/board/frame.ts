import { COMPONENTS, KINDS } from '@quorum/simulation/catalog'
import { has, zoned, zoneMs } from '@quorum/simulation/lookups'
import { type GameNode } from '@quorum/simulation/state'
import { CARD_W, heightOf, inPort, outPort, route, type Box, type Pt } from './geometry.ts'
import { flowMarks, placeLabel } from './flows.ts'
import { chipAt, rowsAt } from './lod.ts'
import { packetShapeOf } from '../game/packets.ts'
import { type BoardState } from './types.ts'
import { type Palette, palette, mix } from './palette.ts'
import { silhouette } from './shapes.ts'
import { easeOut, DRAW_IN_S, GLOW_S, CUT_S, RETRACT_S, reducedMotion, follow } from './motion.ts'
import { footerRect } from './card-parts.ts'
import { lengthOf, pointOn, laneUnder, midOf, partOf, traceOf } from './paths.ts'
import { BELT, SPLITTER_W, beltSpeed, arrowAt, pointAndDirection } from './marks.ts'
import {
  DIM,
  QUIET,
  CHEVRON_SCALE,
  PLACE_LIFT,
  type Mouth,
  linkKey,
  portalsOf,
} from './belt-view.ts'
import { particleColor } from './layers.ts'
import type { BoardController } from './controller.ts'

/** What every pass of one frame shares. */
type Frame = Readonly<{
  c: BoardController
  state: BoardState
  colors: Palette
  seconds: number
  still: boolean
  detailed: boolean
  view: Box
  byId: Map<string, GameNode>
}>

/** Advances every view and draws one frame of the board. */
export const animate = (c: BoardController, seconds: number): void => {
  const state = c.state
  if (!state) return
  const now = performance.now()
  c.settleHover(now)
  c.flushCursor(now)
  c.cursorLayer.tick(
    now,
    { x: c.world.position.x, y: c.world.position.y, scale: c.world.scale.x },
    state.region,
    c.activityOf,
  )
  const colors = palette()
  // The phase is sim time: at 10× the belts carry ten times as many items per real second.
  if (!state.paused) c.phase += seconds * state.speed
  // Reduced motion: packets hold still along the pipe, and the bottleneck does not pulse.
  const still = reducedMotion()
  const zoom = c.world.scale.x
  const detailed = zoom >= CHEVRON_SCALE
  const rows = rowsAt(zoom)
  const chip = chipAt(zoom)
  // The chevrons and packets draw only for belts on screen. A card off screen is
  // hidden too, so the cards' render group does not draw a world the view cannot see.
  const scale = zoom
  const margin = 40 / scale
  const view: Box = {
    x: -c.world.position.x / scale - margin,
    y: -c.world.position.y / scale - margin,
    w: c.host.clientWidth / scale + 2 * margin,
    h: c.host.clientHeight / scale + 2 * margin,
  }
  for (const card of c.views.values()) {
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
  c.advanceHold()
  c.leaving = c.leaving.filter((view) => {
    if (view.tick(seconds, still)) return true
    view.root.destroy({ children: true })
    return false
  })
  const byId = c.shown()
  // Once the dropped cards are in their spots, their links follow them again.
  if (
    c.heldLanding &&
    c.gesture?.kind !== 'node' &&
    (performance.now() - c.droppedAt > 1000 ||
      [...c.heldLanding].every(
        ([id, spot]) => byId.get(id)?.x === spot.x && byId.get(id)?.y === spot.y,
      ))
  )
    c.heldLanding = null
  for (const [key, age] of c.fresh)
    if (age >= GLOW_S) c.fresh.delete(key)
    else c.fresh.set(key, age + seconds)
  const f: Frame = { c, state, colors, seconds, still, detailed, view, byId }
  const { mouths, moved } = drawBelts(f)
  c.packets.end()
  c.notes.end()
  c.places.end()
  c.chevrons.end()
  c.drawBoxes(state.game, colors)
  c.drawReplication(state, colors)

  drawPortals(c, mouths, colors)
  drawSplitters(f, moved)
  drawOverlay(f)
}

/** Draws every belt on screen and collects the tunnel mouths it leaves. */
const aboveGround = (): boolean => false

const drawBelts = (f: Frame): Readonly<{ mouths: Array<Mouth>; moved: boolean }> => {
  const { c, state, colors, seconds, still, detailed, view, byId } = f
  const rates = c.ratesFor(state.ledger.links)
  const zoneHue = { a: colors.groups.edge, b: colors.groups.ops, c: colors.groups.data }
  let moved = false

  // Chevrons and packets draw only for belts on screen.
  c.chevrons.begin()
  const focus = c.pathOf(state)
  c.packets.begin()
  // Clearing marks the Graphics changed, so an empty one is left alone.
  if (c.arrows.context.instructions.length > 0) c.arrows.clear()
  c.notes.begin()
  c.places.begin()
  // Clearing marks the Graphics changed, so an empty one is left alone.
  if (c.overlay.context.instructions.length > 0) c.overlay.clear()
  const mouths: Array<Mouth> = []
  c.syncBelts(state.game.links)
  const picked = c.selectedLink
  if (picked && !state.game.links.some((l) => l.from === picked.from && l.to === picked.to))
    c.selectedLink = null
  // One belt is under the pointer or picked: it carries the answer, so the rest quiet down.
  const lit = c.hoverLink ?? c.selectedLink
  const litKey =
    lit && state.game.links.some((l) => l.from === lit.from && l.to === lit.to)
      ? `${lit.from}>${lit.to}`
      : null
  for (const link of state.game.links) {
    const key = linkKey(link)
    const belt = c.belts.get(key)
    const from = byId.get(link.from)
    const to = byId.get(link.to)
    if (belt && (!from || !to)) belt.show(false, 1)
    if (!belt || !from || !to) continue
    const picked = c.selectedLink?.from === link.from && c.selectedLink.to === link.to
    const hovered = picked || (c.hoverLink?.from === link.from && c.hoverLink.to === link.to)
    const quiet = litKey !== null && litKey !== key
    // Off the focused path, a belt fades back.
    const off = focus !== null && !(focus.has(link.from) && focus.has(link.to))
    // A lit belt rises above the channel it shares with the others, so nothing covers it.
    if (litKey === key) c.bodies.setChildIndex(belt.body, c.bodies.children.length - 1)
    const age = c.fresh.get(key)
    const wire = c.wireOf(from, to, key)
    if (belt.wire !== wire) {
      belt.wire = wire
      moved = true
    }
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
    const body =
      zones && !crossing && !hovered
        ? mix(zoneHue[from.zone], colors.canvas, busy ? 0.75 : 0.85)
        : mix(packet, colors.canvas, hovered ? 0.55 : busy ? 0.8 : 0.92)
    const width = hovered ? BELT + 1 : busy ? BELT : 3
    belt.draw(pieces, rail, body, width, zonal ? colors.warn : null)
    if (drawn >= 1)
      for (const mouth of belt.mouthsFor(pieces, width, off || quiet)) mouths.push(mouth)
    // A lit belt marks both of its ports, so the lane shows which cards it joins.
    if (hovered && drawn >= 1) {
      for (const port of [outPort(from), inPort(to)])
        c.overlay
          .circle(port.x, port.y, 4.5)
          .fill(colors.accent)
          .stroke({ color: colors.card, width: 2 })
    }
    // A still, busy belt shows its arrows and rate instead of chevrons: one read, not two.
    // The items carry the flow; the chevrons are faint unless the belt is in focus.
    if (detailed && seen && busy && !still)
      c.chevrons.add(
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
      c.places.add(mid.x, mid.y, place, colors.ink, colors.warn, -PLACE_LIFT)
    }
    if (picked) {
      const mid = pointOn(path, 0.5)
      c.overlay.circle(mid.x, mid.y, 9).fill(colors.danger)
      c.overlay
        .moveTo(mid.x - 3.5, mid.y - 3.5)
        .lineTo(mid.x + 3.5, mid.y + 3.5)
        .moveTo(mid.x + 3.5, mid.y - 3.5)
        .lineTo(mid.x - 3.5, mid.y + 3.5)
      c.overlay.stroke({ color: colors.card, width: 2 })
    }
    if (age !== undefined) {
      const glow = 1 - easeOut(Math.min(1, age / GLOW_S))
      traceOf(c.overlay, path).stroke({
        color: colors.accent,
        width: 2 + 6 * glow,
        alpha: 0.35 * glow,
        cap: 'round',
        join: 'round',
      })
      if (drawn < 1) {
        const tip = path[path.length - 1]
        if (tip) c.overlay.circle(tip.x, tip.y, 4).fill(colors.accent)
        continue
      }
    }
    if (!flow || !busy || off || quiet || !seen) continue
    const length = lengthOf(path)
    const marks = flowMarks(still, flow.rate, length)
    const shape = packetShapeOf(flow.kind)
    const alpha = tap ? 0.6 : 0.95
    // Nothing shows on the belt while it runs through a tunnel.
    const underground =
      wire.tunnels.length === 0
        ? aboveGround
        : (t: number): boolean =>
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
        c.packets.add(shape, at.x, at.y, color)
      }
    } else {
      // Reduced motion: still arrows along the belt, under the rate they stand for.
      for (const t of marks.arrows) {
        if (underground(t)) continue
        const at = pointAndDirection(path, t)
        arrowAt(c.arrows, at.x, at.y, at.ux, at.uy, 4.2)
      }
      c.arrows.fill({ color: packet, alpha })
      const mid = midOf(path)
      c.notes.add(mid.x, mid.y, marks.label, hue, colors.card, tap ? 12 : 11)
    }
  }

  return { mouths, moved }
}

/** Redraws the tunnel portals when a mouth or the colour changed. */
const drawPortals = (c: BoardController, mouths: Array<Mouth>, colors: Palette): void => {
  const portalColor = colors.edge
  const sameMouths =
    mouths.length === c.mouthsDrawn.length &&
    mouths.every((mouth, index) => {
      const before = c.mouthsDrawn[index] as Mouth
      return (
        mouth.x === before.x &&
        mouth.y === before.y &&
        mouth.across === before.across &&
        mouth.width === before.width &&
        mouth.off === before.off
      )
    })
  c.mouthsDrawn = mouths
  if (!sameMouths || portalColor !== c.portalInk) {
    c.portalInk = portalColor
    c.portals.clear()
    for (const portal of portalsOf(mouths))
      c.portals
        .roundRect(portal.x0, portal.y0, portal.x1 - portal.x0, portal.y1 - portal.y0, 1.25)
        .fill({ color: portalColor, alpha: portal.off ? DIM : 0.7 })
  }
}

/** A port that feeds several belts has a splitter over the point where they part. */
const drawSplitters = (f: Frame, moved: boolean): void => {
  const { c, state, colors, byId } = f
  // The fans follow the wires: with none moved and no belt drawing in, they stand.
  if (!moved && state.game.links === c.splitLinks && c.fresh.size === 0 && c.splitFresh === 0)
    return
  c.splitLinks = state.game.links
  c.splitFresh = c.fresh.size
  // A port that feeds several belts has a splitter over the point where they part.
  const fans = new Map<string, { x: number; top: number; bottom: number; belts: number }>()
  for (const link of state.game.links) {
    const from = byId.get(link.from)
    const to = byId.get(link.to)
    if (!from || !to || c.fresh.has(linkKey(link))) continue
    const port = outPort(from)
    const fan = fans.get(link.from) ?? {
      x: port.x,
      top: port.y,
      bottom: port.y,
      belts: 0,
    }
    fan.belts += 1
    // The fan is the stretch out of the port before the belt runs straight up or down.
    const path = c.wireOf(from, to, linkKey(link)).path
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
  if (splittersKey !== c.splittersKey) {
    c.splittersKey = splittersKey
    c.splitters.clear()
    const pad = BELT / 2 + 1.5
    for (const fan of splitters)
      c.splitters
        .roundRect(fan.x, fan.top - pad, SPLITTER_W, fan.bottom - fan.top + pad * 2, 3)
        .fill(colors.card)
        .stroke({ color: colors.edge, width: 1.5 })
  }
}

/** Cue, cut links, the wire in hand, selection frame, stamp and the landing outline. */
const drawOverlay = (f: Frame): void => {
  const { c, state, colors, seconds, still, byId } = f
  // A disclosure cue: a ring around the one footer button to press next.
  const cue = state.cue ? byId.get(state.cue) : undefined
  if (cue) {
    const rect = footerRect(cue.type)
    const pulse = still ? 0.9 : 0.35 + 0.55 * Math.abs(Math.sin(c.phase * 2.4))
    c.overlay
      .roundRect(cue.x + rect.x - 3, cue.y + rect.y - 3, rect.w + 6, rect.h + 6, 10)
      .stroke({ color: colors.ok, width: 2.5, alpha: pulse })
  }

  // Cut links fade where they were, in the colour that warned before the cut.
  c.cuts = c.cuts.filter((cut) => {
    cut.t += seconds
    const fade = 1 - easeOut(Math.min(1, cut.t / CUT_S))
    traceOf(c.overlay, cut.path).stroke({
      color: colors.danger,
      width: 2.5,
      alpha: 0.9 * fade,
      cap: 'round',
      join: 'round',
    })
    return cut.t < CUT_S
  })

  // A wire let go over nothing draws back into its port.
  const retract = c.retract
  if (retract) {
    retract.t += seconds
    const left = 1 - easeOut(Math.min(1, retract.t / RETRACT_S))
    const path = partOf(retract.path, left)
    traceOf(c.overlay, path).stroke({
      color: colors.accent,
      width: 2.5,
      cap: 'round',
      join: 'round',
    })
    const tip = path[path.length - 1]
    if (tip) c.overlay.circle(tip.x, tip.y, 5 * Math.max(0.4, left)).fill(colors.accent)
    if (retract.t >= RETRACT_S) c.retract = null
  }

  const gesture = c.gesture
  const snapped = gesture?.kind === 'link' && c.snapTo ? byId.get(c.snapTo) : undefined
  c.snapGlow += ((snapped ? 1 : 0) - c.snapGlow) * follow(seconds, 26, still)
  if (gesture?.kind === 'link') {
    const from = byId.get(gesture.from)
    if (from) {
      // Free, the end rides the pointer; near a port it is pulled onto it.
      const aim = snapped ? inPort(snapped) : gesture.at
      const end = c.wireEnd ?? aim
      const k = follow(seconds, snapped ? 30 : 60, still)
      c.wireEnd = { x: end.x + (aim.x - end.x) * k, y: end.y + (aim.y - end.y) * k }
      const lane = laneUnder(from, snapped ? snapped.y + heightOf(snapped.type) : c.wireEnd.y)
      traceOf(c.overlay, route(outPort(from), c.wireEnd, lane)).stroke({
        color: colors.accent,
        width: 2.5,
        cap: 'round',
        join: 'round',
      })
      c.overlay.circle(c.wireEnd.x, c.wireEnd.y, 5 + 1.5 * c.snapGlow).fill(colors.accent)
      if (snapped) {
        silhouette(
          c.overlay,
          COMPONENTS[snapped.type].group,
          snapped.x,
          snapped.y,
          CARD_W,
          heightOf(snapped.type),
          3 + 5 * (1 - c.snapGlow),
        ).stroke({ color: colors.accent, width: 2, alpha: c.snapGlow })
      }
    }
  }

  const frame = c.selectionFrame()
  if (frame) {
    c.overlay
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
      c.overlay
        .rect(cx - size / 2, cy - size / 2, size, size)
        .fill({ color: 0xffffff })
        .stroke({ color: colors.accent, width: 1.5 })
  }

  if (gesture?.kind === 'box') {
    const left = Math.min(gesture.from.x, gesture.at.x)
    const top = Math.min(gesture.from.y, gesture.at.y)
    c.overlay
      .rect(
        left,
        top,
        Math.abs(gesture.at.x - gesture.from.x),
        Math.abs(gesture.at.y - gesture.from.y),
      )
      .fill({ color: colors.accent, alpha: 0.08 })
      .stroke({ color: colors.accent, width: 1.5, alpha: 0.8 })
  }
  const landing = c.landingOf()
  if (state.stamp) {
    // The Playbook shows where it will land, clear of the cards already there.
    const x = landing?.x ?? Math.round(c.pointer.x / 8) * 8
    const y = landing?.y ?? Math.round(c.pointer.y / 8) * 8
    for (const entry of state.stamp) {
      silhouette(
        c.overlay,
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
    gesture?.kind === 'node' && c.dragged
      ? byId.get(c.dragged.id)
      : state.placing && c.ghost.visible
        ? {
            type: state.placing,
            x: Math.round((c.pointer.x - CARD_W / 2) / 8) * 8,
            y: Math.round((c.pointer.y - heightOf(state.placing) / 2) / 8) * 8,
          }
        : undefined
  if (held && landing && (landing.x !== held.x || landing.y !== held.y)) {
    const group = gesture?.kind === 'node' && c.dragged ? c.groupOf(c.dragged.id) : []
    const from = state.game.nodes.find((node) => node.id === c.dragged?.id)
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
        c.overlay,
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

  if (c.ghost.visible)
    c.ghost.position.set(
      c.pointer.x - CARD_W / 2,
      c.pointer.y - heightOf(c.ghostType ?? 'server') / 2,
    )
}
