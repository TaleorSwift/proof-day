-- Migration 007: Storage bucket for project images
-- Story 3.2 — Image Gallery Upload

-- Create storage bucket for project images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: solo el builder puede subir imágenes a su propio espacio
-- El path sigue el patrón {userId}/{projectId}/{filename}
-- El primer segmento del path debe coincidir con el uid del builder
CREATE POLICY "builder_upload_project_images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: cualquiera puede leer imágenes de proyectos (son públicas)
CREATE POLICY "public_read_project_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

-- Policy: solo el builder puede eliminar sus propias imágenes
CREATE POLICY "builder_delete_project_images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
