'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Button from '@/components/ui/Button'
import Link from 'next/link'

/* ── 3D Wireframe Sphere + Neural field ── */
function Scene3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    /* — Sphere vertices — */
    const RINGS = 12, SEGS = 18, R = Math.min(window.innerWidth, window.innerHeight) * 0.22
    function spherePt(phi: number, theta: number) {
      return {
        x: R * Math.sin(phi) * Math.cos(theta),
        y: R * Math.cos(phi),
        z: R * Math.sin(phi) * Math.sin(theta),
      }
    }
    const verts: { x: number; y: number; z: number }[] = []
    for (let i = 0; i <= RINGS; i++)
      for (let j = 0; j < SEGS; j++)
        verts.push(spherePt((Math.PI * i) / RINGS, (2 * Math.PI * j) / SEGS))

    /* — Neural particles — */
    const N = 55
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }))

    let t = 0, raf: number
    const CX = () => canvas.width * 0.72
    const CY = () => canvas.height * 0.5

    const draw = () => {
      t += 0.004
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      /* rotation driven by mouse + time */
      const rx = (mouse.current.y - 0.5) * 0.8 + t * 0.3
      const ry = (mouse.current.x - 0.5) * 1.2 + t * 0.5

      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      const cosY = Math.cos(ry), sinY = Math.sin(ry)

      const project = (v: { x: number; y: number; z: number }) => {
        /* rotate X */
        const y1 = v.y * cosX - v.z * sinX
        const z1 = v.y * sinX + v.z * cosX
        /* rotate Y */
        const x2 = v.x * cosY + z1 * sinY
        const z2 = -v.x * sinY + z1 * cosY
        const fov = 900
        const scale = fov / (fov + z2)
        return { sx: CX() + x2 * scale, sy: CY() + y1 * scale, z: z2 }
      }

      /* draw sphere wireframe */
      for (let i = 0; i <= RINGS; i++) {
        ctx.beginPath()
        for (let j = 0; j < SEGS; j++) {
          const p = project(verts[i * SEGS + j])
          j === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy)
        }
        ctx.closePath()
        const depth = (i / RINGS - 0.5) * 2
        ctx.strokeStyle = `rgba(78,205,196,${0.06 + Math.abs(depth) * 0.08})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
      for (let j = 0; j < SEGS; j++) {
        ctx.beginPath()
        for (let i = 0; i <= RINGS; i++) {
          const p = project(verts[i * SEGS + j])
          i === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy)
        }
        const depth = (j / SEGS - 0.5) * 2
        ctx.strokeStyle = `rgba(78,205,196,${0.04 + Math.abs(depth) * 0.06})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      /* front-facing dot highlight */
      verts.forEach((v) => {
        const p = project(v)
        if (p.z > R * 0.5) {
          const alpha = ((p.z - R * 0.5) / (R * 0.5)) * 0.7
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,107,107,${alpha})`
          ctx.fill()
        }
      })

      /* neural field (left side) */
      const mx = mouse.current.x * canvas.width
      const my = mouse.current.y * canvas.height
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(78,205,196,${(1 - d / 110) * 0.12})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
        const dx = pts[i].x - mx, dy = pts[i].y - my
        const dm = Math.sqrt(dx * dx + dy * dy)
        if (dm < 160) {
          ctx.beginPath()
          ctx.moveTo(pts[i].x, pts[i].y)
          ctx.lineTo(mx, my)
          ctx.strokeStyle = `rgba(255,107,107,${(1 - dm / 160) * 0.25})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(78,205,196,0.4)'
        ctx.fill()
      }

      /* cursor ring */
      ctx.beginPath()
      ctx.arc(mx, my, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,107,107,0.6)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(mx, my, 18, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,107,107,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

/* ── Parallax text block ── */
function ParallaxText() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  const tx = useTransform(sx, [-1, 1], [-12, 12])
  const ty = useTransform(sy, [-1, 1], [-8, 8])

  const onMove = (e: React.MouseEvent) => {
    mx.set((e.clientX / window.innerWidth - 0.5) * 2)
    my.set((e.clientY / window.innerHeight - 0.5) * 2)
  }

  return (
    <motion.div
      onMouseMove={onMove}
      style={{ x: tx, y: ty, position: 'relative', zIndex: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '36px',
        }}
      >
        <div style={{ width: '32px', height: '1px', background: 'var(--color-teal)' }} />
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'var(--color-teal)',
          fontWeight: 500,
        }}>
          Plataforma de cursos · Rafaela, Argentina
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(48px, 7.5vw, 92px)',
          letterSpacing: '-4px',
          fontStyle: 'italic',
          lineHeight: 0.95,
          marginBottom: '32px',
          color: 'var(--color-text)',
        }}
      >
        Aprendé lo<br />
        <span style={{
          background: 'linear-gradient(90deg, var(--color-teal), var(--color-coral))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          que yo uso
        </span><br />
        con clientes<br />reales, hoy
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.28 }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          lineHeight: 1.8,
          color: 'rgba(247,247,242,0.5)',
          maxWidth: '380px',
          marginBottom: '48px',
        }}
      >
        Cursos de IA y marketing digital para profesionales que quieren resultados, no teoría.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.42 }}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
      >
        <Button href="/cursos" variant="primary">Ver cursos</Button>
        <Button href="/login" variant="ghost">Acceder</Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ marginTop: '64px', display: 'flex', alignItems: 'center', gap: '24px' }}
      >
        {[['IA', 'Práctica'], ['Marketing', 'Digital'], ['Resultados', 'Reales']].map(([a, b]) => (
          <div key={a} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>{a}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.3)', letterSpacing: '1px' }}>{b}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-deep)',
      position: 'relative',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
      alignItems: 'center',
    }}>
      <Scene3D />

      {/* Gradient overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 60% at 20% 50%, rgba(10,10,20,0.6), transparent)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', background: 'linear-gradient(to left, rgba(10,10,20,0.3), transparent)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Left col — text */}
      <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(80px, 10vw, 120px) clamp(24px, 4vw, 48px) 80px clamp(24px, 6vw, 80px)' }}>
        <ParallaxText />
      </div>

      {/* Right col — 3D sphere lives in canvas, just course badge here */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/cursos/ia-para-community-managers" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                padding: '28px 32px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                maxWidth: '320px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '48px',
                height: '3px',
                background: 'linear-gradient(90deg, var(--color-teal), var(--color-coral))',
                borderRadius: '2px',
                marginBottom: '20px',
              }} />
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--color-teal)',
                marginBottom: '10px',
              }}>
                Disponible ahora
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-text)',
                lineHeight: 1.3,
                marginBottom: '16px',
              }}>
                IA para Community Managers que quieren trabajar distinto
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)' }}>
                  $25.000 ARS
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--color-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  Ver curso <span style={{ fontSize: '14px' }}>→</span>
                </span>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '80px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 2,
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, rgba(78,205,196,0.6), transparent)' }}
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(247,247,242,0.25)' }}>
          scroll
        </span>
      </motion.div>
    </section>
  )
}
