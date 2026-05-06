-- Migration 029: CREATE TABLE notification_preferences
-- Story 12.1 — Epic 12: AI Summaries & Notifications
--
-- Preferencias de notificación por usuario y tipo.
-- UNIQUE(user_id, type) garantiza una única fila de preferencia por tipo.
-- email_enabled=true por defecto — el usuario puede desactivarlas explícitamente.

CREATE TABLE notification_preferences (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          text    NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, type)
);

-- Índice en user_id para consultar todas las preferencias de un usuario
CREATE INDEX notification_preferences_user_id_idx ON notification_preferences(user_id);
