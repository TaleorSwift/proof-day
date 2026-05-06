-- Story 11.1 — Feedback quality: custom_answer y quality_score
-- Añade soporte para respuesta personalizada a la pregunta custom del builder
-- y quality score calculado para filtros de completitud (Epic 11)

ALTER TABLE feedbacks
  ADD COLUMN custom_answer  TEXT,
  ADD COLUMN quality_score  NUMERIC(4,2);

-- RLS: sin cambios — las nuevas columnas heredan las políticas existentes de feedbacks
