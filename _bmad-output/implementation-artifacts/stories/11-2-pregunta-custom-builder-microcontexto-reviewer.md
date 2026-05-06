# Story 11.2: Pregunta custom del Builder + microcontexto al Reviewer

Status: done

## Metadata

- **Epic:** 11 — Calidad del Feedback y Reciprocidad
- **Story key:** 11.2
- **Prerequisito:** Story 11.1 completada (columnas `custom_question` en `projects` y `custom_answer` en `feedbacks` disponibles en BD)
- **Phase:** Development
- **Agent:** Homer
- **Flow:** Full Flow (Homer)

## Story

Como Builder,
quiero poder añadir una pregunta personalizada a mi proyecto en el paso 3 del wizard,
para que los Reviewers me den una respuesta específica sobre algo concreto que quiero validar.

## Acceptance Criteria

**AC-1 — Campo `custom_question` en WizardStepDetails**
Dado que estoy en el paso 3 (Detalles) del wizard de creación de proyecto,
cuando visualizo el formulario,
entonces veo un campo textarea opcional con label "Pregunta para los Reviewers (opcional)" y placeholder "Ej: ¿Echarías en falta esta funcionalidad si desapareciera mañana?",
y el campo tiene un contador de caracteres visible (0/200),
y el campo tiene `data-testid="wizard-field-custom-question"`.

**AC-2 — Validación de longitud máxima**
Dado que estoy escribiendo una pregunta custom en el paso 3,
cuando el texto supera 200 caracteres,
entonces el campo muestra un borde rojo y el texto del contador cambia a color de error (`var(--color-weak-text)`),
y el botón "Continuar" permanece habilitado (la pregunta es opcional, el exceso no bloquea — el schema de Zod rechazará al publicar).

**AC-3 — Persistencia en `WizardFormData`**
Dado que el Builder escribe una pregunta custom en el paso 3 y navega al paso 4 y vuelve,
cuando regresa al paso 3,
entonces el texto de la pregunta custom se conserva sin cambios.

**AC-4 — Guardado en `projects.custom_question` al publicar**
Dado que el Builder ha rellenado el campo `custom_question` y pulsa "Publicar" en el paso 5,
cuando `launchProject()` se ejecuta en el servidor,
entonces el proyecto se crea con `custom_question` persistido en la columna `projects.custom_question` de Supabase,
y si el campo está vacío o no se envió, la columna queda como `NULL`.

**AC-5 — Campo de respuesta condicional en `FeedbackFormInline`**
Dado que el Reviewer abre el formulario de feedback de un proyecto que tiene `custom_question` no nulo y no vacío,
cuando visualiza el formulario,
entonces aparece un bloque adicional debajo de los campos estándar con el label "Pregunta del Builder:" seguido del texto de la pregunta en itálica,
y debajo un textarea con `data-testid="feedback-custom-answer"` y placeholder "Tu respuesta...",
y el textarea no tiene longitud mínima obligatoria (es opcional).

**AC-6 — Campo de respuesta NO visible sin `custom_question`**
Dado que el Reviewer abre el formulario de feedback de un proyecto que tiene `custom_question = null` o `custom_question = ""`
cuando visualiza el formulario,
entonces NO aparece el bloque de pregunta custom (el campo no existe en el DOM),
y el formulario funciona exactamente igual que antes de esta story.

**AC-7 — `custom_answer` se guarda en `feedbacks.custom_answer`**
Dado que el Reviewer escribe una respuesta en el campo custom y envía el formulario,
cuando `POST /api/feedback` procesa la petición,
entonces el campo `custom_answer` se persiste en `feedbacks.custom_answer` en Supabase,
y si el campo está vacío o el proyecto no tiene pregunta custom, `custom_answer` queda como `NULL`.

**AC-8 — La respuesta custom no afecta la validación del formulario**
Dado que el Reviewer no rellena el campo de respuesta custom,
cuando intenta enviar el formulario con los campos obligatorios completados (p1Score, p2Score, improvement ≥ 10 chars),
entonces el formulario se envía correctamente sin error,
y `custom_answer` se guarda como `NULL`.

