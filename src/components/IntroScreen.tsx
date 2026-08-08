const LINES = [
  'Tomorrow isn’t just a day out.',
  'It’s a little adventure I’ve planned for us.',
  'There are 5 checkpoints waiting for you.',
  'You’ll know when we’ve reached each one...',
  'but you won’t know what’s waiting there.',
  'I’ll have the keys.',
  'You just have to come with me. ❤️',
]

export function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-8 py-14 text-center">
      <div className="space-y-4">
        {LINES.map((line, i) => (
          <p
            key={line}
            className={`animate-fade-up motion-reduce:animate-none ${
              i === 5 || i === 6
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
        onClick={onContinue}
        className="animate-fade-up mt-14 min-h-13 rounded-full border border-gold/60 px-10 py-4 text-[13px] font-semibold tracking-[0.2em] text-gold transition-colors duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none motion-reduce:animate-none"
        style={{ animationDelay: `${0.2 + LINES.length * 0.35 + 0.3}s` }}
      >
        LET&rsquo;S GO
      </button>
    </div>
  )
}
