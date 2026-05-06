-- Migration 031: RLS policies para tablas de Epic 12
-- Story 12.1 — AI Summaries & Notifications
--
-- Resumen de políticas:
--   ai_summaries         → SELECT para usuarios autenticados (proyectos en comunidades)
--   notifications        → SELECT/UPDATE para el propio usuario (auth.uid() = user_id)
--   notification_preferences → CRUD para el propio usuario (auth.uid() = user_id)
--   ai_cost_tracking     → solo service_role (sin política pública — tabla interna)

-- ─────────────────────────────────────────────
-- ai_summaries
-- ─────────────────────────────────────────────
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer resúmenes (los proyectos son visibles
-- para todos los miembros de la comunidad — restricción ya en projects RLS).
CREATE POLICY "ai_summaries_read_authenticated"
  ON ai_summaries
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo service_role puede insertar/actualizar/eliminar (via API server-side)
-- No hay política INSERT/UPDATE/DELETE pública — el service_role las bypasea

-- ─────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INSERT/DELETE son exclusivos del service_role (no hay política pública)

-- ─────────────────────────────────────────────
-- notification_preferences
-- ─────────────────────────────────────────────
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_select_own"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_own"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_delete_own"
  ON notification_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ai_cost_tracking
-- ─────────────────────────────────────────────
-- RLS habilitado pero sin políticas públicas: solo service_role puede acceder.
ALTER TABLE ai_cost_tracking ENABLE ROW LEVEL SECURITY;

-- No se crean políticas SELECT/INSERT/UPDATE/DELETE para roles authenticated/anon.
-- El service_role bypasea RLS por diseño de Supabase.
