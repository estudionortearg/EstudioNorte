# Estudio Norte V2 — Diseño Completo
**Fecha:** 2026-07-30  
**Estado:** Aprobado

---

## Sección 1 — Sistema Visual

### Paleta de colores
```
Verde EN:      #3D7A5F  (acento primario)
Coral EN:      #E8735A  (acento secundario)
Fondo:         gradiente suave verde → coral (exterior de la app)
Superficie:    #FFFFFF con backdrop-filter blur (glassmorphism suave)
Superficie 2:  rgba(255,255,255,0.7) (cards secundarias)
Border:        rgba(0,0,0,0.06)
Texto:         #0F0F0F
Texto suave:   #8A8A8A
```

### Estética 2025-2026
- Glassmorphism suave — cards con blur y transparencia
- Bordes muy sutiles, casi imperceptibles
- Sombras grandes y difusas (box-shadow tipo Figma/Linear)
- Íconos de trazo fino (Lucide)
- Animaciones de spring — fluidas, no rígidas
- Números de progreso muy grandes y bold
- Imágenes con gradient overlay en esquinas

### Layout
- Sidebar 64px solo íconos + tooltip al hover
- Cards con padding generoso, mucho espacio en blanco
- 3 columnas en desktop: info lateral / contenido principal / panel contextual
- Bottom nav en mobile (como app nativa)

---

## Sección 2 — Arquitectura de Páginas

### Rutas públicas
```
/                    Landing rediseñada
/cursos              Catálogo con filtros
/cursos/[slug]       Página de venta + waitlist
/precios             Planes de suscripción
/sobre-juano         Bio + agenda mentoría 1a1
/verificar/[id]      Verificación pública de certificados
```

### Rutas privadas (alumno)
```
/dashboard           Home + onboarding 1ra vez + racha + XP
/aprender/[slug]/[id] Player + quiz + peer review + notas + tutor IA
/comunidad/[slug]    Foro + ranking + anuncios
/en-vivo             Clases en vivo + cohorts + grabaciones
/recompensas         Catálogo XP → cursos/beneficios gratis
/perfil              Badges + mapa habilidades + pagos + referidos
/certificados/[slug] Cert + LinkedIn + QR + descarga PDF
```

### Rutas admin
```
/admin               Métricas generales
/admin/cursos        Gestión cursos + quizzes IA
/admin/alumnos       Alumnos + progreso + notas + afiliados
/admin/ventas        Ingresos + suscripciones + precios USD
/admin/comunidad     Moderación foro + aprobación mentores
/admin/cohorts       Clases en vivo + camadas
/admin/empresa       Panel B2B
```

### Sin ruta propia (viven dentro de otras páginas)
```
Notas privadas        → dentro del player
Quiz IA               → dentro del player
Peer review           → dentro del player al terminar módulo
Ranking               → dentro de /comunidad/[slug]
Racha + XP + Badges   → dentro de /dashboard y /perfil
Mapa de habilidades   → dentro de /perfil
Waitlist              → dentro de /cursos/[slug]
Resumen diario IA     → dentro del player al terminar módulo
Bot de moderación     → corre en backend, sin ruta visible
Onboarding            → modal en primer login en /dashboard
```

---

## Sección 3 — Sistema de Contenido y Aprendizaje

### Estructura de datos de una lección
```
lesson {
  title
  description
  pdf_url          → Supabase Storage
  video_url        → null ahora, YouTube/Bunny fase 2
  has_quiz         → true/false
  has_activity     → true/false (peer review, activado por curso)
  order_index
}
```

### Flujo dentro del player
```
1. Alumno abre lección
   → PDF renderizado inline (scroll completo)
   → Botón descargar PDF
   → Botón flotante "✦ Tutor" (abre chat cuando necesita)

2. Al terminar PDF
   → "Marcar como completada"
   → Si has_quiz → quiz 2-4 preguntas generadas por IA
     → Aprueba → suma XP → siguiente lección
     → No aprueba → reintenta (sin límite)

3. Al terminar módulo completo
   → Si has_activity → entrega actividad práctica
     → Entrega trabajo (texto + imagen)
     → Revisa 2 trabajos de compañeros con rúbrica
     → O espera 48hs → avanza automáticamente
   → Resumen IA del módulo (3 puntos clave)
   → Botón compartir resultado en redes

4. Siguiente módulo desbloqueado automáticamente
```

