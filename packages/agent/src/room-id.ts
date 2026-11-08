/* ==========================================================================
   A Room's id is a hash of the browser's write key. The id is safe to paste
   into an agent prompt; the key never leaves the browser. No key is stored on
   the server: the Durable Object's name is the hash.
   ========================================================================== */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const base64url = (bytes: Uint8Array): string => {
  let text = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const second = bytes[index + 1]
    const third = bytes[index + 2]
    text += ALPHABET.charAt(first >> 2)
    text += ALPHABET.charAt(((first & 3) << 4) | ((second ?? 0) >> 4))
    if (second === undefined) break
    text += ALPHABET.charAt(((second & 15) << 2) | ((third ?? 0) >> 6))
    if (third === undefined) break
    text += ALPHABET.charAt(third & 63)
  }
  return text
}

/** 32 random bytes, base64url: 43 characters. */
export const newWriteKey = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return base64url(bytes)
}

/** The public id of the Room a write key owns. */
export const roomIdOf = async (writeKey: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(writeKey))
  return base64url(new Uint8Array(digest)).slice(0, 22)
}

export const isWriteKey = (value: string): boolean => /^[A-Za-z0-9_-]{43}$/.test(value)

export const isRoomId = (value: string): boolean => /^[A-Za-z0-9_-]{22}$/.test(value)
