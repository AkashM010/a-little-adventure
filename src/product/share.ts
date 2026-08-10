import { sealPayload, normalizeCode } from '../utils/crypto'
import type { Experience, SealedExperience, SealedMoment, MomentReveal } from './types'

/**
 * Turning a draft into something shareable:
 * every moment's reveal is AES-encrypted with its own unlock code,
 * then the whole thing is packed into the URL fragment.
 * No backend, and the recipient can't peek by reading the link.
 */

/** The code that opens a moment, from the creator's plaintext rule. */
export function unlockCode(m: Experience['moments'][number]): string {
  switch (m.unlock.type) {
    case 'key':
      return m.unlock.key
    case 'clue':
      return m.unlock.answer
    case 'time':
      // self-opening moments carry their own random key, gated by time
      return `T-${m.id}`
  }
}

export async function seal(exp: Experience): Promise<SealedExperience> {
  const moments: SealedMoment[] = []
  for (const m of exp.moments) {
    const code = unlockCode(m)
    const blob = await sealPayload(m.reveal satisfies MomentReveal, code)
    const lock =
      m.unlock.type === 'key'
        ? ({ type: 'key' } as const)
        : m.unlock.type === 'clue'
          ? ({ type: 'clue', clue: m.unlock.clue } as const)
          : ({ type: 'time', at: m.unlock.at, k: btoa(code) } as const)
    moments.push({ id: m.id, teaser: m.teaser, lock, blob })
  }
  return {
    v: 1,
    id: exp.id,
    occasion: exp.occasion,
    title: exp.title,
    toName: exp.toName,
    introLines: exp.introLines,
    moments,
    ending: exp.ending,
  }
}

const b64url = (s: string) => s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64url = (s: string) => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  return s.replace(/-/g, '+').replace(/_/g, '/') + pad
}

export function encodeShare(sealed: SealedExperience): string {
  const json = JSON.stringify(sealed)
  return b64url(btoa(unescape(encodeURIComponent(json))))
}

export function decodeShare(encoded: string): SealedExperience | null {
  try {
    const json = decodeURIComponent(escape(atob(fromB64url(encoded))))
    const parsed = JSON.parse(json) as SealedExperience
    if (parsed.v !== 1 || !Array.isArray(parsed.moments)) return null
    return parsed
  } catch {
    return null
  }
}

export function shareUrl(sealed: SealedExperience): string {
  return `${location.origin}${location.pathname}#/r/${encodeShare(sealed)}`
}

/** Per-moment hint text for preview/demo modes (creator-eyes only). */
export function buildHints(exp: Experience): Record<string, string> {
  const hints: Record<string, string> = {}
  for (const m of exp.moments) {
    if (m.unlock.type === 'key') hints[m.id] = `key: ${normalizeCode(m.unlock.key)}`
    if (m.unlock.type === 'clue') hints[m.id] = `answer: ${normalizeCode(m.unlock.answer)}`
    if (m.unlock.type === 'time') hints[m.id] = 'opens by itself'
  }
  return hints
}

/** Human-readable cheat sheet of every code in the experience. */
export function cheatSheet(exp: Experience): { label: string; value: string }[] {
  return exp.moments.map((m, i) => {
    const n = String(i + 1).padStart(2, '0')
    switch (m.unlock.type) {
      case 'key':
        return { label: `${n} · you reveal it`, value: normalizeCode(m.unlock.key) }
      case 'clue':
        return { label: `${n} · they answer`, value: normalizeCode(m.unlock.answer) }
      case 'time':
        return {
          label: `${n} · opens by itself`,
          value: new Date(m.unlock.at).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        }
    }
  })
}
