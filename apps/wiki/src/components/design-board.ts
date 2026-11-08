import { HOME_REGION } from '@quorum/simulation/catalog'
import { nodeOrdinals } from '@quorum/simulation/labels'
import { solveFlow } from '@quorum/simulation/solve'
import { attachBoard, fitBoard, setBoard, type BoardState } from '@quorum/ui/board/board'
import { DESIGNS } from '../patterns/designs/index.ts'

const NOOP = () => {}

export const drawDesign = (id: string, host: HTMLElement): (() => void) => {
  const design = DESIGNS[id]
  if (!design) return NOOP
  const key = `design-${id}`
  const game = design.game
  const state: BoardState = {
    locale: 'en',
    translate: (text) => text,
    game,
    ledger: solveFlow(game),
    selected: null,
    selection: [],
    placing: null,
    stamp: null,
    history: {},
    ordinals: nodeOrdinals(game),
    region: HOME_REGION,
    paused: true,
    speed: 1,
    suspended: false,
    cue: null,
    readOnly: true,
    inset: { top: 16, bottom: 16, left: 0 },
    pad: 16,
    minScale: 0.6,
  }
  setBoard(key, state)
  const detach = attachBoard(key, host, {
    onNodeTap: NOOP,
    onNodeMove: NOOP,
    onFooter: NOOP,
    onLink: NOOP,
    onUnlink: NOOP,
    onPlace: NOOP,
    onEmptyTap: NOOP,
    onNodeToggle: NOOP,
    onBox: NOOP,
  })
  // The board starts asynchronously: send the state again over its first second, then fit it.
  let frames = 0
  let frame = requestAnimationFrame(function again() {
    setBoard(key, state)
    frames += 1
    if (frames === 30 || frames === 60 || frames === 89) fitBoard(key)
    if (frames < 90) frame = requestAnimationFrame(again)
  })
  return () => {
    cancelAnimationFrame(frame)
    detach()
  }
}
