// Keywords that trigger moderation (spam, promo, competitor courses)
const SPAM_PATTERNS = [
  // Promo/ventas
  /\b(compra|comprá|compralo|descuento|oferta|promo|precio especial|link en bio|dm para|escribime|whatsapp|contactame)\b/i,
  // URLs sospechosas
  /https?:\/\/(?!estudionorte\.ar|supabase\.co)/i,
  // Publicitar otros cursos
  /\b(mi curso|mis cursos|te enseño|sumate a mi|mi academia|mi programa|mi mentoria|mi mentoría|mi masterclass|mi taller)\b/i,
  // Plataformas competidoras comunes
  /\b(udemy|hotmart|teachable|kajabi|domestika|platzi|crehana|coderhouse)\b/i,
  // Lenguaje agresivo básico
  /\b(idiota|imbécil|imbecil|estúpido|estupido|pelotudo|boludo|hdp|hijo de puta)\b/i,
]

export function moderateContent(text: string): { flagged: boolean; reason: string } {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { flagged: true, reason: `Contenido detectado: ${pattern.source.slice(0, 60)}` }
    }
  }
  return { flagged: false, reason: '' }
}

export async function sendWelcome(
  admin: { from: (t: string) => any },
  postId: string,
  _userId: string
) {
  const welcomeMessages = [
    '¡Bienvenido/a a la comunidad de Estudio Norte! 🌱 Nos alegra que hayas dado el primer paso para conectar con otros emprendedores. Si tenés alguna duda, el equipo y la comunidad estamos acá para ayudarte.',
    '¡Primer post en la comunidad! 🎉 Que bueno tenerte acá. Recordá que esta es una comunidad de aprendizaje mutuo — cualquier pregunta o trabajo para compartir es bienvenido.',
    '¡Bienvenido/a! 🤝 Este es tu espacio para aprender, preguntar y compartir junto a otros emprendedores que están en el mismo camino. ¡Adelante!',
  ]
  const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]

  await admin.from('community_replies').insert({
    post_id: postId,
    user_id: null,
    body: msg,
    is_bot: true,
  })

  await admin.from('moderation_logs').insert({
    post_id: postId,
    reason: 'Mensaje de bienvenida automático',
    action: 'welcomed',
  })
}
