-- Migration 018: Corregir recursión infinita en RLS de community_members
-- La política "members_read_community_peers" (017) causaba recursión infinita
-- porque hacía una subquery sobre community_members dentro de su propia política.
-- Solución: función SECURITY DEFINER que bypasea RLS al leer las propias membresías.

DROP POLICY IF EXISTS "members_read_community_peers" ON community_members;

-- Función que obtiene los community_id del usuario autenticado sin pasar por RLS
CREATE OR REPLACE FUNCTION get_my_community_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT community_id FROM community_members WHERE user_id = auth.uid();
$$;

-- Política: un miembro puede ver todas las filas de sus comunidades
CREATE POLICY "members_read_community_peers"
  ON community_members FOR SELECT
  USING (
    community_id IN (SELECT get_my_community_ids())
  );
