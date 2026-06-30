'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const faqs = [
  {
    q: '¿Necesito experiencia previa con IA para hacer el curso?',
    a: 'No. El curso está diseñado para community managers que nunca usaron IA. Arrancamos desde cero y avanzamos a un ritmo práctico.',
  },
  {
    q: '¿Cuánto tiempo por semana necesito dedicarle?',
    a: 'Con 3 a 4 horas semanales es suficiente. Las lecciones son cortas y directas — sin relleno. Podés avanzar a tu ritmo.',
  },
  {
    q: '¿El acceso tiene fecha de vencimiento?',
    a: 'No. El acceso es de por vida. Cuando actualicemos el contenido, lo recibís automáticamente sin pagar de nuevo.',
  },
  {
    q: '¿Cómo funciona la garantía de 7 días?',
    a: 'Si en los primeros 7 días sentís que el curso no es para vos, nos escribís y te devolvemos el dinero. Sin preguntas, sin trámites.',
  },
  {
    q: '¿En qué moneda pago y qué métodos aceptan?',
    a: 'El precio está en pesos argentinos (ARS). Aceptamos Mercado Pago con todos sus medios: tarjeta de crédito, débito, transferencia.',
  },
  {
    q: '¿Recibo algún certificado al terminar?',
    a: 'Sí. Al completar todas las lecciones podés descargar tu certificado en PDF. Es verificable y lo podés compartir en LinkedIn o donde quieras.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section style={{
      backgroundColor: 'var(--color-bg-section)', padding: '130px 24px', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(78,205,196,0.12), transparent)' }} />

      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-teal)', marginBottom: '16px' }}>
            Preguntas frecuentes
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-2px',
            color: 'var(--color-text)', lineHeight: 1.05,
          }}>
            Todo lo que querés<br />saber antes de arrancar
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              viewport={{ once: true }}
              style={{
                borderRadius: i === 0 ? '12px 12px 0 0' : i === faqs.length - 1 ? '0 0 12px 12px' : '0',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                background: open === i ? 'rgba(78,205,196,0.04)' : 'rgba(255,255,255,0.02)',
                transition: 'background 0.3s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', padding: '24px 28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px',
                  color: open === i ? 'var(--color-text)' : 'rgba(247,247,242,0.7)',
                  lineHeight: 1.4, transition: 'color 0.3s',
                }}>
                  {q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ flexShrink: 0, color: open === i ? 'var(--color-teal)' : 'rgba(247,247,242,0.3)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 28px 24px',
                      fontFamily: 'var(--font-body)', fontSize: '14px',
                      color: 'rgba(247,247,242,0.5)', lineHeight: 1.8,
                    }}>
                      {a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
