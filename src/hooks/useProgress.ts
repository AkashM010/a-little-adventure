import { useCallback, useEffect, useRef, useState } from 'react'
import { tryDecrypt, normalizeCode, type Reveal } from '../utils/crypto'
import {
  loadProgress,
  saveProgress,
  clearProgress,
  encodeKey,
  decodeKey,
  type Stage,
} from '../utils/storage'

export interface UnlockResult {
  id: number
  reveal: Reveal
}

export function useProgress() {
  const [ready, setReady] = useState(false)
  const [stage, setStageState] = useState<Stage>('landing')
  const [reveals, setReveals] = useState<Record<number, Reveal>>({})
  const [completed, setCompleted] = useState<number[]>([])
  const keysRef = useRef<Record<string, string>>({})

  // Hydrate from localStorage: re-decrypt every stored code.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const stored = loadProgress()
      keysRef.current = stored.keys
      const restored: Record<number, Reveal> = {}
      for (const [idStr, keyB64] of Object.entries(stored.keys)) {
        const reveal = await tryDecrypt(Number(idStr), decodeKey(keyB64))
        if (reveal) restored[Number(idStr)] = reveal
      }
      if (cancelled) return
      setReveals(restored)
      setCompleted(stored.completed)
      setStageState(stored.stage)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((nextStage: Stage, nextCompleted: number[]) => {
    saveProgress({ stage: nextStage, keys: keysRef.current, completed: nextCompleted })
  }, [])

  const setStage = useCallback(
    (next: Stage) => {
      setStageState(next)
      setCompleted((current) => {
        persist(next, current)
        return current
      })
    },
    [persist],
  )

  /** Try the code against every still-locked checkpoint. */
  const unlock = useCallback(
    async (rawCode: string): Promise<UnlockResult | null> => {
      const code = normalizeCode(rawCode)
      for (const id of [1, 2, 3, 4, 5]) {
        if (keysRef.current[String(id)]) continue
        const reveal = await tryDecrypt(id, code)
        if (reveal) {
          keysRef.current[String(id)] = encodeKey(code)
          setReveals((current) => ({ ...current, [id]: reveal }))
          setStageState((currentStage) => {
            setCompleted((currentCompleted) => {
              persist(currentStage, currentCompleted)
              return currentCompleted
            })
            return currentStage
          })
          return { id, reveal }
        }
      }
      return null
    },
    [persist],
  )

  /** Mark a checkpoint complete; returns the new completed list. */
  const complete = useCallback(
    (id: number): number[] => {
      let next: number[] = []
      setCompleted((current) => {
        next = current.includes(id) ? current : [...current, id]
        setStageState((currentStage) => {
          persist(currentStage, next)
          return currentStage
        })
        return next
      })
      return next
    },
    [persist],
  )

  const reset = useCallback(() => {
    clearProgress()
    window.location.reload()
  }, [])

  return { ready, stage, setStage, reveals, completed, unlock, complete, reset }
}
