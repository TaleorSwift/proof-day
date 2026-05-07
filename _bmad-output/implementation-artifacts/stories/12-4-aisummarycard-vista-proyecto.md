# Story 12.4 — AISummaryCard: vista del proyecto

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.4
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.3 Done (ai_summaries tiene datos)

## User Story

Como Builder,
quiero ver el resumen IA de los feedbacks de mi proyecto en la vista de detalle,
para obtener una visión sintetizada de lo que mis revisores piensan sin leer cada feedback individualmente.

## Acceptance Criteria

**AC1 — Componente AISummaryCard: estado con datos**
Given que el Builder visita la página de su proyecto
When existe un registro en `ai_summaries` para ese proyecto
Then se muestra el componente `AISummaryCard` con el contenido del resumen
And se muestra `data-testid="ai-summary-card"`
And se muestra `data-testid="ai-summary-text"` con el texto del resumen (`content` de la tabla)
And se muestra una sección de insights `data-testid="ai-summary-insights"` con los puntos clave parseados del contenido
And el footer muestra la fecha de generación y el modelo usado (ej: "Generado el 6 may 2026 · claude-sonnet-4-6")

**AC2 — Componente AISummaryCard: estado vacío**
Given que el Builder visita la página de su proyecto
When NO existe un registro en `ai_summaries` para ese proyecto
Then se muestra `AISummaryCard` con el estado vacío
And el estado vacío muestra: "Tu síntesis aún no está disponible. Se genera automáticamente cuando recibes 3 feedbacks completos."
And NO se muestra `data-testid="ai-summary-text"` ni `data-testid="ai-summary-insights"`

**AC3 — Componente AISummaryCard: estado loading**
Given que el componente recibe `isLoading={true}`
Then se muestra un skeleton loader con `data-testid="ai-summary-skeleton"`
And NO se muestra el contenido real ni el estado vacío

**AC4 — Banner "Generado por IA"**
Given que se muestra `AISummaryCard` con datos
Then incluye un banner o badge visible con el texto "Generado por IA"
And el banner usa `backgroundColor: 'var(--color-hypothesis-bg)'` y `border: '1px solid var(--color-hypothesis-border)'` (patrón "en juego" del design system)

**AC5 — Visibilidad: solo para el Builder (owner)**
Given que un Reviewer (no owner) visita la página del proyecto
Then NO se muestra `AISummaryCard`
Given que el Builder (owner) visita la página del proyecto
Then `AISummaryCard` sí se muestra (sea cual sea el contenido)

**AC6 — Integración en page.tsx**
Given que se actualiza `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx`
When el usuario es owner (`isOwner === true`)
Then se consulta `ai_summaries` para el proyecto y se pasa el resultado a `AISummaryCard`
And `AISummaryCard` se renderiza dentro del bloque "Feedback recibido" de la sidebar del owner, debajo de `FeedbackQualityStats`
And si la query está en curso (usando Suspense o estado loading), se pasa `isLoading={true}`

**AC7 — Props del componente**
Given que reviso la interfaz del componente
Then las props son:
```typescript
interface AISummaryCardProps {
  summary: AISummary | null
  isLoading?: boolean
}
```
Donde `AISummary` se importa de `@/lib/types/ai`

**AC8 — Storybook**
Given que ejecuto Storybook
When navego a la story de `AISummaryCard`
Then encuentro 4 stories:
  - `Default` — con datos de síntesis reales (summary no null)
  - `Empty` — sin datos (summary null)
  - `Loading` — con isLoading=true
  - `WithInsights` — con un summary que tiene múltiples puntos en los insights

**AC9 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `AISummaryCard`
Then hay tests para: renderizado con datos, renderizado vacío, skeleton visible con isLoading=true, badge "Generado por IA" visible, data-testid correctos

## Tasks

