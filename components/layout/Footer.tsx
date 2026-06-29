import { Logo } from '@/components/ui'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(78,205,196,0.08)', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Logo size="sm" />
        <p style={{ color: 'rgba(247,247,242,0.5)', fontSize: '13px', textAlign: 'center' }}>
          Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina
        </p>
        <p style={{ color: 'rgba(247,247,242,0.25)', fontSize: '12px' }}>
          © {new Date().getFullYear()} Estudio Norte. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
