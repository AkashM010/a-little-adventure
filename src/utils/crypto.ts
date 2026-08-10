import secretsJson from '../data/secrets.json'

/**
 * What a checkpoint reveals once its code is entered.
 * The plaintext for these only exists inside scripts/generate-secrets.mjs —
 * the app ships nothing but AES-GCM ciphertext (src/data/secrets.json).
 */
export interface Reveal {
  finale?: boolean
  greeting: string
  message: string
  name: string
  location: string
  note?: string
  highlight?: string
  footnote?: string
  mapQuery: string
  completeLabel: string
}

export interface SecretBlob {
  salt: string
  iv: string
  data: string
}

const secrets = secretsJson as Record<string, SecretBlob>

const enc = new TextEncoder()
const dec = new TextDecoder()

export const normalizeCode = (code: string): string => code.trim().toUpperCase()

const fromB64 = (s: string): Uint8Array =>
  Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0))

const toB64 = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function deriveKey(
  code: string,
  salt: Uint8Array,
  usage: 'encrypt' | 'decrypt',
): Promise<CryptoKey> {
  const codeBytes = enc.encode(code)
  const material = new Uint8Array(salt.length + codeBytes.length)
  material.set(salt)
  material.set(codeBytes, salt.length)
  const hash = await crypto.subtle.digest('SHA-256', material)
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [usage])
}

/** Encrypt any JSON payload with a code (browser-side twin of the node generator). */
export async function sealPayload(payload: unknown, rawCode: string): Promise<SecretBlob> {
  const code = normalizeCode(rawCode)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(code, salt, 'encrypt')
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify(payload)),
  )
  return { salt: toB64(salt), iv: toB64(iv), data: toB64(data) }
}

/** Decrypt a sealed payload. Wrong code → GCM auth fails → null. */
export async function openPayload<T>(blob: SecretBlob, rawCode: string): Promise<T | null> {
  try {
    const code = normalizeCode(rawCode)
    if (!code) return null
    const salt = fromB64(blob.salt)
    const iv = fromB64(blob.iv)
    const key = await deriveKey(code, salt, 'decrypt')
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      fromB64(blob.data),
    )
    return JSON.parse(dec.decode(plain)) as T
  } catch {
    return null
  }
}

/**
 * Attempt to decrypt a checkpoint with the given code.
 * Wrong code → AES-GCM authentication fails → returns null.
 */
export async function tryDecrypt(id: number, rawCode: string): Promise<Reveal | null> {
  const blob = secrets[String(id)]
  if (!blob) return null
  return openPayload<Reveal>(blob, rawCode)
}
