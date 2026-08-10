import type { SecretBlob } from '../utils/crypto'

export type Occasion = 'birthday' | 'anniversary' | 'gifthunt'

/** How a moment unlocks (creator-side, plaintext). */
export type UnlockRule =
  | { type: 'key'; key: string } // creator reveals it with a secret key
  | { type: 'clue'; clue: string; answer: string } // recipient solves it
  | { type: 'time'; at: string } // opens by itself (datetime-local string)

/** What a moment reveals once open (creator-side, plaintext). */
export interface MomentReveal {
  message: string
  /** Optional "what/where it is" — a place, an object, a gift. */
  name?: string
  /** Optional location; also used for the map link. */
  location?: string
}

export interface Moment {
  id: string
  teaser: string
  unlock: UnlockRule
  reveal: MomentReveal
}

/** A full experience as the creator edits it. Lives only on the creator's device. */
export interface Experience {
  id: string
  occasion: Occasion
  title: string
  toName: string
  introLines: string[]
  moments: Moment[]
  ending: { headline: string; lines: string[] }
  createdAt: string
}

/** The public lock info a recipient is allowed to see. */
export type PublicLock =
  | { type: 'key' }
  | { type: 'clue'; clue: string }
  | { type: 'time'; at: string; k: string } // k = obfuscated self-open key

/** A moment as shipped to the recipient: teaser + lock + ciphertext. */
export interface SealedMoment {
  id: string
  teaser: string
  lock: PublicLock
  blob: SecretBlob
}

/** The whole experience as shipped to the recipient — no plaintext secrets. */
export interface SealedExperience {
  v: 1
  id: string
  occasion: Occasion
  title: string
  toName: string
  introLines: string[]
  moments: SealedMoment[]
  ending: { headline: string; lines: string[] }
}
