-- Migration 003: RLS policies for communities and community_members
-- Story 2.1 — Create Community

-- RLS communities: solo miembros leen su comunidad
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own_community"
  ON communities FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM community_members WHERE community_id = id
    )
  );

CREATE POLICY "authenticated_insert_community"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS community_members
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own_memberships"
  ON community_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "authenticated_insert_membership"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
