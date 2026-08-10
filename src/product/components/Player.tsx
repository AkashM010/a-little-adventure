import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import {
  ArrowRight,
  Check,
  Clock,
  Heart,
  KeyRound,
  Lock,
  LockOpen,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react'
import { openPayload } from '../../utils/crypto'
import { RainBackground } from '../../components/RainBackground'
import { OCCASIONS } from '../occasions'
import { loadPlay, savePlay, clearPlay } from '../store'
import type { MomentReveal, SealedExperience, SealedMoment } from '../types'

type Stage = 'landing' | 'intro' | 'journey' | 'ending'

interface PlayerProps {
  sealed: SealedExperience
  /** live = real recipient (progress persists) · preview/demo = ephemeral, with hints */
  mode: 'live' | 'preview' | 'demo'
  hints?: Record<string, string>
  onExit?: () => void
}

/** Creators can paste a Google Maps share link instead of a place name. */
const isMapLink = (s: string) => /^https?:\/\//i.test(s.trim())

const mapsUrl = (query: string) =>
  isMapLink(query)
    ? query.trim()
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

const timeReady = (at: string) => new Date(at).getTime() <= Date.now()

export function Player({ sealed, mode, hints, onExit }: PlayerProps) {
  const config = OCCASIONS[sealed.occasion]
  const live = mode === 'live'

  const [ready, setReady] = useState(!live)
  const [stage, setStage] = useState<Stage>('landing')
  const [opened, setOpened] = useState<Record<string, MomentReveal>>({})
  const [done, setDone] = useState<string[]>([])
  const [justOpened, setJustOpened] = useState<string | null>(null)
  const [keyModal, setKeyModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{ count: number; teaser: string | null } | null>(
    null,
  )

  const codesRef = useRef<Record<string, string>>({})
  const cardEls = useRef<Record<string, HTMLDivElement | null>>({})
  const titleTaps = useRef(0)
  const titleTapTimer = useRef<number | undefined>(undefined)

  const total = sealed.moments.length
  const hasKeyMoments = sealed.moments.some((m) => m.lock.type === 'key')
  const lastId = sealed.moments[total - 1]?.id

  const persist = useCallback(
    (nextStage: Stage, nextDone: string[]) => {
      if (!live) return
      savePlay(sealed.id, { stage: nextStage, codes: codesRef.current, done: nextDone })
    },
    [live, sealed.id],
  )

  // Hydrate saved progress (live mode): re-decrypt each stored code.
  useEffect(() => {
    if (!live) return
    let cancelled = false
    void (async () => {
      const saved = loadPlay(sealed.id)
      codesRef.current = saved.codes
      const restored: Record<string, MomentReveal> = {}
      for (const m of sealed.moments) {
        const codeB64 = saved.codes[m.id]
        if (!codeB64) continue
        try {
          const reveal = await openPayload<MomentReveal>(m.blob, atob(codeB64))
          if (reveal) restored[m.id] = reveal
        } catch {
          // corrupted entry — leave locked
        }
      }
      if (cancelled) return
      setOpened(restored)
      setDone(saved.done)
      setStage(saved.stage)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [live, sealed])

  const openMoment = useCallback(
    (m: SealedMoment, reveal: MomentReveal, code: string) => {
      codesRef.current[m.id] = btoa(code)
      setOpened((current) => ({ ...current, [m.id]: reveal }))
      setJustOpened(m.id)
      setDone((currentDone) => {
        setStage((currentStage) => {
          persist(currentStage, currentDone)
          return currentStage
        })
        return currentDone
      })
    },
    [persist],
  )

  /** Try a code/answer against every still-locked moment. */
  const attempt = useCallback(
    async (raw: string): Promise<boolean> => {
      for (const m of sealed.moments) {
        if (opened[m.id] || m.lock.type === 'time') continue
        const reveal = await openPayload<MomentReveal>(m.blob, raw)
        if (reveal) {
          openMoment(m, reveal, raw.trim().toUpperCase())
          return true
        }
      }
      return false
    },
    [sealed.moments, opened, openMoment],
  )

  // Self-opening moments: check now and every 15 seconds.
  useEffect(() => {
    if (stage !== 'journey') return
    const check = async () => {
      for (const m of sealed.moments) {
        if (opened[m.id] || m.lock.type !== 'time' || !timeReady(m.lock.at)) continue
        const code = atob(m.lock.k)
        const reveal = await openPayload<MomentReveal>(m.blob, code)
        if (reveal) openMoment(m, reveal, code)
      }
    }
    void check()
    const timer = setInterval(() => void check(), 15000)
    return () => clearInterval(timer)
  }, [stage, sealed.moments, opened, openMoment])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (justOpened == null) return
    const t = setTimeout(() => {
      cardEls.current[justOpened]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 250)
    return () => clearTimeout(t)
  }, [justOpened])

  const goStage = useCallback(
    (next: Stage) => {
      setStage(next)
      setDone((currentDone) => {
        persist(next, currentDone)
        return currentDone
      })
    },
    [persist],
  )

  const completeMoment = useCallback(
    (id: string) => {
      setDone((current) => {
        const next = current.includes(id) ? current : [...current, id]
        persist(stage, next)
        if (next.length === total) {
          setTimeout(() => goStage('ending'), 700)
        } else {
          const upcoming = sealed.moments.find((m) => !next.includes(m.id) && !opened[m.id])
          setCelebration({ count: next.length, teaser: upcoming ? upcoming.teaser : null })
        }
        return next
      })
    },
    [persist, stage, total, sealed.moments, opened, goStage],
  )

  const closeCelebration = useCallback(() => {
    setCelebration(null)
    const upcoming = sealed.moments.find((m) => !done.includes(m.id) && !opened[m.id])
    if (upcoming) {
      setTimeout(() => {
        cardEls.current[upcoming.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 150)
    }
  }, [sealed.moments, done, opened])

  // Hidden reset for live mode: tap the header title 7 times quickly.
  const handleTitleTap = useCallback(() => {
    if (!live) return
    titleTaps.current += 1
    window.clearTimeout(titleTapTimer.current)
    titleTapTimer.current = window.setTimeout(() => {
      titleTaps.current = 0
    }, 2500)
    if (titleTaps.current >= 7) {
      titleTaps.current = 0
      if (window.confirm('Reset all progress for this experience?')) {
        clearPlay(sealed.id)
        window.location.reload()
      }
    }
  }, [live, sealed.id])

  const dark = stage !== 'journey'

  if (!ready) {
    return <div className="min-h-dvh bg-ink" style={config.theme as CSSProperties} aria-hidden="true" />
  }

  return (
    <div
      style={config.theme as CSSProperties}
      className={`min-h-dvh transition-colors duration-700 ${
        dark ? 'bg-ink text-cream' : 'bg-cream text-ink'
      }`}
    >
      <RainBackground tone={dark ? 'dark' : 'light'} />

      {stage === 'landing' && (
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-7 py-14 text-center">
          <p
            className="animate-fade-up text-[11px] font-medium tracking-[0.28em] text-gold motion-reduce:animate-none"
            style={{ animationDelay: '0.1s' }}
          >
            {config.emoji} A SURPRISE {sealed.toName ? `FOR ${sealed.toName.toUpperCase()}` : 'FOR YOU'}
          </p>
          <h1
            className="animate-fade-up mt-7 font-serif text-[2.2rem] leading-[1.15] text-cream motion-reduce:animate-none"
            style={{ animationDelay: '0.3s' }}
          >
            {sealed.title}
          </h1>
          <p
            className="animate-fade-up mt-5 font-serif text-lg italic text-gold-soft motion-reduce:animate-none"
            style={{ animationDelay: '0.5s' }}
          >
            {config.tagline}
          </p>
          <button
            type="button"
            onClick={() => goStage('intro')}
            className="animate-fade-up mt-12 min-h-13 rounded-full bg-burgundy px-9 py-4 text-[13px] font-semibold tracking-[0.18em] text-cream shadow-lg shadow-black/30 transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
            style={{ animationDelay: '0.75s' }}
          >
            {config.beginLabel}
          </button>
        </div>
      )}

      {stage === 'intro' && (
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-8 py-14 text-center">
          <div className="space-y-4">
            {sealed.introLines.map((line, i) => (
              <p
                key={`${i}-${line}`}
                className={`animate-fade-up motion-reduce:animate-none ${
                  i >= sealed.introLines.length - 2
                    ? 'font-serif text-lg italic text-gold-soft'
                    : 'text-[16px] leading-relaxed text-cream/85'
                }`}
                style={{ animationDelay: `${0.2 + i * 0.35}s` }}
              >
                {line}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => goStage('journey')}
            className="animate-fade-up mt-14 min-h-13 rounded-full border border-gold/60 px-10 py-4 text-[13px] font-semibold tracking-[0.2em] text-gold transition-colors duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
            style={{ animationDelay: `${0.2 + sealed.introLines.length * 0.35 + 0.3}s` }}
          >
            {config.introButton}
          </button>
        </div>
      )}

      {stage === 'journey' && (
        <div className="relative z-10 mx-auto min-h-dvh w-full max-w-md">
          <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/85 px-5 py-3.5 backdrop-blur-md">
            <button
              type="button"
              onClick={handleTitleTap}
              className="max-w-[60%] truncate text-left text-[10.5px] font-medium tracking-[0.22em] text-ink/50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              {sealed.title.toUpperCase()}
            </button>
            {hasKeyMoments && (
              <button
                type="button"
                onClick={() => setKeyModal(true)}
                aria-label="Enter unlock key"
                className="rounded-full p-2.5 text-ink/40 transition-colors hover:text-burgundy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <KeyRound size={17} aria-hidden="true" />
              </button>
            )}
          </header>

          <main className="px-5 pt-4 pb-24">
            <div className="mb-9 text-center">
              <p className="font-serif text-2xl text-ink">{sealed.title}</p>
              <p className="mt-1.5 text-[13px] italic text-ink/50">
                {total} {config.momentLabel.toLowerCase()}s. One {config.name.toLowerCase()}. ✦
              </p>
            </div>

            <ol className="list-none">
              {sealed.moments.map((m, i) => (
                <li key={m.id} className="flex gap-4">
                  <div className="flex w-6 shrink-0 flex-col items-center" aria-hidden="true">
                    <span
                      className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                        done.includes(m.id)
                          ? 'border-gold bg-gold text-ink'
                          : opened[m.id]
                            ? 'border-rose bg-rose/15'
                            : 'border-ink/20 bg-cream'
                      }`}
                    >
                      {done.includes(m.id) ? (
                        <Check size={13} strokeWidth={3} />
                      ) : (
                        <span
                          className={`size-1.5 rounded-full ${opened[m.id] ? 'bg-rose' : 'bg-ink/25'}`}
                        />
                      )}
                    </span>
                    {i < total - 1 && (
                      <span
                        className={`w-px flex-1 transition-colors duration-700 ${
                          done.includes(m.id) ? 'bg-gold/70' : 'bg-ink/12'
                        }`}
                      />
                    )}
                  </div>
                  <div
                    className="min-w-0 flex-1 pb-8"
                    ref={(el) => {
                      cardEls.current[m.id] = el
                    }}
                  >
                    <MomentCard
                      moment={m}
                      index={i}
                      isLast={m.id === lastId}
                      label={config.momentLabel}
                      reveal={opened[m.id]}
                      completed={done.includes(m.id)}
                      justOpened={justOpened === m.id}
                      hint={hints?.[m.id]}
                      cluePlaceholder={config.cluePlaceholder}
                      completeLabel={m.id === lastId ? config.finishLabel : config.completeLabel}
                      onAttempt={attempt}
                      onComplete={completeMoment}
                      onLockedTap={() => setToast(config.lockedTease)}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </main>
        </div>
      )}

      {stage === 'ending' && (
        <EndingScreen
          headline={sealed.ending.headline}
          lines={sealed.ending.lines}
          onRevisit={() => goStage('journey')}
        />
      )}

      {keyModal && (
        <KeyModal
          prompt={config.keyPrompt}
          onClose={() => setKeyModal(false)}
          onSubmit={async (code) => {
            const ok = await attempt(code)
            if (ok) setKeyModal(false)
            return ok
          }}
        />
      )}

      {celebration && (
        <Celebration
          title={config.celebrate[Math.min(celebration.count - 1, config.celebrate.length - 1)].title}
          line={config.celebrate[Math.min(celebration.count - 1, config.celebrate.length - 1)].line}
          teaser={celebration.teaser}
          onClose={closeCelebration}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 z-40 w-max max-w-[85vw] -translate-x-1/2 rounded-full bg-ink-soft px-5 py-3 text-[13px] text-cream shadow-lg animate-fade-up motion-reduce:animate-none"
        >
          {toast}
        </div>
      )}

      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="fixed right-4 bottom-4 z-50 flex items-center gap-1.5 rounded-full bg-ink/85 px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-cream shadow-lg backdrop-blur transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          <X size={13} aria-hidden="true" />
          {mode === 'preview' ? 'EXIT PREVIEW' : 'EXIT DEMO'}
        </button>
      )}
    </div>
  )
}

/* ---------------------------------- cards ---------------------------------- */

interface MomentCardProps {
  moment: SealedMoment
  index: number
  isLast: boolean
  label: string
  reveal?: MomentReveal
  completed: boolean
  justOpened: boolean
  hint?: string
  cluePlaceholder: string
  completeLabel: string
  onAttempt: (code: string) => Promise<boolean>
  onComplete: (id: string) => void
  onLockedTap: () => void
}

function MomentCard({
  moment,
  index,
  isLast,
  label,
  reveal,
  completed,
  justOpened,
  hint,
  cluePlaceholder,
  completeLabel,
  onAttempt,
  onComplete,
  onLockedTap,
}: MomentCardProps) {
  const number = String(index + 1).padStart(2, '0')
  const [answer, setAnswer] = useState('')
  const [clueError, setClueError] = useState(false)
  const [busy, setBusy] = useState(false)

  // Last moment gets the staged suspense reveal.
  const staged = isLast && justOpened && Boolean(reveal)
  const [showBody, setShowBody] = useState(!staged)
  const [suspenseLine, setSuspenseLine] = useState(false)
  useEffect(() => {
    if (!staged) {
      setShowBody(true)
      return
    }
    setShowBody(false)
    setSuspenseLine(false)
    const t1 = setTimeout(() => setSuspenseLine(true), 1500)
    const t2 = setTimeout(() => setShowBody(true), 3300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [staged])

  const submitClue = async (e: FormEvent) => {
    e.preventDefault()
    if (busy || !answer.trim()) return
    setBusy(true)
    const ok = await onAttempt(answer)
    setBusy(false)
    if (!ok) setClueError(true)
    else setAnswer('')
  }

  if (!reveal) {
    const lockRow = (
      <>
        <p className="text-[11px] font-semibold tracking-[0.24em] text-ink/45">
          {label} {number}
        </p>
        <p className="mt-3 font-serif text-lg italic text-ink/70">{moment.teaser}</p>
      </>
    )

    if (moment.lock.type === 'clue') {
      return (
        <div className="w-full rounded-2xl border border-ink/10 bg-white/55 px-6 py-7 text-center shadow-sm">
          {lockRow}
          <p className="mt-4 rounded-xl bg-parchment/70 px-4 py-3.5 text-[14px] leading-relaxed whitespace-pre-line text-ink/75">
            {moment.lock.clue}
          </p>
          <form onSubmit={submitClue} className="mt-4 flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
                setClueError(false)
              }}
              placeholder={cluePlaceholder}
              aria-label={`Answer for ${label.toLowerCase()} ${number}`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-4 py-3 text-center text-[14px] text-ink placeholder:text-ink/30 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              aria-label="Try answer"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-burgundy text-cream shadow-sm transition-transform duration-200 active:scale-95 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>
          {clueError && (
            <p role="alert" className="mt-3 text-[13px] text-rose">
              Not it. Try again. 😌
            </p>
          )}
          {hint && <HintChip text={hint} />}
        </div>
      )
    }

    if (moment.lock.type === 'time') {
      return (
        <div className="w-full rounded-2xl border border-ink/10 bg-white/55 px-6 py-7 text-center shadow-sm">
          {lockRow}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-medium tracking-[0.08em] text-ink/50">
            <Clock size={13} aria-hidden="true" />
            Opens{' '}
            {new Date(moment.lock.at).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          {hint && <HintChip text={hint} />}
        </div>
      )
    }

    return (
      <button
        type="button"
        onClick={onLockedTap}
        aria-label={`${label} ${number}, locked`}
        className="w-full rounded-2xl border border-ink/10 bg-white/55 px-6 py-7 text-center shadow-sm transition-transform duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        {lockRow}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.2em] text-ink/40">
          <Lock size={13} aria-hidden="true" />
          LOCKED
        </p>
        {hint && <HintChip text={hint} />}
      </button>
    )
  }

  const anim = (delay: number): { className: string; style: CSSProperties } =>
    justOpened
      ? {
          className: 'animate-fade-up motion-reduce:animate-none',
          style: { animationDelay: `${delay}s` },
        }
      : { className: '', style: {} }

  return (
    <div
      className={`overflow-hidden rounded-2xl border px-6 py-7 shadow-md transition-colors duration-500 ${
        completed ? 'border-gold/50 bg-parchment' : 'border-rose/25 bg-white/80'
      } ${justOpened ? 'animate-pop motion-reduce:animate-none' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-rose">
          {label} {number}
        </p>
        {completed ? (
          <p className="flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-burgundy">
            <Check size={12} aria-hidden="true" />
            DONE
          </p>
        ) : (
          <LockOpen
            size={16}
            aria-hidden="true"
            className={`text-gold ${justOpened ? 'animate-unlock motion-reduce:animate-none' : ''}`}
          />
        )}
      </div>

      {showBody ? (
        <>
          <p
            style={anim(0.2).style}
            className={`mt-4 text-[15px] leading-relaxed whitespace-pre-line text-ink/80 ${anim(0.2).className}`}
          >
            {reveal.message}
          </p>

          {(reveal.name || reveal.location) && (
            <div
              style={staged ? {} : anim(0.5).style}
              className={`mt-5 rounded-xl border border-gold/40 bg-cream px-5 py-5 ${
                staged ? 'animate-fade-up motion-reduce:animate-none' : anim(0.5).className
              }`}
            >
              {reveal.name && (
                <h3 className="font-serif text-[1.3rem] leading-tight text-burgundy">
                  {reveal.name}
                </h3>
              )}
              {reveal.location && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-ink/60">
                  <MapPin size={14} aria-hidden="true" className="shrink-0 text-rose" />
                  {isMapLink(reveal.location) ? 'Pinned location' : reveal.location}
                </p>
              )}
            </div>
          )}

          <div
            style={staged ? { animationDelay: '0.3s' } : anim(0.75).style}
            className={`mt-5 flex flex-col gap-3 ${
              staged ? 'animate-fade-up motion-reduce:animate-none' : anim(0.75).className
            }`}
          >
            {reveal.location && (
              <a
                href={mapsUrl(reveal.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-burgundy/40 px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-burgundy transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <MapPin size={14} aria-hidden="true" />
                OPEN MAP
              </a>
            )}
            {!completed && (
              <button
                type="button"
                onClick={() => onComplete(moment.id)}
                className="min-h-12 rounded-full bg-burgundy px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-cream shadow-sm transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                {completeLabel}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 py-4 animate-fade-in motion-reduce:animate-none">
          <Heart
            size={22}
            aria-hidden="true"
            className="animate-heart fill-rose text-rose motion-reduce:animate-none"
          />
          <p className="animate-shimmer font-serif text-[15px] italic text-ink/60 motion-reduce:animate-none">
            wait for it...
          </p>
          {suspenseLine && (
            <p className="animate-fade-up text-[13px] text-ink/45 motion-reduce:animate-none">
              one more breath. 🤍
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function HintChip({ text }: { text: string }) {
  return (
    <p className="mx-auto mt-4 w-max max-w-full truncate rounded-full border border-dashed border-ink/25 px-3 py-1 text-[10.5px] tracking-[0.08em] text-ink/45">
      preview · {text}
    </p>
  )
}

/* ------------------------------- key modal ------------------------------- */

function KeyModal({
  prompt,
  onClose,
  onSubmit,
}: {
  prompt: string
  onClose: () => void
  onSubmit: (code: string) => Promise<boolean>
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!code.trim()) {
      setError('Enter the key first.')
      return
    }
    setBusy(true)
    try {
      const ok = await onSubmit(code)
      if (!ok) {
        setError('That key doesn’t seem to work. 😌')
        setBusy(false)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={prompt}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-cream px-6 py-7 shadow-2xl animate-pop motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
              <KeyRound size={17} aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl text-ink">{prompt}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 rounded-full p-2 text-ink/45 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setError(null)
            }}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Unlock key"
            placeholder="________"
            className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-center font-serif text-lg tracking-[0.3em] text-ink uppercase placeholder:text-ink/25 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none"
          />
          {error && (
            <p role="alert" className="mt-3 text-center text-[13px] text-rose">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 min-h-12 w-full rounded-full bg-burgundy px-6 py-3.5 text-[13px] font-semibold tracking-[0.2em] text-cream shadow-sm transition-transform duration-200 active:scale-95 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            {busy ? 'CHECKING...' : 'UNLOCK'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------ celebration ------------------------------ */

function Celebration({
  title,
  line,
  teaser,
  onClose,
}: {
  title: string
  line: string
  teaser: string | null
  onClose: () => void
}) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const dist = 46 + (i % 3) * 22
        return {
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist}px`,
          size: 3 + (i % 3) * 2,
          delay: `${(i % 4) * 0.05}s`,
          tone: i % 3,
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
        aria-label="Progress"
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
                className={`absolute rounded-full animate-burst motion-reduce:animate-none motion-reduce:opacity-0 ${
                  s.tone === 0 ? 'bg-gold' : s.tone === 1 ? 'bg-rose' : 'bg-gold-soft'
                }`}
                style={
                  {
                    width: s.size,
                    height: s.size,
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

        <h2 className="mt-5 font-serif text-2xl text-ink">{title}</h2>
        <p className="mt-2 text-[15px] text-ink/70">{line}</p>

        {teaser && (
          <div className="mt-6 rounded-xl border border-gold/40 bg-parchment/60 px-5 py-4">
            <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] text-gold">
              <Sparkles size={12} aria-hidden="true" />
              UP NEXT
            </p>
            <p className="mt-2 font-serif text-lg italic text-ink/80">&ldquo;{teaser}&rdquo;</p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-12 w-full rounded-full bg-burgundy px-6 py-3 text-[12px] font-semibold tracking-[0.18em] text-cream shadow-sm transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          {teaser ? 'ONWARD →' : 'CONTINUE'}
        </button>
      </div>
    </div>
  )
}

/* -------------------------------- ending -------------------------------- */

function EndingScreen({
  headline,
  lines,
  onRevisit,
}: {
  headline: string
  lines: string[]
  onRevisit: () => void
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        size: 3 + ((i * 7) % 5),
        delay: `${(i * 0.9) % 7}s`,
        duration: `${6 + ((i * 3) % 5)}s`,
        opacity: 0.2 + ((i * 13) % 30) / 100,
        drift: `${((i % 5) - 2) * 14}px`,
        tone: i % 3,
      })),
    [],
  )

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 py-14 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {particles.map((p, i) => (
          <span
            key={i}
            className={`absolute bottom-0 rounded-full animate-float-up motion-reduce:animate-none motion-reduce:opacity-0 ${
              p.tone === 0 ? 'bg-gold' : 'bg-rose'
            }`}
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
                '--particle-opacity': p.opacity,
                '--particle-drift': p.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <Heart
        size={40}
        aria-hidden="true"
        className="animate-heart fill-rose text-rose motion-reduce:animate-none"
      />

      <h1
        className="animate-fade-up mt-8 font-serif text-[2rem] leading-tight text-cream motion-reduce:animate-none"
        style={{ animationDelay: '0.3s' }}
      >
        {headline}
      </h1>

      <div
        className="animate-fade-up mt-8 space-y-1.5 text-[15.5px] leading-relaxed text-cream/80 motion-reduce:animate-none"
        style={{ animationDelay: '0.6s' }}
      >
        {lines.map((line, i) => (
          <p key={`${i}-${line}`}>{line}</p>
        ))}
      </div>

      <button
        type="button"
        onClick={onRevisit}
        className="animate-fade-up mt-12 text-[11.5px] tracking-[0.18em] text-cream/35 underline-offset-4 transition-colors hover:text-cream/60 hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
        style={{ animationDelay: '1.2s' }}
      >
        LOOK BACK AT THE JOURNEY
      </button>
    </div>
  )
}
