# Story 8.7: Project Detail — Layout y contenido

Status: dev-complete

## Story

Como visitante o miembro de una comunidad,
quiero ver la página de detalle de un proyecto con un layout claro, la información del autor y todas las secciones de contenido bien estructuradas,
para entender el proyecto en profundidad y decidir si quiero dar feedback.

## Acceptance Criteria

1. La página muestra un `BackButton` con label "← Volver al feed" que enlaza a `/communities/[slug]`.
2. El header incluye: título del proyecto (`h1`), `StatusBadge` con el estado actual, y `UserAvatar` del autor (con `showName=true`) obtenido desde la tabla `profiles`.
3. Si el proyecto tiene `image_urls` con al menos una URL, la primera imagen se muestra como imagen destacada grande (`object-fit: cover`, ancho completo, altura máxima 480px) con `next/image`. Las imágenes adicionales (si las hay) se muestran en una galería secundaria debajo.
4. Las secciones Problema, Solución e Hipótesis siempre se muestran (son campos obligatorios).
5. La sección "Usuario objetivo" se muestra solo si `target_user` tiene valor (no null, no cadena vacía).
6. La sección "Ver demo" se muestra solo si `demo_url` tiene valor; el enlace abre en nueva pestaña con `rel="noopener noreferrer"` y muestra el texto "Ver demo" (no la URL cruda).
7. La sección "Temas de feedback" se muestra solo si `feedback_topics` es un array no vacío; cada tema se renderiza con el componente `ContentTag` (variant `default`).
8. El sidebar de feedback (builder) y el botón "Dar feedback" (no-builder, live) permanecen sin cambios funcionales.
9. El `UserAvatar` del autor se obtiene usando el nombre del perfil (`profiles.name`); si el perfil no existe o `name` es null, se usa el email del usuario como fallback (no bloquea el render).
10. La imagen destacada usa `next/image` con `priority` (es LCP). Las imágenes secundarias no llevan `priority`.

## Tasks / Subtasks

- [x] Task 1 — Test E2E (skip) para página de detalle (AC: 1, 2, 3, 5, 6, 7)
  - [x] Crear `tests/e2e/projects/projectDetail.spec.ts` con `test.skip` (misma convención que `projectCard.spec.ts`)
  - [x] Cubrir: BackButton visible, h1 con título, StatusBadge, UserAvatar del autor, imagen destacada, secciones opcionales con/sin valor

- [x] Task 2 — Tests unitarios para lógica de presentación (AC: 5, 6, 7, 9)
  - [x] Crear `tests/unit/projects/ProjectDetailSections.test.tsx`
  - [x] Test: sección `target_user` no se renderiza si el campo es null o vacío
  - [x] Test: sección `demo_url` no se renderiza si el campo es null; sí se renderiza con href correcto y `target="_blank"` si tiene valor
  - [x] Test: sección `feedback_topics` no se renderiza si el array es null o vacío; sí se renderiza un `ContentTag` por cada elemento
  - [x] Test: fallback de nombre del autor (null profile → email parcial)

- [x] Task 3 — Consulta del perfil del autor en el Server Component (AC: 2, 9)
  - [x] En `page.tsx`, después de obtener el proyecto, consultar `profiles` via `createProfilesRepository(supabase).findByIdForWidget(project.builder_id)`
  - [x] Derivar `authorName`: `profile?.name ?? user.email?.split('@')[0] ?? 'Autor'` (solo si el viewer ES el builder se reutiliza `user`; si no, la consulta de perfil es la única fuente)
  - [x] IMPORTANTE: el fallback de email solo aplica cuando el builder es el usuario autenticado. Para proyectos de otros builders, el fallback es simplemente `'Autor'`

- [x] Task 4 — Refactor del header en `page.tsx` (AC: 1, 2)
  - [x] Añadir `BackButton` encima del bloque header con `href={`/communities/${slug}`}`
  - [x] Añadir `UserAvatar` con `name={authorName}` y `showName={true}` en el header, debajo del título y StatusBadge
  - [x] Respetar diseño existente (flexbox, gap tokens, no romper el layout grid de columna principal + sidebar)

