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
  verificationCode?: string
  issuedAt?: string
}

export default function CertificadoClient({
  courseTitle, courseSlug, displayName, isComplete,
  completedCount, totalLessons, verificationCode, issuedAt,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const verifyUrl = verificationCode
    ? `https://estudionorte.ar/verificar/${verificationCode}`
    : ''

  const issuedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const linkedInUrl = (() => {
    if (!issuedAt || !verificationCode) return '#'
    const d = new Date(issuedAt)
    const p = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: courseTitle,
      organizationName: 'Estudio Norte',
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: verifyUrl,
      certId: verificationCode,
    })
    return `https://www.linkedin.com/profile/add?${p}`
  })()

  const copyLink = async () => {
    await navigator.clipboard.writeText(verifyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297, H = 210

      // Background #FAFAF8
      doc.setFillColor(250, 250, 248)
      doc.rect(0, 0, W, H, 'F')

      // Borde #3D7A5F
      doc.setDrawColor(61, 122, 95)
      doc.setLineWidth(0.8)
      doc.rect(12, 12, W - 24, H - 24)

      // Línea superior coral #E8735A
      doc.setFillColor(232, 115, 90)
      doc.rect(12, 12, W - 24, 2.5, 'F')

      // "ESTUDIO NORTE"
      doc.setTextColor(61, 122, 95)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('ESTUDIO NORTE', W / 2, 30, { align: 'center' })

      // Título
      doc.setTextColor(15, 15, 15)
      doc.setFontSize(26)
      doc.text('Certificado de Finalización', W / 2, 50, { align: 'center' })

      // Separador coral
      doc.setDrawColor(232, 115, 90)
      doc.setLineWidth(0.8)
      doc.line(W / 2 - 40, 56, W / 2 + 40, 56)

      // "Se certifica que"
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Se certifica que', W / 2, 70, { align: 'center' })

      // Nombre
      doc.setTextColor(15, 15, 15)
      doc.setFontSize(32)
      doc.setFont('helvetica', 'bold')
      doc.text(displayName, W / 2, 88, { align: 'center' })

      // "completó..."
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('completó satisfactoriamente el curso', W / 2, 102, { align: 'center' })

      // Título del curso coral
      doc.setTextColor(232, 115, 90)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(courseTitle, W / 2, 118, { align: 'center' })

      // Fecha
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(issuedDate, W / 2, 132, { align: 'center' })

      // Firma
      doc.setDrawColor(138, 138, 138)
      doc.setLineWidth(0.4)
      doc.line(W / 2 - 35, 163, W / 2 + 35, 163)
      doc.setTextColor(138, 138, 138)
      doc.setFontSize(9)
      doc.text('Juan Gallino', W / 2, 169, { align: 'center' })
      doc.text('Director - Estudio Norte', W / 2, 175, { align: 'center' })

      // URL de verificación
      doc.setTextColor(61, 122, 95)
      doc.setFontSize(7)
      doc.text(
        `Verificar en: estudionorte.ar/verificar/${verificationCode}`,
        W / 2, H - 16, { align: 'center' }
      )

      doc.save(`certificado-${courseSlug}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  // Vista incompleta
  if (!isComplete) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--en-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          maxWidth: '480px', width: '100%', textAlign: 'center',
          padding: '48px 40px', borderRadius: '24px',
          background: 'var(--en-surface)', border: '1px solid var(--en-border)',
          boxShadow: 'var(--en-shadow)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900,
            color: 'var(--en-text)', marginBottom: '12px',
          }}>
            Todavía no terminaste el curso
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--en-text-soft)', marginBottom: '28px', lineHeight: 1.6,
          }}>
            {completedCount} de {totalLessons} clases ({pct}%).
            Terminá el curso para obtener tu certificado.
          </p>
          <div style={{
            height: '6px', borderRadius: '100px',
            background: 'var(--en-track-bg)', marginBottom: '28px',
          }}>
            <div style={{
              height: '100%', borderRadius: '100px',
              width: pct + '%', background: 'var(--en-green)',
            }} />
          </div>
          <Link
            href={'/aprender/' + courseSlug}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px', textDecoration: 'none',
              background: 'var(--en-coral)', color: 'var(--en-white)',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
            }}
          >
            Continuar curso →
          </Link>
        </div>
      </div>
    )
  }

  // Vista completa
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--en-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Certificado visual */}
      <div style={{
        width: '100%', maxWidth: '760px',
        background: 'var(--en-surface)', borderRadius: '20px',
        border: '1px solid var(--en-border)', boxShadow: 'var(--en-shadow-lg)',
        borderTop: '3px solid var(--en-coral)',
        padding: 'clamp(40px, 6vw, 72px) clamp(32px, 6vw, 64px)',
        textAlign: 'center', marginBottom: '32px',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '3px',
          color: 'var(--en-green)', marginBottom: '20px',
          textTransform: 'uppercase', fontWeight: 700,
        }}>
          ESTUDIO NORTE
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 900,
          letterSpacing: '-1px', color: 'var(--en-text)', marginBottom: '8px',
        }}>
          Certificado de Finalización
        </h1>
        <div style={{
          width: '60px', height: '2px',
          background: 'var(--en-coral)', margin: '0 auto 28px',
        }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '8px' }}>
          Se certifica que
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900,
          letterSpacing: '-1.5px', color: 'var(--en-text)',
          marginBottom: '16px', lineHeight: 1.1,
        }}>
          {displayName}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--en-text-soft)', marginBottom: '12px' }}>
          completó satisfactoriamente el curso
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 700,
          letterSpacing: '-0.5px', color: 'var(--en-coral)', marginBottom: '32px',
        }}>
          {courseTitle}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)', marginBottom: '40px' }}>
          {issuedDate}
        </p>
        <div style={{ display: 'inline-block' }}>
          <div style={{ width: '140px', height: '1px', background: 'var(--en-border-mid)', margin: '0 auto 8px' }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--en-text-soft)' }}>Juan Gallino</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--en-text-faint)' }}>Director - Estudio Norte</p>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 28px', borderRadius: '12px', cursor: 'pointer',
            background: 'var(--en-green)', color: 'var(--en-white)',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700,
            border: 'none', opacity: downloading ? 0.7 : 1,
            boxShadow: 'var(--en-shadow-green-sm)',
          }}
        >
          {downloading ? 'Generando PDF...' : '↓ Descargar PDF'}
        </button>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '12px', textDecoration: 'none',
            background: '#0A66C2', color: 'var(--en-white)',
            fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
          }}
        >
          Agregar a LinkedIn
        </a>
        <button
          onClick={copyLink}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '12px', cursor: 'pointer',
            background: 'var(--en-surface)', border: '1.5px solid var(--en-border-mid)',
            color: 'var(--en-text)', fontFamily: 'var(--font-body)',
            fontSize: '14px', fontWeight: 500,
          }}
        >
          {copied ? '✓ ¡Copiado!' : '🔗 Copiar link verificable'}
        </button>
      </div>
    </div>
  )
}
