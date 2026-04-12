# Story 9.8: Modal "Lanzar idea" — Dialog completo con tagline, chips de feedback y subida de imágenes

Status: ready-for-dev

## Story

Como Builder,
quiero lanzar una nueva idea desde un modal en el feed sin abandonar la página,
para publicar mi proyecto con todos los campos relevantes (tagline, hipótesis, imágenes, chips de feedback) y empezar a recibir validación inmediatamente.

## Acceptance Criteria

1. **[AC-1]** Dado que el usuario hace clic en el botón "+ Lanzar idea" del header del feed, cuando el modal se abre, entonces:
   - Aparece un `Dialog` centrado de ~540px de ancho con scroll interno.
   - El header del dialog muestra el título "Lanzar una nueva idea".
   - El fondo queda oscurecido (overlay estándar de shadcn Dialog).
   - El modal es closeable con la X superior, la tecla Escape y el botón "Cancelar".

2. **[AC-2]** Dado que el modal está abierto, cuando el usuario inspecciona el formulario, entonces existen los siguientes campos en orden:
   - **Project name** (required) — input texto, `placeholder="ej. Pulse Check"`, `data-testid="modal-field-title"`.
   - **Tagline** (required) — input texto, `placeholder="Una frase que capture tu idea"`, `data-testid="modal-field-tagline"`.
   - **¿Qué problema resuelve esto?** (required) — textarea, `data-testid="modal-field-problem"`.
   - **¿Cuál es tu solución propuesta?** (required) — textarea, `data-testid="modal-field-solution"`.
   - **¿Quién es el usuario objetivo?** (optional) — input texto, `data-testid="modal-field-target-user"`.
   - **🚀 Hipótesis a validar** (required) — textarea, `placeholder="Si [acción], entonces [resultado]…"`, `data-testid="modal-field-hypothesis"`.
   - **Enlace de demo (opcional)** — input URL, `data-testid="modal-field-demo-link"`.
   - **Imágenes (hasta 3)** — uploader con botón "Añadir imagen", `data-testid="modal-field-images"`. Muestra previews de las imágenes añadidas. Máximo 3; el botón se desactiva al llegar al límite.
   - **¿Qué feedback buscas?** — chips toggleables, `data-testid="modal-feedback-chips"` (ver AC-3).

3. **[AC-3]** Dado que el usuario interactúa con los chips de feedback, cuando hace clic en un chip, entonces:
   - El chip alterna entre activo (fondo naranja, texto blanco) e inactivo (fondo `var(--color-surface)`, borde `var(--color-border)`).
   - Los chips disponibles son exactamente: `"Claridad del problema"`, `"Disposición de uso"`, `"Viabilidad técnica"`, `"Funcionalidades faltantes"`, `"Ajuste de mercado"`, `"Problemas de UX"`.
   - El estado de cada chip se refleja en `aria-pressed` para accesibilidad.
   - Se pueden seleccionar múltiples chips simultáneamente.

4. **[AC-4]** Dado que el usuario completa los campos requeridos y hace clic en "+ Lanzar proyecto", cuando el submit es exitoso, entonces:
   - El proyecto se crea en base de datos con `status = 'live'` directamente (publicado, no draft).
   - Los campos `title`, `tagline`, `problem`, `solution`, `target_user`, `hypothesis`, `demo_link`, `image_urls`, `feedback_topics` se persisten con los valores del formulario.
   - El modal se cierra.
   - El feed se revalida (los proyectos se actualizan sin recarga de página completa).
   - Aparece un toast de confirmación "¡Idea lanzada! Ya está recibiendo feedback."

5. **[AC-5]** Dado que el usuario intenta hacer submit con campos requeridos vacíos, cuando hace clic en "+ Lanzar proyecto", entonces:
   - El formulario muestra mensajes de error inline bajo cada campo inválido.
   - El submit no se ejecuta hasta que todos los campos requeridos estén completos.
   - Los campos con error tienen `aria-invalid="true"`.

6. **[AC-6]** Dado que el usuario sube imágenes, cuando selecciona archivos en el uploader, entonces:
   - Solo se aceptan archivos de imagen (`image/*`).
   - Cada imagen se sube a Supabase Storage (bucket `project-images`) antes del submit.
   - Las URLs resultantes se incluyen en `image_urls` al crear el proyecto.
   - Si hay error en la subida, se muestra mensaje de error y no se bloquea el resto del formulario.