**AC-9 — Tests pasan al 100%**
Dado que ejecuto `npm run test:unit`,
cuando se procesan los tests de esta story,
entonces todos los tests nuevos pasan al 100% y los tests existentes no se rompen.

## Tasks / Subtasks

- [x] **T1** — TDD: WizardStepDetails — campo `custom_question` (RED → GREEN → REFACTOR)
  - [x] T1.1 Escribir test: campo `wizard-field-custom-question` visible en el DOM
  - [x] T1.2 Escribir test: contador de caracteres visible (formato "0/200")
  - [x] T1.3 Escribir test: contador cambia a color error cuando length > 200
  - [x] T1.4 Escribir test: `onChange` se llama con `{ customQuestion: value }` al teclear
  - [x] T1.5 Implementar campo `customQuestion` en `WizardFormData` + `INITIAL_DATA` (cadena vacía)
  - [x] T1.6 Añadir textarea con contador al JSX de `WizardStepDetails`
  - [x] T1.7 Verificar todos los tests en verde

- [x] **T2** — TDD: FeedbackFormInline — campo condicional `custom_answer` (RED → GREEN → REFACTOR)
  - [x] T2.1 Escribir test: sin `customQuestion` prop → campo `feedback-custom-answer` NO existe en DOM
  - [x] T2.2 Escribir test: con `customQuestion="¿Qué mejorarías?"` → bloque visible con label e itálica
  - [x] T2.3 Escribir test: con `customQuestion=""` → campo NO existe en DOM
  - [x] T2.4 Escribir test: al rellenar `custom_answer` y enviar → `submitFeedback` recibe `customAnswer: "texto"`
  - [x] T2.5 Escribir test: sin rellenar `custom_answer` y enviar → `submitFeedback` recibe `customAnswer: null` o campo ausente
  - [x] T2.6 Añadir prop `customQuestion?: string` a `FeedbackFormInlineProps`
  - [x] T2.7 Añadir estado `customAnswer` y bloque condicional al JSX
  - [x] T2.8 Pasar `customAnswer` a `submitFeedback`
  - [x] T2.9 Verificar todos los tests en verde

- [x] **T3** — TDD: `launchProject` server action — guarda `custom_question` (RED → GREEN)
  - [x] T3.1 Escribir test: `launchProject` con `customQuestion: "pregunta"` → insert incluye `custom_question: "pregunta"`
  - [x] T3.2 Escribir test: `launchProject` sin `customQuestion` → `custom_question` es `null` en el insert
  - [x] T3.3 Añadir `customQuestion?: string` a `LaunchProjectInput`
  - [x] T3.4 Incluir `custom_question: input.customQuestion ?? null` en el insert de Supabase
  - [x] T3.5 Verificar tests en verde

- [x] **T4** — TDD: `POST /api/feedback` — guarda `custom_answer` (RED → GREEN)
  - [x] T4.1 Escribir test: body con `customAnswer: "respuesta"` → `feedbackRepo.create` recibe `customAnswer: "respuesta"`
  - [x] T4.2 Escribir test: body sin `customAnswer` → `feedbackRepo.create` recibe `customAnswer: null`
  - [x] T4.3 Actualizar `submitFeedbackSchema` en `lib/validations/feedback.ts` — añadir `customAnswer: z.string().optional()`
  - [x] T4.4 Actualizar `feedbackRepo.create` en `lib/repositories/feedback.repository.ts` — incluir `custom_answer` en el insert
  - [x] T4.5 Actualizar `POST /api/feedback` — extraer y pasar `customAnswer` al repo
  - [x] T4.6 Verificar tests en verde

- [x] **T5** — Actualizar `launchIdeaSchema` + `lib/validations/projects.ts`
  - [x] T5.1 Añadir `customQuestion: z.string().max(200).optional()` a `launchIdeaSchema`
  - [x] T5.2 Añadir `customQuestion: z.string().max(200).optional()` a `createProjectSchema`

- [x] **T6** — Actualizar `lib/api/feedback.ts` (cliente) — pasar `customAnswer`
  - [x] T6.1 Añadir `customAnswer?: string` al tipo `SubmitFeedbackPayload`
  - [x] T6.2 Incluir `customAnswer` en el body del fetch a `POST /api/feedback`

