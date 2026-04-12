# Story 8.10: FeedbackCTA contextual + Storybook

Status: ready-for-dev

## Story

As a community member viewing a project,
I want to see a contextual call-to-action that invites me to give feedback (or sign in to do so),
so that the project gets useful feedback from the right people without showing irrelevant CTAs to project owners.

## Acceptance Criteria

1. **AC-1 — Variante `unauthenticated`**: Cuando el usuario NO está autenticado, `FeedbackCTA` muestra una card con título "Ayuda a mejorar esta idea", texto motivacional, y un prompt/botón para iniciar sesión. El botón redirige a `/auth/login`.
2. **AC-2 — Variante `authenticated-member`**: Cuando el usuario está autenticado y NO es el owner del proyecto, `FeedbackCTA` muestra la card con título "Ayuda a mejorar esta idea", texto motivacional, y el botón `FeedbackButton` ("Dar feedback") que abre el formulario de feedback.
3. **AC-3 — Variante `owner`**: Cuando el usuario autenticado ES el owner del proyecto (`variant === 'owner'`), `FeedbackCTA` devuelve `null`. No se renderiza ningún elemento en el DOM.
4. **AC-4 — Componente presentacional puro**: `FeedbackCTA` es un Server Component (sin `'use client'`). No contiene lógica de autenticación ni acceso a Supabase. Recibe `variant`, `projectId` y `communityId` como props.
5. **AC-5 — Integración en `page.tsx`**: La lógica auth/owner se resuelve en `page.tsx` (Server Component). Se determina la variante y se pasa a `FeedbackCTA`. En proyectos con `status !== 'live'` NO se muestra el CTA.
6. **AC-6 — Design tokens CSS**: Todos los estilos usan CSS custom properties del sistema de diseño (ningún valor hardcodeado de color, espaciado o tipografía).
7. **AC-7 — Storybook**: Fichero `stories/feedback/FeedbackCTA.stories.tsx` con exactamente 3 stories: `Unauthenticated`, `AuthenticatedMember`, `Owner`. La story `Owner` muestra texto explícito indicando que el componente devuelve `null`.
8. **AC-8 — Tests unitarios**: Tests para las 3 variantes. La variante `owner` afirma que no se renderiza ningún elemento. Las variantes `unauthenticated` y `authenticated-member` afirman la presencia de los elementos clave.
9. **AC-9 — Test E2E (skip)**: Test E2E marcado como `test.skip` que describe el comportamiento observable en un navegador real para las 3 variantes.
10. **AC-10 — `FeedbackButton` existente no se modifica**: `FeedbackCTA` en variante `authenticated-member` compone el componente `FeedbackButton` existente sin alterarlo.

## Tasks / Subtasks

