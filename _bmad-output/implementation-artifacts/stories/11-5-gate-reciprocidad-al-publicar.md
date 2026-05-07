# Story 11.5: Gate de reciprocidad al publicar

Status: done

## Metadata

- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.5
- **Prerequisito:** Story 11.1 completada (columna `reciprocity_threshold` en `communities` disponible en BD)
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## Story

Como miembro de una comunidad,
quiero que el sistema me impida publicar un proyecto si no he dado el mínimo de feedbacks requeridos por la comunidad,
para que el ecosistema de feedback sea recíproco y justo para todos los builders.

## Acceptance Criteria

**AC-1 — Gate desactivado cuando `reciprocity_threshold = 0`**
Dado que la comunidad tiene `reciprocity_threshold = 0`,
cuando el Builder intenta publicar un proyecto vía `launchProject()`,
entonces el proyecto se publica sin ninguna verificación de feedbacks dados,
y la función devuelve `{ success: true, ... }`.

**AC-2 — Gate bloqueante cuando el Builder no cumple el umbral**
Dado que la comunidad tiene `reciprocity_threshold = 3` y el Builder ha dado 2 feedbacks completos en esa comunidad en los últimos 30 días,
cuando el Builder intenta publicar un proyecto vía `launchProject()`,
entonces la función devuelve `{ success: false, error: "Necesitas dar 1 feedback más antes de publicar. Has dado 2 de 3 requeridos.", code: "RECIPROCITY_GATE_BLOCKED" }`,
y NO se inserta ningún proyecto en la BD.

**AC-3 — Gate superado cuando el Builder cumple o supera el umbral**
Dado que la comunidad tiene `reciprocity_threshold = 3` y el Builder ha dado 3 o más feedbacks en esa comunidad en los últimos 30 días,
cuando el Builder intenta publicar un proyecto vía `launchProject()`,
entonces el proyecto se publica correctamente,
y la función devuelve `{ success: true, ... }`.

**AC-4 — Mensaje de error con pluralización correcta**
Dado que al Builder le faltan N feedbacks (N >= 1),
cuando el gate bloquea,
entonces el mensaje es:
- N = 1 → "Necesitas dar 1 feedback más antes de publicar. Has dado X de Y requeridos."
- N > 1 → "Necesitas dar N feedbacks más antes de publicar. Has dado X de Y requeridos."

**AC-5 — `ProjectPreview` muestra gate bloqueado**
Dado que `ProjectPreview` recibe la prop `reciprocityGate = { blocked: true, given: 2, required: 3 }`,
cuando se renderiza el paso 5 del wizard,
entonces el botón "Publicar" está deshabilitado (`disabled={true}`),
y aparece un bloque con `data-testid="reciprocity-gate-message"` con el texto: "Necesitas dar 1 feedback más antes de publicar. Has dado 2 de 3 requeridos.",
y el botón "Publicar" no tiene el cursor de `not-allowed` propio del estado `isPublishing` — tiene su propio estilo de bloqueado.

**AC-6 — `ProjectPreview` sin gate muestra el flujo normal**
Dado que `ProjectPreview` recibe `reciprocityGate = { blocked: false, given: 5, required: 3 }` o no recibe la prop,
cuando se renderiza,
entonces el botón "Publicar" está habilitado (siempre que `isPublishing = false`),
y NO aparece el bloque `reciprocity-gate-message`.

**AC-7 — `LaunchIdeaModal` carga el gate antes de mostrar el paso 5**
Dado que el Builder navega hasta el paso 5 del wizard en `LaunchIdeaModal`,
cuando el componente monta el paso 5,
entonces consulta `GET /api/communities/[slug]/reciprocity-status` (o lo obtiene del server) para saber el estado del gate,
y pasa `reciprocityGate` a `ProjectPreview` con el resultado.

Alternativa implementación: si la complejidad es alta, el gate se verifica SOLO en el server action `launchProject()` (AC-2/AC-3) y el UI solo muestra el error de servidor en el `serverError` del wizard. Los ACs 5 y 6 son para la experiencia óptima — si el PR muestra solo el error de servidor, se acepta como versión inicial.

**AC-8 — Conteo de feedbacks: solo últimos 30 días**
Dado que la verificación del gate se ejecuta en `launchProject()`,
cuando cuenta los feedbacks del Builder en la comunidad,
entonces solo cuenta feedbacks con `created_at >= (now() - 30 days)`,
y no tiene en cuenta feedbacks dados en comunidades distintas.

**AC-9 — Tests pasan al 100%**
Dado que ejecuto `npm run test:unit`,
cuando se procesan los tests de esta story,
entonces todos los tests nuevos pasan al 100% y los tests existentes no se rompen.

## Tasks / Subtasks