### Tutor IA (botón flotante)
- Conoce el contenido del PDF de esa lección específica
- Responde solo preguntas relacionadas al contenido
- Genera quizzes bajo demanda ("poneme a prueba")
- Explica conceptos de otra manera si el alumno no entendió

---

## Sección 4 — Gamificación y Motivación

### Sistema XP
```
Completar lección:          +10 XP
Aprobar quiz primera vez:   +25 XP
Completar módulo:           +50 XP
Completar curso:            +200 XP
Post en comunidad:          +15 XP
Responder a otro alumno:    +15 XP
Ser votado útil:            +20 XP
Revisar peer review:        +20 XP
Referir un alumno activo:   +100 XP
Racha 7 días:               +50 XP bonus
Racha 30 días:              +200 XP bonus
```

### Badges automáticos
```
🎯 Primera lección       Al completar lección 1
🔥 Racha 7 días          7 días consecutivos
💎 Racha 30 días         30 días consecutivos
⚡ Quiz perfecto         5 quizzes aprobados al primer intento
🏆 Curso completado      100% de cualquier curso
📚 Constante             Estudiar 4 semanas seguidas
🤝 Mentor                Revisar 10 peer reviews
📢 Referidor             Primer referido activo
💬 Voz de la comunidad   50 respuestas votadas como útiles
🌟 Histórico Top 1       Llegar #1 en ranking histórico de un curso
```

### Recompensas por umbrales XP
```
500 XP   → Guía gratuita a elección
1000 XP  → Descuento 20% en cualquier curso
2500 XP  → Acceso 1 mes gratis plan Norte
5000 XP  → Sesión mentoría 1a1 con Juan (30min)
10000 XP → Acceso 3 meses gratis plan Norte Pro
```

### Racha diaria
- Escudo de racha disponible desde día 7
- Se gana un escudo nuevo cada 7 días de racha
- Máximo 2 escudos acumulados
- Notificación a las 20hs si no estudió ese día
- Racha se rompe a medianoche sin al menos 1 lección completada

### Ranking
- Semanal: top 10 XP de esa semana → resetea lunes
- Histórico: top 10 XP acumulado de todo el curso
- Ambos visibles en /comunidad/[slug]
- Badge solo para ranking histórico (más mérito)

---

## Sección 5 — Comunidad y Social

### Foro por curso `/comunidad/[slug]`

**Tipos de post:**
```
📌 Anuncio     → solo Juan, siempre arriba, badge "Del instructor"
❓ Pregunta    → otros pueden marcar respuesta como correcta
💬 Compartir   → resultados, recursos, tips, logros
```

**Estructura de post:**
```
- Título
- Texto (bold, listas, links)
- Imagen opcional (Supabase Storage)
- Tipo (Pregunta o Compartir)
- Votos útiles
- Respuestas planas con @menciones (sin anidado)
```

### Bot de moderación IA
```
Al publicar → Claude API analiza:
✓ ¿Es relevante al curso?
✓ ¿Tiene contenido inapropiado?
✓ ¿Es spam o publicidad?

→ Pasa    → se publica instantáneo
→ Duda    → va a cola de moderación (Juan revisa en /admin/comunidad)
→ Rechaza → no se publica, mensaje al alumno explicando por qué
```

### Sistema de mentores del curso
```
- Alumnos con +500 XP en ese curso pueden postular
- Juan aprueba desde /admin/comunidad
- Badge visible "Mentor" en todos sus posts
- Suman +30 XP por respuesta (en vez de +15)
- Con 50+ respuestas votadas útiles → invitación automática a grabar módulo
```

### Clases en vivo `/en-vivo`
```
- Juan agenda desde /admin/cohorts (título, descripción, fecha, link Meet/Zoom)
- Alumnos ven calendario en /en-vivo
- Recordatorio email 24hs antes + 1hs antes
- Botón "Unirse" abre videollamada en nueva pestaña
- Chat de texto en vivo dentro de la plataforma durante la sesión
- Después: Juan sube grabación → aparece en /en-vivo como "Grabación"
```

---

## Sección 6 — Modelo de Negocio

### Planes de suscripción

**FREE — $0**
```
→ Comunidad en modo lectura (ve posts, no escribe)
→ 1 lección de muestra por curso
→ Sin tutor IA
→ Sin certificados
```

