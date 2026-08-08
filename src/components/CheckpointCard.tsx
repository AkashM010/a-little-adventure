import { useEffect, useState, type CSSProperties } from 'react'
import { Check, Lock, LockOpen, MapPin } from 'lucide-react'
import type { Reveal } from '../utils/crypto'

interface Props {
  id: number
  teaser: string
  reveal?: Reveal
  completed: boolean
  justUnlocked: boolean
  onComplete: (id: number) => void
  onLockedTap: () => void
}

const mapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export function CheckpointCard({
  id,
  teaser,
  reveal,
  completed,
  justUnlocked,
  onComplete,
  onLockedTap,
}: Props) {
  const number = String(id).padStart(2, '0')

  // Finale (checkpoint 5): hold the destination back for a moment after unlock.
  const staged = Boolean(reveal?.finale && justUnlocked)
  const [showDestination, setShowDestination] = useState(!staged)
  useEffect(() => {
    if (!staged) return
    setShowDestination(false)
    const t = setTimeout(() => setShowDestination(true), 2400)
    return () => clearTimeout(t)
  }, [staged])

  // Stagger entrance animations only on a fresh unlock, not on reload.
  const anim = (delay: number): { className: string; style: CSSProperties } =>
    justUnlocked
      ? {
          className: 'animate-fade-up motion-reduce:animate-none',
          style: { animationDelay: `${delay}s` },
        }
      : { className: '', style: {} }

  if (!reveal) {
    return (
      <button
        type="button"
        onClick={onLockedTap}
        aria-label={`Checkpoint ${number}, locked`}
        className="w-full rounded-2xl border border-ink/10 bg-white/55 px-6 py-7 text-center shadow-sm transition-transform duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        <p className="text-[11px] font-semibold tracking-[0.24em] text-ink/45">
          CHECKPOINT {number}
        </p>
        <p className="mt-3 font-serif text-lg italic text-ink/70">{teaser}</p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.2em] text-ink/40">
          <Lock size={13} aria-hidden="true" />
          LOCKED
        </p>
      </button>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border px-6 py-7 shadow-md transition-colors duration-500 ${
        completed ? 'border-gold/50 bg-parchment' : 'border-rose/25 bg-white/80'
      } ${justUnlocked ? 'animate-pop motion-reduce:animate-none' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-rose">
          CHECKPOINT {number}
        </p>
        {completed ? (
          <p className="flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-burgundy">
            <Check size={12} aria-hidden="true" />
            COMPLETED
          </p>
        ) : (
          <LockOpen
            size={16}
            aria-hidden="true"
            className={`text-gold ${justUnlocked ? 'animate-unlock motion-reduce:animate-none' : ''}`}
          />
        )}
      </div>

      <p {...anim(0.15)} className={`mt-4 font-serif text-xl text-ink ${anim(0.15).className}`}>
        {reveal.greeting}
      </p>
      <p
        style={anim(0.35).style}
        className={`mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink/75 ${anim(0.35).className}`}
      >
        {reveal.message}
      </p>

      {showDestination ? (
        <>
          <div
            style={staged ? {} : anim(0.6).style}
            className={`mt-5 rounded-xl border border-gold/40 bg-cream px-5 py-5 ${
              staged
                ? 'animate-fade-up motion-reduce:animate-none'
                : anim(0.6).className
            }`}
          >
            <p className="text-[10px] font-semibold tracking-[0.26em] text-gold">
              DESTINATION
            </p>
            <h3 className="mt-2 font-serif text-[1.35rem] leading-tight text-burgundy">
              {reveal.name}
            </h3>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink/60">
              <MapPin size={14} aria-hidden="true" className="shrink-0 text-rose" />
              {reveal.location}
            </p>
            {reveal.note && (
              <p className="mt-3 text-[14px] leading-relaxed whitespace-pre-line italic text-ink/70">
                {reveal.note}
              </p>
            )}
            {reveal.highlight && (
              <p className="mt-4 font-serif text-lg text-rose">{reveal.highlight}</p>
            )}
            {reveal.footnote && (
              <p className="mt-4 border-t border-ink/10 pt-3 text-[12.5px] leading-relaxed text-ink/55">
                {reveal.footnote}
              </p>
            )}
          </div>

          <div
            style={staged ? { animationDelay: '0.3s' } : anim(0.85).style}
            className={`mt-5 flex flex-col gap-3 ${
              staged
                ? 'animate-fade-up motion-reduce:animate-none'
                : anim(0.85).className
            }`}
          >
            <a
              href={mapsUrl(reveal.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-burgundy/40 px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-burgundy transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <MapPin size={14} aria-hidden="true" />
              OPEN MAP
            </a>
            {!completed && (
              <button
                type="button"
                onClick={() => onComplete(id)}
                className="min-h-12 rounded-full bg-burgundy px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-cream shadow-sm transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                {reveal.completeLabel}
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="mt-5 animate-shimmer text-center font-serif text-sm italic text-rose motion-reduce:animate-none">
          ...
        </p>
      )}
    </div>
  )
}
