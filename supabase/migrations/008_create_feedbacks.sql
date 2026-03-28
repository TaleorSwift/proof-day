CREATE TABLE feedbacks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id     uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  scores           jsonb NOT NULL,       -- { p1: 1|2|3, p2: 1|2|3, p3: 1|2|3 }
  text_responses   jsonb NOT NULL,       -- { p1?, p2?, p3?, p4: string }
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, reviewer_id)       -- un feedback por reviewer por proyecto
);

CREATE INDEX idx_feedbacks_project_id ON feedbacks(project_id);
CREATE INDEX idx_feedbacks_reviewer_id ON feedbacks(reviewer_id);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Solo el builder puede leer feedbacks de sus proyectos
CREATE POLICY "builder_read_project_feedbacks"
  ON feedbacks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT builder_id FROM projects WHERE id = project_id
    )
  );

-- El reviewer puede leer sus propios feedbacks
CREATE POLICY "reviewer_read_own_feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = reviewer_id);

-- Cualquier miembro autenticado puede insertar feedback (se valida en API Route)
CREATE POLICY "member_insert_feedback"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
