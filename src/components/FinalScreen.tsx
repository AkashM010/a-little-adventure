import { useMemo, type CSSProperties } from 'react'
import { Heart } from 'lucide-react'

interface Particle {
  left: string
  size: number
  delay: string
  duration: string
  opacity: number
  drift: string
  color: string
}

export function FinalScreen({ onRevisit }: { onRevisit: () => void }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        size: 3 + ((i * 7) % 5),
        delay: `${(i * 0.9) % 7}s`,
        duration: `${6 + ((i * 3) % 5)}s`,
        opacity: 0.2 + ((i * 13) % 30) / 100,
        drift: `${((i % 5) - 2) * 14}px`,
        color: i % 3 === 0 ? '#d4af71' : '#b05a6e',
      })),
    [],
  )

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8 py-14 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full animate-float-up motion-reduce:animate-none motion-reduce:opacity-0"
            style={
              {
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
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
        style={{ animationDelay: '0.2s' }}
      />

      <h1
        className="animate-fade-up mt-8 font-serif text-[2.1rem] leading-tight text-cream motion-reduce:animate-none"
        style={{ animationDelay: '0.3s' }}
      >
        Adventure Complete. ❤️
      </h1>

      <div
        className="animate-fade-up mt-8 space-y-1.5 text-[15.5px] leading-relaxed text-cream/80 motion-reduce:animate-none"
        style={{ animationDelay: '0.6s' }}
      >
        <p>Five checkpoints.</p>
        <p>One birthday.</p>
        <p>One very special person.</p>
        <p className="pt-2">Thank you for spending the day with me.</p>
      </div>

      <p
        className="animate-fade-up mt-9 font-serif text-xl italic text-gold-soft motion-reduce:animate-none"
        style={{ animationDelay: '1s' }}
      >
        Happy birthday to me. ❤️
      </p>

      <div
        className="animate-fade-up mt-10 space-y-1 text-[13.5px] text-cream/55 motion-reduce:animate-none"
        style={{ animationDelay: '1.4s' }}
      >
        <p>Now close the website.</p>
        <p>The rest of the day doesn&rsquo;t need instructions.</p>
      </div>

      <button
        type="button"
        onClick={onRevisit}
        className="animate-fade-up mt-12 text-[11.5px] tracking-[0.18em] text-cream/35 underline-offset-4 transition-colors hover:text-cream/60 hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
        style={{ animationDelay: '1.8s' }}
      >
        LOOK BACK AT THE DAY
      </button>
    </div>
  )
}
