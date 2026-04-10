-- Migration 013: FK de feedbacks.reviewer_id a profiles(id)
-- Permite que PostgREST resuelva el JOIN profiles:reviewer_id en findByProject()
-- Profiles siempre existen cuando hay feedbacks (trigger on_auth_user_created los crea al registrar)

ALTER TABLE feedbacks
  ADD CONSTRAINT feedbacks_reviewer_profiles_fkey
  FOREIGN KEY (reviewer_id) REFERENCES profiles(id) ON DELETE CASCADE;
