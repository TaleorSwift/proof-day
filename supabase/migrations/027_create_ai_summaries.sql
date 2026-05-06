-- Migration 027: CREATE TABLE ai_summaries
-- Story 12.1 — Epic 12: AI Summaries & Notifications
--
-- Almacena el resumen IA generado para cada proyecto.
-- Relación 1:1 con projects (UNIQUE project_id).
-- Se regenera cuando hay nuevos feedbacks (updated_at refleja la última síntesis).

CREATE TABLE ai_summaries (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id                  uuid        NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  content                     text        NOT NULL,
  feedback_count_at_generation int        NOT NULL DEFAULT 0,
  model                       text        NOT NULL,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- Índice en project_id para búsqueda directa por proyecto
CREATE INDEX ai_summaries_project_id_idx ON ai_summaries(project_id);
