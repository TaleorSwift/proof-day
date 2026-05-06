# Story 11.6: Admin — configuración de reciprocidad por comunidad

Status: ready-for-dev

## Metadata

- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.6
- **Prerequisito:** Story 11.1 completada (columna `reciprocity_threshold` en `communities` disponible en BD)
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## Story

Como admin de una comunidad,
quiero poder configurar el número mínimo de feedbacks que un Builder debe haber dado antes de poder publicar un proyecto,
para adaptar el nivel de reciprocidad requerido a las necesidades y madurez de mi comunidad.

## Acceptance Criteria

**AC-1 — Campo numérico visible en la página de settings**
Dado que soy admin de la comunidad y navego a `/communities/[slug]/settings`,
cuando se carga la página,
entonces veo una nueva sección con título "Reciprocidad" debajo de la sección de invitaciones,
y dentro aparece un campo numérico con label "Feedbacks mínimos para publicar",
y el campo muestra el valor actual de `community.reciprocity_threshold` (por defecto 3),
y el campo tiene `data-testid="reciprocity-threshold-input"`,
y tiene un texto de ayuda: "Los miembros deben haber dado este número de feedbacks en los últimos 30 días antes de poder publicar. Pon 0 para desactivar el requisito."

**AC-2 — Validación del rango 0-10**
Dado que el admin escribe un valor en el campo de reciprocidad,
cuando el valor es < 0 o > 10 o no es un número entero,
entonces el campo muestra un mensaje de error de validación antes de enviar el formulario,
y el botón "Guardar" está deshabilitado o el formulario no se envía.

**AC-3 — `PATCH /api/communities/[id]/settings` actualiza `reciprocity_threshold`**
Dado que el admin guarda un valor válido (0-10),
cuando se llama a `PATCH /api/communities/[id]/settings` con `{ reciprocityThreshold: N }` y el header de auth correcto,
entonces la ruta devuelve `200 OK` con `{ data: { id, reciprocityThreshold: N } }`,
y la columna `communities.reciprocity_threshold` queda actualizada en Supabase.

**AC-4 — Protección 401 sin autenticación**
Dado que se llama a `PATCH /api/communities/[id]/settings` sin sesión activa,
cuando el middleware de auth verifica la sesión,
entonces la ruta devuelve `401 Unauthorized` con `{ error: "No autenticado", code: "UNAUTHENTICATED" }`.

**AC-5 — Protección 403 si no es admin**
Dado que se llama a `PATCH /api/communities/[id]/settings` con sesión de un usuario que NO es admin de la comunidad,
cuando el handler verifica el rol,
entonces la ruta devuelve `403 Forbidden` con `{ error: "Solo el admin puede cambiar esta configuración", code: "FORBIDDEN" }`.

**AC-6 — Desactivar el gate con valor 0**
Dado que el admin guarda el valor 0,
cuando se actualiza `reciprocity_threshold`,
entonces la columna queda en 0,
y el gate de reciprocidad de Story 11.5 queda efectivamente desactivado para esa comunidad.

**AC-7 — Feedback visual tras guardar**
Dado que el admin guarda el valor con éxito,
cuando `PATCH` devuelve 200,
entonces el botón "Guardar" muestra "Guardado" durante 2 segundos y vuelve a "Guardar",
o aparece un toast de confirmación con `data-testid="reciprocity-saved-feedback"`.

**AC-8 — Tests pasan al 100%**
Dado que ejecuto `npm run test:unit`,
cuando se procesan los tests de esta story,
entonces todos los tests nuevos pasan al 100% y los tests existentes no se rompen.

## Tasks / Subtasks

- [ ] **T1** — TDD: `PATCH /api/communities/[id]/settings` (RED → GREEN → REFACTOR)
  - [ ] T1.1 Crear `tests/integration/communities/community-settings.test.ts`
  - [ ] T1.2 Escribir test: sin auth → 401
  - [ ] T1.3 Escribir test: auth pero no admin → 403
  - [ ] T1.4 Escribir test: admin, body `{ reciprocityThreshold: 5 }` → 200 + community actualizada
  - [ ] T1.5 Escribir test: admin, `reciprocityThreshold: 0` → 200 (gate desactivado)
  - [ ] T1.6 Escribir test: admin, `reciprocityThreshold: -1` → 400 VALIDATION_ERROR
  - [ ] T1.7 Escribir test: admin, `reciprocityThreshold: 11` → 400 VALIDATION_ERROR
  - [ ] T1.8 Escribir test: admin, `reciprocityThreshold: 2.5` (no entero) → 400 VALIDATION_ERROR
  - [ ] T1.9 Crear `app/api/communities/[id]/settings/route.ts` con PATCH handler
  - [ ] T1.10 Verificar todos los tests en verde

- [ ] **T2** — Crear schema de validación para el PATCH
  - [ ] T2.1 En `lib/validations/communities.ts` (nuevo o existente), añadir `updateCommunitySettingsSchema = z.object({ reciprocityThreshold: z.number().int().min(0).max(10) })`
  - [ ] T2.2 Test unitario del schema (valores válidos, inválidos, borde)

- [ ] **T3** — Añadir método al repositorio de comunidades
  - [ ] T3.1 Verificar si existe `lib/repositories/communities.repository.ts`
  - [ ] T3.2 Añadir (o crear) método `updateSettings(communityId: string, data: { reciprocityThreshold: number })`
  - [ ] T3.3 El método actualiza `reciprocity_threshold` en la tabla `communities`
  - [ ] T3.4 Test unitario del método del repositorio

