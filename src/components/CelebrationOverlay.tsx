import { useMemo, type CSSProperties } from 'react'
import { Check, Sparkles } from 'lucide-react'

interface Props {
  /** How many checkpoints are done (1–4). */
  count: number
  /** Teaser line of the next locked checkpoint, if any. */
  nextTeaser: string | null
  onClose: () => void
}

const MESSAGES: Record<number, { title: string; line: string }> = {
  1: { title: 'One down. ✨', line: 'Four little mysteries left.' },
  2: { title: 'Two down. 😌', line: 'You’re getting good at this.' },
  3: { title: 'Three down.', line: 'Past halfway. No turning back now.' },
  4: { title: 'Four down. 👀', line: 'Only one secret left.' },
}

export function CelebrationOverlay({ count, nextTeaser, onClose }: Props) {
  const message = MESSAGES[count] ?? MESSAGES[1]

  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const dist = 46 + (i % 3) * 22
        return {
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist}px`,
          size: 3 + (i % 3) * 2,
          color: i % 3 === 0 ? '#d4af71' : i % 3 === 1 ? '#b05a6e' : '#e9d7b0',
          delay: `${(i % 4) * 0.05}s`,
        }
      }),
    [],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkpoint complete"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-cream px-6 py-8 text-center shadow-2xl animate-pop motion-reduce:animate-none"
      >
        <div className="relative mx-auto flex size-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {sparks.map((s, i) => (
              <span
                key={i}
                className="absolute rounded-full animate-burst motion-reduce:animate-none motion-reduce:opacity-0"
                style={
                  {
                    width: s.size,
                    height: s.size,
                    backgroundColor: s.color,
                    animationDelay: s.delay,
                    '--dx': s.dx,
                    '--dy': s.dy,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/20 text-burgundy">
            <Check size={26} strokeWidth={2.5} aria-hidden="true" />
          </span>
        </div>

        <h2 className="mt-5 font-serif text-2xl text-ink">{message.title}</h2>
        <p className="mt-2 text-[15px] text-ink/70">{message.line}</p>

        {nextTeaser && (
          <div className="mt-6 rounded-xl border border-gold/40 bg-parchment/60 px-5 py-4">
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] text-gold">
              <Sparkles size={12} aria-hidden="true" />
              UP NEXT
            </p>
            <p className="mt-2 font-serif text-lg italic text-ink/80">
              &ldquo;{nextTeaser}&rdquo;
            </p>
            <p className="mt-2 text-[12.5px] text-ink/55">
              You&rsquo;ll get the key when we get there. 🔐
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-12 w-full rounded-full bg-burgundy px-6 py-3 text-[12px] font-semibold tracking-[0.18em] text-cream shadow-sm transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          {nextTeaser ? 'ONWARD →' : 'CONTINUE'}
        </button>
      </div>
    </div>
  )
}