- [x] Task 5 — Imagen destacada con `next/image` (AC: 3, 10)
  - [x] Reemplazar el bloque `<img>` actual por `next/image` via `ProjectDetailFeaturedImage`
  - [x] La primera imagen: `priority`, `fill` con contenedor de altura fija (480px)
  - [x] Dominio Supabase ya presente en `next.config.ts` → no requirió cambio
  - [x] Imágenes adicionales (índice > 0): misma implementación sin `priority`

- [x] Task 6 — Sección "Ver demo" (AC: 6)
  - [x] Sustituir el render actual de `demo_url` (que mostraba la URL cruda) por un `<a>` con texto "Ver demo" y atributos `target="_blank" rel="noopener noreferrer"`
  - [x] Usar token `var(--color-accent)` para el color del enlace

- [x] Task 7 — Sección "Temas de feedback" con `ContentTag` (AC: 7)
  - [x] Sustituir el render actual de `<li>` con estilos inline por `ContentTag` con `variant="default"` para cada topic
  - [x] La key es `topic` (strings únicos por diseño del dominio)

- [x] Task 8 — Verificar `next.config.ts` para imágenes remotas (AC: 10, prerequisito Task 5)
  - [x] `next.config.ts` ya tenía `*.supabase.co` en `images.remotePatterns` — sin cambios necesarios

## Dev Notes

### Contexto de la página actual

La página `app/(app)/communities/[slug]/projects/[id]/page.tsx` es un Server Component. Ya consulta directamente a Supabase sin usar el repositorio. La Story 8.7 **no migra** la consulta principal al repositorio — eso es trabajo de refactor posterior. Solo añade la consulta de perfil del autor via `createProfilesRepository`.

Los campos `target_user`, `demo_url` y `feedback_topics` ya se seleccionan en la query existente (línea 28 de `page.tsx`) y ya existen en `ProjectRow` / `Project`. Ya hay lógica parcial de render para estos campos — la story la **refina** (demo_url → texto "Ver demo"; feedback_topics → usa `ContentTag`; imagen → `next/image`).

### Componentes disponibles — NO reinventar

| Componente | Path | Props relevantes |
|---|---|---|
| `BackButton` | `components/shared/BackButton.tsx` | `href`, `label` |
| `UserAvatar` | `components/shared/UserAvatar.tsx` | `name`, `size`, `showName` |
| `StatusBadge` | `components/projects/StatusBadge.tsx` | `status: ProjectStatus` |
| `ContentTag` | `components/shared/ContentTag.tsx` | `label`, `variant: 'default' \| 'outline'` |

`UserAvatar` genera el color del avatar con hash del nombre y muestra la inicial. No tiene soporte para `avatar_url` — se usa solo con el `name` del perfil.

### Repositorio de perfiles

`createProfilesRepository(supabase).findByIdForWidget(id)` devuelve `{ id, name, avatar_url }`. Usar este método (no `findById` completo) para minimizar la superficie de datos.

```ts
// Patrón a seguir en page.tsx:
const { data: builderProfile } = await createProfilesRepository(supabase)
  .findByIdForWidget(project.builder_id)
const authorName = builderProfile?.name ?? 'Autor'
```

### `next/image` — configuración remota

Verificar `next.config.ts`. Si el dominio de Supabase Storage no está en `remotePatterns`, añadir:

```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
},
```

El bucket se llama `project-images` (constante `PROJECT_IMAGES_BUCKET` en `lib/types/projects.ts`).

### TDD Outside-In — orden de implementación

1. Test E2E (`test.skip`) — define los `data-testid` esperados
2. Tests unitarios para secciones opcionales — red antes de implementar
3. Implementación Task 3 (consulta perfil) → Task 4 (header) → Task 5 (imagen) → Task 6 (demo) → Task 7 (tags)
4. Tests en verde → pasar a CR

### Design tokens obligatorios

Todos los estilos inline deben usar variables CSS de `docs/project/design-tokens.md`. No valores hex hardcoded. Tokens relevantes para esta story:

