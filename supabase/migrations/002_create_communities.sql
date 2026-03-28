-- Migration 002: Create communities and community_members tables
-- Story 2.1 — Create Community

-- communities
CREATE TABLE communities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text NOT NULL,
  image_url   text,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_created_by ON communities(created_by);

-- community_members
CREATE TABLE community_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);

-- Trigger: auto-actualizar updated_at en UPDATE de communities
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER communities_set_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
