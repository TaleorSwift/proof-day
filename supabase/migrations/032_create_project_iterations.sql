-- 032_create_project_iterations.sql
-- Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

CREATE TABLE project_iterations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number  INTEGER     NOT NULL,
  title           TEXT,
  description     TEXT,
  hypothesis      TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_iterations_project_version_unique
    UNIQUE (project_id, version_number)
);

-- RLS
ALTER TABLE project_iterations ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros de la comunidad del proyecto
CREATE POLICY "project_iterations_select_community_members"
  ON project_iterations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects p
      JOIN community_members cm ON cm.community_id = p.community_id
      WHERE p.id = project_iterations.project_id
        AND cm.user_id = auth.uid()
    )
  );

-- INSERT: solo el Builder (author) del proyecto
CREATE POLICY "project_iterations_insert_builder"
  ON project_iterations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects p
      WHERE p.id = project_iterations.project_id
        AND p.builder_id = auth.uid()
    )
  );
