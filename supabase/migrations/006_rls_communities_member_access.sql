-- Migration 006: RLS reforzada en communities — política SELECT con EXISTS
-- Story 2.3 — Community Access Control & Listing
-- AC-3: La policy SELECT en communities usa EXISTS (más eficiente y explícita que IN)

-- Eliminar policy existente (creada en migration 003 con IN subquery)
DROP POLICY IF EXISTS "members_read_own_community" ON communities;

-- Nueva policy con EXISTS: solo si auth.uid() es miembro de la comunidad
CREATE POLICY "members_read_own_community"
  ON communities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
        AND community_members.user_id = auth.uid()
    )
  );

-- Nota: las policies de INSERT en communities (authenticated_insert_community)
-- y todas las policies de community_members (SELECT, INSERT, UPDATE, DELETE)
-- no se ven afectadas por esta migración.
