-- Migration 030: CREATE TABLE ai_cost_tracking
-- Story 12.1 — Epic 12: AI Summaries & Notifications
--
-- Tracking de costes de IA por mes (formato YYYY-MM, e.g. "2026-05").
-- UNIQUE(month) garantiza un único registro por mes.
-- Actualizado por la capa de servicio cada vez que se genera una síntesis.
-- Solo accesible vía service_role — no hay políticas públicas (ver migración 031).

CREATE TABLE ai_cost_tracking (
  id                 uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  month              varchar(7)     NOT NULL UNIQUE,
  tokens_input       bigint         NOT NULL DEFAULT 0,
  tokens_output      bigint         NOT NULL DEFAULT 0,
  estimated_cost_usd numeric(10,6)  NOT NULL DEFAULT 0,
  synthesis_count    int            NOT NULL DEFAULT 0,
  updated_at         timestamptz    NOT NULL DEFAULT now()
);

-- Índice en month para upsert eficiente
CREATE INDEX ai_cost_tracking_month_idx ON ai_cost_tracking(month);

-- Constraint de formato de mes: YYYY-MM (4 dígitos - 2 dígitos)
ALTER TABLE ai_cost_tracking
  ADD CONSTRAINT ai_cost_tracking_month_format
  CHECK (month ~ '^\d{4}-\d{2}$');