7. **[AC-7]** Dado que la ruta `/communities/[slug]/projects/new` existe actualmente como página independiente, cuando se implementa el modal, entonces:
   - La ruta `/communities/[slug]/projects/new` se mantiene como fallback (no se elimina).
   - El botón "+ Lanzar idea" del feed abre el modal en lugar de navegar a la ruta.

8. **[AC-8]** Dado que ejecuto `npm run storybook`, cuando navego a `"projects/LaunchIdeaModal"`, entonces existen stories: `EstadoVacio`, `ConDatosRellenos`, `EstadoCargando`, `ChipsSeleccionados`.

9. **[AC-9]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes (≥384 tests pasando).

## Tasks / Subtasks

- [ ] **T1** — Crear `components/projects/LaunchIdeaModal.tsx` (componente Dialog principal)
  - [ ] T1.1 Estructura Dialog (shadcn/ui `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`)
  - [ ] T1.2 Ancho ~540px, scroll interno (`overflow-y: auto` en `DialogContent`)
  - [ ] T1.3 Footer con botones "Cancelar" (secundario) y "+ Lanzar proyecto" (naranja, `var(--color-accent)`)
  - [ ] T1.4 Prop `communitySlug: string` para saber en qué comunidad crear el proyecto
  - [ ] T1.5 Prop `onSuccess?: () => void` para callback post-submit (permite al feed revalidar)

- [ ] **T2** — Crear `components/projects/LaunchIdeaForm.tsx` (formulario interno, separado para testabilidad)
  - [ ] T2.1 Campos: title, tagline, problem, solution, target_user, hypothesis, demo_link
  - [ ] T2.2 Validación con react-hook-form + zod (mismos patrones que el resto del proyecto)
  - [ ] T2.3 Mensajes de error inline bajo cada campo requerido
  - [ ] T2.4 `data-testid` en cada campo (ver AC-2)

- [ ] **T3** — Crear `components/projects/FeedbackTopicChips.tsx` (chips toggleables reutilizables)
  - [ ] T3.1 Props: `value: string[]`, `onChange: (topics: string[]) => void`
  - [ ] T3.2 Chips: `["Claridad del problema", "Disposición de uso", "Viabilidad técnica", "Funcionalidades faltantes", "Ajuste de mercado", "Problemas de UX"]`
  - [ ] T3.3 Estilo activo: `background: var(--color-accent)`, `color: white`
  - [ ] T3.4 Estilo inactivo: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`
  - [ ] T3.5 `aria-pressed` por chip para accesibilidad
  - [ ] T3.6 `data-testid="modal-feedback-chips"` en el contenedor

- [ ] **T4** — Crear `components/projects/ImageUploader.tsx` (subida multi-imagen)
  - [ ] T4.1 Botón "Añadir imagen" con `<input type="file" accept="image/*" multiple />`
  - [ ] T4.2 Máximo 3 imágenes — botón desactivado al llegar al límite
  - [ ] T4.3 Previews de imágenes añadidas (object-fit: cover, thumbnail ~80px)
  - [ ] T4.4 Botón de eliminar por preview
  - [ ] T4.5 Subida a Supabase Storage bucket `project-images` (reutilizar lógica de `app/(app)/communities/[slug]/projects/new/page.tsx` si existe)
  - [ ] T4.6 Estado de carga por imagen (spinner o progress)
  - [ ] T4.7 Manejo de error de subida sin bloquear el formulario

- [ ] **T5** — Crear server action `actions/projects/launchProject.ts`
  - [ ] T5.1 Recibe: `communitySlug`, `title`, `tagline`, `problem`, `solution`, `target_user`, `hypothesis`, `demo_link`, `image_urls`, `feedback_topics`
  - [ ] T5.2 Crea el proyecto con `status = 'live'` directamente
  - [ ] T5.3 Llama a `revalidatePath('/communities/[slug]')` tras inserción exitosa
  - [ ] T5.4 Retorna `{ success: true, projectId }` o `{ success: false, error: string }`

- [ ] **T6** — Integrar modal en `app/(app)/communities/[slug]/page.tsx`
  - [ ] T6.1 Importar `LaunchIdeaModal` y gestionar estado `isModalOpen` (useState en un Client wrapper)
  - [ ] T6.2 El botón "+ Lanzar idea" del feed header abre el modal (ver Story 9.9 — este botón lo añade Story 9.9; T6 presupone que el botón existe o añade un botón temporal)
  - [ ] T6.3 Tras `onSuccess`, llamar a `router.refresh()` para revalidar el feed

- [ ] **T7** — Storybook `stories/projects/LaunchIdeaModal.stories.tsx`
  - [ ] T7.1 Story `EstadoVacio` — modal abierto con campos vacíos
  - [ ] T7.2 Story `ConDatosRellenos` — campos pre-rellenados con datos de ejemplo
  - [ ] T7.3 Story `EstadoCargando` — botón submit en estado loading
  - [ ] T7.4 Story `ChipsSeleccionados` — 3 chips activos

- [ ] **T8** — Tests
  - [ ] T8.1 `tests/unit/projects/LaunchIdeaModal.test.tsx` — render, apertura/cierre, validación requeridos, submit con datos válidos
  - [ ] T8.2 `tests/unit/projects/FeedbackTopicChips.test.tsx` — toggle chips, aria-pressed, máximo selección (libre), estado controlado
  - [ ] T8.3 `tests/unit/projects/ImageUploader.test.tsx` — render, límite de 3 imágenes, botón desactivado al límite

- [ ] **T9** — Documentación `docs/project/modules/projects.md`
  - [ ] T9.1 Documentar `LaunchIdeaModal`, `LaunchIdeaForm`, `FeedbackTopicChips`, `ImageUploader`
  - [ ] T9.2 Documentar el server action `launchProject`
  - [ ] T9.3 Anotar que `/communities/[slug]/projects/new` se mantiene como fallback

- [ ] **T10** — Verificación final
  - [ ] T10.1 `npm run lint` — verde
  - [ ] T10.2 `npx tsc --noEmit` — verde
  - [ ] T10.3 `npx vitest run tests/unit/` — verde (≥384 tests)

## Dev Notes

### Arquitectura actual relevante

```
app/(app)/communities/[slug]/page.tsx  (Server Component async)
  └── actualmente el botón "Nuevo proyecto" navega a /communities/[slug]/projects/new

