-- Story 10.1: Tabla project_templates (Phase 2)
-- Templates globales de proyecto — extensibles sin deploy

CREATE TABLE project_templates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type                  text NOT NULL UNIQUE,
  name                  text NOT NULL,
  description_structure jsonb NOT NULL,
  reviewer_context      text NOT NULL,
  created_at            timestamptz DEFAULT now()
);

-- RLS: lectura pública para usuarios autenticados (datos de config global)
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_templates_read_authenticated"
  ON project_templates FOR SELECT
  TO authenticated
  USING (true);