- [ ] **T4** — TDD: componente `ReciprocitySettings` (RED → GREEN)
  - [ ] T4.1 Crear `tests/unit/communities/ReciprocitySettings.test.tsx`
  - [ ] T4.2 Escribir test: se renderiza con valor inicial `currentThreshold = 3`
  - [ ] T4.3 Escribir test: campo `reciprocity-threshold-input` visible con value = 3
  - [ ] T4.4 Escribir test: valor < 0 → botón "Guardar" deshabilitado
  - [ ] T4.5 Escribir test: valor > 10 → botón "Guardar" deshabilitado
  - [ ] T4.6 Escribir test: valor válido (5) → botón habilitado, al hacer submit llama a `onSave(5)`
  - [ ] T4.7 Escribir test: `isSaving = true` → botón muestra "Guardando..."
  - [ ] T4.8 Crear `components/communities/ReciprocitySettings.tsx` — Client Component
  - [ ] T4.9 Verificar todos los tests en verde

- [ ] **T5** — Integrar `ReciprocitySettings` en la página de settings
  - [ ] T5.1 Leer `app/(app)/communities/[slug]/settings/page.tsx` (ya existe, tiene sección de InvitationSection)
  - [ ] T5.2 En el Server Component: leer `community.reciprocity_threshold` (añadir al SELECT de la query existente)
  - [ ] T5.3 Renderizar `<ReciprocitySettings communityId={community.id} currentThreshold={community.reciprocity_threshold} />`
  - [ ] T5.4 El componente hace `PATCH` a `/api/communities/${communityId}/settings` internamente

- [ ] **T6** — Storybook
  - [ ] T6.1 Crear `stories/communities/ReciprocitySettings.stories.tsx` con stories: `ValorDefecto`, `Guardando`, `ValorInvalido`, `GateDesactivado` (valor 0)

## Dev Notes

### Contexto de negocio

El umbral de reciprocidad es una decisión de gobernanza de la comunidad. Una comunidad nueva puede querer empezar con threshold = 0 (sin requisito) para facilitar el onboarding. Una comunidad madura puede subir el umbral a 5 para asegurar un nivel alto de participación. El admin tiene control total.

El valor 0 desactiva el gate completamente (Story 11.5 AC-1). Valores 1-10 habilitan el gate con el número correspondiente de feedbacks requeridos.

### Arquitectura / Componentes

**Fichero a crear:**

| Fichero | Descripción |
|---|---|
| `app/api/communities/[id]/settings/route.ts` | PATCH handler — actualiza `reciprocity_threshold` |
| `components/communities/ReciprocitySettings.tsx` | Client Component con input numérico + submit |
| `stories/communities/ReciprocitySettings.stories.tsx` | Storybook stories |

**Ficheros a modificar:**

| Fichero | Cambio |
|---|---|
| `app/(app)/communities/[slug]/settings/page.tsx` | Añadir `reciprocity_threshold` al SELECT y renderizar `ReciprocitySettings` |
| `lib/validations/communities.ts` | Añadir `updateCommunitySettingsSchema` (crear si no existe) |
| `lib/repositories/communities.repository.ts` | Añadir método `updateSettings` (crear si no existe) |

### Verificación de ownership en el handler

La página `settings/page.tsx` ya verifica que el usuario es `admin` via `community_members.role`. El handler PATCH necesita hacer la misma verificación a nivel de API (no confiar solo en la UI):

```typescript
// En PATCH /api/communities/[id]/settings
const { data: membership } = await supabase
  .from('community_members')
  .select('role')
  .eq('community_id', params.id)
  .eq('user_id', user.id)
  .single()

if (!membership || membership.role !== 'admin') {
  return NextResponse.json(
    { error: 'Solo el admin puede cambiar esta configuración', code: 'FORBIDDEN' },
    { status: 403 }
  )
}
```

### Schema Zod para el PATCH

```typescript
// lib/validations/communities.ts
export const updateCommunitySettingsSchema = z.object({
  reciprocityThreshold: z
    .number()
    .int('El umbral debe ser un número entero')
    .min(0, 'El umbral mínimo es 0')
    .max(10, 'El umbral máximo es 10'),
})
```

### Componente `ReciprocitySettings`

Es un Client Component (maneja estado del input y el submit). Sigue el patrón de `InvitationSection` (ver componente existente como referencia de estilo y estructura).

```typescript
interface ReciprocitySettingsProps {
  communityId: string
  currentThreshold: number
}
```

El componente:
1. Mantiene `value` en estado local (inicializado con `currentThreshold`)
2. Valida que `value` está en [0, 10] y es entero antes de habilitar el botón "Guardar"
3. Al hacer submit, llama a `PATCH /api/communities/${communityId}/settings` con `{ reciprocityThreshold: value }`
4. Muestra feedback visual tras éxito (AC-7)

### Tests a crear

```
tests/integration/communities/community-settings.test.ts  (nuevo)
tests/unit/communities/ReciprocitySettings.test.tsx        (nuevo)
tests/unit/validations/communities.test.ts                 (nuevo o ampliar)
```

### Nota sobre el SELECT de la página de settings

La query actual en `settings/page.tsx` es:
```typescript
.select('id, name, slug')
```
Hay que añadir `reciprocity_threshold` para poder pasarlo al componente:
```typescript
.select('id, name, slug, reciprocity_threshold')
```
