-- Migration 004: RLS policies for community_members — admin UPDATE and DELETE
-- Story 2.1 CR2-F1: community_members lacked UPDATE and DELETE policies
-- Admins can update member roles and remove members from their communities

-- UPDATE: admins can update roles of members in their own communities
CREATE POLICY "admins_update_community_members"
  ON community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members AS admin_check
      WHERE admin_check.community_id = community_members.community_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role = 'admin'
    )
  );

-- DELETE: admins can remove members from their own communities
CREATE POLICY "admins_delete_community_members"
  ON community_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_members AS admin_check
      WHERE admin_check.community_id = community_members.community_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role = 'admin'
    )
  );

-- DEUDA TÉCNICA (story 2.1, CR2-F1):
-- Las políticas de UPDATE y DELETE de community_members se añaden en esta migración
-- de forma retroactiva. En producción, deberá aplicarse después de 003_rls_policies.sql.
-- Funcionalidades de expulsión/cambio de rol serán implementadas en stories futuras (2.x).
