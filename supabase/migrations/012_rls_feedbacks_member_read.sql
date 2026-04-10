-- Migration: 012_rls_feedbacks_member_read.sql
-- Story 8.9 — TeamPerspectives: feedbacks públicos para miembros de la comunidad
--
-- Añade una tercera policy SELECT en feedbacks que permite a cualquier miembro
-- autenticado de la comunidad del proyecto leer todos sus feedbacks.
--
-- Policies existentes (NO se eliminan):
--   - builder_read_project_feedbacks: el builder lee los feedbacks de sus proyectos
--   - reviewer_read_own_feedbacks: el reviewer lee sus propios feedbacks
--
-- Nueva policy:
--   - member_read_community_feedbacks: cualquier miembro de la comunidad lee
--     todos los feedbacks de los proyectos de esa comunidad.
--
-- Patrón EXISTS con JOIN (más eficiente que IN) — consistente con migration 006.

CREATE POLICY "member_read_community_feedbacks"
  ON public.feedbacks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.community_members cm
      JOIN public.projects p ON p.community_id = cm.community_id
      WHERE p.id = feedbacks.project_id
        AND cm.user_id = auth.uid()
    )
  );
