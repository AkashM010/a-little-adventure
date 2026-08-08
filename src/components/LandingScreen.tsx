import { KeyRound } from 'lucide-react'
import { ADVENTURE_DATE } from '../data/checkpoints'

export function LandingScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-7 py-14 text-center">
      <p
        className="animate-fade-up text-[11px] font-medium tracking-[0.28em] text-gold motion-reduce:animate-none"
        style={{ animationDelay: '0.1s' }}
      >
        {ADVENTURE_DATE.toUpperCase()}
      </p>

      <h1
        className="animate-fade-up mt-7 font-serif text-[2.35rem] leading-[1.15] text-cream motion-reduce:animate-none"
        style={{ animationDelay: '0.25s' }}
      >
        Tomorrow isn&rsquo;t
        <br />
        just a day out.
      </h1>

      <p
        className="animate-fade-up mt-5 font-serif text-lg italic text-gold-soft motion-reduce:animate-none"
        style={{ animationDelay: '0.45s' }}
      >
        I&rsquo;ve planned a little adventure for us.
      </p>

      <div
        className="animate-fade-up mt-9 space-y-2 text-[15px] leading-relaxed text-cream/75 motion-reduce:animate-none"
        style={{ animationDelay: '0.65s' }}
      >
        <p>There are 5 checkpoints waiting for you.</p>
        <p>Your only job is to come with me.</p>
      </div>

      <p
        className="animate-fade-up mt-8 flex items-center gap-2 text-sm text-rose motion-reduce:animate-none"
        style={{ animationDelay: '0.85s' }}
      >
        <KeyRound size={15} aria-hidden="true" />
        I&rsquo;ll have the keys.
      </p>

      <button
        type="button"
        onClick={onBegin}
        className="animate-fade-up mt-12 min-h-13 rounded-full bg-burgundy px-9 py-4 text-[13px] font-semibold tracking-[0.18em] text-cream shadow-lg shadow-black/30 transition-transform duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
        style={{ animationDelay: '1.05s' }}
      >
        BEGIN THE ADVENTURE
      </button>
    </div>
  )
}