- [x] **T1** — TDD: `launchProject` — gate de reciprocidad (RED → GREEN → REFACTOR)
  - [x] T1.1 Crear `tests/unit/projects/launchProject-reciprocity.test.ts`
  - [x] T1.2 Escribir test: comunidad con `reciprocity_threshold = 0` → siempre pasa (sin consulta de feedbacks)
  - [x] T1.3 Escribir test: threshold = 3, builder tiene 3 feedbacks → publica OK
  - [x] T1.4 Escribir test: threshold = 3, builder tiene 2 feedbacks → devuelve error con `code: "RECIPROCITY_GATE_BLOCKED"` y mensaje correcto
  - [x] T1.5 Escribir test: threshold = 3, builder tiene 0 feedbacks → mensaje "Necesitas dar 3 feedbacks más..."
  - [x] T1.6 Escribir test: threshold = 3, builder tiene 1 feedback → mensaje "Necesitas dar 2 feedbacks más..."
  - [x] T1.7 Escribir test: threshold = 1, builder tiene 0 feedbacks → mensaje "Necesitas dar 1 feedback más..." (singular)
  - [x] T1.8 Actualizar `LaunchProjectResult` — añadir `{ success: false; error: string; code?: string }` al tipo (si no ya existe)
  - [x] T1.9 Implementar la verificación en `actions/projects/launchProject.ts`
  - [x] T1.10 Reutilizar `feedbackRepo.countByReviewerInCommunity` o crear consulta con filtro de fecha
  - [x] T1.11 Verificar todos los tests en verde

- [x] **T2** — TDD: componente `ProjectPreview` — gate bloqueado (RED → GREEN)
  - [x] T2.1 Crear/ampliar `tests/component/projects/ProjectPreview.11-5.test.tsx`
  - [x] T2.2 Escribir test: sin prop `reciprocityGate` → botón "Publicar" habilitado, sin mensaje gate
  - [x] T2.3 Escribir test: `reciprocityGate = { blocked: false, given: 5, required: 3 }` → botón habilitado, sin mensaje
  - [x] T2.4 Escribir test: `reciprocityGate = { blocked: true, given: 2, required: 3 }` → botón deshabilitado
  - [x] T2.5 Escribir test: `reciprocityGate = { blocked: true, given: 2, required: 3 }` → bloque `reciprocity-gate-message` visible con texto "Necesitas dar 1 feedback más..."
  - [x] T2.6 Escribir test: `reciprocityGate = { blocked: true, given: 0, required: 3 }` → mensaje "Necesitas dar 3 feedbacks más..." (plural)
  - [x] T2.7 Añadir prop `reciprocityGate?: ReciprocityGate` a `ProjectPreview`
  - [x] T2.8 Añadir bloque condicional en el JSX de `ProjectPreview`
  - [x] T2.9 Verificar todos los tests en verde

- [x] **T3** — Crear helper de mensaje de pluralización
  - [x] T3.1 Crear `lib/utils/reciprocity.ts` con `buildReciprocityMessage` y `checkReciprocityGate`
  - [x] T3.2 Tests unitarios en `tests/unit/utils/reciprocity.test.ts`

- [x] **T4** — `countByReviewerInCommunityRecent` — consulta con filtro de fecha
  - [x] T4.1 Verificar si `countByReviewerInCommunity` en `feedback.repository.ts` acepta parámetro de fecha
  - [x] T4.2 Añadir `countByReviewerInCommunityRecent(reviewerId, communityId, days: number)` con filtro `gte('created_at', ...)`
  - [x] T4.3 Tests unitarios en `tests/unit/repositories/feedbackRepository.11-5.test.ts`

- [ ] **T5** — (Opcional) `GET /api/communities/[slug]/reciprocity-status`
  - [ ] T5.1 No implementado — gate verificado solo en server action `launchProject()` (variante aceptada en AC-7)

- [x] **T6** — Integrar gate en `LaunchIdeaModal` / `ProjectWizard`
  - [x] T6.1 El error del gate se muestra a través del `serverError` del wizard
  - [x] T6.2 `ProjectPreview` recibe `reciprocityGate` desde `LaunchIdeaModal` para UX proactiva
  - [x] T6.3 El mensaje de error del servidor se muestra correctamente en el paso 5 del wizard

## Dev Notes

### Contexto de negocio

El gate de reciprocidad es el mecanismo central de equidad del sistema. Si un Builder puede publicar proyectos sin haber dado feedback a otros, el sistema se desequilibra. El `reciprocity_threshold` por defecto es 3 (configurable por el admin de la comunidad en Story 11.6).

El período de 30 días es deliberado: es suficientemente largo para que un builder activo siempre pueda publicar, y suficientemente corto para que sea continuo (no vale haber dado 3 feedbacks hace 6 meses y no haber dado ninguno desde entonces).

### Arquitectura / Componentes

**Ficheros a modificar:**

| Fichero | Cambio |
|---|---|
| `actions/projects/launchProject.ts` | Añadir verificación de reciprocidad antes del insert |
| `components/projects/ProjectPreview.tsx` | Añadir prop `reciprocityGate?` y bloque condicional |
| `lib/repositories/feedback.repository.ts` | Añadir/extender método de conteo con filtro de fecha |

