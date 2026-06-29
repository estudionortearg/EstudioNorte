import {
  Html, Head, Body, Container, Section, Text, Button, Hr
} from '@react-email/components'

interface CertificateEmailProps {
  studentName: string
  courseTitle: string
  courseSlug: string
  siteUrl: string
}

export default function CertificateEmail({ studentName, courseTitle, courseSlug, siteUrl }: CertificateEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0A14', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{ color: '#4ECDC4', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 4px' }}>
              ESTUDIO NORTE
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ fontSize: '48px', margin: 0 }}>🏆</Text>
          </Section>

          <Section style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Text style={{ color: '#F7F7F2', fontSize: '26px', fontWeight: 700, margin: '0 0 16px', lineHeight: '1.3' }}>
              ¡Felicitaciones, {studentName}!
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.7)', fontSize: '15px', lineHeight: '1.75', margin: '0 0 8px' }}>
              Completaste el curso
            </Text>
            <Text style={{ color: '#F7F7F2', fontSize: '18px', fontWeight: 700, margin: '0 0 24px', lineHeight: '1.3' }}>
              {courseTitle}
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.6)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Tu certificado está listo para descargar. Compartilo en LinkedIn para que el mundo sepa de tu logro.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Button
              href={`${siteUrl}/certificados/${courseSlug}`}
              style={{
                backgroundColor: '#FF6B6B', color: '#ffffff',
                fontSize: '15px', fontWeight: 600, padding: '14px 32px',
                borderRadius: '8px', textDecoration: 'none', display: 'inline-block',
              }}
            >
              Descargar certificado
            </Button>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Text style={{ margin: 0 }}>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}/certificados/${courseSlug}`}
                style={{ color: '#4ECDC4', fontSize: '13px', textDecoration: 'none' }}
              >
                Compartir en LinkedIn →
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: 'rgba(78,205,196,0.12)', margin: '32px 0' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(247,247,242,0.2)', fontSize: '11px', margin: 0 }}>
              Estudio Norte · estudionorte.ar · Rafaela, Santa Fe, Argentina
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