**NORTE — U$D 7/mes**
```
→ Todas las guías PDF
→ Comunidad completa (escribe, vota, responde)
→ Tutor IA
→ Clases en vivo
→ XP + Badges + Racha + Recompensas
→ Descuento anual: 2 meses gratis
```

**NORTE PRO — U$D 15/mes**
```
→ Todo Norte
→ Peer review
→ Certificados verificables + LinkedIn badge
→ 20% descuento en cursos premium
→ Prioridad en mentoría con Juan
→ Descuento anual: 2 meses gratis
```

### Cursos premium (pago único)
```
→ Video completo grabado
→ Certificado verificable
→ Acceso de por vida
→ Precio: U$D 49-149 según curso
→ Suscriptores Norte Pro: 20% descuento automático
```

### Mentoría 1a1 con Juan
```
→ Sesión 30 minutos
→ Calendly embed en /sobre-juano
→ Precio: U$D 30-50 por sesión
→ Disponible también con 5000 XP
→ Prioridad para suscriptores Norte Pro
```

### Precios en ARS
```
→ Precio base en USD definido en /admin/suscripciones
→ Conversión automática al tipo de cambio del día
→ Actualización cada 24hs via API tipo de cambio
→ Pago ARS via Mercado Pago
→ Pago USD via Stripe
```

### Referidos
```
→ Link único: estudionorte.ar/r/[código]
→ Referido: 20% descuento primer mes
→ Referidor: +100 XP + crédito inmediato 20% primera cuota
→ Referido activo 3 meses: +1 mes gratis al referidor
→ Dashboard en /perfil: referidos activos, créditos, estado
```

### Afiliados
```
→ Alumnos con 5+ referidos activos → postulación automática
→ Juan aprueba desde /admin/alumnos
→ Comisión 15% mensual mientras el referido siga suscripto
→ Panel de métricas en /perfil
```

### B2B — Plan Empresa
```
Pack 5 usuarios:  U$D 25/mes (U$D 5/usuario)
Pack 10 usuarios: U$D 40/mes (U$D 4/usuario)
Pack 20 usuarios: U$D 60/mes (U$D 3/usuario)
+20 usuarios:     plan custom vía contacto directo

Incluye:
→ Dashboard de progreso del equipo
→ Asignación de cursos por empleado
→ Exportación CSV/PDF de reportes
→ Factura empresarial automática mensual
```

---

## Sección 7 — Certificaciones

### Flujo para obtener el certificado
```
SIEMPRE requerido:
→ 100% lecciones completadas
→ Todos los quizzes aprobados

OPCIONAL por curso (Juan activa desde admin):
→ Peer review completado
   (fallback 48hs si no hay compañeros disponibles)

Al cumplir: certificado generado automáticamente
```

### Componentes del certificado
```
- Nombre completo del alumno (desde /perfil)
- Nombre del curso
- Fecha de emisión
- Código legible: EN-CM-2026-X7K2-M9P4
- UUID interno en base de datos (para verificación)
- Firma digital de Juan Gallino
- QR apuntando a /verificar/[UUID]
- Logo e identidad visual Estudio Norte V2
```

### Verificación pública
```
/verificar/[UUID]
→ Página pública, sin login requerido
→ Muestra: nombre, curso, fecha, estado (válido/inválido)
→ Verificable en 1 click por cualquier empleador
→ Imposible de falsificar
```

### Microcredenciales por módulo
```
→ Badge digital al completar cada módulo
→ Visible en /perfil
→ URL de verificación propia por badge
→ Acumula aunque no se termine el curso completo
```

### Integración LinkedIn
```
→ Botón "Agregar a LinkedIn" en /certificados/[slug]
→ Pre-completa: nombre, organización, fecha, URL credencial
→ El alumno solo hace click en "Guardar" en LinkedIn
```

### PDF descargable
```
→ Diseño con identidad visual EN V2 (verde + coral + blanco)
→ QR integrado apuntando a /verificar/[UUID]
→ Código legible visible en el diseño
→ Generado client-side con jsPDF
```

---

## Sección 8 — Crecimiento y Diferenciadores

