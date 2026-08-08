import { useCallback, useEffect, useRef, useState } from 'react'
import { LandingScreen } from './components/LandingScreen'
import { IntroScreen } from './components/IntroScreen'
import { Timeline } from './components/Timeline'
import { FinalScreen } from './components/FinalScreen'
import { UnlockModal } from './components/UnlockModal'
import { RainPlanModal } from './components/RainPlanModal'
import { RainBackground } from './components/RainBackground'
import { useProgress } from './hooks/useProgress'

const RESET_TAPS = 7
const RESET_WINDOW_MS = 2500

export default function App() {
  const { ready, stage, setStage, reveals, completed, unlock, complete, reset } =
    useProgress()

  const [unlockOpen, setUnlockOpen] = useState(false)
  const [rainOpen, setRainOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [justUnlockedId, setJustUnlockedId] = useState<number | null>(null)

  const cardEls = useRef<Record<number, HTMLDivElement | null>>({})
  const tapCount = useRef(0)
  const tapTimer = useRef<number | undefined>(undefined)

  const cardRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      cardEls.current[id] = el
    },
    [],
  )

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // Scroll a freshly unlocked card into view.
  useEffect(() => {
    if (justUnlockedId == null) return
    const t = setTimeout(() => {
      cardEls.current[justUnlockedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 250)
    return () => clearTimeout(t)
  }, [justUnlockedId])

  const handleUnlock = useCallback(
    async (code: string): Promise<boolean> => {
      const result = await unlock(code)
      if (!result) return false
      setUnlockOpen(false)
      setJustUnlockedId(result.id)
      return true
    },
    [unlock],
  )

  const handleComplete = useCallback(
    (id: number) => {
      const next = complete(id)
      if (next.length === 5) {
        setTimeout(() => setStage('final'), 700)
      }
    },
    [complete, setStage],
  )

  const handleLockedTap = useCallback(() => {
    setToast('Nice try. 😌 I’ve got the keys.')
  }, [])

  // Hidden reset: tap the date in the header 7 times quickly.
  const handleDateTap = useCallback(() => {
    tapCount.current += 1
    window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(() => {
      tapCount.current = 0
    }, RESET_WINDOW_MS)
    if (tapCount.current >= RESET_TAPS) {
      tapCount.current = 0
      if (window.confirm('Reset all adventure progress?')) reset()
    }
  }, [reset])

  const dark = stage !== 'timeline'

  if (!ready) {
    return <div className="min-h-dvh bg-ink" aria-hidden="true" />
  }

  return (
    <div
      className={`min-h-dvh transition-colors duration-700 ${
        dark ? 'bg-ink text-cream' : 'bg-cream text-ink'
      }`}
    >
      <RainBackground tone={dark ? 'dark' : 'light'} />

      {stage === 'landing' && <LandingScreen onBegin={() => setStage('intro')} />}
      {stage === 'intro' && <IntroScreen onContinue={() => setStage('timeline')} />}
      {stage === 'timeline' && (
        <Timeline
          reveals={reveals}
          completed={completed}
          justUnlockedId={justUnlockedId}
          cardRef={cardRef}
          onComplete={handleComplete}
          onLockedTap={handleLockedTap}
          onOpenUnlock={() => setUnlockOpen(true)}
          onOpenRainPlan={() => setRainOpen(true)}
          onDateTap={handleDateTap}
        />
      )}
      {stage === 'final' && <FinalScreen onRevisit={() => setStage('timeline')} />}

      <UnlockModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onUnlock={handleUnlock}
      />
      <RainPlanModal open={rainOpen} onClose={() => setRainOpen(false)} />

      {toast && (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 z-40 w-max max-w-[85vw] -translate-x-1/2 rounded-full bg-ink-soft px-5 py-3 text-[13px] text-cream shadow-lg animate-fade-up motion-reduce:animate-none"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
