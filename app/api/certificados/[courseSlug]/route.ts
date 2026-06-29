import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', courseSlug)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  // Check 100% completion
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', course.id)

  const moduleIds = (modules || []).map(m => m.id)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['none'])

  const lessonIds = (lessons || []).map(l => l.id)

  const { count: completedCount } = await supabase
    .from('progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['none'])

  const totalCount = lessonIds.length

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const studentName = profile?.full_name || user.email?.split('@')[0] || 'Estudiante'

  const completionDate = new Date().toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Generate PDF — A4 landscape for certificate feel
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const W = 297 // A4 landscape width mm
  const H = 210 // A4 landscape height mm

  // Background — white (certificates should be printable)
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, W, H, 'F')

  // Dark border frame
  doc.setDrawColor(10, 10, 20) // #0A0A14 approx
  doc.setLineWidth(1)
  doc.rect(8, 8, W - 16, H - 16)

  // Teal accent lines top and bottom
  doc.setDrawColor(78, 205, 196) // #4ECDC4
  doc.setLineWidth(2)
  doc.line(16, 16, W - 16, 16) // top
  doc.line(16, H - 16, W - 16, H - 16) // bottom

  // Coral dot (Polaris) top center
  doc.setFillColor(255, 107, 107) // #FF6B6B
  doc.circle(W / 2, 16, 3, 'F')

  // Header label
  doc.setTextColor(78, 205, 196)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('ESTUDIO NORTE', W / 2, 32, { align: 'center' })

  // "Certifica que" text
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(13)
  doc.text('Certifica que', W / 2, 60, { align: 'center' })

  // Student name — large, bold
  doc.setTextColor(10, 10, 20)
  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.text(studentName, W / 2, 82, { align: 'center' })

  // Divider line under name
  doc.setDrawColor(78, 205, 196)
  doc.setLineWidth(0.5)
  const nameWidth = Math.min(doc.getTextWidth(studentName) + 40, W - 80)
  doc.line((W - nameWidth) / 2, 88, (W + nameWidth) / 2, 88)

  // "Completó exitosamente el curso"
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('completó exitosamente el curso', W / 2, 102, { align: 'center' })

  // Course title
  doc.setTextColor(10, 10, 20)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(course.title, W - 80)
  doc.text(titleLines, W / 2, 118, { align: 'center' })

  // Date
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`${completionDate}`, W / 2, 148, { align: 'center' })

  // Signature line
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)
  doc.line(W / 2 - 40, 172, W / 2 + 40, 172)

  doc.setTextColor(10, 10, 20)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Juan Gallino', W / 2, 178, { align: 'center' })

  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Estudio Norte · estudionorte.ar', W / 2, 185, { align: 'center' })

  // Footer
  doc.setTextColor(180, 180, 180)
  doc.setFontSize(7)
  doc.text('Más allá de lo que creías posible', W / 2, H - 20, { align: 'center' })

  const pdfBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${courseSlug}.pdf"`,
    },
  })
}
