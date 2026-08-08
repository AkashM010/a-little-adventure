import { CloudRain, X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

export function RainPlanModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-6 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Rain plan"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-cream px-6 py-7 text-center shadow-2xl animate-pop motion-reduce:animate-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="float-right -m-2 rounded-full p-2 text-ink/45 transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <CloudRain size={26} aria-hidden="true" className="mx-auto mt-2 text-rose" />
        <h2 className="mt-3 font-serif text-xl text-ink">If the rain gets serious</h2>
        <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed text-ink/75">
          <p>Don&rsquo;t worry.</p>
          <p>We don&rsquo;t cancel the adventure.</p>
          <p>We simply change the route.</p>
        </div>
        <p className="mt-5 font-serif text-sm italic text-rose">
          The plan bends. It doesn&rsquo;t break. 🌧️
        </p>
      </div>
    </div>
  )
}