### PWA
```
→ Instalable como app nativa (sin App Store)
→ Carga rápida con service worker
→ Notificaciones push:
   - Racha en riesgo (20hs si no estudió)
   - Nueva clase en vivo programada
   - Respuesta en tu post
   - Nuevo contenido disponible
→ SIN modo offline (fase 3)
```

### Tutor IA + Ruta personalizada
```
Onboarding (modal en primer login):
→ 3 preguntas: nivel actual, objetivo, tiempo disponible
→ IA genera ruta personalizada de módulos recomendados
→ Visible en /dashboard como "Tu ruta"
→ Se actualiza automáticamente según progreso real

Tutor IA en player:
→ Conoce el PDF de esa lección
→ Responde solo preguntas del contenido
→ Genera quizzes bajo demanda
→ Explica conceptos de otra manera si es necesario
```

### Mapa de habilidades en /perfil
```
→ Grid de skills por área temática
→ 3 estados:
   🔒 Bloqueada    → módulo no completado
   ⚡ En progreso  → módulo iniciado
   ✅ Desbloqueada → módulo completado
→ Click en skill desbloqueada muestra lecciones que la componen
→ Sin librerías externas, CSS puro

Skills por área:
CM  → Contenido, Estrategia, Analytics, Comunidades
IA  → Prompts, Automatización, Herramientas, Workflows
Ads → Meta Ads, Google Ads, Copy, Métricas
```

### Contenido generado por alumnos
```
→ Post destacado de la semana = más votos útiles (automático)
→ Aparece en /dashboard de alumnos del mismo curso
→ Badge "Mentor" + invitación a grabar módulo
   cuando alumno tiene 50+ respuestas votadas útiles
→ Aparece como co-instructor en el curso
```

### B2B, Mentoría y Afiliados
→ Detallados en Sección 6.

---

## Base de datos — tablas nuevas requeridas

```sql
-- Suscripciones
subscriptions (id, user_id, plan, status, current_period_end, price_usd)

-- XP y gamificación
user_xp (id, user_id, total_xp, updated_at)
xp_transactions (id, user_id, amount, reason, created_at)
user_badges (id, user_id, badge_slug, earned_at)
user_streaks (id, user_id, current_streak, longest_streak, last_study_date, shields)

-- Comunidad
forum_posts (id, course_id, user_id, type, title, body, image_url, votes, created_at, pinned)
forum_replies (id, post_id, user_id, body, votes, created_at)
forum_votes (id, user_id, post_id, reply_id, created_at)
course_mentors (id, user_id, course_id, approved_at)

-- Clases en vivo
live_sessions (id, course_id, title, description, scheduled_at, meet_url, recording_url)
live_chat (id, session_id, user_id, message, created_at)

-- Certificados
certificates (id, user_id, course_id, uuid, readable_code, issued_at, verified)
module_badges (id, user_id, module_id, issued_at)

-- Referidos y afiliados
referrals (id, referrer_id, referred_id, status, created_at)
affiliate_commissions (id, affiliate_id, referral_id, amount, paid_at)

-- Peer review
activities (id, lesson_id, user_id, content, image_url, submitted_at)
activity_reviews (id, activity_id, reviewer_id, score, feedback, created_at)

-- Quizzes
quizzes (id, lesson_id, questions_json, generated_at)
quiz_attempts (id, user_id, quiz_id, score, passed, created_at)

-- B2B
companies (id, name, contact_email, plan, user_limit, created_at)
company_members (id, company_id, user_id, role, added_at)

-- Exchange rate cache
exchange_rates (id, usd_ars, updated_at)
```

---

## Fases de implementación sugeridas

### Fase 1 — Rediseño visual + base
- Nueva identidad visual (colores, tipografía, glassmorphism)
- Landing rediseñada
- Dashboard rediseñado
- Player con PDF inline
- Página de precios con 3 planes

### Fase 2 — Gamificación + Comunidad
- Sistema XP + Badges + Racha
- Foro por curso con bot de moderación IA
- Quiz IA entre lecciones
- Tutor IA en player

### Fase 3 — Negocio + Crecimiento
- Suscripciones con Stripe/MP
- Conversión USD → ARS automática
- Referidos + Afiliados
- Certificados verificables + LinkedIn
- PWA + Notificaciones push

### Fase 4 — Avanzado
- Clases en vivo + Cohorts
- Peer review
- Panel B2B
- Ruta personalizada IA
- Mapa de habilidades
- Modo offline PWA
