# Story 9.9: Feed header — "Ideas en validación", subtítulo y botón "+ Lanzar idea"

Status: ready-for-dev

## Story

Como Builder o Reviewer,
quiero ver un header claro en el feed con el título "Ideas en validación" y un botón naranja "+ Lanzar idea" bien posicionado,
para entender inmediatamente el propósito del espacio y lanzar o revisar ideas sin fricciones.

## Acceptance Criteria

1. **[AC-1]** Dado que el usuario autenticado accede al feed de una comunidad, cuando la página carga, entonces:
   - Aparece un `<h1>` con el texto `"Ideas en validación"` (`data-testid="feed-heading"`), font-bold, ~28px (o `var(--text-2xl)`).
   - Debajo del h1 aparece un subtítulo con el texto `"Da feedback. Aprende más rápido. Decide qué construir."` (`data-testid="feed-subheading"`), text-sm, `color: var(--color-text-muted)`.
   - El h1 anterior que mostraba el nombre de la comunidad (`community.name`) ya no aparece como heading principal.

2. **[AC-2]** Dado que el usuario visualiza el header del feed, cuando inspecciona el layout, entonces:
   - El área del header es una fila flex con `justify-content: space-between` y `align-items: flex-start`.
   - A la izquierda: h1 + subtítulo apilados verticalmente.
   - A la derecha: botón naranja `"+ Lanzar idea"` (`data-testid="btn-launch-idea"`), alineado al inicio del eje cruzado (`align-self: flex-start`).
   - El botón usa `background: var(--color-accent)`, texto blanco, `border-radius: var(--radius-md)`.

3. **[AC-3]** Dado que el usuario hace clic en el botón `"+ Lanzar idea"`, cuando se procesa el clic, entonces:
   - Se abre el modal `LaunchIdeaModal` de Story 9.8 (sin navegar a ninguna URL).
   - El comportamiento es idéntico al descrito en Story 9.8, AC-1.

4. **[AC-4]** Dado que el bloque de metadatos de la comunidad (nombre, descripción, número de miembros, enlace a Configuración) existía previamente en el header, cuando se implementa el nuevo diseño, entonces:
   - El bloque de metadatos pasa a ser secundario o discreto: se mueve debajo del subtítulo o se elimina del header principal, sin ocupar el espacio prominente anterior.
   - Al menos el nombre de la comunidad sigue siendo accesible en la página (puede ser en texto pequeño/muted o en otro lugar del layout), pero no como elemento dominante.

5. **[AC-5]** Dado que ejecuto la suite de tests, cuando todos pasan, entonces lint/tsc/tests son verdes (≥384 tests pasando, en paralelo o posterior a Story 9.8).

## Tasks / Subtasks

- [ ] **T1** — Modificar el header en `app/(app)/communities/[slug]/page.tsx`
  - [ ] T1.1 Reemplazar el heading actual del nombre de la comunidad por `<h1 data-testid="feed-heading">Ideas en validación</h1>`
  - [ ] T1.2 Añadir `<p data-testid="feed-subheading">Da feedback. Aprende más rápido. Decide qué construir.</p>` debajo del h1
  - [ ] T1.3 Aplicar layout flex `justify-between` en el contenedor del header
  - [ ] T1.4 Mover el bloque de metadatos de comunidad a posición secundaria (debajo del subtítulo, texto pequeño/muted)
  - [ ] T1.5 Añadir botón `"+ Lanzar idea"` alineado a la derecha del header

- [ ] **T2** — Conectar botón con modal (Story 9.8)
  - [ ] T2.1 Si `LaunchIdeaModal` ya existe (Story 9.8 implementada): importar `FeedWithModal` o el wrapper client correspondiente y envolver el área del feed
  - [ ] T2.2 Si Story 9.8 no está implementada aún: el botón puede ser un placeholder con `onClick={() => {}}` y un comentario `// TODO: conectar a LaunchIdeaModal — Story 9.8`; la integración real ocurre en la PR de 9.8 o en esta misma si se implementan juntas
  - [ ] T2.3 El botón tiene `data-testid="btn-launch-idea"`

