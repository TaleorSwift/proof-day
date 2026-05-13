-- Migration 034: Storage bucket for community images
-- Community Image Upload — upload file + URL download to own storage

INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: solo el creador puede subir imágenes a su propio espacio
-- Path: {userId}/{communityId | "temp"}/{filename}
CREATE POLICY "user_upload_community_images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: cualquiera puede leer imágenes de comunidad (son públicas)
CREATE POLICY "public_read_community_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

-- Policy: solo el propietario puede eliminar sus imágenes
CREATE POLICY "user_delete_community_images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
