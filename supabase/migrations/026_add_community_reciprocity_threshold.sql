-- Story 11.1 — Community reciprocity threshold
-- reciprocity_threshold: número mínimo de feedbacks dados que un builder debe tener
-- para poder publicar un nuevo proyecto (gate de reciprocidad, Epic 11)
-- DEFAULT 3 según spec de negocio

ALTER TABLE communities
  ADD COLUMN reciprocity_threshold INTEGER DEFAULT 3;

-- RLS: sin cambios — la nueva columna hereda las políticas existentes de communities
