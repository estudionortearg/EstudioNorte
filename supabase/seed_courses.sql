-- ============================================================
-- SEED: Cursos de Estudio Norte
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── CURSO 1: IA para Community Managers ──────────────────────

INSERT INTO courses (slug, title, subtitle, description, what_you_learn, for_who, price_ars, price_usd, is_published, is_featured)
VALUES (
  'ia-para-community-managers',
  'IA para Community Managers que quieren trabajar distinto',
  'Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía — solo lo que uso con mis clientes reales.',
  'Un curso práctico de Juan Gallino para CMs que quieren multiplicar su producción, mantener su voz auténtica y empezar a cobrar lo que merecen. Cada módulo termina con algo que podés aplicar ese mismo día.',
  ARRAY[
    'Cómo generar un mes de contenido en una tarde usando IA',
    'Prompts específicos para cada red social',
    'Cómo mantener tu voz mientras usás inteligencia artificial',
    'Automatizaciones simples que liberan horas de trabajo',
    'Cómo presentarle IA a tus clientes sin que se asusten'
  ],
  ARRAY[
    'CMs freelance que quieren hacer más en menos tiempo',
    'Dueños de negocio que gestionan sus propias redes',
    'Agencias que quieren escalar sin contratar más personas'
  ],
  25000,
  25,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  what_you_learn = EXCLUDED.what_you_learn,
  for_who = EXCLUDED.for_who,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured;

-- Módulos del Curso 1
WITH course AS (SELECT id FROM courses WHERE slug = 'ia-para-community-managers')
INSERT INTO modules (course_id, title, order_index)
SELECT course.id, m.title, m.order_index
FROM course, (VALUES
  (1, 'Módulo 1 — Por qué la IA cambia todo para un CM'),
  (2, 'Módulo 2 — Generación de contenido con IA'),
  (3, 'Módulo 3 — Tu voz + IA'),
  (4, 'Módulo 4 — Automatizaciones sin código'),
  (5, 'Módulo 5 — Subir tus tarifas con IA como argumento')
) AS m(order_index, title)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 1 (Curso 1)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'ia-para-community-managers' AND modules.order_index = 1
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Qué hace la IA que vos no podés hacer solo', 'Entendemos qué es la IA generativa en términos prácticos. Qué puede hacer, qué no puede, y por qué es una ventaja enorme para los CMs que la adopten hoy.', 12, true),
  (2, 'Las 5 herramientas que uso todos los días', 'ChatGPT, Claude, Midjourney, Canva IA y Make. Para qué sirve cada una, cómo se complementan y cuál empezar primero.', 18, false),
  (3, 'Tu nuevo flujo de trabajo con IA', 'Rediseñamos tu día a día: dónde entra la IA, dónde seguís siendo vos. Un flujo simple que podés implementar esta semana.', 15, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 2 (Curso 1)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'ia-para-community-managers' AND modules.order_index = 2
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Prompt engineering para redes sociales', 'La técnica exacta que uso para escribir prompts que generan contenido listo para publicar. Con ejemplos reales para IG, TikTok y LinkedIn.', 20, false),
  (2, 'Un mes de contenido en una tarde', 'Paso a paso: cómo planifico 30 días de contenido para un cliente usando IA. Incluye la plantilla que uso yo.', 25, false),
  (3, 'Adaptar para IG, TikTok y LinkedIn sin esfuerzo', 'Un mismo contenido, tres formatos distintos. Cómo hacer que la IA lo adapte sola sin que pierda la esencia.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 3 (Curso 1)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'ia-para-community-managers' AND modules.order_index = 3
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Cómo entrenar la IA con tu estilo', 'Técnica de "voz de marca": le enseñás a ChatGPT cómo habla tu cliente. El resultado parece escrito por un humano.', 22, false),
  (2, 'Revisar y pulir sin perder autenticidad', 'Filtros para detectar y corregir el "tono robot". Qué cambiar, qué dejar, cómo acelerar la revisión.', 14, false),
  (3, 'Casos reales con clientes míos', 'Tres ejemplos con pantallas reales: cómo apliqué esto para una marca de ropa, un estudio contable y un emprendedor gastronómico.', 28, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 4 (Curso 1)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'ia-para-community-managers' AND modules.order_index = 4
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 20
FROM mod, (VALUES
  (1, 'Zapier y Make para CMs: primer flujo en 20 min', 'Conectamos ChatGPT con Google Sheets y WhatsApp sin escribir una línea de código. Tu primer automatización que ahorra tiempo real.', 24, false),
  (2, 'Reportes automáticos para clientes', 'Cómo generar reportes de métricas con IA y mandarlos automáticamente. Tus clientes van a quedar impresionados.', 18, false),
  (3, 'Flujos que te liberan 5+ horas semanales', 'Los 3 flujos más rentables que tengo armados: publicación, monitoreo y respuesta a comentarios. Cómo copiarlos para tu cuenta.', 22, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 5 (Curso 1)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'ia-para-community-managers' AND modules.order_index = 5
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 25
FROM mod, (VALUES
  (1, 'Cómo presentar IA a tus clientes sin que se asusten', 'El discurso que uso yo. Cómo explicar que usás IA sin que el cliente sienta que le estás dando menos trabajo.', 16, false),
  (2, 'Tu propuesta de valor diferencial con IA', 'Construimos juntos un argumento de venta que te separe del resto. Por qué el CM que usa IA vale más, no menos.', 20, false),
  (3, 'Cobrar más por hacer mejor trabajo', 'Cómo reposicionar tu servicio y subir tarifas usando IA como argumento. Con ejemplo de propuesta comercial real.', 24, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;


-- ── CURSO 2: Tu Marca con IA ──────────────────────────────────

INSERT INTO courses (slug, title, subtitle, description, what_you_learn, for_who, price_ars, price_usd, is_published, is_featured)
VALUES (
  'tu-marca-con-ia',
  'Tu Marca con IA — de idea a identidad visual completa',
  'Creá tu logo, definí tu paleta de colores, tipografía y sistema de marca usando IA. Sin experiencia previa en diseño.',
  'Juan Gallino te lleva de tener una idea vaga a tener una identidad visual completa y profesional. El proceso exacto que usa con sus clientes, adaptado para que cualquier emprendedor lo pueda aplicar desde cero usando herramientas de IA.',
  ARRAY[
    'Crear un logo profesional con IA en menos de 2 horas',
    'Definir paleta de colores y tipografías que comuniquen tu marca',
    'Armar un mini sistema de marca listo para usar en cualquier soporte',
    'Generar piezas para redes con coherencia visual usando Canva + IA',
    'Presentar tu marca a clientes de manera profesional'
  ],
  ARRAY[
    'Emprendedores que quieren una marca propia sin pagar una agencia',
    'Freelancers que necesitan una identidad visual para conseguir clientes',
    'Profesionales que quieren renovar su marca personal con IA'
  ],
  29000,
  29,
  true,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  what_you_learn = EXCLUDED.what_you_learn,
  for_who = EXCLUDED.for_who,
  price_ars = EXCLUDED.price_ars,
  price_usd = EXCLUDED.price_usd,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured;

-- Módulos del Curso 2
WITH course AS (SELECT id FROM courses WHERE slug = 'tu-marca-con-ia')
INSERT INTO modules (course_id, title, order_index)
SELECT course.id, m.title, m.order_index
FROM course, (VALUES
  (1, 'Módulo 1 — Qué es una marca y cómo la IA la crea'),
  (2, 'Módulo 2 — Tu logo con IA'),
  (3, 'Módulo 3 — Paleta, tipografía y estilo visual'),
  (4, 'Módulo 4 — Sistema de marca en Canva'),
  (5, 'Módulo 5 — Lanzar tu marca al mundo')
) AS m(order_index, title)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 1 (Curso 2)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'tu-marca-con-ia' AND modules.order_index = 1
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Qué es una marca (y qué no es un logo)', 'La diferencia entre marca e identidad visual. Por qué importa antes de crear cualquier elemento gráfico, y cómo la IA cambia el proceso.', 10, true),
  (2, 'Definir la personalidad de tu marca en 30 minutos', 'Usamos ChatGPT para hacer una entrevista de marca. Al final tenés: 3 palabras clave, tono de voz y arquetipo de marca.', 20, false),
  (3, 'El brief visual: qué decirle a la IA para que diseñe bien', 'Cómo convertir la personalidad de tu marca en instrucciones para herramientas de IA. La diferencia entre un prompt genérico y uno que da resultados.', 18, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 2 (Curso 2)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'tu-marca-con-ia' AND modules.order_index = 2
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Midjourney y Ideogram para logos: guía práctica', 'Las dos herramientas que uso yo para generar logos. Prompts específicos, parámetros clave y cómo iterar hasta llegar al resultado.', 25, false),
  (2, 'De imagen IA a logo vectorial (sin Adobe)', 'Cómo vectorizar tu logo generado con IA usando herramientas gratuitas. Resultado: un archivo SVG listo para usar en cualquier tamaño.', 22, false),
  (3, 'Variaciones de logo: horizontal, ícono y versión oscura', 'Todo logo necesita variantes. Creamos las versiones que vas a usar en redes, web y tarjeta personal.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 3 (Curso 2)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'tu-marca-con-ia' AND modules.order_index = 3
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 15
FROM mod, (VALUES
  (1, 'Elegir la paleta de colores perfecta con IA', 'Coolors + ChatGPT: cómo elegir 5 colores que comuniquen lo correcto. Por qué el color es la parte más importante de una marca y cómo no equivocarse.', 20, false),
  (2, 'Tipografías que funcionan y dónde encontrarlas gratis', 'La combinación de 2 tipografías que le recomiendo a todos mis clientes. Display + texto. Con alternativas gratuitas en Google Fonts.', 18, false),
  (3, 'Crear un moodboard de marca en Canva', 'Reunimos todo: logo, colores, tipografías y referencias visuales en un moodboard que vas a poder mostrar a cualquier persona y que comunique tu marca al instante.', 22, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 4 (Curso 2)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'tu-marca-con-ia' AND modules.order_index = 4
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 20
FROM mod, (VALUES
  (1, 'Armar tu kit de marca en Canva en 1 hora', 'Configuramos el Brand Kit de Canva con tus colores, tipografías y logo. A partir de acá, todo lo que diseñes va a quedar coherente automáticamente.', 28, false),
  (2, 'Plantillas de posteos para redes que se ven profesionales', 'Creamos 5 plantillas de Instagram que cualquier emprendedor puede usar. Story, carrusel, quote y anuncio. Con IA para generar las imágenes.', 32, false),
  (3, 'Tarjeta personal, presentación y firma de email', 'Los 3 materiales que más necesitás para conseguir clientes. Los hacemos en Canva usando tu identidad visual recién creada.', 24, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- Lecciones Módulo 5 (Curso 2)
WITH mod AS (
  SELECT modules.id FROM modules
  JOIN courses ON modules.course_id = courses.id
  WHERE courses.slug = 'tu-marca-con-ia' AND modules.order_index = 5
)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index, xp_value)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index, 25
FROM mod, (VALUES
  (1, 'Cómo presentar tu marca a clientes o empleadores', 'La estructura que uso yo para presentar una identidad visual. Cómo contar las decisiones de diseño de manera que el cliente las entienda y las valore.', 18, false),
  (2, 'Tu marca en web: qué necesitás y qué podés ignorar', 'Bio de Instagram, Linktree, landing page simple. Qué priorizar cuando estás empezando y cómo aplicar tu identidad visual en cada uno.', 20, false),
  (3, 'Mantener y evolucionar tu marca con IA', 'Cómo actualizar elementos de tu marca sin perder coherencia. Cuándo rediseñar, cuándo adaptar, y cómo usar IA para hacerlo rápido.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview)
ON CONFLICT DO NOTHING;

-- ── Verificación ──────────────────────────────────────────────
SELECT
  c.title AS curso,
  COUNT(DISTINCT m.id) AS modulos,
  COUNT(DISTINCT l.id) AS lecciones
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
WHERE c.slug IN ('ia-para-community-managers', 'tu-marca-con-ia')
GROUP BY c.title;