- [ ] **T3** — Tests
  - [ ] T3.1 `tests/unit/community/CommunityFeedHeader.test.tsx` — render h1 "Ideas en validación", subtítulo, botón visible, clic abre modal (mock)
  - [ ] T3.2 Actualizar tests existentes de `app/(app)/communities/[slug]/page.tsx` que referencien el heading anterior del nombre de comunidad

- [ ] **T4** — Verificación final
  - [ ] T4.1 `npm run lint` — verde
  - [ ] T4.2 `npx tsc --noEmit` — verde
  - [ ] T4.3 `npx vitest run tests/unit/` — verde (≥384 tests)

## Dev Notes

### Arquitectura actual relevante

```
app/(app)/communities/[slug]/page.tsx  (Server Component async)
  ├── Actualmente: <h1>{community.name}</h1> como heading principal
  ├── Actualmente: botón "Nuevo proyecto" navega a /communities/[slug]/projects/new
  └── Pasa <ProjectFeed> con los proyectos de la comunidad
```

### Cambio de heading: impacto en tests existentes

El test actual probablemente verifica `screen.getByRole('heading', { name: community.name })` o similar. Localizar y actualizar esas assertions a `"Ideas en validación"` antes de implementar (TDD Outside-In).

### Integración con Story 9.8

Story 9.9 depende de Story 9.8 para la funcionalidad completa del botón. Opciones de coordinación:

- **Opción A (recomendada):** Implementar 9.9 y 9.8 en la misma rama (`feat/9-8-9-9-feed-launch`). El botón y el modal van juntos en una única PR.
- **Opción B:** Implementar 9.9 primero con el botón como placeholder, luego 9.8 conecta el modal. Requiere dos PRs pero permite paralelizar si hay dos desarrolladores.

### Layout del header (estructura HTML objetivo)

```tsx
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)',
  }}
>
  <div>
    <h1
      data-testid="feed-heading"
      style={{
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-text-primary)',
        margin: 0,
      }}
    >
      Ideas en validación
    </h1>
    <p
      data-testid="feed-subheading"
      style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--space-1)',
        marginBottom: 0,
      }}
    >
      Da feedback. Aprende más rápido. Decide qué construir.
    </p>
    {/* Metadatos de comunidad en posición secundaria */}
    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
      {community.name}
    </p>
  </div>
  <button
    data-testid="btn-launch-idea"
    onClick={() => setIsModalOpen(true)}
    style={{
      background: 'var(--color-accent)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-2) var(--space-4)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-semibold)',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    + Lanzar idea
  </button>
</div>
```

> Nota: el `onClick` y el estado `isModalOpen` requieren que este bloque esté en un Client Component (el `FeedWithModal` wrapper de Story 9.8) o extraer el header a su propio `'use client'` component.

### Design tokens en uso

- `var(--text-2xl)` — h1 "Ideas en validación"
- `var(--text-sm)` — subtítulo
- `var(--text-xs)` — metadatos de comunidad secundarios
- `var(--color-text-primary)` — h1
- `var(--color-text-muted)` — subtítulo y metadatos
- `var(--color-accent)` — botón naranja
- `var(--font-bold)`, `var(--font-semibold)` — pesos tipográficos
- `var(--space-1)`, `var(--space-2)`, `var(--space-4)`, `var(--space-6)` — espaciados
- `var(--radius-md)` — border-radius del botón

### Dependencias

- **Story 9.8** — `LaunchIdeaModal` debe existir para que el botón sea funcional. Si se implementan por separado, el botón puede ser placeholder con TODO.
- **No requiere cambios de DB** — solo cambios de UI en el Server Component y posiblemente un Client wrapper.

### Git context

```
19ac310 feat(project-detail): tagline, sidebar universal y feedback inline — Story 9.7 (#59)
d7e473d feat(feed): secciones Live/Cerrados, ProjectCard horizontal y fix bug autor — Story 9.6 (#58)
```

### Rama sugerida

`feat/9-9-feed-header-ideas-en-validacion`

O combinada con 9.8: `feat/9-8-9-9-feed-launch-modal`

### Flow

Quick Flow (Bart) — complejidad baja: cambios de texto, layout flex y conexión con modal ya existente. Sin cambios de DB ni lógica de negocio nueva.

## Dev Agent Record

_A rellenar por Bart al implementar._

### Agent Model Used

_pendiente_

### File List

_pendiente_

### Implementation Notes

_pendiente_

### Completion Notes

_pendiente_
