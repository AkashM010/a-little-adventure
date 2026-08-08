import { useEffect, useRef, useState, type FormEvent } from 'react'
import { KeyRound, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  /** Returns true if the code unlocked a checkpoint. */
  onUnlock: (code: string) => Promise<boolean>
}

export function UnlockModal({ open, onClose, onUnlock }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setCode('')
      setError(null)
      setBusy(false)
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!code.trim()) {
      setError('Enter the key first.')
      return
    }
    setBusy(true)
    try {
      const ok = await onUnlock(code)
      if (!ok) {
        setError('That key doesn’t seem to work. 😌')
        setBusy(false)
      }
      // success: parent closes the modal
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
        aria-label="Enter the key"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-cream px-6 py-7 shadow-2xl animate-pop motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
              <KeyRound size={17} aria-hidden="true" />
            </span>
            <h2 className="font-serif text-xl text-ink">Enter the key</h2>
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