- `--color-accent` para el enlace "Ver demo"
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- `--space-*` para gaps y padding
- `--radius-*` para bordes redondeados
- `--text-*` para tamaños de fuente

### Sección hipótesis — patrón visual existente

La sección Hipótesis ya usa el patrón "en juego" con `var(--color-hypothesis-bg)` y `var(--color-hypothesis-border)`. No modificar ese estilo.

### Regresiones a evitar

- El sidebar de feedback (`ProofScoreSidebar`, `FeedbackList`, `FeedbackCounter`) no se toca.
- `ProjectStateActions` (acciones de estado para el builder) no se toca.
- `DraftBanner` e `InactiveBanner` no se tocan.
- El botón "Editar" y `FeedbackButton` no se tocan.
- El grid layout (`isOwner ? '2 columnas' : '1 columna'`) no cambia.

### `data-testid` a añadir (para E2E)

| testid | Elemento |
|---|---|
| `project-detail-back-button` | `BackButton` |
| `project-detail-title` | `h1` con el título |
| `project-detail-author-avatar` | contenedor del `UserAvatar` del autor |
| `project-detail-featured-image` | imagen destacada (primera) |
| `project-detail-section-target-user` | sección "Usuario objetivo" |
| `project-detail-section-demo` | sección "Ver demo" |
| `project-detail-section-feedback-topics` | sección "Temas de feedback" |

### Project Structure Notes

- Page: `app/(app)/communities/[slug]/projects/[id]/page.tsx` — único fichero a modificar en app/
- Tests E2E: `tests/e2e/projects/projectDetail.spec.ts` — nuevo fichero
- Tests unit: `tests/unit/projects/ProjectDetailSections.test.tsx` — nuevo fichero
- Config imágenes: `next.config.ts` — posible modificación si el pattern no existe
- No se crean nuevos componentes reutilizables en esta story (la page no es un componente reutilizable)

### References

- Layout actual: `app/(app)/communities/[slug]/projects/[id]/page.tsx`
- Tipos de proyecto: `lib/types/projects.ts` — `ProjectRow`, `Project`, `PROJECT_IMAGES_BUCKET`
- Repositorio de perfiles: `lib/repositories/profiles.repository.ts` — `findByIdForWidget`
- Tipos de perfiles: `lib/types/profiles.ts` — `Profile`
- Design tokens: `docs/project/design-tokens.md`
- Patrón E2E (convención test.skip): `tests/e2e/projects/projectCard.spec.ts`
- `BackButton`: `components/shared/BackButton.tsx`
- `UserAvatar`: `components/shared/UserAvatar.tsx`
- `ContentTag`: `components/shared/ContentTag.tsx`
- `StatusBadge`: `components/projects/StatusBadge.tsx`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Task 8 completada sin cambios de código: `next.config.ts` ya tenía `*.supabase.co` en `remotePatterns`.
- Creado `components/projects/ProjectDetailSections.tsx` con 5 componentes de presentación puros (ProjectDetailAuthor, ProjectDetailFeaturedImage, ProjectDetailTargetUser, ProjectDetailDemo, ProjectDetailFeedbackTopics) para habilitar tests unitarios sin mocks de Server Components.
- 23 tests unitarios pasando + 293 total sin regresiones. TypeScript sin errores.
- `data-testid` añadidos según tabla de la story: `project-detail-back-button`, `project-detail-title`, `project-detail-author-avatar`, `project-detail-featured-image`, `project-detail-section-target-user`, `project-detail-section-demo`, `project-detail-section-feedback-topics`.

### File List

- `app/(app)/communities/[slug]/projects/[id]/page.tsx` — modificado (BackButton, UserAvatar autor, next/image via secciones, demo "Ver demo", ContentTag topics)
- `components/projects/ProjectDetailSections.tsx` — creado (componentes de presentación puros)
- `tests/unit/projects/ProjectDetailSections.test.tsx` — creado (23 tests unitarios)
- `tests/e2e/projects/projectDetail.spec.ts` — creado (9 tests E2E con test.skip)
- `_bmad-output/implementation-artifacts/story-8-7-project-detail-layout.md` — actualizado (status + tasks)
