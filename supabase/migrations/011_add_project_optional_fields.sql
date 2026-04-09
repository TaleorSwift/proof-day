-- Story 8.1: Migración DB — Nuevos campos de proyecto
-- Añade target_user, demo_url y feedback_topics a la tabla projects

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS target_user     text,
  ADD COLUMN IF NOT EXISTS demo_url        text,
  ADD COLUMN IF NOT EXISTS feedback_topics text[];
