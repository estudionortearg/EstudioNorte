import {
  Html, Head, Body, Container, Section, Text, Button, Hr
} from '@react-email/components'

interface WelcomeEmailProps {
  studentName: string
  courseTitle: string
  courseSlug: string
  siteUrl: string
}

export default function WelcomeEmail({ studentName, courseTitle, courseSlug, siteUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0A14', fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{ color: '#4ECDC4', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              ESTUDIO NORTE
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.3)', fontSize: '9px', letterSpacing: '2px', margin: 0 }}>
              Más allá de lo que creías posible
            </Text>
          </Section>

          {/* Star divider */}
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{ color: '#FF6B6B', fontSize: '20px', margin: 0 }}>★</Text>
          </Section>

          {/* Main content */}
          <Section style={{ marginBottom: '32px' }}>
            <Text style={{ color: '#F7F7F2', fontSize: '24px', fontWeight: 700, margin: '0 0 16px', lineHeight: '1.3' }}>
              Hola {studentName},
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.7)', fontSize: '16px', lineHeight: '1.75', margin: '0 0 8px' }}>
              bienvenido/a a Estudio Norte.
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.7)', fontSize: '16px', lineHeight: '1.75', margin: '0 0 24px' }}>
              Tu acceso al curso <strong style={{ color: '#F7F7F2' }}>{courseTitle}</strong> está activado. Podés empezar cuando quieras.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Button
              href={`${siteUrl}/aprender/${courseSlug}`}
              style={{
                backgroundColor: '#FF6B6B',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Empezar ahora →
            </Button>
          </Section>

          <Hr style={{ borderColor: 'rgba(78,205,196,0.12)', margin: '32px 0' }} />

          {/* Footer */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(247,247,242,0.3)', fontSize: '12px', margin: '0 0 4px' }}>
              Juan Gallino · Estudio Norte
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.2)', fontSize: '11px', margin: 0 }}>
              Estudio Norte es una iniciativa de JuanoConecta · Rafaela, Santa Fe, Argentina
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
