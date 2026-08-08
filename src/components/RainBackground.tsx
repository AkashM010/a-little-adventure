import { useEffect, useRef } from 'react'

interface Drop {
  x: number
  y: number
  len: number
  speed: number
  alpha: number
}

/** Very subtle animated monsoon drizzle behind everything. */
export function RainBackground({ tone }: { tone: 'dark' | 'light' }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let drops: Drop[] = []
    const color = tone === 'dark' ? '176, 198, 224' : '78, 100, 128'

    const spawn = (w: number, h: number): Drop => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 12,
      speed: 1.6 + Math.random() * 2.6,
      alpha: 0.04 + Math.random() * 0.08,
    })

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.min(70, Math.floor(window.innerWidth / 14))
      drops = Array.from({ length: count }, () => spawn(canvas.width, canvas.height))
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 1
      for (const d of drops) {
        ctx.strokeStyle = `rgba(${color}, ${d.alpha})`
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x + 1.5, d.y + d.len)
        ctx.stroke()
        d.y += d.speed
        d.x += 0.25
        if (d.y > canvas.height + 20) {
          d.y = -20
          d.x = Math.random() * canvas.width
        }
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [tone])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
