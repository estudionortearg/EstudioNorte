import { Resend } from 'resend'
import WelcomeEmail from './templates/WelcomeEmail'
import ReminderEmail from './templates/ReminderEmail'
import CertificateEmail from './templates/CertificateEmail'

const FROM = process.env.RESEND_FROM_EMAIL || 'hola@estudionorte.ar'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://estudionorte.ar'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

export async function sendWelcomeEmail({
  to,
  studentName,
  courseTitle,
  courseSlug,
}: {
  to: string
  studentName: string
  courseTitle: string
  courseSlug: string
}) {
  return getResend().emails.send({
    from: `Estudio Norte <${FROM}>`,
    to,
    subject: 'Ya sos parte de Estudio Norte 🌟',
    react: WelcomeEmail({ studentName, courseTitle, courseSlug, siteUrl: SITE_URL }),
  })
}

export async function sendReminderEmail({
  to,
  studentName,
  courseTitle,
  courseSlug,
  progressPercent,
  nextLessonTitle,
  nextLessonId,
}: {
  to: string
  studentName: string
  courseTitle: string
  courseSlug: string
  progressPercent: number
  nextLessonTitle: string
  nextLessonId: string
}) {
  return getResend().emails.send({
    from: `Estudio Norte <${FROM}>`,
    to,
    subject: 'Te esperamos donde lo dejaste',
    react: ReminderEmail({ studentName, courseTitle, courseSlug, progressPercent, nextLessonTitle, nextLessonId, siteUrl: SITE_URL }),
  })
}

export async function sendCertificateEmail({
  to,
  studentName,
  courseTitle,
  courseSlug,
}: {
  to: string
  studentName: string
  courseTitle: string
  courseSlug: string
}) {
  return getResend().emails.send({
    from: `Estudio Norte <${FROM}>`,
    to,
    subject: 'Tu certificado de Estudio Norte está listo',
    react: CertificateEmail({ studentName, courseTitle, courseSlug, siteUrl: SITE_URL }),
  })
}