- [x] **T7** — Storybook: actualizar stories afectadas
  - [x] T7.1 Actualizar `stories/projects/ProjectWizard.stories.tsx` — añadir variante `ConPreguntaCustom`
  - [x] T7.2 Actualizar `stories/feedback/FeedbackFormInline.stories.tsx` con variantes `ConPreguntaCustom`, `SinPreguntaCustom` y `ConHipotesisYPreguntaCustom`

- [x] **T8** — Fixtures (ya cubiertos desde Story 11.1)
  - [x] T8.1 `lib/fixtures/projects.ts` — `customQuestion` presente en proyectos representativos
  - [x] T8.2 `lib/fixtures/feedback.ts` — `customAnswer` presente en feedbacks representativos

## Dev Agent Record

### Implementación

- **Rama:** `feat/11-2-pregunta-custom-builder-microcontexto-reviewer`
- **Tests creados:** 24 (10 WizardStepDetails, 9 FeedbackFormInline, 3 launchProject, 2 feedback-custom-answer)
- **Suite completa:** 1488/1488 tests en verde
- **Estrategia TDD:** Outside-In — tests escritos en RED antes de implementar, luego GREEN

### Decisiones técnicas

1. `data-error="true"` en textarea y contador para indicar exceso de caracteres — permite tests limpios sin inspeccionar estilos inline
2. `customAnswer: null` se envía siempre desde `FeedbackFormInline` (no se omite del payload) — simplicidad en el schema Zod y en el repo
3. `SubmitFeedbackPayload` extiende `SubmitFeedbackInput` en `lib/api/feedback.ts` para no romper los tipos existentes
4. Test existente `FeedbackFormInline.test.tsx` (envío con datos correctos) actualizado para incluir `customAnswer: null` — refleja el nuevo contrato del componente
5. T8 (fixtures) no requirió cambios — `customQuestion` y `customAnswer` ya estaban presentes desde Story 11.1

### Ficheros modificados

- `components/projects/ProjectWizard.tsx` — `WizardFormData` + `INITIAL_DATA`
- `components/projects/wizard/WizardStepDetails.tsx` — textarea + contador
- `components/feedback/FeedbackFormInline.tsx` — prop `customQuestion`, estado `customAnswer`, bloque condicional
- `components/projects/LaunchIdeaModal.tsx` — pasa `customQuestion` a `launchProject`
- `actions/projects/launchProject.ts` — `LaunchProjectInput` + insert `custom_question`
- `app/api/feedback/route.ts` — extrae y pasa `customAnswer`
- `lib/repositories/feedback.repository.ts` — `create()` incluye `custom_answer`
- `lib/validations/feedback.ts` — `customAnswer` en `submitFeedbackSchema`
- `lib/validations/projects.ts` — `customQuestion` en `launchIdeaSchema` y `createProjectSchema`
- `lib/api/feedback.ts` — `SubmitFeedbackPayload` con `customAnswer`
- `app/(app)/communities/[slug]/projects/[projectSlug]/page.tsx` — pasa `customQuestion` a `FeedbackFormInline`
- `stories/projects/ProjectWizard.stories.tsx` — variante `ConPreguntaCustom`
- `stories/feedback/FeedbackFormInline.stories.tsx` — variantes `ConPreguntaCustom`, `SinPreguntaCustom`, `ConHipotesisYPreguntaCustom`
- `tests/component/feedback/FeedbackFormInline.test.tsx` — test de envío actualizado para incluir `customAnswer: null`

### Ficheros creados

- `tests/component/projects/WizardStepDetails.11-2.test.tsx`
- `tests/component/feedback/FeedbackFormInline.11-2.test.tsx`
- `tests/unit/projects/launchProject.11-2.test.ts`
- `tests/integration/api/feedback-custom-answer.test.ts`

## Dev Notes

### Contexto de negocio

El Builder quiere obtener respuestas más específicas de sus Reviewers. En lugar de depender solo de las 4 preguntas estándar del formulario, puede añadir una pregunta libre. Esta pregunta aparece en el formulario de feedback como campo adicional al final. La respuesta es siempre opcional para el Reviewer — no queremos incrementar la fricción de dar feedback.

