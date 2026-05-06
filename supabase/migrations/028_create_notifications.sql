-- Migration 028: CREATE TABLE notifications
-- Story 12.1 — Epic 12: AI Summaries & Notifications
--
-- Almacena notificaciones para usuarios. El campo payload (JSONB) permite
-- datos variables según el tipo de notificación sin alterar el schema.
-- read=false por defecto — el usuario las marca como leídas.

CREATE TABLE notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text        NOT NULL,
  payload    jsonb       NOT NULL DEFAULT '{}',
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultar notificaciones de un usuario ordenadas por fecha
CREATE INDEX notifications_user_id_created_at_idx ON notifications(user_id, created_at DESC);
-- Índice para filtrar por estado leído/no leído
CREATE INDEX notifications_user_id_read_idx ON notifications(user_id, read);
