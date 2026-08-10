import type { Experience } from './types'

/**
 * Local-only persistence for the prototype.
 * Drafts live on the creator's device; play progress on the recipient's.
 */

const DRAFTS_KEY = 'sx.drafts.v1'

export function listDrafts(): Experience[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as Experience[]) : []
  } catch {
    return []
  }
}

export function getDraft(id: string): Experience | undefined {
  return listDrafts().find((d) => d.id === id)
}

export function saveDraft(exp: Experience): void {
  try {
    const drafts = listDrafts().filter((d) => d.id !== exp.id)
    drafts.unshift(exp)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
  } catch {
    // storage unavailable — editing still works for the session
  }
}

export function deleteDraft(id: string): void {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(listDrafts().filter((d) => d.id !== id)))
  } catch {
    // ignore
  }
}

/** Recipient-side progress for one experience. */
export interface PlayProgress {
  stage: 'landing' | 'intro' | 'journey' | 'ending'
  /** momentId → base64 of the code that opened it */
  codes: Record<string, string>
  done: string[]
}

const playKey = (id: string) => `sx.play.${id}`

export function loadPlay(id: string): PlayProgress {
  try {
    const raw = localStorage.getItem(playKey(id))
    if (raw) return JSON.parse(raw) as PlayProgress
  } catch {
    // fall through
  }
  return { stage: 'landing', codes: {}, done: [] }
}

export function savePlay(id: string, progress: PlayProgress): void {
  try {
    localStorage.setItem(playKey(id), JSON.stringify(progress))
  } catch {
    // ignore
  }
}

export function clearPlay(id: string): void {
  try {
    localStorage.removeItem(playKey(id))
  } catch {
    // ignore
  }
}