**Ficheros a crear (opcionales pero recomendados):**

| Fichero | Descripción |
|---|---|
| `lib/utils/reciprocity.ts` | Helpers: `buildReciprocityMessage`, `checkReciprocityGate` |
| `app/api/communities/[slug]/reciprocity-status/route.ts` | GET endpoint para el UI |

### Tipos

```typescript
// Nuevo tipo para la prop de ProjectPreview
export interface ReciprocityGate {
  blocked: boolean
  given: number
  required: number
}
```

### Implementación en `launchProject`

```typescript
// Después de resolver community.id, antes del insert:
const community = await supabase
  .from('communities')
  .select('id, reciprocity_threshold')
  .eq('slug', input.communitySlug)
  .single()

if (community.reciprocity_threshold > 0) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('feedbacks')
    .select('id', { count: 'exact', head: true })
    .eq('community_id', community.id)
    .eq('reviewer_id', user.id)
    .gte('created_at', thirtyDaysAgo)

  const given = count ?? 0
  const required = community.reciprocity_threshold
  if (given < required) {
    const missing = required - given
    const feedbackWord = missing === 1 ? 'feedback' : 'feedbacks'
    return {
      success: false,
      error: `Necesitas dar ${missing} ${feedbackWord} más antes de publicar. Has dado ${given} de ${required} requeridos.`,
      code: 'RECIPROCITY_GATE_BLOCKED',
    }
  }
}
```

### Estilos para el gate bloqueado en `ProjectPreview`

El bloque de mensaje debe usar tokens semáforo de advertencia:
```css
background-color: var(--color-needs-bg);
border: 1px solid var(--color-needs-text);
border-radius: var(--radius-lg);
padding: var(--space-3) var(--space-4);
```

### Nota sobre `countByReviewerInCommunity` existente

El método `countByReviewerInCommunity` en `feedback.repository.ts` ya existe (ver fichero) pero NO filtra por fecha. Para esta story necesitamos el mismo concepto pero con `gte('created_at', thirtyDaysAgo)`. Se puede añadir un parámetro `since?: string` al método existente, o crear un nuevo método `countByReviewerInCommunityRecent`.

### Tests a crear

```
tests/unit/projects/launchProject-reciprocity.test.ts  (nuevo)
tests/unit/projects/ProjectPreview-reciprocity.test.tsx  (nuevo o ampliar existente)
tests/unit/utils/reciprocity.test.ts  (nuevo)
tests/integration/communities/reciprocity-status.test.ts  (nuevo, si se crea el endpoint)
```

## Dev Agent Record

### Implementación

- **Rama:** `feat/11-5-gate-reciprocidad-al-publicar`
- **Tests creados:** 27 (9 launchProject-reciprocity, 9 ProjectPreview.11-5, 4 feedbackRepository.11-5, 5 reciprocity utils)
- **Suite completa:** 1554/1554 tests en verde
- **Estrategia TDD:** Outside-In — tests escritos en RED antes de implementar, luego GREEN

### Decisiones técnicas

1. Gate implementado íntegramente en `launchProject()` server action — se evita el endpoint `/api/communities/[slug]/reciprocity-status` (AC-7 variante aceptada)
2. `countByReviewerInCommunityRecent(reviewerId, communityId, days)` creado en `feedback.repository.ts` como método separado (no se modificó el existente `countByReviewerInCommunity`) para preservar retrocompatibilidad
3. `lib/utils/reciprocity.ts` centraliza `buildReciprocityMessage`, `checkReciprocityGate` y el tipo `ReciprocityGate` — reutilizados en `launchProject.ts` y `ProjectPreview.tsx`
4. Integración UI: `LaunchIdeaModal` pasa `reciprocityGate` a `ProjectPreview` para UX proactiva; si el usuario sortea el componente y el server action bloquea, el `serverError` del wizard muestra el mensaje igualmente
5. El bloque de gate en `ProjectPreview` usa tokens semáforo `var(--color-needs-bg)` / `var(--color-needs-text)` según especificación de la story

### Ficheros modificados

- `actions/projects/launchProject.ts` — gate de reciprocidad con `buildReciprocityMessage`
- `components/projects/ProjectPreview.tsx` — prop `reciprocityGate?` + bloque condicional con `data-testid="reciprocity-gate-message"`
- `components/projects/LaunchIdeaModal.tsx` — pasa `reciprocityGate` a `ProjectPreview`
- `components/projects/ProjectWizard.tsx` — `WizardFormData` ajustado si necesario
- `lib/repositories/feedback.repository.ts` — nuevo método `countByReviewerInCommunityRecent`

### Ficheros creados

- `lib/utils/reciprocity.ts` — helpers + tipo `ReciprocityGate`
- `tests/unit/projects/launchProject-reciprocity.test.ts`
- `tests/component/projects/ProjectPreview.11-5.test.tsx`
- `tests/unit/repositories/feedbackRepository.11-5.test.ts`
- `tests/unit/utils/reciprocity.test.ts`
