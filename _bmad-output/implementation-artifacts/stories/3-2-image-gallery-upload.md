# Story 3.2: Image Gallery Upload

Status: ready-for-dev

## Story

Como Builder,
quiero poder subir entre 1 y 5 imágenes a mi proyecto,
para que la comunidad tenga contexto visual de mi idea.

## Acceptance Criteria

1. Upload de 1 a 5 imágenes por proyecto (FR13)
2. Formatos aceptados: JPG, PNG, WebP
3. Tamaño máximo por imagen: 5MB
4. Preview inmediato tras selección (antes de guardar)
5. Imágenes ordenables mediante flechas (↑ ↓) o drag & drop
6. Imagen principal: la primera de la lista — usada como imagen destacada en `ProjectCard`
7. Al eliminar imagen: confirmación inline (no Dialog), solo si hay más de 1
8. Imágenes guardadas en Supabase Storage, bucket `project-images`
9. Error inline si se supera el límite de 5 imágenes
10. `ImageGallery` reemplaza el campo de URL strings de Story 3-1 en `ProjectForm`

## Rejection Criteria

- NO usar Server Actions — toda mutación va por API Route
- NO hardcodear bucket name — usar constante `PROJECT_IMAGES_BUCKET`
- NO permitir subir imágenes a proyectos que no sean del usuario autenticado
- NO guardar URLs absolutas en DB — guardar paths relativos al bucket (`{projectId}/{filename}`)
- NO pedir confirmación en Dialog externo — inline dentro del componente

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/3-2-image-gallery-upload`

- [ ] **T2: Supabase Storage bucket `project-images`**
  - [ ] Crear migración o script para el bucket:
    ```sql
    -- supabase/migrations/00Y_storage_project_images.sql
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-images', 'project-images', true);

    -- Policy: solo el builder puede subir a su propio proyecto
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

    -- Policy: solo el builder puede eliminar sus imágenes
    CREATE POLICY "builder_delete_project_images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'project-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
    ```
  - [ ] **Nota:** Si no es posible via SQL migration, configurar manualmente en Supabase Dashboard y documentarlo en la story

- [ ] **T3: Constante y tipos**
  - [ ] Añadir a `lib/types/projects.ts`:
    ```typescript
    export const PROJECT_IMAGES_BUCKET = 'project-images'

    export interface ProjectImage {
      id: string          // filename en Storage
      url: string         // URL pública
      path: string        // path relativo en Storage: {userId}/{projectId}/{filename}
      order: number
    }
    ```

- [ ] **T4: API Route POST /api/projects/[id]/images — upload** (AC: 1-3, 8)
  - [ ] Crear `app/api/projects/[id]/images/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { createClient } from '@/lib/supabase/server'
    import { PROJECT_IMAGES_BUCKET } from '@/lib/types/projects'

    export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { id: projectId } = await params

      // Verificar que el proyecto es del builder
      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id, image_urls, status')
        .eq('id', projectId)
        .single()

      if (!project) return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
      if (project.builder_id !== user.id) return NextResponse.json({ error: 'Sin permiso', code: 'PROJECT_FORBIDDEN' }, { status: 403 })
      if (project.image_urls.length >= 5) return NextResponse.json(
        { error: 'Límite de 5 imágenes alcanzado', code: 'PROJECT_IMAGES_LIMIT' }, { status: 422 }
      )

      const formData = await request.formData()
      const file = formData.get('file') as File
      if (!file) return NextResponse.json({ error: 'Archivo requerido', code: 'VALIDATION_ERROR' }, { status: 400 })

      // Validar formato y tamaño
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
      const MAX_SIZE = 5 * 1024 * 1024 // 5MB
      if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json(
        { error: 'Formato no válido. Usa JPG, PNG o WebP', code: 'VALIDATION_ERROR' }, { status: 400 }
      )
      if (file.size > MAX_SIZE) return NextResponse.json(
        { error: 'La imagen no puede superar 5MB', code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const path = `${user.id}/${projectId}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(PROJECT_IMAGES_BUCKET)
        .upload(path, file)

      if (uploadError) return NextResponse.json(
        { error: 'Error al subir la imagen', code: 'STORAGE_UPLOAD_ERROR' }, { status: 500 }
      )

      const { data: { publicUrl } } = supabase.storage
        .from(PROJECT_IMAGES_BUCKET)
        .getPublicUrl(path)

      // Añadir URL al array de imágenes del proyecto
      const newImageUrls = [...project.image_urls, publicUrl]
      await supabase.from('projects').update({ image_urls: newImageUrls }).eq('id', projectId)

      return NextResponse.json({ data: { url: publicUrl, path } }, { status: 201 })
    }
    ```

- [ ] **T5: API Route DELETE /api/projects/[id]/images — eliminar** (AC: 7)
  - [ ] Añadir `DELETE` handler a `app/api/projects/[id]/images/route.ts`:
    ```typescript
    export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

      const { id: projectId } = await params
      const { path, url } = await request.json()

      const { data: project } = await supabase
        .from('projects')
        .select('id, builder_id, image_urls')
        .eq('id', projectId)
        .single()

      if (!project || project.builder_id !== user.id) return NextResponse.json(
        { error: 'Sin permiso', code: 'PROJECT_FORBIDDEN' }, { status: 403 }
      )

      // Eliminar de Storage
      await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path])

      // Actualizar array de URLs
      const newImageUrls = project.image_urls.filter((u: string) => u !== url)
      await supabase.from('projects').update({ image_urls: newImageUrls }).eq('id', projectId)

      return NextResponse.json({ success: true })
    }
    ```

- [ ] **T6: API Route PATCH /api/projects/[id]/images/reorder** (AC: 5)
  - [ ] Crear `app/api/projects/[id]/images/reorder/route.ts`:
    ```typescript
    // PATCH — recibe array de URLs en el nuevo orden
    export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
      // Verificar auth + ownership
      // Validar que imageUrls es array de max 5 strings
      // Actualizar projects.image_urls con el nuevo orden
    }
    ```

- [ ] **T7: Typed client wrappers para imágenes**
  - [ ] Añadir a `lib/api/projects.ts`:
    ```typescript
    export async function uploadProjectImage(projectId: string, file: File): Promise<{ url: string; path: string }> {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/projects/${projectId}/images`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return (await res.json()).data
    }

    export async function deleteProjectImage(projectId: string, path: string, url: string): Promise<void> {
      const res = await fetch(`/api/projects/${projectId}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, url }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    }

    export async function reorderProjectImages(projectId: string, imageUrls: string[]): Promise<void> {
      const res = await fetch(`/api/projects/${projectId}/images/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
    }
    ```

- [ ] **T8: Componente ImageUpload** (AC: 1-4)
  - [ ] Crear `components/projects/ImageUpload.tsx` — Client Component:
    - Input tipo `file` accept=`image/jpeg,image/png,image/webp`
    - Preview inmediato usando `URL.createObjectURL(file)` antes del upload real
    - Estado visual: zona de drop + "Seleccionar imagen"
    - Al seleccionar: llama a `uploadProjectImage()`, muestra loading
    - Error inline si formato o tamaño inválidos
    - Deshabilitar si ya hay 5 imágenes

- [ ] **T9: Componente ImageGallery** (AC: 4-7, 10)
  - [ ] Crear `components/projects/ImageGallery.tsx` — Client Component:
    - Recibe `images: { url: string; path: string }[]` + `projectId: string` + `isEditable: boolean`
    - Muestra thumbnails 80×80px con overlay de controles (↑ ↓ subir orden, ✕ eliminar)
    - Confirmación inline al eliminar: texto "¿Eliminar?" con "Sí / No" bajo la imagen
    - Drag & drop opcional (si no se implementa, las flechas son suficientes para MVP)
    - Al reordenar: llama a `reorderProjectImages()`
    - Botón "Añadir imagen" visible si hay < 5 imágenes → abre `ImageUpload`

- [ ] **T10: Integrar ImageGallery en ProjectForm** (AC: 10)
  - [ ] Actualizar `components/projects/ProjectForm.tsx`:
    - Reemplazar el campo de URL strings por `<ImageGallery projectId={projectId} isEditable={true} />`
    - **Nota:** En modo CREATE, el proyecto debe crearse primero (con image_urls vacío), luego se suben las imágenes y se hace redirect. O alternativamente crear el proyecto y permitir editar imágenes en el flujo de edición inmediata.
    - **Decisión simplificada para MVP:** En modo create, imageUrls = [] al crear (se acepta AC con al menos 1 imagen subida antes de publicar en Story 3-3). En modo edit, ImageGallery gestiona upload/delete.

- [ ] **T11: Tests unitarios** (AC: 2, 3)
  - [ ] Crear `tests/unit/projects/imageValidation.test.ts`:
    - Validar que solo JPG, PNG, WebP son aceptados
    - Validar que archivos > 5MB son rechazados
    - Validar que no se pueden añadir más de 5 imágenes
    - Validar reordenamiento de array de URLs
    - Al menos 4 tests

- [ ] **T12: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(projects): add image gallery upload to project`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `3-2-image-gallery-upload: review`

## Dev Notes

### Dependencias

- **Prerrequisito obligatorio:** Story 3-1 completada (tabla `projects` debe existir)
- **Story 3-3** usará `image_urls[0]` como imagen destacada en `ProjectCard`

### Patrón de Storage — paths

```
{userId}/{projectId}/{timestamp}.{ext}
```
- `userId` como primer segmento permite al RLS verificar ownership
- Nunca exponer `SERVICE_ROLE_KEY` al cliente — los uploads van siempre por API Route
- URLs públicas: `https://{project}.supabase.co/storage/v1/object/public/project-images/{path}`

### Decisión sobre imagen en modo create

En modo CREATE, el formulario crea primero el proyecto (con `image_urls = []`), luego redirige a la vista de edición donde el builder puede subir las imágenes. La validación "mínimo 1 imagen" se aplica en el momento de **publicar** (Story 3-3), no en el momento de crear el draft. Esto simplifica el flujo y evita race conditions.

### References

- [Source: epic-3-proyectos.md#Story 3.2] — ACs y notas técnicas
- [Source: architecture.md#Authentication & Security] — Storage RLS policy pattern
- [Source: stories/3-1-create-edit-project-draft.md] — estructura de projects table, ProjectForm

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
