'use client'

import { useEffect, useRef } from 'react'
import { motion, type Variants } from 'framer-motion'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.15 + 0.15,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }))

    let rafId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.x += s.dx
        s.y += s.dy
        if (s.x < 0) s.x = canvas.width
        if (s.x > canvas.width) s.x = 0
        if (s.y < 0) s.y = canvas.height
        if (s.y > canvas.height) s.y = 0
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(78,205,196,${s.opacity})`
        ctx.fill()
      }
      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

function IsotipoWatermark() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        opacity: 0.04,
        background: 'var(--color-teal)',
        clipPath: 'polygon(50% 0%, 20% 50%, 50% 70%, 80% 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '900px',
      }}
    >
      <motion.div variants={item}>
        <Logo size="lg" />
      </motion.div>

      <motion.h1
        variants={item}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(40px, 7vw, 72px)',
          letterSpacing: '-2px',
          fontStyle: 'italic',
          color: 'var(--color-text)',
          marginTop: '32px',
          marginBottom: '24px',
          lineHeight: 1.1,
        }}
      >
        Aprendé lo que yo uso<br />con clientes reales, hoy
      </motion.h1>

      <motion.p
        variants={item}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          lineHeight: 1.75,
          color: 'rgba(247,247,242,0.7)',
          maxWidth: '560px',
          margin: '0 auto 40px',
        }}
      >
        Cursos de IA y marketing digital para profesionales que quieren resultados, no teoría.
      </motion.p>

      <motion.div
        variants={item}
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button href="/cursos" variant="primary">Ver cursos</Button>
        <Button href="/login" variant="ghost">Ya soy alumno</Button>
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-deep)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StarField />
      <IsotipoWatermark />
      <HeroContent />
    </section>
  )
}
