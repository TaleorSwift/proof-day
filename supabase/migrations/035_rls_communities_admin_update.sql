-- Migration 035: RLS UPDATE policy for communities — admins only
-- Bug fix: communities table had no UPDATE policy, causing all PATCH operations
-- (reciprocity_threshold, image_url) to be silently blocked by RLS

CREATE POLICY "admins_update_community"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
        AND community_members.user_id = auth.uid()
        AND community_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_members.community_id = communities.id
        AND community_members.user_id = auth.uid()
        AND community_members.role = 'admin'
    )
  );
