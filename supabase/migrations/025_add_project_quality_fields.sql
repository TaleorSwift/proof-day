-- Story 11.1 — Project quality fields: custom_question y quality_threshold
-- custom_question: pregunta adicional del builder que aparece en el formulario de feedback
-- quality_threshold: puntuación mínima para considerar un feedback "completo" (DEFAULT 0.6)
-- NOT NULL con DEFAULT 0.6 — los registros existentes reciben 0.6 automáticamente (HIGH-2)

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS custom_question   TEXT,
  ADD COLUMN IF NOT EXISTS quality_threshold NUMERIC(4,2) NOT NULL DEFAULT 0.6;

-- RLS: sin cambios — las nuevas columnas heredan las políticas existentes de projects
