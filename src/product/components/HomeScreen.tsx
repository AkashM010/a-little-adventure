import { useState } from 'react'
import { ArrowRight, Trash2 } from 'lucide-react'
import { RainBackground } from '../../components/RainBackground'
import { OCCASIONS } from '../occasions'
import { listDrafts, deleteDraft } from '../store'
import type { Experience } from '../types'

const navigate = (path: string) => {
  window.location.hash = path
}

export function HomeScreen() {
  const [drafts, setDrafts] = useState<Experience[]>(() => listDrafts())

  const removeDraft = (id: string) => {
    if (!window.confirm('Delete this experience? This can’t be undone.')) return
    deleteDraft(id)
    setDrafts(listDrafts())
  }

  return (
    <div className="min-h-dvh bg-ink text-cream">
      <RainBackground tone="dark" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-7 py-14">
        <p
          className="animate-fade-up text-[11px] font-medium tracking-[0.28em] text-gold motion-reduce:animate-none"
          style={{ animationDelay: '0.1s' }}
        >
          A LITTLE ADVENTURE
        </p>
        <h1
          className="animate-fade-up mt-6 font-serif text-[2.3rem] leading-[1.15] motion-reduce:animate-none"
          style={{ animationDelay: '0.25s' }}
        >
          Plan a surprise.
          <br />
          Watch them discover it.
        </h1>
        <p
          className="animate-fade-up mt-5 text-[15px] leading-relaxed text-cream/70 motion-reduce:animate-none"
          style={{ animationDelay: '0.45s' }}
        >
          Hidden moments, secret keys, and a journey they open one step at a time. You plan
          it. They live it.
        </p>

        <button
          type="button"
          onClick={() => navigate('/create')}
          className="animate-fade-up mt-9 flex min-h-13 items-center justify-center gap-2 rounded-full bg-burgundy px-9 py-4 text-[13px] font-semibold tracking-[0.18em] text-cream shadow-lg shadow-black/30 transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
          style={{ animationDelay: '0.65s' }}
        >
          CREATE YOURS
          <ArrowRight size={15} aria-hidden="true" />
        </button>

        <div
          className="animate-fade-up mt-12 motion-reduce:animate-none"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-center text-[11px] font-medium tracking-[0.24em] text-cream/40">
            OR FEEL ONE FIRST
          </p>
          <div className="mt-4 space-y-3">
            {Object.values(OCCASIONS).map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => navigate(`/demo/${occ.id}`)}
                className="flex w-full items-center gap-4 rounded-2xl border border-cream/12 bg-cream/[0.04] px-5 py-4 text-left transition-colors duration-200 hover:border-gold/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
              >
                <span className="text-2xl" aria-hidden="true">
                  {occ.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg text-cream">{occ.name}</span>
                  <span className="block truncate text-[13px] text-cream/55">
                    {occ.pickerLine}
                  </span>
                </span>
                <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-gold/70" />
              </button>
            ))}
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="mt-12">
            <p className="text-center text-[11px] font-medium tracking-[0.24em] text-cream/40">
              YOUR EXPERIENCES
            </p>
            <div className="mt-4 space-y-3">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-2xl border border-cream/12 bg-cream/[0.04] px-5 py-4"
                >
                  <span className="text-xl" aria-hidden="true">
                    {OCCASIONS[d.occasion].emoji}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/edit/${d.id}`)}
                    className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    <span className="block truncate font-serif text-[17px] text-cream">
                      {d.title}
                    </span>
                    <span className="block text-[12.5px] text-cream/55">
                      {d.toName ? `for ${d.toName} · ` : ''}
                      {d.moments.length} moments · tap to continue
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDraft(d.id)}
                    aria-label={`Delete ${d.title}`}
                    className="shrink-0 rounded-full p-2 text-cream/35 transition-colors hover:text-rose focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-auto pt-14 pb-2 text-center">
          <p className="text-[11px] leading-relaxed text-cream/30">
            This began as one real birthday adventure.{' '}
            <a
              href="#/aug9"
              className="underline underline-offset-2 hover:text-cream/60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              It still lives here.
            </a>
          </p>
          <p className="mt-1 text-[10px] tracking-[0.18em] text-cream/20">PROTOTYPE</p>
        </footer>
      </div>
    </div>
  )
}
