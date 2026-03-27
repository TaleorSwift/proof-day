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

-- NOTA SEGURIDAD: La política "authenticated_read_by_token" original (USING auth.uid() IS NOT NULL)
-- exponía TODA la tabla a cualquier usuario autenticado — vulnerabilidad de enumeración de tokens.
-- Corrección: no se puede restringir a token específico en RLS sin conocer el valor del token en USING.
-- La validación del token se realiza directamente en el Server Component app/invite/[token]/page.tsx
-- usando createClient() de lib/supabase/server.ts — la lógica de join vive en page.tsx, no en API Route.
-- Nota: app/api/invitations/[token]/use/route.ts fue creada inicialmente pero eliminada en CR6-F2
-- (dead code sin callers tras mover la lógica al Server Component en CR4-F1).
-- Solución: eliminar la política READ pública y usar una función RPC con SECURITY DEFINER
-- que valide el token sin exponer la tabla completa.
-- Para MVP: page.tsx usa el cliente autenticado — RLS admin_manage_invitations
-- cubre solo admins. Para la validación de join, usar una función SECURITY DEFINER:

CREATE OR REPLACE FUNCTION validate_invitation_token(p_token text)
RETURNS TABLE(id uuid, community_id uuid, used_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, community_id, used_at
  FROM invitation_links
  WHERE token = p_token
  LIMIT 1;
$$;

-- Revocar acceso directo de SELECT a invitation_links para roles no-admin
-- La función SECURITY DEFINER ejecuta con privilegios del owner (postgres/service_role)
-- y solo expone los campos necesarios para validar un token específico.

-- CR3-F2: GRANT EXECUTE para que el rol authenticated pueda llamar la función RPC.
-- PostgreSQL no hereda EXECUTE automáticamente — sin este GRANT, el RPC falla con
-- "permission denied for function validate_invitation_token" en producción.
GRANT EXECUTE ON FUNCTION validate_invitation_token(text) TO authenticated;

-- CR3-F1: Policy RLS para que un usuario autenticado pueda invalidar (UPDATE used_at)
-- su propio token de invitación. La política admin_manage_invitations solo cubre admins.
-- Sin esta policy, el UPDATE de used_at falla silenciosamente — AC-2 violado (token reutilizable).
CREATE POLICY "use_invitation"
  ON invitation_links FOR UPDATE
  USING (auth.uid() IS NOT NULL AND used_at IS NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
