'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  courseTitle: string
  courseSlug: string
  displayName: string
  isComplete: boolean
  completedCount: number
  totalLessons: number
  enrolledAt: string
}

export default function CertificadoClient({
  courseTitle, courseSlug, displayName, isComplete,
  completedCount, totalLessons,
}: Props) {
  const [downloading, setDownloading] = useState(false)

  const completionDate = new Date().toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297
      const H = 210
      doc.setFillColor(8, 8, 16)
      doc.rect(0, 0, W, H, 'F')
      doc.setDrawColor(78, 205, 196)
      doc.setLineWidth(0.5)
      doc.rect(10, 10, W - 20, H - 20)
      doc.setLineWidth(0.2)
      doc.rect(12, 12, W - 24, H - 24)
      const corners: [number, number][] = [[10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10]]
      corners.forEach(([x, y]) => { doc.setFillColor(78, 205, 196); doc.circle(x, y, 2, 'F') })
      doc.setFillColor(78, 205, 196)
      doc.rect(10, 10, W - 20, 1.2, 'F')
      doc.setTextColor(78, 205, 196)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTUDIO NORTE', W / 2, 28, { align: 'center' })
      doc.setTextColor(247, 247, 242)
      doc.setFontSize(26)
      doc.text('Certificado de Finalizacion', W / 2, 48, { align: 'center' })
      doc.setDrawColor(255, 107, 107)
      doc.setLineWidth(0.8)
      doc.line(W / 2 - 40, 54, W / 2 + 40, 54)
      doc.setTextColor(180, 180, 180)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Se certifica que', W / 2, 68, { align: 'center' })
      doc.setTextColor(247, 247, 242)
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.text(displayName, W / 2, 86, { align: 'center' })
      doc.setTextColor(180, 180, 180)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('completo satisfactoriamente el curso', W / 2, 100, { align: 'center' })
      doc.setTextColor(255, 107, 107)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(courseTitle, W / 2, 116, { align: 'center' })
      doc.setTextColor(140, 140, 140)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Fecha: ' + completionDate, W / 2, 130, { align: 'center' })
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.4)
      doc.line(W / 2 - 35, 163, W / 2 + 35, 163)
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(9)
      doc.text('Juan Gallino', W / 2, 169, { align: 'center' })
      doc.text('Director - Estudio Norte', W / 2, 174, { align: 'center' })
      doc.setTextColor(60, 60, 80)
      doc.setFontSize(7)
      doc.text('estudionorte.ar', W / 2, H - 16, { align: 'center' })
      doc.save('certificado-' + courseSlug + '.pdf')
    } catch (err) { console.error(err) } finally { setDownloading(false) }
  }

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  if (!isComplete) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '48px 40px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: 'var(--color-text)', marginBottom: '12px' }}>
            Todavia no terminaste el curso
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(247,247,242,0.4)', marginBottom: '28px', lineHeight: 1.6 }}>
            {completedCount} de {totalLessons} clases ({pct}%). Termina el curso para obtener tu certificado.
          </p>
          <div style={{ height: '6px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', marginBottom: '28px' }}>
            <div style={{ height: '100%', borderRadius: '100px', width: pct + '%', background: 'var(--color-coral)' }}/>
          </div>
          <Link href={'/aprender/' + courseSlug} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', background: 'var(--color-coral)', color: '#fff', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
            Continuar curso
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '760px', borderRadius: '20px', border: '1px solid rgba(78,205,196,0.2)', boxShadow: '0 0 80px rgba(78,205,196,0.08)', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ background: '#080810', padding: 'clamp(40px,6vw,72px) clamp(32px,6vw,64px)', textAlign: 'center', position: 'relative', border: '2px solid rgba(78,205,196,0.15)', margin: '12px', borderRadius: '12px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--color-teal)' }}/>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '3px', color: 'var(--color-teal)', marginBottom: '20px', textTransform: 'uppercase' }}>ESTUDIO NORTE</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, letterSpacing: '-1px', color: 'var(--color-text)', marginBottom: '8px' }}>Certificado de Finalizacion</h1>
          <div style={{ width: '60px', height: '2px', background: 'var(--color-coral)', margin: '0 auto 28px' }}/>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)', marginBottom: '8px' }}>Se certifica que</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,5vw,40px)', fontWeight: 900, letterSpacing: '-1.5px', color: 'var(--color-text)', marginBottom: '16px', lineHeight: 1.1 }}>{displayName}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(247,247,242,0.4)', marginBottom: '12px' }}>completo satisfactoriamente el curso</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-coral)', marginBottom: '32px' }}>{courseTitle}</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(247,247,242,0.25)', marginBottom: '40px' }}>{completionDate}</p>
          <div style={{ display: 'inline-block' }}>
            <div style={{ width: '140px', height: '1px', background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px' }}/>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(247,247,242,0.4)' }}>Juan Gallino</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(247,247,242,0.2)' }}>Director - Estudio Norte</p>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={downloadPDF} disabled={downloading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 28px', borderRadius: '12px', cursor: 'pointer', background: 'var(--color-teal)', color: '#0C0C18', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, border: 'none', opacity: downloading ? 0.7 : 1 }}>
          {downloading ? 'Generando PDF...' : 'Descargar certificado'}
        </button>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 24px', borderRadius: '12px', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(247,247,242,0.5)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
