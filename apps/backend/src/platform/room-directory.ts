import * as Effect from 'effect/Effect'
import {
  RoomDirectory,
  RoomError,
  type Published,
  type RoomStub,
} from '../contexts/room/directory.ts'

/** Room codes: no 0, O, 1, or I, so a code can be read aloud. */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const CODE_LENGTH = 6
const TRIES = 6

const text = (bytes: number): string => {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  return [...buffer].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const code = (): string => {
  const buffer = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(buffer)
  return [...buffer].map((byte) => ALPHABET[byte % ALPHABET.length]).join('')
}

/**
 * The Room namespace as the context sees it. One Room per code, and the code
 * is the object's name.
 */
export const roomDirectory = (stubOf: (code: string) => RoomStub): RoomDirectory['Service'] => ({
  publish: (request) =>
    Effect.gen(function* () {
      const token = text(24)
      for (let attempt = 0; attempt < TRIES; attempt += 1) {
        const candidate = code()
        const taken = yield* Effect.tryPromise({
          try: () => stubOf(candidate).info(),
          catch: (cause) => new RoomError({ cause }),
        })
        if (taken.exists) continue
        yield* Effect.tryPromise({
          try: () => stubOf(candidate).publish({ ...request, token }),
          catch: (cause) => new RoomError({ cause }),
        })
        return { code: candidate, token } satisfies Published
      }
      return yield* new RoomError({ cause: 'No room code was free.' })
    }),
  info: (candidate) =>
    Effect.tryPromise({
      try: () => stubOf(candidate).info(),
      catch: (cause) => new RoomError({ cause }),
    }),
})
