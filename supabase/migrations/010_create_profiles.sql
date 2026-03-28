-- Story 6.1: User Profile (View & Edit)
-- Tabla profiles + trigger de creación automática + RLS

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text,
  bio         text,
  interests   text[] DEFAULT '{}',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger para crear perfil vacío al registrar usuario
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios de la misma comunidad pueden verse entre sí
CREATE POLICY "community_members_read_profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR auth.uid() IN (
      SELECT cm1.user_id
      FROM community_members cm1
      JOIN community_members cm2 ON cm1.community_id = cm2.community_id
      WHERE cm2.user_id = profiles.id
    )
  );

-- Cada usuario edita solo su propio perfil
CREATE POLICY "user_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
