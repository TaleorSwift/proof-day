-- Story 9.1: Contador would_use_count en tabla projects
-- Columna denormalizada + trigger AFTER INSERT/UPDATE/DELETE en feedbacks
-- "would use" = scores->>'p2' = 'yes' (nuevo FeedbackFormInline)
--              OR (scores->>'p2' ~ '^\d+$' AND (scores->>'p2')::int = 3) (FeedbackDialog legacy)

-- 1. Columna
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS would_use_count integer NOT NULL DEFAULT 0;

-- 2. Helper: evalúa si un feedback cuenta como "lo usaría"
CREATE OR REPLACE FUNCTION feedback_would_use(scores jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT
    scores->>'p2' = 'yes'
    OR (
      scores->>'p2' ~ '^\d+$'
      AND (scores->>'p2')::int = 3
    )
$$;

-- 3. Función del trigger
CREATE OR REPLACE FUNCTION recompute_project_would_use_count()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_project_id uuid;
BEGIN
  v_project_id := COALESCE(NEW.project_id, OLD.project_id);
  UPDATE projects
  SET would_use_count = (
    SELECT COUNT(*)
    FROM feedbacks
    WHERE project_id = v_project_id
      AND feedback_would_use(scores)
  )
  WHERE id = v_project_id;
  RETURN NULL;
END;
$$;

-- 4. Trigger
DROP TRIGGER IF EXISTS feedbacks_recompute_would_use ON feedbacks;
CREATE TRIGGER feedbacks_recompute_would_use
  AFTER INSERT OR UPDATE OF scores OR DELETE ON feedbacks
  FOR EACH ROW EXECUTE FUNCTION recompute_project_would_use_count();

-- 5. Backfill inicial — sincroniza contadores con datos existentes
UPDATE projects p
SET would_use_count = (
  SELECT COUNT(*)
  FROM feedbacks f
  WHERE f.project_id = p.id
    AND feedback_would_use(f.scores)
);
