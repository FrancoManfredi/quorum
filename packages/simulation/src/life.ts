import { Schema } from 'effect'

export const DownCause = Schema.Literals(['restart', 'failure', 'oom'])
export type DownCause = typeof DownCause.Type

export const Life = Schema.TaggedUnion({
  Running: {},
  Warming: { warm: Schema.Finite },
  Restarting: {
    left: Schema.Finite,
    cause: DownCause,
    warm: Schema.Finite,
  },
  Stopped: { cause: DownCause, warm: Schema.Finite },
})
export type Life = typeof Life.Type

export const RUNNING: Life = Life.cases.Running.make({})

export const warming = (warm: number): Life =>
  warm >= 1 ? RUNNING : Life.cases.Warming.make({ warm })

export const restarting = (left: number, cause: DownCause, warm: number): Life =>
  Life.cases.Restarting.make({ left, cause, warm })

export const stopped = (cause: DownCause, warm: number): Life =>
  Life.cases.Stopped.make({ cause, warm })

export const isDown = Life.isAnyOf(['Restarting', 'Stopped'])

export const warmOf = (life: Life): number =>
  Life.match(life, {
    Running: () => 1,
    Warming: ({ warm }) => warm,
    Restarting: ({ warm }) => warm,
    Stopped: ({ warm }) => warm,
  })

export const causeOf = (life: Life): DownCause =>
  Life.match(life, {
    Running: (): DownCause => 'restart',
    Warming: (): DownCause => 'restart',
    Restarting: ({ cause }) => cause,
    Stopped: ({ cause }) => cause,
  })

export const leftOf = (life: Life): number =>
  Life.match(life, {
    Running: () => 0,
    Warming: () => 0,
    Restarting: ({ left }) => left,
    Stopped: () => -1,
  })

export const withWarm = (life: Life, warm: number): Life =>
  Life.match(life, {
    Running: () => warming(warm),
    Warming: () => warming(warm),
    Restarting: (state) => Life.cases.Restarting.make({ ...state, warm }),
    Stopped: (state) => Life.cases.Stopped.make({ ...state, warm }),
  })

export const down = (life: Life, left: number, cause: DownCause): Readonly<{ life: Life }> => ({
  life: left === -1 ? stopped(cause, warmOf(life)) : restarting(left, cause, warmOf(life)),
})

export const lifeOf = (down: number, warm: number, cause: DownCause): Life =>
  down === -1 ? stopped(cause, warm) : down > 0 ? restarting(down, cause, warm) : warming(warm)
