import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  Eye,
  KeyRound,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { RainBackground } from '../../components/RainBackground'
import { OCCASIONS, buildTemplate, newMoment, pickKey } from '../occasions'
import { getDraft, saveDraft } from '../store'
import { seal, shareUrl, cheatSheet, buildHints } from '../share'
import { buildPrompt, type PromptKind } from '../prompts'
import { Player } from './Player'
import type { Experience, Moment, Occasion, SealedExperience, UnlockRule } from '../types'

const navigate = (path: string) => {
  window.location.hash = path
}

/** #/create → pick an occasion. #/edit/<id> → edit that draft. */
export function CreateFlow({ draftId }: { draftId?: string }) {
  if (!draftId) return <OccasionPicker />
  return <Editor draftId={draftId} />
}

/* ----------------------------- occasion picker ---------------------------- */

function OccasionPicker() {
  const start = (occasion: Occasion) => {
    const draft = buildTemplate(occasion)
    saveDraft(draft)
    navigate(`/edit/${draft.id}`)
  }

  return (
    <div className="min-h-dvh bg-ink text-cream">
      <RainBackground tone="dark" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-7 py-12">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex w-max items-center gap-1.5 text-[12px] tracking-[0.14em] text-cream/50 transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          BACK
        </button>

        <h1
          className="animate-fade-up mt-10 font-serif text-[2rem] leading-tight motion-reduce:animate-none"
          style={{ animationDelay: '0.1s' }}
        >
          What&rsquo;s the occasion?
        </h1>
        <p
          className="animate-fade-up mt-3 text-[14.5px] text-cream/65 motion-reduce:animate-none"
          style={{ animationDelay: '0.25s' }}
        >
          Each one starts you with a ready-made journey. You just make it yours.
        </p>

        <div className="mt-8 space-y-4">
          {Object.values(OCCASIONS).map((occ, i) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => start(occ.id)}
              className="animate-fade-up w-full rounded-2xl border border-cream/12 bg-cream/[0.04] px-6 py-6 text-left transition-colors duration-200 hover:border-gold/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
              style={{ animationDelay: `${0.4 + i * 0.15}s` }}
            >
              <span className="text-3xl" aria-hidden="true">
                {occ.emoji}
              </span>
              <span className="mt-3 block font-serif text-2xl text-cream">{occ.name}</span>
              <span className="mt-1.5 block text-[14px] leading-relaxed text-cream/60">
                {occ.pickerLine}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- editor --------------------------------- */

function Editor({ draftId }: { draftId: string }) {
  const [exp, setExp] = useState<Experience | undefined>(() => getDraft(draftId))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [preview, setPreview] = useState<SealedExperience | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [promptFor, setPromptFor] = useState<PromptKind | null>(null)
  const saveTimer = useRef<number | undefined>(undefined)

  // Autosave (debounced a touch to avoid hammering localStorage).
  useEffect(() => {
    if (!exp) return
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => saveDraft(exp), 250)
    return () => window.clearTimeout(saveTimer.current)
  }, [exp])

  const update = useCallback((fn: (draft: Experience) => Experience) => {
    setExp((current) => (current ? fn(current) : current))
  }, [])

  const updateMoment = useCallback(
    (id: string, fn: (m: Moment) => Moment) => {
      update((draft) => ({
        ...draft,
        moments: draft.moments.map((m) => (m.id === id ? fn(m) : m)),
      }))
    },
    [update],
  )

  const hints = useMemo(() => (exp ? buildHints(exp) : {}), [exp])

  if (!exp) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-8 text-center text-cream">
        <p className="font-serif text-2xl">That draft isn&rsquo;t here anymore.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-8 rounded-full border border-gold/60 px-8 py-3 text-[12px] font-semibold tracking-[0.18em] text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          GO HOME
        </button>
      </div>
    )
  }

  const config = OCCASIONS[exp.occasion]

  const openPreview = async () => {
    setPreviewLoading(true)
    const sealed = await seal(exp)
    setPreview(sealed)
    setPreviewLoading(false)
  }

  if (preview) {
    return (
      <Player sealed={preview} mode="preview" hints={hints} onExit={() => setPreview(null)} />
    )
  }

  const moveMoment = (index: number, dir: -1 | 1) => {
    update((draft) => {
      const moments = [...draft.moments]
      const target = index + dir
      if (target < 0 || target >= moments.length) return draft
      ;[moments[index], moments[target]] = [moments[target], moments[index]]
      return { ...draft, moments }
    })
  }

  const removeMoment = (id: string) => {
    if (!window.confirm('Remove this moment?')) return
    update((draft) => ({ ...draft, moments: draft.moments.filter((m) => m.id !== id) }))
  }

  const addMoment = () => {
    const used = exp.moments.flatMap((m) => (m.unlock.type === 'key' ? [m.unlock.key] : []))
    const moment = newMoment(exp.occasion, used)
    update((draft) => ({ ...draft, moments: [...draft.moments, moment] }))
    setExpandedId(moment.id)
  }

  return (
    <div style={config.theme as CSSProperties} className="min-h-dvh bg-cream text-ink">
      <div className="mx-auto w-full max-w-md">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-cream/90 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Back to home"
            className="rounded-full p-2.5 text-ink/45 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-ink/50">
            {config.emoji} {config.name.toUpperCase()}
          </p>
          <button
            type="button"
            onClick={() => void openPreview()}
            disabled={previewLoading}
            className="flex items-center gap-1.5 rounded-full bg-ink/5 px-4 py-2 text-[11.5px] font-semibold tracking-[0.12em] text-ink/70 transition-colors hover:bg-ink/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <Eye size={14} aria-hidden="true" />
            {previewLoading ? '...' : 'PREVIEW'}
          </button>
        </header>

        <main className="px-5 pt-4 pb-32">
          <p className="text-[13px] leading-relaxed text-ink/55">
            Everything below is a starting point — rewrite whatever you like. The grey text
            in empty boxes is just guidance; it disappears the moment you type.
          </p>

          {/* Basics */}
          <Section title="WHO IS THIS FOR?">
            <Field label="Their name">
              <input
                type="text"
                value={exp.toName}
                onChange={(e) => update((d) => ({ ...d, toName: e.target.value }))}
                placeholder="e.g. Maya"
                className={inputCls}
              />
            </Field>
            <Field label="Title of the experience" onHelp={() => setPromptFor({ kind: 'title' })}>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => update((d) => ({ ...d, title: e.target.value }))}
                className={inputCls}
              />
            </Field>
          </Section>

          {/* Intro */}
          <Section
            title="THE OPENING"
            hint="Shown line by line before the journey begins. One line per row."
            onHelp={() => setPromptFor({ kind: 'opening' })}
          >
            <textarea
              value={exp.introLines.join('\n')}
              onChange={(e) =>
                update((d) => ({ ...d, introLines: e.target.value.split('\n') }))
              }
              rows={Math.max(4, exp.introLines.length)}
              className={`${inputCls} resize-y leading-relaxed`}
            />
          </Section>

          {/* Moments */}
          <Section
            title={`THE ${config.momentLabel}S`}
            hint="Tap one to edit it. Reorder or remove freely."
          >
            <div className="space-y-3">
              {exp.moments.map((m, i) => (
                <MomentEditor
                  key={m.id}
                  moment={m}
                  index={i}
                  count={exp.moments.length}
                  occasion={exp.occasion}
                  label={config.momentLabel}
                  expanded={expandedId === m.id}
                  onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  onChange={(fn) => updateMoment(m.id, fn)}
                  onMove={(dir) => moveMoment(i, dir)}
                  onRemove={() => removeMoment(m.id)}
                  usedKeys={exp.moments.flatMap((x) =>
                    x.id !== m.id && x.unlock.type === 'key' ? [x.unlock.key] : [],
                  )}
                  onPrompt={setPromptFor}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addMoment}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/25 py-3.5 text-[12px] font-semibold tracking-[0.14em] text-ink/55 transition-colors hover:border-gold hover:text-burgundy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <Plus size={15} aria-hidden="true" />
              ADD A {config.momentLabel}
            </button>
          </Section>

          {/* Ending */}
          <Section
            title="THE ENDING"
            hint="What they see when everything is done."
            onHelp={() => setPromptFor({ kind: 'ending' })}
          >
            <Field label="Headline">
              <input
                type="text"
                value={exp.ending.headline}
                onChange={(e) =>
                  update((d) => ({ ...d, ending: { ...d.ending, headline: e.target.value } }))
                }
                className={inputCls}
              />
            </Field>
            <Field label="Closing lines (one per row)">
              <textarea
                value={exp.ending.lines.join('\n')}
                onChange={(e) =>
                  update((d) => ({
                    ...d,
                    ending: { ...d.ending, lines: e.target.value.split('\n') },
                  }))
                }
                rows={3}
                className={`${inputCls} resize-y leading-relaxed`}
              />
            </Field>
          </Section>
        </main>

        {/* Share bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-md bg-gradient-to-t from-cream via-cream/95 to-transparent px-5 pt-6 pb-5">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-4 text-[13px] font-semibold tracking-[0.18em] text-cream shadow-lg transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <Share2 size={15} aria-hidden="true" />
            SHARE IT
          </button>
        </div>

        {shareOpen && <ShareSheet exp={exp} onClose={() => setShareOpen(false)} />}
        {promptFor && (
          <PromptSheet exp={exp} req={promptFor} onClose={() => setPromptFor(null)} />
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-none'

function HelpButton({ onHelp }: { onHelp: () => void }) {
  return (
    <button
      type="button"
      onClick={onHelp}
      aria-label="Get an AI writing prompt for this"
      title="Get an AI writing prompt"
      className="flex shrink-0 items-center gap-1 rounded-full border border-gold/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-burgundy transition-colors hover:bg-gold/15 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
    >
      <Sparkles size={11} aria-hidden="true" />
      AI HELP
    </button>
  )
}

function Section({
  title,
  hint,
  onHelp,
  children,
}: {
  title: string
  hint?: string
  onHelp?: () => void
  children: ReactNode
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[11px] font-semibold tracking-[0.24em] text-burgundy">{title}</h2>
        {onHelp && <HelpButton onHelp={onHelp} />}
      </div>
      {hint && <p className="mt-1 text-[12.5px] text-ink/45">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  onHelp,
  children,
}: {
  label: string
  onHelp?: () => void
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-medium text-ink/60">{label}</span>
        {onHelp && <HelpButton onHelp={onHelp} />}
      </span>
      {children}
    </label>
  )
}

/* ------------------------------ moment editor ----------------------------- */

const nextHourLocal = (): string => {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function MomentEditor({
  moment,
  index,
  count,
  occasion,
  label,
  expanded,
  onToggle,
  onChange,
  onMove,
  onRemove,
  usedKeys,
  onPrompt,
}: {
  moment: Moment
  index: number
  count: number
  occasion: Occasion
  label: string
  expanded: boolean
  onToggle: () => void
  onChange: (fn: (m: Moment) => Moment) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
  usedKeys: string[]
  onPrompt: (req: PromptKind) => void
}) {
  const number = String(index + 1).padStart(2, '0')

  const unlockSummary =
    moment.unlock.type === 'key'
      ? `🔑 you reveal · ${moment.unlock.key}`
      : moment.unlock.type === 'clue'
        ? '🧩 they solve a clue'
        : '⏰ opens by itself'

  const setUnlockType = (type: UnlockRule['type']) => {
    onChange((m) => {
      if (m.unlock.type === type) return m
      const unlock: UnlockRule =
        type === 'key'
          ? { type: 'key', key: pickKey(occasion, usedKeys) }
          : type === 'clue'
            ? { type: 'clue', clue: '', answer: '' }
            : { type: 'time', at: nextHourLocal() }
      return { ...m, unlock }
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-5 py-4 text-left focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        <span className="text-[11px] font-semibold tracking-[0.18em] text-rose">{number}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-serif text-[16px] italic text-ink/85">
            {moment.teaser || 'Untitled moment'}
          </span>
          <span className="block truncate text-[11.5px] text-ink/45">{unlockSummary}</span>
        </span>
        <span className="text-[11px] text-ink/35">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-ink/10 px-5 pt-4 pb-5">
          <Field
            label={`Teaser — what they see while ${label.toLowerCase()} is locked`}
            onHelp={() => onPrompt({ kind: 'teaser', moment })}
          >
            <input
              type="text"
              value={moment.teaser}
              onChange={(e) => onChange((m) => ({ ...m, teaser: e.target.value }))}
              placeholder={moment.hints?.teaser ?? 'a mysterious one-liner — no spoilers'}
              className={inputCls}
            />
          </Field>

          <Field
            label="The reveal — your message when it opens"
            onHelp={() => onPrompt({ kind: 'reveal', moment })}
          >
            <textarea
              value={moment.reveal.message}
              onChange={(e) =>
                onChange((m) => ({ ...m, reveal: { ...m.reveal, message: e.target.value } }))
              }
              rows={3}
              placeholder={moment.hints?.message ?? 'what do you want to say when this opens?'}
              className={`${inputCls} resize-y leading-relaxed`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3">
            <Field label="What / where is it? (optional)">
              <input
                type="text"
                value={moment.reveal.name ?? ''}
                onChange={(e) =>
                  onChange((m) => ({
                    ...m,
                    reveal: { ...m.reveal, name: e.target.value || undefined },
                  }))
                }
                placeholder={moment.hints?.name ?? 'a place, a gift, an activity...'}
                className={inputCls}
              />
            </Field>
            <Field label="Location (optional — adds a map button)">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={moment.reveal.location ?? ''}
                  onChange={(e) =>
                    onChange((m) => ({
                      ...m,
                      reveal: { ...m.reveal, location: e.target.value || undefined },
                    }))
                  }
                  placeholder={moment.hints?.location ?? 'place name, or paste a Maps link'}
                  className={`${inputCls} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const q = (moment.reveal.location ?? '').trim()
                    const url =
                      q && !/^https?:\/\//i.test(q)
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
                        : q || 'https://www.google.com/maps'
                    window.open(url, '_blank', 'noopener')
                  }}
                  aria-label="Find on Google Maps"
                  title="Find on Google Maps"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-burgundy/40 px-3.5 text-[11px] font-semibold tracking-[0.08em] text-burgundy transition-colors hover:bg-burgundy/5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                >
                  <MapPin size={14} aria-hidden="true" />
                  MAPS
                </button>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink/40">
                Type the place and tap MAPS — Google Maps opens already searching for it.
                Then Share → Copy link, paste it back here, and their map button will open
                that exact pin.
              </p>
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-[12.5px] font-medium text-ink/60">
              How does it open?
            </span>
            <div className="flex gap-2">
              {(
                [
                  ['key', '🔑 I reveal it'],
                  ['clue', '🧩 They solve'],
                  ['time', '⏰ On its own'],
                ] as const
              ).map(([type, labelText]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUnlockType(type)}
                  className={`flex-1 rounded-full border px-2 py-2.5 text-[11.5px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                    moment.unlock.type === type
                      ? 'border-burgundy bg-burgundy text-cream'
                      : 'border-ink/15 bg-white text-ink/60 hover:border-ink/30'
                  }`}
                >
                  {labelText}
                </button>
              ))}
            </div>

            {moment.unlock.type === 'key' && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-parchment/70 px-4 py-3">
                <KeyRound size={15} aria-hidden="true" className="shrink-0 text-burgundy" />
                <input
                  type="text"
                  value={moment.unlock.key}
                  onChange={(e) =>
                    onChange((m) => ({ ...m, unlock: { type: 'key', key: e.target.value } }))
                  }
                  aria-label="Unlock key"
                  className="min-w-0 flex-1 bg-transparent font-serif text-[15px] tracking-[0.2em] text-ink uppercase focus:outline-none"
                />
                <span className="shrink-0 text-[10.5px] text-ink/40">only you know this</span>
              </div>
            )}

            {moment.unlock.type === 'clue' && (
              <div className="mt-3 space-y-3">
                <Field
                  label="The clue or question they see"
                  onHelp={() => onPrompt({ kind: 'clue', moment })}
                >
                  <textarea
                    value={moment.unlock.clue}
                    onChange={(e) =>
                      onChange((m) => ({
                        ...m,
                        unlock: { ...(m.unlock as { type: 'clue'; clue: string; answer: string }), clue: e.target.value },
                      }))
                    }
                    rows={2}
                    placeholder={
                      moment.hints?.clue ?? 'a riddle, or a question only they can answer...'
                    }
                    className={`${inputCls} resize-y leading-relaxed`}
                  />
                </Field>
                <Field label="The answer (not case-sensitive)">
                  <input
                    type="text"
                    value={moment.unlock.answer}
                    onChange={(e) =>
                      onChange((m) => ({
                        ...m,
                        unlock: { ...(m.unlock as { type: 'clue'; clue: string; answer: string }), answer: e.target.value },
                      }))
                    }
                    placeholder={moment.hints?.answer ?? 'the exact word or phrase'}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            {moment.unlock.type === 'time' && (
              <div className="mt-3">
                <Field label="Opens automatically at">
                  <input
                    type="datetime-local"
                    value={moment.unlock.at}
                    onChange={(e) =>
                      onChange((m) => ({ ...m, unlock: { type: 'time', at: e.target.value } }))
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-ink/10 pt-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onMove(-1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded-full p-2 text-ink/45 transition-colors hover:text-ink disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                disabled={index === count - 1}
                aria-label="Move down"
                className="rounded-full p-2 text-ink/45 transition-colors hover:text-ink disabled:opacity-25 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-medium text-rose transition-colors hover:bg-rose/10 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <Trash2 size={14} aria-hidden="true" />
              REMOVE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- share sheet ------------------------------ */

function ShareSheet({ exp, onClose }: { exp: Experience; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    void seal(exp).then((sealed) => {
      if (!cancelled) setUrl(shareUrl(sealed))
    })
    return () => {
      cancelled = true
    }
  }, [exp])

  const sheet = cheatSheet(exp)
  const unfinished = exp.moments.filter(
    (m) =>
      !m.teaser.trim() ||
      !m.reveal.message.trim() ||
      m.teaser.includes('[') ||
      m.reveal.message.includes('[') ||
      (m.unlock.type === 'clue' &&
        (!m.unlock.clue.trim() ||
          !m.unlock.answer.trim() ||
          m.unlock.clue.includes('[') ||
          m.unlock.answer.includes('['))),
  ).length

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — the field is selectable
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm animate-fade-in motion-reduce:animate-none sm:items-center sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this experience"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream px-6 pt-6 pb-8 shadow-2xl animate-fade-up motion-reduce:animate-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl text-ink">Share it</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 rounded-full p-2 text-ink/45 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {unfinished > 0 && (
          <p className="mt-3 rounded-xl bg-gold/15 px-4 py-3 text-[13px] leading-relaxed text-ink/75">
            Heads up: {unfinished} moment{unfinished > 1 ? 's are' : ' is'} not finished yet —
            an empty teaser, message, or clue will show up blank for them.
          </p>
        )}

        <p className="mt-4 text-[13.5px] leading-relaxed text-ink/60">
          This one link <em>is</em> the experience — everything is sealed inside it. Send it
          however you like. Their surprises stay locked until the right key, answer, or time.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5">
          <input
            type="text"
            readOnly
            value={url ?? 'sealing your experience...'}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Share link"
            className="min-w-0 flex-1 truncate bg-transparent text-[12.5px] text-ink/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!url}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-burgundy px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-cream transition-transform active:scale-95 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-[12.5px] font-medium text-burgundy underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Open a test run in a new tab ↗
          </a>
        )}

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-burgundy">
            <KeyRound size={13} aria-hidden="true" />
            YOUR KEYS — SCREENSHOT THIS
          </h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-ink/12">
            {sheet.map((row, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${
                  i % 2 === 0 ? 'bg-white' : 'bg-parchment/50'
                }`}
              >
                <span className="text-[12px] text-ink/55">{row.label}</span>
                <span className="font-serif text-[14px] tracking-[0.12em] text-ink">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink/45">
            Keys open moments you reveal yourself. Answers are what they must type. Keep this
            list away from curious eyes. 😌
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- prompt sheet ------------------------------ */

function PromptSheet({
  exp,
  req,
  onClose,
}: {
  exp: Experience
  req: PromptKind
  onClose: () => void
}) {
  const prompt = useMemo(() => buildPrompt(exp, req), [exp, req])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — text below is selectable
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm animate-fade-in motion-reduce:animate-none sm:items-center sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI writing prompt"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream px-6 pt-6 pb-8 shadow-2xl animate-fade-up motion-reduce:animate-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold/20 text-burgundy">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <h2 className="font-serif text-2xl text-ink">Writing help</h2>
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

        <p className="mt-3 text-[13.5px] leading-relaxed text-ink/60">
          Copy this prompt into any AI you like — ChatGPT, Claude, Gemini... It already
          knows your occasion, who it&rsquo;s for, and what you&rsquo;ve written so far.
          Paste your favorite answer back into the field.
        </p>

        <div className="mt-4 max-h-[38dvh] overflow-y-auto rounded-xl border border-ink/12 bg-white px-4 py-3.5">
          <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink/75 select-all">
            {prompt}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void copy()}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-[13px] font-semibold tracking-[0.18em] text-cream shadow-sm transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? 'COPIED — GO PASTE IT' : 'COPY PROMPT'}
        </button>

        <p className="mt-3 text-center text-[11.5px] text-ink/40">
          Nothing is sent anywhere — you stay in control of which AI sees it.
        </p>
      </div>
    </div>
  )
}
