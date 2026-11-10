import { holds } from './card-parts.ts'
import { type GameNode } from '@quorum/simulation/state'
import { CARD_W, heightOf, outPort } from './geometry.ts'
import type { BoardController } from './controller.ts'

/** Wires the canvas's pointer, wheel and keyboard events to the board's gestures. */
export const bindPointer = (c: BoardController): void => {
  const canvas = c.app.canvas
  const { signal } = c.abort
  canvas.style.touchAction = 'none'
  canvas.addEventListener('contextmenu', (event) => event.preventDefault(), { signal })

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      c.coarse = event.pointerType !== 'mouse'
      if (c.coarse) {
        c.touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
        canvas.setPointerCapture(event.pointerId)
        if (c.touches.size === 2) {
          // A second finger turns the gesture into a pinch.
          c.letGo()
          c.gesture = null
          c.dragged = null
          if (c.pressed) {
            c.pressed = null
            c.syncCards()
          }
          c.pinch = c.pinchOf()
          return
        }
        if (c.touches.size > 2) return
      }
      const point = c.toWorld(event)
      c.pointer = point
      c.over = true
      c.pointerKnown = true
      // A press on the Board is board work, not the panel the cursor last announced.
      c.activity = null
      if (event.button === 2) {
        const link = c.linkAt(point)
        if (link) c.selectLink(link)
        return
      }
      if (event.button !== 0) return
      canvas.setPointerCapture(event.pointerId)
      if (c.state?.readOnly) {
        c.gesture = {
          kind: 'pan',
          x: event.clientX,
          y: event.clientY,
          moved: false,
          cut: null,
        }
        return
      }
      if (c.state?.stamp) {
        c.events.onPlace(Math.round(point.x / 8) * 8, Math.round(point.y / 8) * 8)
        return
      }
      if (c.state?.placing) {
        c.events.onPlace(point.x - CARD_W / 2, point.y - heightOf(c.state.placing) / 2)
        return
      }
      const port = c.outPortAt(point)
      if (port) {
        c.hoverLink = null
        c.gesture = { kind: 'link', from: port.id, at: point }
        c.wireEnd = outPort(c.shown().get(port.id) ?? port)
        c.snapTo = null
        c.snapGlow = 0
        c.events.onSound?.('pull', 1, true)
        return
      }
      const node = c.nodeAt(point)
      if (node) {
        if (c.footerAt(node, point)) {
          c.pressed = node.id
          c.holdSince = c.state && holds(c.state.game, node) ? performance.now() : 0
          c.syncCards()
        } else {
          const view = c.views.get(node.id)
          if (view) view.held = true
        }
        c.gesture = {
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
        c.gesture = { kind: 'box', from: point, at: point }
        return
      }
      if (c.selectedLink && c.onBadge(point)) {
        c.events.onUnlink(c.selectedLink.from, c.selectedLink.to)
        c.selectedLink = null
        return
      }
      // Inside the frame of a multi-selection, a drag takes the whole group.
      const frame = c.selectionFrame()
      const lead = c.nodes().find((entry) => c.state?.selection[0] === entry.id)
      if (
        frame &&
        lead &&
        point.x >= frame.x &&
        point.x <= frame.x + frame.w &&
        point.y >= frame.y &&
        point.y <= frame.y + frame.h
      ) {
        c.gesture = {
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
      if (c.hoverLink) {
        c.selectLink(c.hoverLink)
        return
      }
      c.gesture = {
        kind: 'pan',
        x: event.clientX,
        y: event.clientY,
        moved: false,
        cut: c.coarse ? c.linkAt(point) : null,
      }
    },
    { signal },
  )

  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (c.touches.has(event.pointerId)) {
        c.touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (c.pinch) {
          c.zoomTo(c.pinchOf())
          return
        }
      }
      const point = c.toWorld(event)
      c.pointer = point
      // Back on the Board: the pointer moves again, so it stops saying what the panel was.
      c.over = true
      c.pointerKnown = true
      c.activity = null
      c.cursorWaiting = true
      const gesture = c.gesture
      if (gesture?.kind === 'pan') {
        const dx = event.clientX - gesture.x
        const dy = event.clientY - gesture.y
        if (!gesture.moved && Math.hypot(dx, dy) < 4) return
        gesture.moved = true
        c.world.position.x += dx
        c.world.position.y += dy
        gesture.x = event.clientX
        gesture.y = event.clientY
        canvas.style.cursor = 'grabbing'
        return
      }
      if (gesture?.kind === 'node') {
        if (!gesture.moved && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 4)
          return
        const view = c.views.get(gesture.id)
        if (!gesture.moved && view) {
          // Picked up: it rises above the other cards.
          view.held = false
          view.lifted = true
          c.cards.addChild(view.root)
          c.events.onSound?.('lift', 1, true)
        }
        gesture.moved = true
        const last = c.dragged
        c.dragged = {
          id: gesture.id,
          x: Math.round((point.x - gesture.dx) / 8) * 8,
          y: Math.round((point.y - gesture.dy) / 8) * 8,
        }
        // Each grid line it crosses is a faint detent.
        if (last && (last.x !== c.dragged.x || last.y !== c.dragged.y)) c.events.onSound?.('detent')
        c.syncCards()
        canvas.style.cursor = 'grabbing'
        return
      }
      if (gesture?.kind === 'link' || gesture?.kind === 'box') {
        gesture.at = point
        const target = c.nodeAt(point)
        const next = target && target.id !== gesture.from ? target.id : null
        if (next !== c.snapTo) {
          if (next) c.events.onSound?.('snap')
          else c.events.onSound?.('detent', 0.7)
          c.snapTo = next
        }
        canvas.style.cursor = 'crosshair'
        return
      }
      if (c.state?.stamp) {
        canvas.style.cursor = 'copy'
        return
      }
      if (c.state?.placing) {
        canvas.style.cursor = 'copy'
        return
      }
      // A port wins over the link leaving it: pulling a wire is not a cut.
      c.hoverLink = c.nodeAt(point) || c.outPortAt(point) ? null : c.linkAt(point)
      c.hoverNode = c.nodeAt(point)?.id ?? null
      canvas.style.cursor = c.outPortAt(point)
        ? 'crosshair'
        : c.nodeAt(point)
          ? c.footerAt(c.nodeAt(point) as GameNode, point)
            ? 'pointer'
            : 'move'
          : c.hoverLink
            ? 'pointer'
            : 'grab'
    },
    { signal },
  )

  const finish = (event: PointerEvent, cancelled: boolean) => {
    c.endHold()
    c.touches.delete(event.pointerId)
    if (c.pinch) {
      // The pinch ends with its first finger; the other one does nothing until it lifts.
      if (c.touches.size < 2) c.pinch = null
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      return
    }
    const gesture = c.gesture
    c.gesture = null
    c.letGo()
    c.holdSince = 0
    if (c.pressed) {
      c.pressed = null
      c.syncCards()
    }
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    canvas.style.cursor = 'grab'
    if (!gesture || cancelled) {
      if (gesture?.kind === 'link') c.springBack(gesture.from)
      c.dragged = null
      return
    }
    const point = c.toWorld(event)
    if (gesture.kind === 'pan' && !gesture.moved) {
      if (gesture.cut) c.selectLink(gesture.cut)
      else {
        c.selectedLink = null
        c.events.onEmptyTap()
      }
    }
    if (gesture.kind === 'node') {
      const node = c.nodes().find((entry) => entry.id === gesture.id)
      // A dropped card keeps its place until the Model has it (see draw), so it
      // does not glide back toward where it was for a frame.
      if (gesture.moved && c.dragged) {
        c.droppedAt = performance.now()
        // The card settles where the Model will put it, clear of the others.
        const landing = c.landingOf(c.dragged) ?? c.dragged
        c.dragged = { id: gesture.id, x: landing.x, y: landing.y }
        c.syncCards()
        c.events.onNodeMove(gesture.id, landing.x, landing.y)
      } else if (gesture.frame) {
        c.dragged = null
      } else {
        c.dragged = null
        if (event.shiftKey) c.events.onNodeToggle(gesture.id)
        // A size is bought by holding (see animate), so letting go early buys nothing.
        else if (node && c.footerAt(node, point)) {
          if (!c.state || !holds(c.state.game, node)) c.events.onFooter(gesture.id)
        } else c.events.onNodeTap(gesture.id)
      }
    }
    if (gesture.kind === 'link') {
      const target = c.nodeAt(point)
      if (target && target.id !== gesture.from) {
        c.wired = `${gesture.from}>${target.id}`
        c.wireEnd = null
        c.snapTo = null
        c.events.onLink(gesture.from, target.id)
      } else c.springBack(gesture.from)
    }
    if (gesture.kind === 'box') {
      const left = Math.min(gesture.from.x, point.x)
      const right = Math.max(gesture.from.x, point.x)
      const top = Math.min(gesture.from.y, point.y)
      const bottom = Math.max(gesture.from.y, point.y)
      c.events.onBox(
        c
          .nodes()
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
      c.over = false
      c.hoverLink = null
      c.hoverNode = null
      // A panel is open: the pointer stays on the Board and says what this Seat is doing.
      if (c.activity !== null) {
        c.emitCursor()
        return
      }
      c.cursorWaiting = false
      c.events.onCursorGone?.()
    },
    { signal },
  )
  // A hidden window takes the pointer with it, and a cursor left on the
  // Board would keep pointing at a spot nobody is looking at.
  window.addEventListener(
    'blur',
    () => {
      c.over = false
      c.cursorWaiting = false
      c.events.onCursorGone?.()
    },
    { signal },
  )
  window.addEventListener(
    'keydown',
    (event) => {
      const link = c.selectedLink
      if (!link) return
      if (event.key === 'Escape') c.selectedLink = null
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      c.selectedLink = null
      c.events.onUnlink(link.from, link.to)
    },
    { signal },
  )

  canvas.addEventListener(
    'wheel',
    (event) => {
      // A board on a page lets the page scroll; Ctrl or Cmd zooms it.
      if (c.state?.readOnly && !event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect = c.host.getBoundingClientRect()
      const screen = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      const before = c.toWorld(event)
      const scale = Math.min(
        1.6,
        Math.max(0.25, c.world.scale.x * Math.exp(-event.deltaY * 0.0015)),
      )
      c.world.scale.set(scale)
      c.world.position.set(screen.x - before.x * scale, screen.y - before.y * scale)
    },
    { signal, passive: false },
  )
}
