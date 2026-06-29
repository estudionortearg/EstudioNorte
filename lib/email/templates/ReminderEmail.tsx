import {
  Html, Head, Body, Container, Section, Text, Button, Hr
} from '@react-email/components'

interface ReminderEmailProps {
  studentName: string
  courseTitle: string
  courseSlug: string
  progressPercent: number
  nextLessonTitle: string
  nextLessonId: string
  siteUrl: string
}

export default function ReminderEmail({
  studentName, courseTitle, courseSlug, progressPercent, nextLessonTitle, nextLessonId, siteUrl
}: ReminderEmailProps) {
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

          <Section style={{ marginBottom: '32px' }}>
            <Text style={{ color: '#F7F7F2', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }}>
              Te esperamos donde lo dejaste, {studentName}.
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.7)', fontSize: '15px', lineHeight: '1.75', margin: '0 0 16px' }}>
              Completaste el <strong style={{ color: '#4ECDC4' }}>{progressPercent}%</strong> de <strong style={{ color: '#F7F7F2' }}>{courseTitle}</strong>.
            </Text>
            <Text style={{ color: 'rgba(247,247,242,0.7)', fontSize: '15px', lineHeight: '1.75', margin: 0 }}>
              Próxima clase: <strong style={{ color: '#F7F7F2' }}>{nextLessonTitle}</strong>
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Button
              href={`${siteUrl}/aprender/${courseSlug}/${nextLessonId}`}
              style={{
                backgroundColor: '#FF6B6B', color: '#ffffff',
                fontSize: '15px', fontWeight: 600, padding: '14px 32px',
                borderRadius: '8px', textDecoration: 'none', display: 'inline-block',
              }}
            >
              Continuar →
            </Button>
          </Section>

          <Hr style={{ borderColor: 'rgba(78,205,196,0.12)', margin: '32px 0' }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(247,247,242,0.2)', fontSize: '11px', margin: 0 }}>
              Estudio Norte · estudionorte.ar
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
