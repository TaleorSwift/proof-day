-- Story 9.1: Migración DB — tagline en tabla projects
-- Añade campo tagline (texto corto, propuesta de valor del proyecto)

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS tagline text;
