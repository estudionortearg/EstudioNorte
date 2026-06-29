-- Seed data: pilot course
INSERT INTO courses (
  slug, title, subtitle, price_ars, price_usd,
  is_published, is_featured,
  what_you_learn, for_who
) VALUES (
  'ia-para-community-managers',
  'IA para Community Managers que quieren trabajar distinto',
  'Aprendé a usar inteligencia artificial en tu trabajo diario. Sin teoría vacía.',
  25000,
  25,
  true,
  true,
  ARRAY[
    'Generá un mes de contenido en una tarde',
    'Prompts específicos para cada red social',
    'Mantené tu voz usando IA',
    'Automatizaciones que liberan horas',
    'Cómo presentar IA a tus clientes'
  ],
  ARRAY[
    'CMs freelance que quieren producir más',
    'Dueños de negocio que manejan sus redes',
    'Agencias que quieren escalar'
  ]
);
