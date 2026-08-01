'use client'

import { Button } from '@/components/ui'

export default function SobreJuanoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--en-bg)' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--en-bg-blur)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--en-border)',
        padding: '0 clamp(16px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--en-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px' }}>EN</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--en-text)' }}>Estudio Norte</span>
          </a>
          <a href="/login" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--en-green)', textDecoration: 'none', padding: '7px 16px', borderRadius: '8px', border: '1.5px solid var(--en-green)' }}>
            Ingresar
          </a>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(48px, 8vw, 96px) clamp(16px, 5vw, 40px)' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '100px',
          background: 'var(--en-green-light)', marginBottom: '24px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--en-green)', display: 'inline-block' }}/>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-green)', fontWeight: 600 }}>El instructor</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-2px',
          fontStyle: 'italic', color: 'var(--en-text)',
          marginBottom: '32px', lineHeight: 1.1,
        }}>
          Juan Gallino
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '24px' }}>
          Soy diseñador de marcas con IA, basado en Rafaela, Santa Fe. Trabajo con emprendedores y profesionales que quieren construir una identidad visual que se destaque — usando herramientas de inteligencia artificial que multiplican lo que podés hacer solo.
        </p>
        <p style={{ fontSize: '18px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '24px' }}>
          Llevo años creando logos, identidades y sistemas de marca para clientes reales. Pero además uso IA todos los días para acelerar el proceso, experimentar más rápido y entregarle a cada cliente algo que realmente le representa.
        </p>
        <p style={{ fontSize: '18px', color: 'var(--en-text-soft)', lineHeight: 1.75, marginBottom: '48px' }}>
          Estudio Norte nació para compartir eso. No teoría de libro — el proceso exacto que uso con mis clientes, adaptado para que vos lo puedas aplicar desde cero.
        </p>

        {/* Stats strip */}
        <div style={{
          display: 'flex', gap: '0', marginBottom: '48px',
          background: 'var(--en-surface)', border: '1.5px solid var(--en-border)',
          borderRadius: '20px', overflow: 'hidden',
        }}>
          {[
            ['500+', 'Alumnos'],
            ['100%', 'Práctico'],
            ['IA', 'Integrada'],
          ].map(([val, lbl], i) => (
            <div key={lbl} style={{
              flex: 1, textAlign: 'center', padding: '24px 16px',
              borderRight: i < 2 ? '1px solid var(--en-border)' : 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: 'var(--en-green)', letterSpacing: '-1px', marginBottom: '4px' }}>{val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--en-text-soft)' }}>{lbl}</div>
            </div>
          ))}
        </div>

        <Button href="/cursos" variant="primary">Ver cursos disponibles</Button>

        <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--en-border)' }}>
          <p style={{ color: 'var(--en-text-faint)', fontSize: '13px' }}>
            Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina
          </p>
        </div>

      </div>
    </div>
  )
}
