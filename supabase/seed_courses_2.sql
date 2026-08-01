-- ============================================================
-- SEED 2: 3 cursos adicionales — Estudio Norte
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── CURSO 3: Canva Pro para tu marca ─────────────────────────

INSERT INTO courses (slug, title, subtitle, description, what_you_learn, for_who, price_ars, price_usd, is_published, is_featured)
VALUES (
  'canva-pro-para-tu-marca',
  'Canva Pro para tu marca — de plantilla a identidad propia',
  'Dejá de usar plantillas genéricas. Aprendé a usar Canva Pro como un diseñador para construir una marca coherente y profesional.',
  'Juan Gallino te muestra cómo sacar el máximo provecho de Canva Pro para crear una identidad visual completa. Sin depender de plantillas ajenas, sin perder tiempo, y con un resultado que parece hecho por una agencia.',
  ARRAY[
    'Configurar tu Brand Kit con colores, tipografías y logos',
    'Crear plantillas propias para redes, presentaciones y materiales',
    'Usar la IA de Canva para generar imágenes y textos de marca',
    'Armar un sistema de piezas coherentes para todo el año',
    'Exportar archivos listos para imprimir y para digital'
  ],
  ARRAY[
    'Emprendedores que quieren dejar de "improvisar" su diseño',
    'Profesionales que usan Canva pero no saben todo lo que pueden hacer',
    'Community managers que necesitan producir más en menos tiempo'
  ],
  19000,
  19,
  true,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  what_you_learn = EXCLUDED.what_you_learn, for_who = EXCLUDED.for_who,
  price_ars = EXCLUDED.price_ars, price_usd = EXCLUDED.price_usd,
  is_published = EXCLUDED.is_published, is_featured = EXCLUDED.is_featured;

WITH course AS (SELECT id FROM courses WHERE slug = 'canva-pro-para-tu-marca')
INSERT INTO modules (course_id, title, order_index)
SELECT course.id, m.title, m.order_index FROM course, (VALUES
  (1, 'Módulo 1 — Canva Pro por dentro: lo que nadie te explica'),
  (2, 'Módulo 2 — Brand Kit: tu marca siempre lista'),
  (3, 'Módulo 3 — Plantillas propias que escalan'),
  (4, 'Módulo 4 — IA de Canva para acelerar todo'),
  (5, 'Módulo 5 — Sistema completo y flujo de trabajo real')
) AS m(order_index, title) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'canva-pro-para-tu-marca' AND modules.order_index = 1)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Por qué Canva Pro vale la pena (y cómo pagarlo menos)', 'Diferencias reales entre Free y Pro. Las funciones que justifican el costo. Y cómo acceder a precio reducido si estás en Argentina.', 10, true),
  (2, 'La interfaz que la mayoría ignora', 'Carpetas, páginas, grillas y guías. Cómo organizar tu espacio de trabajo para encontrar todo en segundos y no perder tiempo.', 14, false),
  (3, 'Atajos y trucos que aceleran tu producción x3', 'Los 15 atajos de teclado que uso todos los días. Cómo copiar estilos, alinear elementos y trabajar con capas como un profesional.', 12, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'canva-pro-para-tu-marca' AND modules.order_index = 2)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Configurar tu Brand Kit paso a paso', 'Cómo cargar tus colores en HEX, subir tus tipografías y organizar las versiones de tu logo. Configuración de una vez, beneficios para siempre.', 20, false),
  (2, 'Múltiples Brand Kits para múltiples marcas', 'Si tenés más de una marca o trabajás con clientes, esto es fundamental. Cómo mantener identidades separadas sin confundirlas.', 15, false),
  (3, 'Colores que funcionan en pantalla y en impresión', 'La diferencia entre RGB y CMYK en Canva. Cómo elegir colores que se vean bien en digital y no se arruinen al imprimir.', 18, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'canva-pro-para-tu-marca' AND modules.order_index = 3)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Crear una plantilla de post de Instagram desde cero', 'Diseñamos juntos una plantilla de feed que respeta tu identidad visual. Sin partir de una plantilla ajena — todo propio.', 28, false),
  (2, 'Plantilla de story, carrusel y Reel cover', 'Las 3 plantillas que más vas a usar en redes. Cómo hacerlas consistentes entre sí y adaptarlas para diferentes temas de contenido.', 25, false),
  (3, 'Presentación y propuesta comercial de marca', 'Diseñamos una presentación de 10 slides con tu identidad visual. El mismo formato que uso yo para presentar proyectos a clientes.', 30, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'canva-pro-para-tu-marca' AND modules.order_index = 4)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Magic Write: generar textos de marca con IA', 'Cómo usar Magic Write para generar copys de posts, títulos y descripciones que suenan a tu marca. Prompts específicos para distintos tipos de contenido.', 16, false),
  (2, 'Text to Image: imágenes propias sin banco de fotos', 'Generar imágenes con la IA de Canva que encajen con tu paleta y estilo visual. Cómo iterar hasta llegar al resultado que necesitás.', 20, false),
  (3, 'Background Remover y otras herramientas IA de Canva', 'Las funciones de IA que más tiempo me ahorran: remover fondos, expandir imágenes, traducir diseños y redimensionar para cualquier formato.', 18, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'canva-pro-para-tu-marca' AND modules.order_index = 5)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Organizar tu biblioteca de diseño para nunca perderte', 'Carpetas por cliente, por campaña, por formato. El sistema de organización que uso yo después de años trabajando con decenas de marcas.', 14, false),
  (2, 'Exportar correctamente para cada uso', 'PNG, JPG, PDF, MP4, SVG. Qué formato usar para cada caso, qué resolución elegir y cómo comprimir sin perder calidad.', 12, false),
  (3, 'Tu flujo de trabajo semanal con Canva', 'Cómo armar un sistema de producción de contenido usando Canva + IA que te lleve menos de 3 horas por semana. Con checklist descargable.', 20, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;


-- ── CURSO 4: Conseguí tus primeros clientes de diseño ─────────

INSERT INTO courses (slug, title, subtitle, description, what_you_learn, for_who, price_ars, price_usd, is_published, is_featured)
VALUES (
  'primeros-clientes-diseno',
  'Conseguí tus primeros clientes de diseño',
  'El sistema que uso para conseguir y retener clientes de diseño de marca. Sin publicidad paga, sin seguidores masivos.',
  'Juan Gallino te muestra el proceso exacto que usó para construir su cartera de clientes desde Rafaela, Santa Fe. Sin invertir en publicidad, usando LinkedIn, Instagram y referencias. Un sistema que cualquiera puede replicar.',
  ARRAY[
    'Definir tu nicho y propuesta de valor como diseñador',
    'Armar un portfolio que convierte visitantes en clientes',
    'Conseguir los primeros clientes con estrategia de contenido',
    'Hacer propuestas comerciales que se aceptan',
    'Cobrar lo que merecés y no bajar el precio'
  ],
  ARRAY[
    'Diseñadores que recién empiezan y no saben cómo conseguir clientes',
    'Freelancers que trabajan por referidos pero quieren crecer',
    'Profesionales que quieren pasar de empleados a independientes'
  ],
  22000,
  22,
  true,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  what_you_learn = EXCLUDED.what_you_learn, for_who = EXCLUDED.for_who,
  price_ars = EXCLUDED.price_ars, price_usd = EXCLUDED.price_usd,
  is_published = EXCLUDED.is_published, is_featured = EXCLUDED.is_featured;

WITH course AS (SELECT id FROM courses WHERE slug = 'primeros-clientes-diseno')
INSERT INTO modules (course_id, title, order_index)
SELECT course.id, m.title, m.order_index FROM course, (VALUES
  (1, 'Módulo 1 — Tu posicionamiento como diseñador'),
  (2, 'Módulo 2 — Portfolio que vende'),
  (3, 'Módulo 3 — Conseguir clientes sin publicidad'),
  (4, 'Módulo 4 — La propuesta comercial que cierra'),
  (5, 'Módulo 5 — Cobrar bien y retener clientes')
) AS m(order_index, title) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'primeros-clientes-diseno' AND modules.order_index = 1)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Por qué "hago de todo" te hace conseguir nada', 'La trampa del generalista. Por qué tener un nicho claro genera más clientes, no menos. Con ejemplos de diseñadores que triplicaron sus ingresos al especializarse.', 14, true),
  (2, 'Definir tu nicho en 3 preguntas', 'Las tres preguntas que uso yo para definir el nicho ideal: qué sabés hacer, a quién le sirve y qué problema resolvés. Ejercicio práctico incluido.', 18, false),
  (3, 'Tu propuesta de valor en una oración', 'Cómo resumir lo que hacés en una oración que cualquiera entiende y que hace que tu cliente ideal diga "eso es lo que necesito". Con plantilla y ejemplos.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'primeros-clientes-diseno' AND modules.order_index = 2)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Portfolio en Behance vs. sitio propio: qué elegir', 'Cuándo usar Behance, cuándo necesitás un sitio propio y cuándo con Linktree alcanza. La respuesta depende de tu etapa, no de lo que dicen los tutoriales.', 16, false),
  (2, 'Cómo presentar un proyecto sin tener experiencia previa', 'La técnica que uso para mostrar valor cuando no tenés cartera: proyectos inventados, rediseños y trabajos pro bono bien presentados. Más efectivo de lo que creés.', 22, false),
  (3, 'El caso de estudio que convierte: estructura y copywriting', 'No alcanza con mostrar imágenes lindas. Los clientes quieren ver el proceso y el resultado. Cómo escribir un caso de estudio que muestre tu valor real.', 24, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'primeros-clientes-diseno' AND modules.order_index = 3)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Contenido en LinkedIn que atrae clientes B2B', 'El tipo de post que funciona en LinkedIn para diseñadores: no es mostrar trabajos, es demostrar criterio. La estrategia que uso yo con ejemplos reales.', 20, false),
  (2, 'Instagram para conseguir clientes locales y de nicho', 'Cómo usar Instagram para atraer clientes aunque tengas pocos seguidores. El contenido que convierte y cómo pasarlo a DM sin que suene a spam.', 18, false),
  (3, 'El poder de los referidos: cómo activarlos', 'Tus mejores clientes son los que ya tenés. Cómo pedirle referencias a un cliente sin que sea incómodo y cómo armar un sistema que genera referidos solo.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'primeros-clientes-diseno' AND modules.order_index = 4)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'La reunión de discovery: qué preguntar antes de cotizar', 'Las preguntas que hago yo antes de mandar cualquier presupuesto. Por qué hacer bien el discovery es lo que separa a los diseñadores que consiguen trabajo de los que no.', 22, false),
  (2, 'Cómo armar una propuesta comercial que se acepta', 'La estructura de la propuesta que uso yo: problema, solución, proceso, entregables, inversión y garantía. Con plantilla editable.', 28, false),
  (3, 'Manejar objeciones sin bajar el precio', '"Es muy caro", "lo voy a pensar", "encontré algo más barato". Las respuestas exactas que uso yo para manejar las 5 objeciones más comunes sin ceder en el precio.', 20, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'primeros-clientes-diseno' AND modules.order_index = 5)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Cómo fijar tus precios (sin adivinar)', 'El método que uso para calcular mis tarifas: horas, valor percibido y mercado. Por qué cobrar por proyecto y no por hora, y cómo hacer la transición.', 18, false),
  (2, 'El contrato simple que te salva de clientes difíciles', 'No hace falta un abogado. Un contrato de una página que cubre: alcance, pagos, revisiones, derechos y cancelación. Con modelo descargable.', 16, false),
  (3, 'Retener clientes y cobrar recurrente', 'Cómo convertir un proyecto puntual en una relación de largo plazo. Los servicios de mantenimiento de marca que yo ofrezco y cómo presentarlos después de entregar el proyecto inicial.', 22, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;


-- ── CURSO 5: Contenido visual con IA para Instagram ──────────

INSERT INTO courses (slug, title, subtitle, description, what_you_learn, for_who, price_ars, price_usd, is_published, is_featured)
VALUES (
  'contenido-visual-ia-instagram',
  'Contenido visual con IA para Instagram',
  'Creá imágenes, carruseles y stories profesionales con IA sin saber diseño. Para marcas y emprendedores que quieren un feed coherente.',
  'Un curso práctico de Juan Gallino para crear contenido visual de calidad en Instagram usando IA. Sin Adobe, sin experiencia en diseño, y sin perder horas. El flujo exacto que usa para sus clientes.',
  ARRAY[
    'Generar imágenes para posteos con IA que encajan con tu marca',
    'Diseñar carruseles que educan y convierten seguidores en clientes',
    'Crear stories y Reels covers con identidad visual coherente',
    'Armar un calendario de contenido visual para un mes entero',
    'Mantener consistencia visual sin esfuerzo semana a semana'
  ],
  ARRAY[
    'Emprendedores que quieren un feed profesional sin contratar un diseñador',
    'Community managers que buscan acelerar la producción de contenido visual',
    'Marcas pequeñas que necesitan comunicar mejor en Instagram'
  ],
  18000,
  18,
  true,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  what_you_learn = EXCLUDED.what_you_learn, for_who = EXCLUDED.for_who,
  price_ars = EXCLUDED.price_ars, price_usd = EXCLUDED.price_usd,
  is_published = EXCLUDED.is_published, is_featured = EXCLUDED.is_featured;

WITH course AS (SELECT id FROM courses WHERE slug = 'contenido-visual-ia-instagram')
INSERT INTO modules (course_id, title, order_index)
SELECT course.id, m.title, m.order_index FROM course, (VALUES
  (1, 'Módulo 1 — Qué hace que un feed se vea profesional'),
  (2, 'Módulo 2 — Imágenes con IA que encajan con tu marca'),
  (3, 'Módulo 3 — Carruseles que convierten'),
  (4, 'Módulo 4 — Stories y Reels covers'),
  (5, 'Módulo 5 — Sistema de producción semanal')
) AS m(order_index, title) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'contenido-visual-ia-instagram' AND modules.order_index = 1)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'La diferencia entre un feed que vende y uno que no', 'Analizamos 5 cuentas reales: qué tienen en común las que generan clientes y qué errores cometen las que tienen seguidores pero no convierten.', 12, true),
  (2, 'Los 4 elementos visuales que dan coherencia a un feed', 'Color, tipografía, estilo de imagen y composición. Cómo usarlos de forma consistente sin que cada post parezca de una marca distinta.', 16, false),
  (3, 'Definir el estilo visual de tu marca en 20 minutos', 'Ejercicio práctico: usamos Pinterest y referencias reales para definir en palabras el estilo visual que querés para tu cuenta. Base de todo lo que sigue.', 18, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'contenido-visual-ia-instagram' AND modules.order_index = 2)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Midjourney para contenido de marca: los prompts que funcionan', 'Los prompts exactos que uso para generar imágenes de producto, lifestyle y abstractas que encajan con una identidad visual. Con ejemplos para distintos rubros.', 24, false),
  (2, 'Adobe Firefly y Canva IA: cuándo usar cada uno', 'Midjourney no es la única opción. Cuándo me conviene usar Adobe Firefly, cuándo la IA de Canva y cuándo DALL-E. Comparativa real con resultados.', 20, false),
  (3, 'Adaptar imágenes generadas con IA a tu paleta de colores', 'Una imagen generada con IA raramente encaja perfecta con tu marca. La técnica que uso en Canva para ajustar colores, agregar overlays y hacer que todo sea coherente.', 18, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'contenido-visual-ia-instagram' AND modules.order_index = 3)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'La estructura del carrusel que genera más guardados', 'Portada que para el scroll, slides que enganchan, cierre que convierte. La fórmula que uso para los carruseles de mis clientes con ejemplos reales.', 22, false),
  (2, 'Diseñar un carrusel de 7 slides en Canva con IA', 'Paso a paso completo: elegir el tema, generar las imágenes, escribir los textos con IA, armar el diseño y exportar listo para subir.', 32, false),
  (3, 'Tipos de carrusel: educativo, de producto y de testimonio', 'Cada tipo de carrusel tiene una estructura distinta. Diseñamos los 3 con plantillas propias que podés reutilizar para cualquier tema.', 26, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'contenido-visual-ia-instagram' AND modules.order_index = 4)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Stories que no se pasan: diseño y estrategia', 'Por qué la mayoría de los stories no funcionan visualmente y cómo solucionarlo. Las plantillas que diseño para que mis clientes posteen todos los días sin esfuerzo.', 18, false),
  (2, 'Reel cover que llama la atención en el feed', 'El cover de un Reel es lo primero que ven. Cómo diseñar covers coherentes con tu feed que aumentan las visitas a tu perfil.', 14, false),
  (3, 'Highlight covers: la identidad visual de tu perfil', 'Los highlights son lo primero que ve un nuevo visitante. Diseñamos un set completo de covers con íconos e identidad visual propia.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;

WITH mod AS (SELECT modules.id FROM modules JOIN courses ON modules.course_id = courses.id WHERE courses.slug = 'contenido-visual-ia-instagram' AND modules.order_index = 5)
INSERT INTO lessons (module_id, title, description, duration_minutes, is_free_preview, order_index)
SELECT mod.id, l.title, l.description, l.duration_minutes, l.is_free_preview, l.order_index FROM mod, (VALUES
  (1, 'Planificar un mes de contenido visual en 2 horas', 'El proceso que uso para planificar 30 días de contenido para un cliente: qué tipos de post, qué frecuencia y cómo distribuirlos en el calendario.', 20, false),
  (2, 'Batch creation: producir todo el mes en una tarde', 'Cómo agrupar la producción de contenido para no diseñar todos los días. El flujo de trabajo que me permite cerrar el mes en una sola sesión de trabajo.', 24, false),
  (3, 'Herramientas para programar y analizar resultados', 'Buffer, Later o Meta Business Suite: cuál usar según tu caso. Cómo leer las métricas que importan y ajustar el contenido visual para mejorar el alcance.', 16, false)
) AS l(order_index, title, description, duration_minutes, is_free_preview) ON CONFLICT DO NOTHING;


-- ── Verificación ──────────────────────────────────────────────
SELECT c.slug, c.title, c.price_ars,
  COUNT(DISTINCT m.id) AS modulos,
  COUNT(DISTINCT l.id) AS lecciones
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
WHERE c.slug IN ('canva-pro-para-tu-marca','primeros-clientes-diseno','contenido-visual-ia-instagram')
GROUP BY c.slug, c.title, c.price_ars
ORDER BY c.price_ars DESC;
