-- supabase/seed_gamification.sql
INSERT INTO badges (slug, name, emoji, description, condition_type, condition_value) VALUES
  ('first_lesson',   'Primera lección',   '🌱', 'Completaste tu primera lección. ¡El camino empieza aquí!', 'first_lesson', 1),
  ('streak_3',       '3 días seguidos',   '🔥', 'Estudiaste 3 días consecutivos. ¡Estás en racha!',         'streak_days',  3),
  ('streak_7',       'Una semana',        '⚡', 'Siete días de estudio seguidos. ¡Imparable!',               'streak_days',  7),
  ('streak_30',      'Un mes',            '🏆', '30 días de racha. Eso es disciplina de élite.',             'streak_days',  30),
  ('xp_100',         '100 XP',            '⭐', 'Acumulaste tus primeros 100 XP. ¡Vas creciendo!',           'total_xp',     100),
  ('xp_500',         '500 XP',            '💎', '500 XP acumulados. Sos un alumno de nivel avanzado.',       'total_xp',     500),
  ('first_course',   'Primer curso',      '🎓', 'Completaste tu primer curso. ¡Un logro enorme!',            'courses_completed', 1),
  ('course_complete','Curso completado',  '✅', 'Terminaste un curso de Estudio Norte.',                     'course_complete', 1)
ON CONFLICT (slug) DO NOTHING;
