-- Story 9.1 post-review fix: cambiar volatility de IMMUTABLE a STABLE
-- La función usa regex (~) que puede variar con el locale del servidor.
-- STABLE es correcto: sin side-effects, resultado consistente dentro de una transacción.

CREATE OR REPLACE FUNCTION feedback_would_use(scores jsonb)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT
    scores->>'p2' = 'yes'
    OR (
      scores->>'p2' ~ '^\d+$'
      AND (scores->>'p2')::int = 3
    )
$$;
