import { Check, CloudRain, KeyRound } from 'lucide-react'
import { CHECKPOINTS, ADVENTURE_DATE } from '../data/checkpoints'
import { CheckpointCard } from './CheckpointCard'
import type { Reveal } from '../utils/crypto'

interface Props {
  reveals: Record<number, Reveal>
  completed: number[]
  justUnlockedId: number | null
  cardRef: (id: number) => (el: HTMLDivElement | null) => void
  onComplete: (id: number) => void
  onLockedTap: () => void
  onOpenUnlock: () => void
  onOpenRainPlan: () => void
  onDateTap: () => void
}

export function Timeline({
  reveals,
  completed,
  justUnlockedId,
  cardRef,
  onComplete,
  onLockedTap,
  onOpenUnlock,
  onOpenRainPlan,
  onDateTap,
}: Props) {
  return (
    <div className="relative z-10 mx-auto min-h-dvh w-full max-w-md">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/85 px-5 py-3.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onDateTap}
          className="text-[10.5px] font-medium tracking-[0.22em] text-ink/50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          aria-label="Adventure date"
        >
          {ADVENTURE_DATE.toUpperCase()}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenRainPlan}
            aria-label="Rain plan"
            className="rounded-full p-2.5 text-ink/40 transition-colors hover:text-rose focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <CloudRain size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onOpenUnlock}
            aria-label="Enter unlock key"
            className="rounded-full p-2.5 text-ink/40 transition-colors hover:text-burgundy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <KeyRound size={17} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="px-5 pt-4 pb-16">
        <div className="mb-9 text-center">
          <p className="font-serif text-2xl text-ink">A Little Adventure</p>
          <p className="mt-1.5 text-[13px] italic text-ink/50">
            Five checkpoints. One day. ✦
          </p>
        </div>

        <ol className="list-none">
          {CHECKPOINTS.map((cp, i) => {
            const isCompleted = completed.includes(cp.id)
            const isUnlocked = Boolean(reveals[cp.id])
            return (
              <li key={cp.id} className="flex gap-4">
                <div className="flex w-6 shrink-0 flex-col items-center" aria-hidden="true">
                  <span
                    className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                      isCompleted
                        ? 'border-gold bg-gold text-ink'
                        : isUnlocked
                          ? 'border-rose bg-rose/15'
                          : 'border-ink/20 bg-cream'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={13} strokeWidth={3} />
                    ) : (
                      <span
                        className={`size-1.5 rounded-full ${
                          isUnlocked ? 'bg-rose' : 'bg-ink/25'
                        }`}
                      />
                    )}
                  </span>
                  {i < CHECKPOINTS.length - 1 && (
                    <span
                      className={`w-px flex-1 transition-colors duration-700 ${
                        isCompleted ? 'bg-gold/70' : 'bg-ink/12'
                      }`}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-8" ref={cardRef(cp.id)}>
                  <CheckpointCard
                    id={cp.id}
                    teaser={cp.teaser}
                    reveal={reveals[cp.id]}
                    completed={isCompleted}
                    justUnlocked={justUnlockedId === cp.id}
                    onComplete={onComplete}
                    onLockedTap={onLockedTap}
                  />
                </div>
              </li>
            )
          })}
        </ol>
      </main>
    </div>
  )
}
