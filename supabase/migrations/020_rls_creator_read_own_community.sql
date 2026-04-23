-- Fix: creación de comunidad falla por race condition entre INSERT y SELECT RLS
--
-- Contexto:
--   El método create() en communities.repository.ts hace .insert().select().single().
--   El INSERT pasa la policy "authenticated_insert_community" (auth.uid() = created_by).
--   Pero el .select() encadenado falla: la policy "members_read_own_community"
--   (migración 006) exige que el usuario esté en community_members, tabla que
--   aún no se ha poblado (addMember() se llama después del insert+select).
--   Resultado: la comunidad se crea en BD pero la API devuelve 500 y nunca
--   registra la membresía del creador, dejando una fila huérfana.
--
-- Fix:
--   Añadir una policy SELECT que permita al creador leer sus propias comunidades,
--   independientemente de si ya existe su fila en community_members.

CREATE POLICY "creator_read_own_community"
  ON communities FOR SELECT
  USING (auth.uid() = created_by);
