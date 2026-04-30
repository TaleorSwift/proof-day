-- Story 10.1: Añadir template_id a projects (Phase 2)
-- Nullable FK → retrocompatibilidad garantizada (AC-4)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES project_templates(id) ON DELETE SET NULL;