app/(app)/communities/[slug]/projects/new/page.tsx  (página actual)
  └── formulario de creación — mantener como fallback, no eliminar

lib/api/projects.ts
  └── ProjectListItem — tipos de proyectos en feed

lib/repositories/projects.repository.ts
  └── crear proyecto (insert en tabla projects)
```

### Patrón de componente Client wrapper para estado del modal

`page.tsx` es un Server Component. La gestión del estado `isModalOpen` requiere un Client Component wrapper:

```tsx
// components/projects/FeedWithModal.tsx ('use client')
'use client'
import { useState } from 'react'
import { LaunchIdeaModal } from './LaunchIdeaModal'

interface Props {
  communitySlug: string
  children: React.ReactNode
}

export function FeedWithModal({ communitySlug, children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      {/* Portal para el botón — ver Story 9.9 */}
      <LaunchIdeaModal
        open={isOpen}
        onOpenChange={setIsOpen}
        communitySlug={communitySlug}
      />
      {children}
    </>
  )
}
```

### Server action launchProject

```typescript
// actions/projects/launchProject.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface LaunchProjectInput {
  communitySlug: string
  title: string
  tagline: string
  problem: string
  solution: string
  targetUser?: string
  hypothesis: string
  demoLink?: string
  imageUrls: string[]
  feedbackTopics: string[]
}