- [ ] Task 1 — Test E2E skeleton (AC: #9)
  - [ ] Subtask 1.1: Crear `tests/e2e/feedback/FeedbackCTA.spec.ts` con `test.describe` y 3 `test.skip` (unauthenticated, authenticated-member, owner)
  - [ ] Subtask 1.2: Cada test skip describe el comportamiento observable: elemento visible / ausencia de elemento

- [ ] Task 2 — Tests unitarios (AC: #8)
  - [ ] Subtask 2.1: Crear `tests/unit/feedback/FeedbackCTA.test.tsx`
  - [ ] Subtask 2.2: Test variante `unauthenticated` — afirma título, texto motivacional y link/botón de sign-in con href `/auth/login`
  - [ ] Subtask 2.3: Test variante `authenticated-member` — afirma título, texto motivacional y presencia del botón "Dar feedback" (o su wrapper)
  - [ ] Subtask 2.4: Test variante `owner` — afirma que `container` está vacío (null render)
  - [ ] Subtask 2.5: Todos los tests pasan antes de escribir el componente

- [ ] Task 3 — Implementar `FeedbackCTA` (AC: #1, #2, #3, #4, #6)
  - [ ] Subtask 3.1: Crear `components/feedback/FeedbackCTA.tsx` — Server Component sin `'use client'`
  - [ ] Subtask 3.2: Definir `FeedbackCTAVariant = 'unauthenticated' | 'authenticated-member' | 'owner'`
  - [ ] Subtask 3.3: Definir `FeedbackCTAProps`: `{ variant: FeedbackCTAVariant; projectId: string; communityId: string }`
  - [ ] Subtask 3.4: Implementar `if (variant === 'owner') return null`
  - [ ] Subtask 3.5: Variante `unauthenticated` — card con título, texto motivacional, botón `<a href="/auth/login">` con estilos de CTA primario
  - [ ] Subtask 3.6: Variante `authenticated-member` — card con título, texto motivacional, composición de `<FeedbackButton projectId={projectId} communityId={communityId} />`
  - [ ] Subtask 3.7: Usar exclusivamente tokens CSS del design system (`var(--color-*)`, `var(--space-*)`, `var(--text-*)`, `var(--radius-*)`)
  - [ ] Subtask 3.8: Patrón visual de card: `background-color: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `padding: var(--space-6)`, `box-shadow: var(--shadow-sm)`
  - [ ] Subtask 3.9: Ejecutar tests unitarios — todos deben pasar

- [ ] Task 4 — Integrar en `page.tsx` (AC: #5)
  - [ ] Subtask 4.1: Importar `FeedbackCTA` en `app/(app)/communities/[slug]/projects/[id]/page.tsx`
  - [ ] Subtask 4.2: Calcular `feedbackCTAVariant`: si `!authData.user` → `'unauthenticated'`; si `isOwner` → `'owner'`; si no → `'authenticated-member'`
  - [ ] Subtask 4.3: Renderizar `<FeedbackCTA>` solo cuando `project.status === 'live'`, antes de `<TeamPerspectives>` en la columna principal
  - [ ] Subtask 4.4: Pasar `variant={feedbackCTAVariant}`, `projectId={project.id}`, `communityId={project.community_id}`
  - [ ] Subtask 4.5: Verificar que en página de un proyecto live como owner NO aparece ningún CTA

- [ ] Task 5 — Storybook (AC: #7)
  - [ ] Subtask 5.1: Crear `stories/feedback/FeedbackCTA.stories.tsx`
  - [ ] Subtask 5.2: Story `Unauthenticated` — `variant="unauthenticated"` con `projectId` y `communityId` de ejemplo
  - [ ] Subtask 5.3: Story `AuthenticatedMember` — `variant="authenticated-member"` con props de ejemplo. Nota: `FeedbackButton` requiere `'use client'`; la story puede necesitar wrapper o mock
  - [ ] Subtask 5.4: Story `Owner` — `variant="owner"` con nota en `parameters.docs.description` indicando que el componente devuelve `null` y no renderiza nada
  - [ ] Subtask 5.5: Verificar que las 3 stories aparecen en Storybook sin errores

- [ ] Task 6 — Verificación final (AC: todos)
  - [ ] Subtask 6.1: Ejecutar `pnpm test` — todos los tests unitarios pasan
  - [ ] Subtask 6.2: Ejecutar `pnpm build` — sin errores de TypeScript ni compilación
  - [ ] Subtask 6.3: Revisar manualmente las 3 variantes en Storybook (`pnpm storybook`)
  - [ ] Subtask 6.4: Verificar en la página de detalle de proyecto con usuario owner: CTA ausente
  - [ ] Subtask 6.5: Verificar en la página de detalle de proyecto con usuario miembro: CTA visible con botón "Dar feedback"

## Dev Notes

### Arquitectura del componente

`FeedbackCTA` es **presentacional puro** (no `'use client'`, no hooks, no acceso a Supabase). Recibe toda la información necesaria via props. Esta decisión simplifica el testing y mantiene la lógica de autenticación en el Server Component (`page.tsx`) donde ya existe.

La prop `variant` actúa como discriminante explícito. El componente NO deduce la variante internamente — eso es responsabilidad de `page.tsx`.

**Atención con Storybook + FeedbackButton**: `FeedbackButton` tiene `'use client'` y usa `useRouter`. La story `AuthenticatedMember` puede requerir un mock o wrapper de Next.js Router para Storybook. Ver el patrón usado en `stories/feedback/FeedbackEntry.stories.tsx` para referencia.

### Ficheros a crear

```
components/feedback/FeedbackCTA.tsx          — Componente principal
tests/e2e/feedback/FeedbackCTA.spec.ts       — E2E skeleton (test.skip)
tests/unit/feedback/FeedbackCTA.test.tsx     — Tests unitarios
stories/feedback/FeedbackCTA.stories.tsx     — Storybook 3 stories
```

### Ficheros a modificar

```
app/(app)/communities/[slug]/projects/[id]/page.tsx — Integración del CTA
```

### Comportamiento en `page.tsx` — lógica de variante

```tsx
// Calcular variante ANTES del return del JSX
// El user siempre existe en esta página (redirect si no autenticado — línea 34)
const feedbackCTAVariant = isOwner ? 'owner' : 'authenticated-member'

// En el JSX, dentro de la columna principal, ANTES de <TeamPerspectives>:
{project.status === 'live' && (
  <FeedbackCTA
    variant={feedbackCTAVariant}
    projectId={project.id}
    communityId={project.community_id}
  />
)}
```

Nota: La variante `'unauthenticated'` queda preparada en el tipo para uso futuro (rutas públicas) pero en la integración actual de `page.tsx` no se alcanza porque hay redirect a `/auth/login` en línea 34. La story de Storybook la cubre igualmente.

### Patrón visual de referencia

Basado en el patrón "En Juego" del design system (card de atención activa):

```tsx
// Card wrapper
style={{
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-4)',
}}

// Título
style={{
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-primary)',
  margin: 0,
}}

// Texto motivacional
style={{
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  lineHeight: 'var(--leading-base)',
  margin: 0,
}}

// Botón sign-in (variante unauthenticated)
style={{
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-2) var(--space-4)',
  backgroundColor: 'var(--color-accent)',
  color: 'var(--color-surface)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  alignSelf: 'flex-start',
}}
```

### Componentes de feedback existentes (no modificar)

| Fichero | Responsabilidad |
|---|---|
| `FeedbackButton.tsx` | Botón `'use client'` que abre `FeedbackDialog`. Compuesto por `FeedbackCTA` variante `authenticated-member`. |
| `FeedbackDialog.tsx` | Formulario de feedback (4 preguntas). No se toca. |
| `FeedbackList.tsx` | Lista de feedbacks para el builder. No se toca. |
| `FeedbackEntry.tsx` | Entrada individual de feedback. No se toca. |
| `TeamPerspectives.tsx` | Vista pública de feedbacks. No se toca. |

### TDD Outside-In — orden de implementación

1. E2E `test.skip` (define el comportamiento observable externo)
2. Tests unitarios (define el contrato del componente)
3. Implementación del componente (hace pasar los tests)
4. Integración en `page.tsx`
5. Storybook

### Texto de contenido (no inventar variaciones)

- **Título**: `"Ayuda a mejorar esta idea"`
- **Texto motivacional**: `"Tu perspectiva como miembro de la comunidad es valiosa. Da feedback y ayuda a validar si esta propuesta tiene potencial."`
- **CTA unauthenticated**: `"Inicia sesión para dar feedback"`
- **data-testid**: `"feedback-cta"`, `"feedback-cta-signin-link"`, `"feedback-cta-button-wrapper"`

### Project Structure Notes

- Componente en `components/feedback/` — consistente con todos los componentes de feedback existentes
- Tests en `tests/unit/feedback/` — consistente con `FeedbackEntry.test.tsx`, `TeamPerspectives.test.tsx`
- Stories en `stories/feedback/` — consistente con `FeedbackEntry.stories.tsx`, `TeamPerspectives.stories.tsx`
- E2E en `tests/e2e/feedback/` — consistente con `TeamPerspectives.spec.ts`
- Naming: `FeedbackCTA` (PascalCase) — consistente con todos los componentes del módulo

### References

- Patrón de variante `isOwner` en `page.tsx`: [Source: app/(app)/communities/[slug]/projects/[id]/page.tsx#L46]
- `FeedbackButton` existente (componer, no duplicar): [Source: components/feedback/FeedbackButton.tsx]
- Design tokens CSS: [Source: docs/project/design-tokens.md]
- Patrón "En Juego" (card de atención): [Source: docs/project/design-tokens.md#Patrón-"En-Juego"]
- Tipos de feedback: [Source: lib/types/feedback.ts]
- Auth redirect pattern: [Source: app/(app)/communities/[slug]/projects/[id]/page.tsx#L33-L34]
- Storybook existente de referencia: [Source: stories/feedback/TeamPerspectives.stories.tsx]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
