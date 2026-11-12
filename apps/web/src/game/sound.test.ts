import { afterEach, describe, expect, test } from 'vitest'
import { play } from './sound.ts'

/** The parts of a context that `play` touches before the bus asks for its convolver. */
const refusing = (): BaseAudioContext =>
  ({
    destination: {},
    sampleRate: 48_000,
    currentTime: 0,
    state: 'running',
    createGain: () => ({ gain: { value: 1 }, connect: () => undefined }),
    createWaveShaper: () => ({ curve: null, oversample: 'none', connect: () => undefined }),
    createConvolver: () => {
      throw new Error('this browser cannot build a convolver')
    },
  }) as unknown as BaseAudioContext

const real = globalThis.AudioContext

afterEach(() => {
  if (real === undefined) delete (globalThis as { AudioContext?: unknown }).AudioContext
  else globalThis.AudioContext = real
})

describe('a browser that cannot build the audio graph', () => {
  test('keeps sound off for the session and never throws', () => {
    let built = 0
    globalThis.AudioContext = function () {
      built += 1
      return refusing()
    } as unknown as typeof AudioContext

    expect(() => play('choose')).not.toThrow()
    expect(() => play('hover')).not.toThrow()
    // The first sound gave up on the graph, so the second must not build another context.
    expect(built).toBe(1)
  })
})