export async function launchProject(input: LaunchProjectInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Resolver communityId desde slug
  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', input.communitySlug)
    .single()
  if (!community) return { success: false, error: 'Comunidad no encontrada' }

  const { data, error } = await supabase.from('projects').insert({
    title: input.title,
    tagline: input.tagline,
    problem: input.problem,
    solution: input.solution,
    target_user: input.targetUser ?? null,
    hypothesis: input.hypothesis,
    demo_link: input.demoLink ?? null,
    image_urls: input.imageUrls,
    feedback_topics: input.feedbackTopics,
    community_id: community.id,
    builder_id: user.id,
    status: 'live',
  }).select('id').single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/communities/${input.communitySlug}`)
  return { success: true, projectId: data.id }
}
```

### Chips de feedback: mapeo interno/display

Los chips en el prototipo están en inglés. Se usarán en español para coherencia con el resto de la UI:

| Display (español) | Valor interno (feedback_topics array) |
|---|---|
| Claridad del problema | `"problem_clarity"` |
| Disposición de uso | `"willingness_to_use"` |
| Viabilidad técnica | `"technical_feasibility"` |
| Funcionalidades faltantes | `"missing_features"` |
| Ajuste de mercado | `"market_fit"` |
| Problemas de UX | `"ux_concerns"` |

> El campo `feedback_topics text[]` ya existe en la tabla `projects` (Migration anterior).

### Reutilización de lógica de subida de imágenes

La página `/communities/[slug]/projects/new/page.tsx` ya implementa subida a Supabase Storage. Extraer la lógica de subida a un hook o función utilitaria reutilizable en `lib/utils/imageUpload.ts` para que tanto la página nueva como el modal puedan usarla.

### Design tokens en uso

- `var(--color-accent)` — naranja botón principal y chips activos
- `var(--color-surface)` — fondo chips inactivos
- `var(--color-border)` — borde chips inactivos
- `var(--color-text-muted)` — texto secundario
- `var(--color-background)` — fondo overlay (gestiona shadcn)
- `var(--radius-md)` — border-radius chips
- `var(--space-2)`, `var(--space-3)`, `var(--space-4)` — gaps y padding
- `var(--text-sm)`, `var(--text-xs)` — tamaños de texto

### Dependencias

- **Story 9.1** — campo `tagline` en tabla `projects` ya existe ✓
- **Story 9.9** — el botón "+ Lanzar idea" en el feed header lo añade Story 9.9. Story 9.8 puede asumir que el botón existe o integrarlo en la misma PR si se implementan juntas.
- **shadcn/ui Dialog** — ya instalado en el proyecto (ver Story 9.7 que usa Dialog/Sheet).
- **react-hook-form + zod** — verificar si están instalados; si no, instalar antes de implementar.

### Git context

```
19ac310 feat(project-detail): tagline, sidebar universal y feedback inline — Story 9.7 (#59)
d7e473d feat(feed): secciones Live/Cerrados, ProjectCard horizontal y fix bug autor — Story 9.6 (#58)
```

### Rama sugerida

`feat/9-8-modal-lanzar-idea`

### Flow

Full Flow (Homer) — complejidad alta: nuevo Dialog completo, server action, ImageUploader, FeedbackTopicChips, integración con feed, tests unitarios de tres componentes nuevos.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### File List

**Nuevos:**
- `components/projects/FeedbackTopicChips.tsx` — chips toggleables con mapeo display/valor interno
- `components/projects/ImageUploader.tsx` — uploader inline hasta N imágenes con previews y eliminar
- `components/projects/LaunchIdeaForm.tsx` — formulario interno separado (FormProvider context)
- `components/projects/LaunchIdeaModal.tsx` — Dialog principal ~540px con scroll interno
- `components/projects/FeedWithModal.tsx` — wrapper Client Component (auxiliar)
- `actions/projects/launchProject.ts` — server action que crea proyecto con status='live'
- `lib/utils/imageUpload.ts` — utilitaria de subida a Supabase Storage (reutilizable)
- `tests/unit/projects/FeedbackTopicChips.test.tsx` — 13 tests
- `tests/unit/projects/ImageUploader.test.tsx` — 7 tests
- `tests/unit/projects/LaunchIdeaModal.test.tsx` — 19 tests
- `stories/projects/FeedbackTopicChips.stories.tsx` — 4 stories
- `stories/projects/ImageUploader.stories.tsx` — 3 stories
- `stories/projects/LaunchIdeaModal.stories.tsx` — 4 stories

**Modificados:**
- `components/communities/CommunityFeedHeader.tsx` — botón conectado al LaunchIdeaModal (TODO eliminado)
- `lib/validations/projects.ts` — añadido launchIdeaSchema + LaunchIdeaFormValues
- `tests/unit/communities/CommunityFeedHeader.test.tsx` — 3 tests nuevos de integración modal (9 total)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 9-8 → review
- `_bmad-output/execution-log.yaml` — ELP STARTED + SUCCESS

### Implementation Notes

- TDD Outside-In: 39 tests escritos antes de la implementación
- LaunchIdeaForm usa FormProvider de react-hook-form para separación de UI/lógica
- CommunityFeedHeader integra el modal directamente (ya era Client Component)
- launchProject usa demo_url (no demo_link) para coincidir con el schema de BD existente
- ImageUploader acepta image/* y sube via lib/utils/imageUpload.ts (cliente Supabase)
- /communities/[slug]/projects/new se mantiene intacto como fallback (AC-7 ✓)

### Completion Notes

- 445/445 tests verdes (403 anteriores + 42 nuevos)
- lint: verde
- build: verde (Next.js 15.5.15)
- tsc: implícito en build — verde
