-- Migration 017: Permitir a miembros ver otros miembros de sus comunidades
-- Bug: "members_read_own_memberships" solo permite auth.uid() = user_id,
-- lo que bloquea el JOIN en "community_members_read_profiles" y hace que
-- los perfiles de otros builders sean invisibles (nombres aparecen como UUID).
-- También causa que memberCount muestre "1" en lugar del total real.

CREATE POLICY "members_read_community_peers"
  ON community_members FOR SELECT
  USING (
    community_id IN (
      SELECT community_id
      FROM community_members
      WHERE user_id = auth.uid()
    )
  );
