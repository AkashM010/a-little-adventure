export type Stage = 'landing' | 'intro' | 'timeline' | 'final'

export interface StoredProgress {
  stage: Stage
  /** checkpoint id → base64-obfuscated unlock code (used to re-decrypt on reload) */
  keys: Record<string, string>
  completed: number[]
}

const STORAGE_KEY = 'a9.journey.v1'

const DEFAULTS: StoredProgress = { stage: 'landing', keys: {}, completed: [] }

export function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<StoredProgress>
    return {
      stage: parsed.stage ?? 'landing',
      keys: parsed.keys ?? {},
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveProgress(progress: StoredProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // storage unavailable (private mode etc.) — app still works, just no persistence
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export const encodeKey = (code: string): string => {
  try {
    return btoa(code)
  } catch {
    return ''
  }
}

export const decodeKey = (encoded: string): string => {
  try {
    return atob(encoded)
  } catch {
    return ''
  }
}