- [ ] Task 1: Crear `components/projects/AISummaryCard.tsx` — componente presentacional con las 3 variantes (datos, vacío, loading)
- [ ] Task 2: Implementar el banner "Generado por IA" con tokens `--color-hypothesis-bg` y `--color-hypothesis-border`
- [ ] Task 3: Implementar el Skeleton loader usando el componente `Skeleton` de `components/ui/skeleton` (shadcn/ui)
- [ ] Task 4: Actualizar `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — añadir query de `ai_summaries` para el owner y renderizar `AISummaryCard` en la sidebar
- [ ] Task 5: Crear `components/projects/AISummaryCard.stories.tsx` con las 4 stories
- [ ] Task 6: Crear `tests/unit/components/AISummaryCard.test.tsx` con los tests del AC9

## Dev Notes

### Ficheros a crear
- `components/projects/AISummaryCard.tsx`
- `components/projects/AISummaryCard.stories.tsx`
- `tests/unit/components/AISummaryCard.test.tsx`

### Ficheros a modificar
- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — añadir query + integración del componente

### Tipos de referencia (`lib/types/ai.ts`)
- `AISummary` — interfaz de dominio con camelCase: `id`, `projectId`, `content`, `feedbackCountAtGeneration`, `model`, `createdAt`, `updatedAt`
- `AISummaryRow` — row de Supabase con snake_case
- `aiSummaryFromRow()` — mapper para convertir el resultado de Supabase a `AISummary`

### Query de ai_summaries en page.tsx
La query se añade dentro del bloque `isOwner`. Usar el cliente de Supabase con cookies (ya disponible en la page):
```typescript
const { data: aiSummaryRow } = await supabase
  .from('ai_summaries')
  .select('*')
  .eq('project_id', project.id)
  .maybeSingle()

const aiSummary = aiSummaryRow ? aiSummaryFromRow(aiSummaryRow) : null
```
La RLS de `ai_summaries` permite SELECT para usuarios autenticados (migración 031), así que el cliente con cookies es suficiente.

### Estructura del campo content
El campo `content` de `ai_summaries` almacena el texto completo del resumen tal como lo devuelve Claude. Para extraer los "key insights", el componente puede hacer un parseo básico del texto buscando secciones con bullets (`-` o `•`), o simplemente mostrar el contenido como texto formateado con saltos de línea. La lógica exacta de parseo es responsabilidad del implementador — documentar la decisión en el Dev Agent Record.

### Posición en la sidebar
Dentro del bloque `isOwner && (...)` de la sidebar, el orden recomendado es:
1. `FeedbackCounter` (ya existe)
2. `FeedbackQualityStats` (ya existe)
3. `AISummaryCard` (nuevo — añadir aquí)
4. `FeedbackList` (ya existe)

### Patrones del proyecto (design-tokens.md)
- NO usar Tailwind directamente — usar siempre `var(--color-*)`, `var(--space-*)`, etc.
- NO modificar `components/ui/` (shadcn/ui es intocable)
- Skeleton: usar `<Skeleton>` de `@/components/ui/skeleton` para el loading state
- Patrón "en juego" para el banner IA:
  ```css
  backgroundColor: 'var(--color-hypothesis-bg)'   /* #FDF0E8 */
  border: '1px solid var(--color-hypothesis-border)' /* #F0C9A8 */
  borderRadius: 'var(--radius-xl)'                 /* 16px */
  ```

### Patrón visual de referencia
Ver `components/feedback/FeedbackQualityStats.tsx` para el patrón de componente presentacional que usa CSS vars y data-testid. El componente es client (o server) según necesidad — `AISummaryCard` puede ser un Server Component si no necesita interactividad, o Client Component si se añade algún estado futuro.

### Storybook — datos de fixture
Para las stories, usar datos similares a:
```typescript
const mockSummary: AISummary = {
  id: 'summary-1',
  projectId: 'project-1',
  content: 'Este proyecto aborda un problema real de validación de ideas...\n\n**Puntos fuertes:**\n- Proceso claro\n- UI intuitiva\n\n**Áreas de mejora:**\n- Falta integración con herramientas existentes\n\n**Recomendación:** Continuar con el MVP.',
  feedbackCountAtGeneration: 5,
  model: 'claude-sonnet-4-6',
  createdAt: '2026-05-06T10:00:00Z',
  updatedAt: '2026-05-06T10:00:00Z',
}
```

### TDD Outside-In
1. Escribir primero el test de `AISummaryCard.test.tsx` con los casos del AC9
2. Implementar el componente hasta que los tests pasen
3. Escribir el test de integración en page.tsx (o probar manualmente si no aplica unit test)
