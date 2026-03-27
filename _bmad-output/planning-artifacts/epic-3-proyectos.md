# Epic 3: Proyectos

**Estado:** backlog
**Objetivo:** Ciclo completo de vida de un proyecto: el Builder crea, refina y publica su idea.
**FRs cubiertos:** FR9, FR10, FR11, FR12, FR13, FR14, FR15
**Valor entregado:** Un Builder puede crear un proyecto, añadir imágenes, refinarlo en Draft y publicarlo para recibir feedback.

---

## Story 3.1: Create & Edit Project (Draft)

**Como** Builder,
**quiero** poder crear un proyecto en Draft con título, descripción del problema, solución propuesta, hipótesis e imágenes,
**para que** pueda refinar mi idea antes de exponerla a la comunidad.

### Criterios de Aceptación

- [ ] Botón "Nuevo proyecto" visible en `/communities/[slug]` para usuarios autenticados (FR9)
- [ ] Pantalla `/communities/[slug]/projects/new` con campos: título (obligatorio), descripción del problema (obligatorio), solución propuesta (obligatorio), hipótesis (obligatorio, 1 campo), imágenes (1-5, obligatorio)
- [ ] Proyecto se crea en estado Draft — solo visible para el Builder (FR15)
- [ ] Builder puede editar todos los campos mientras está en Draft (FR10)
- [ ] Ruta de edición: `/communities/[slug]/projects/[id]/edit`
- [ ] Banner en vista de proyecto Draft: "En borrador — no visible para la comunidad"
- [ ] Validación inline: campos obligatorios vacíos, límite de imágenes
- [ ] Proyecto Draft aparece en la lista del Builder con badge "Borrador"

### Notas Técnicas

- `app/communities/[slug]/projects/new/page.tsx`
- `app/communities/[slug]/projects/[id]/edit/page.tsx`
- `app/api/projects/route.ts` — POST (crear)
- `app/api/projects/[id]/route.ts` — PUT (editar)
- `lib/api/projects.ts` — typed client wrappers
- Tabla `projects`: id, community_id, builder_id, title, problem, solution, hypothesis, status, created_at

---

## Story 3.2: Image Gallery Upload

**Como** Builder,
**quiero** poder subir entre 1 y 5 imágenes a mi proyecto,
**para que** la comunidad tenga contexto visual de mi idea.

### Criterios de Aceptación

- [ ] Upload de 1 a 5 imágenes por proyecto (FR13)
- [ ] Formatos aceptados: JPG, PNG, WebP
- [ ] Tamaño máximo por imagen: 5MB
- [ ] Preview inmediato tras upload (antes de guardar)
- [ ] Imágenes ordenables (drag & drop o flechas)
- [ ] Imagen principal: la primera de la lista
- [ ] Al eliminar imagen: confirmación inline (no dialog)
- [ ] Imágenes guardadas en Supabase Storage
- [ ] Error inline si se supera el límite de 5

### Notas Técnicas

- Supabase Storage bucket: `project-images` (public read, auth write)
- `app/api/projects/[id]/images/route.ts` — POST upload, DELETE remove
- `components/projects/ImageGallery.tsx` — galería interactiva
- `components/projects/ImageUpload.tsx` — zona de upload con preview
- RLS en Storage: solo el Builder puede subir/eliminar en su proyecto

---

## Story 3.3: Publish & Manage Project States

**Como** Builder,
**quiero** poder publicar mi proyecto (Draft → Live) y marcarlo como inactivo cuando lo decida,
**para que** controle la visibilidad de mi idea y el flujo de feedback.

### Criterios de Aceptación

- [ ] Botón "Publicar" en vista Draft → cambia estado a Live (FR11)
- [ ] Confirmación antes de publicar: "¿Listo para compartir con tu comunidad?" (no Dialog — toast o inline banner)
- [ ] Proyecto Live visible para todos los miembros de la comunidad (FR14)
- [ ] Botón "Marcar como inactivo" disponible para el Builder en proyectos Live (FR12)
- [ ] Proyecto Inactive: banner "Proyecto inactivo", feedback bloqueado
- [ ] Proyecto Inactive visible para la comunidad (FR14) con badge "Inactivo"
- [ ] No se puede volver de Inactive a Live en MVP (fuera de alcance)
- [ ] Estado del proyecto actualizado en tiempo real al navegar (sin WebSocket)

### Criterios de Rechazo

- [ ] NO debe ser posible para el Reviewer enviar feedback en proyectos Draft o Inactive (FR19)

### Notas Técnicas

- `app/api/projects/[id]/status/route.ts` — PATCH para cambio de estado
- `lib/api/projects.ts` — `publishProject()`, `deactivateProject()`
- Enum `project_status`: 'draft' | 'live' | 'inactive'
- RLS: `project_status = 'live' OR project_status = 'inactive'` para query de miembros

---

## Story 3.4: Project List View in Community

**Como** miembro de una comunidad,
**quiero** ver todos los proyectos Live e Inactive de mi comunidad en una lista organizada,
**para que** pueda explorar y dar feedback a las ideas de mis compañeros.

### Criterios de Aceptación

- [ ] `/communities/[slug]` muestra grid de proyectos Live e Inactive accesibles a miembros (FR14)
- [ ] Builder también ve sus proyectos Draft (FR15) con badge diferenciado
- [ ] ProjectCard muestra: imagen destacada, título, badge de estado, contador de feedbacks, Proof Score (si disponible)
- [ ] Grid 3 columnas desktop / 2 columnas tablet
- [ ] Empty state si no hay proyectos Live: "Esta comunidad no tiene proyectos aún" + CTA
- [ ] Proyectos ordenados por fecha de publicación (más recientes primero)
- [ ] Skeleton loading mientras carga

### Notas Técnicas

- `app/communities/[slug]/page.tsx` — Server Component con fetch inicial
- `components/projects/ProjectCard.tsx` — custom component
- `app/api/projects/route.ts` — GET con communityId filter
- `lib/api/projects.ts` — `getProjects(communityId)`
