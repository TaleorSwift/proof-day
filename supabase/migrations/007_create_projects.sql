-- Story 3.1: Create & Edit Project (Draft)
-- Tabla projects + RLS policies

CREATE TABLE projects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  builder_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  problem      text NOT NULL,
  solution     text NOT NULL,
  hypothesis   text NOT NULL,
  image_urls   text[] NOT NULL DEFAULT '{}',
  status       text NOT NULL CHECK (status IN ('draft', 'live', 'inactive')) DEFAULT 'draft',
  decision     text CHECK (decision IN ('iterate', 'scale', 'abandon')),
  decided_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_community_id ON projects(community_id);
CREATE INDEX idx_projects_builder_id ON projects(builder_id);
CREATE INDEX idx_projects_status ON projects(status);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Builder puede leer sus propios proyectos (draft + live + inactive)
CREATE POLICY "builder_read_own_projects"
  ON projects FOR SELECT
  USING (auth.uid() = builder_id);

-- Miembros de la comunidad ven proyectos live e inactive (no draft de otros)
CREATE POLICY "members_read_live_projects"
  ON projects FOR SELECT
  USING (
    status IN ('live', 'inactive')
    AND auth.uid() IN (
      SELECT user_id FROM community_members WHERE community_id = projects.community_id
    )
  );

-- Solo el builder puede insertar su proyecto
CREATE POLICY "builder_insert_project"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = builder_id);

-- Solo el builder puede actualizar su propio proyecto
CREATE POLICY "builder_update_own_project"
  ON projects FOR UPDATE
  USING (auth.uid() = builder_id);
