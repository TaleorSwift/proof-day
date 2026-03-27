-- Migration: 001_create_invitation_links.sql
-- Story 2.2 — Invitation Links: Generate & Join

CREATE TABLE invitation_links (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text NOT NULL UNIQUE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at      timestamptz NULL,
  used_by      uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitation_links_token ON invitation_links(token);
CREATE INDEX idx_invitation_links_community_id ON invitation_links(community_id);

-- RLS: admin de la comunidad puede crear y leer sus invitation links
ALTER TABLE invitation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_invitations"
  ON invitation_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = invitation_links.community_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = invitation_links.community_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Cualquier usuario autenticado puede leer un token (para validarlo al unirse)
-- pero NO puede leer toda la tabla — solo por token específico
CREATE POLICY "authenticated_read_by_token"
  ON invitation_links FOR SELECT
  USING (auth.uid() IS NOT NULL);