La pregunta se configura en el paso 3 del wizard (campo ya existe como columna en BD desde Story 11.1). Al publicar, `launchProject()` incluye `custom_question` en el insert. Al ver el proyecto, `FeedbackFormInline` recibe `customQuestion` como prop y muestra el campo condicionalmente.

### Arquitectura / Componentes

**Ficheros a modificar:**

| Fichero | Cambio |
|---|---|
| `components/projects/wizard/WizardStepDetails.tsx` | Añadir textarea `customQuestion` con contador 0/200 |
| `components/projects/ProjectWizard.tsx` | Añadir `customQuestion: ''` a `WizardFormData` e `INITIAL_DATA` |
| `components/feedback/FeedbackFormInline.tsx` | Añadir prop `customQuestion?` y campo condicional `customAnswer` |
| `actions/projects/launchProject.ts` | Añadir `customQuestion?` a `LaunchProjectInput` e incluir en insert |
| `app/api/feedback/route.ts` | Extraer `customAnswer` del body y pasarlo al repo |
| `lib/repositories/feedback.repository.ts` | Incluir `custom_answer` en el insert del método `create` |
| `lib/validations/projects.ts` | Añadir `customQuestion` a `launchIdeaSchema` y `createProjectSchema` |
| `lib/validations/feedback.ts` | Añadir `customAnswer?: string` a `submitFeedbackSchema` |
| `lib/api/feedback.ts` | Añadir `customAnswer?` al payload del cliente |
| `lib/fixtures/projects.ts` | Añadir `customQuestion` a fixtures |
| `lib/fixtures/feedback.ts` | Añadir `customAnswer` a fixtures |

**Fichero a crear (Storybook):**
- `stories/feedback/FeedbackFormInline.stories.tsx` — si no existe

### Estrategia de implementación

**TDD Outside-In:** Empezar por los tests de componente (WizardStepDetails, FeedbackFormInline) antes de implementar. Luego tests de integración para la API.

**Orden recomendado:**
1. T1 — WizardStepDetails (UI pura, sin dependencias externas)
2. T2 — FeedbackFormInline (UI pura, mockear `submitFeedback`)
3. T5 — Schemas de validación (sin lógica, solo Zod)
4. T3 — `launchProject` server action
5. T4 — `POST /api/feedback` + repo
6. T6 — cliente `lib/api/feedback.ts`
7. T7, T8 — Storybook y fixtures

**Patrón de estilos** (consistente con el proyecto):
- Usar siempre `var(--token-name)` — nunca valores hardcoded ni clases Tailwind
- El bloque de pregunta custom en `FeedbackFormInline` debe seguir el mismo patrón visual que el `hypothesis-context-banner` (fondo `var(--color-hypothesis-bg)`, borde `var(--color-hypothesis-border)`, `var(--radius-xl)`) para indicar que es contexto del Builder
- El contador de caracteres: `var(--text-xs)` + `var(--color-text-muted)` normal / `var(--color-weak-text)` cuando excede el límite

**Nota sobre el paso 3 del wizard:**
El wizard pasa `data` completo y `onChange` a `WizardStepDetails`. El campo `customQuestion` se añade a `WizardFormData` y se gestiona igual que `targetUser` o `demoLink`. La prop para `FeedbackFormInline` se la tendrá que pasar la página de detalle del proyecto desde `project.customQuestion`.

**Nota sobre el submit de feedback:**
`FeedbackFormInline` actualmente llama a `submitFeedback()` de `lib/api/feedback.ts`. Hay que extender el payload para incluir `customAnswer`. El campo solo se envía si `customQuestion` existe y tiene contenido.

### Tests a crear

```
tests/unit/projects/WizardStepDetails.test.tsx  (nuevo o extend existente)
tests/unit/feedback/FeedbackFormInline.test.tsx  (nuevo o extend existente)
tests/unit/projects/launchProject-11-2.test.ts  (nuevo)
tests/integration/feedback/feedback-custom-answer.test.ts  (nuevo)
```
