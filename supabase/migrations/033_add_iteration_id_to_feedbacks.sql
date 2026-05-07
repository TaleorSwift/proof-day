-- 033_add_iteration_id_to_feedbacks.sql
-- Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

ALTER TABLE feedbacks
  ADD COLUMN iteration_id UUID NULL
  REFERENCES project_iterations(id) ON DELETE SET NULL;
