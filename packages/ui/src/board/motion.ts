/** CSS cubic-bezier timing, so the board moves on the same curves as the DOM. */
const cubicBezier =
  (x1: number, y1: number, x2: number, y2: number) =>
  (t: number): number => {
    const at = (s: number, a: number, b: number) =>
      3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s
    // Solve x(s) = t by bisection; 20 halvings is far below a pixel.
    let lo = 0
    let hi = 1
    for (let step = 0; step < 20; step += 1) {
      const mid = (lo + hi) / 2
      if (at(mid, x1, x2) < t) lo = mid
      else hi = mid
    }
    return at((lo + hi) / 2, y1, y2)
  }

export const easeOut = cubicBezier(0.23, 1, 0.32, 1)
export const ENTER_S = 0.2
export const EXIT_S = 0.15
/** A new link draws out of its port, then glows a moment; a cut one fades. */
export const DRAW_IN_S = 0.22
export const GLOW_S = 0.6
export const CUT_S = 0.18
export const RETRACT_S = 0.18
/** How often the board tells the Room where the pointer is: 25 times a second. */
export const CURSOR_MS = 40
/** How long the pointer rests on a Node or a belt before its hover shows. A pass across the
 *  Board is faster than this, so it lights nothing, and a deliberate hover still answers. */
export const HOVER_SETTLE_MS = 150

let reduceQuery: MediaQueryList | null = null

/** The system setting, or the player's Reduce motion setting (`data-motion` on the root).
 *  The query is made once: its `matches` stays live, and the board asks every frame. */
export const reducedMotion = (): boolean =>
  document.documentElement.dataset['motion'] === 'reduce' ||
  (reduceQuery ??= matchMedia('(prefers-reduced-motion: reduce)')).matches

/** How far toward its target a followed value moves this frame. A follow keeps its
 *  speed when the target changes mid-way, so drags and selections never restart. */
export const follow = (seconds: number, rate: number, still: boolean): number =>
  still ? 1 : 1 - Math.exp(-rate * seconds)
