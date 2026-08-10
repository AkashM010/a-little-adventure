import { useEffect, useMemo, useState } from 'react'
import BirthdayApp from './BirthdayApp'
import { HomeScreen } from './product/components/HomeScreen'
import { CreateFlow } from './product/components/CreateFlow'
import { Player } from './product/components/Player'
import { DEMOS } from './product/demos'
import { seal, decodeShare, buildHints } from './product/share'
import type { Experience, SealedExperience } from './product/types'

/**
 * Tiny hash router — keeps GitHub Pages happy with zero dependencies.
 *   #/            → product home
 *   #/create      → pick an occasion, start a draft
 *   #/edit/<id>   → edit a saved draft
 *   #/demo/<occ>  → play a demo experience
 *   #/r/<data>    → recipient link (experience packed in the URL)
 *   #/aug9        → the original birthday adventure, untouched
 */

export const navigate = (path: string) => {
  window.location.hash = path
}

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const hash = useHash()
  const path = hash.replace(/^#\/?/, '')

  if (path === 'aug9') return <BirthdayApp />
  if (path === 'create') return <CreateFlow key="new" />
  if (path.startsWith('edit/')) {
    const id = path.slice('edit/'.length)
    return <CreateFlow key={id} draftId={id} />
  }
  if (path.startsWith('demo/')) {
    const occ = path.slice('demo/'.length)
    return <DemoRoute occasion={occ} />
  }
  if (path.startsWith('r/')) {
    return <ShareRoute encoded={path.slice('r/'.length)} />
  }
  return <HomeScreen />
}

/* ------------------------------ demo route ------------------------------ */

function DemoRoute({ occasion }: { occasion: string }) {
  const demo: Experience | undefined = DEMOS[occasion]
  const [sealed, setSealed] = useState<SealedExperience | null>(null)

  useEffect(() => {
    if (!demo) return
    let cancelled = false
    void seal(demo).then((s) => {
      if (!cancelled) setSealed(s)
    })
    return () => {
      cancelled = true
    }
  }, [demo])

  const hints = useMemo(() => (demo ? buildHints(demo) : {}), [demo])

  if (!demo) return <NotFound />
  if (!sealed) return <div className="min-h-dvh bg-ink" aria-hidden="true" />
  return <Player sealed={sealed} mode="demo" hints={hints} onExit={() => navigate('/')} />
}

/* ------------------------------ share route ----------------------------- */

function ShareRoute({ encoded }: { encoded: string }) {
  const sealed = useMemo(() => decodeShare(encoded), [encoded])
  if (!sealed) return <NotFound />
  return <Player sealed={sealed} mode="live" />
}

function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink px-8 text-center text-cream">
      <p className="font-serif text-2xl">This link doesn&rsquo;t open anything. 🤔</p>
      <p className="mt-3 text-[14px] text-cream/60">
        It may be incomplete — ask the person who sent it to share it again.
      </p>
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
