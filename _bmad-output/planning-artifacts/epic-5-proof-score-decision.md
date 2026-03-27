# Epic 5: Proof Score & Decisión

**Estado:** backlog
**Objetivo:** La señal accionable — el "aha moment" del Builder. Del feedback estructurado a la decisión documentada.
**FRs cubiertos:** FR20, FR21, FR22, FR23
**Valor entregado:** El Builder recibe una señal interpretable (Promising/Needs iteration/Weak) y registra su decisión explícita visible para la comunidad.

---

## Story 5.1: Proof Score Calculation Algorithm

**Como** plataforma,
**quiero** calcular el Proof Score a partir de los feedbacks recibidos usando el algoritmo definido,
**para que** el Builder reciba una señal interpretable y accionable sobre su proyecto.

### Criterios de Aceptación

- [ ] Proof Score solo se calcula cuando hay ≥ 3 feedbacks (FR20)
- [ ] Con < 3 feedbacks: retorna `null` (no se muestra score)
- [ ] Algoritmo: promedio de todos los scores de las preguntas P1-P3 de todos los feedbacks
  - Cada pregunta: Yes=3pts / Somewhat=2pts / No=1pt
  - Score total = sum(scores) / (n_feedbacks × 3_preguntas)
  - Thresholds: ≥ 4.0 → "Promising" (imposible con max=3 → ajuste: ≥ 2.67 → Promising, 2.0-2.66 → Needs iteration, < 2.0 → Weak)
  - **Thresholds correctos** (escala 1-3): ≥ 2.5 → Promising, 1.75-2.49 → Needs iteration, < 1.75 → Weak
- [ ] `lib/utils/proof-score.ts` exporta `calculateProofScore(feedbacks: FeedbackResponse[]): ProofScoreResult | null`
- [ ] Función pura — testeable con Vitest
- [ ] Tests unitarios con al menos 6 casos: límite < 3 feedbacks, exactamente 3, todos Yes, todos No, mixtos, borde de threshold

### Notas Técnicas

- `lib/utils/proof-score.ts`:
  ```typescript
  const MIN_FEEDBACKS = 3
  const PROMISING_THRESHOLD = 2.5
  const NEEDS_ITERATION_THRESHOLD = 1.75

  export function calculateProofScore(feedbacks: FeedbackResponse[]): 'Promising' | 'Needs iteration' | 'Weak' | null {
    if (feedbacks.length < MIN_FEEDBACKS) return null
    const totalScores = feedbacks.flatMap(f => [f.scores.p1, f.scores.p2, f.scores.p3])
    const average = totalScores.reduce((sum, s) => sum + s, 0) / totalScores.length
    if (average >= PROMISING_THRESHOLD) return 'Promising'
    if (average >= NEEDS_ITERATION_THRESHOLD) return 'Needs iteration'
    return 'Weak'
  }
  ```
- `app/api/proof-score/[projectId]/route.ts` — GET, llama a calculateProofScore con feedbacks del proyecto
- `lib/api/proof-score.ts` — `getProofScore(projectId)`

---

## Story 5.2: Proof Score Display & Waiting State

**Como** Builder,
**quiero** ver el Proof Score de mi proyecto con peso visual cuando esté disponible, y un estado de espera motivador mientras no lo esté,
**para que** siempre sepa qué está pasando con mi idea.

### Criterios de Aceptación

**Estado de espera (< 3 feedbacks):**
- [ ] `ProofScoreWaiting` component visible en sidebar de vista de proyecto
- [ ] Número dinámico: "Faltan N feedbacks para tu señal" (N = 3 - feedbacks_recibidos)
- [ ] Progress bar: value = (feedbacks_recibidos / 3) × 100
- [ ] Copy motivador: "Tu señal estará lista pronto"
- [ ] No se muestra el score parcial ni ninguna métrica numérica

**Estado con score (≥ 3 feedbacks):**
- [ ] `ProofScoreBadge` visible en sidebar (FR20)
- [ ] Variante `full` (con descripción de una línea):
  - Promising: icono ✓, fondo verde claro, "El equipo ve potencial real"
  - Needs iteration: icono ⟳, fondo ámbar, "La solución genera dudas — refina antes de escalar"
  - Weak: icono ✗, fondo rojo claro, "Señal débil — reconsidera el enfoque"
- [ ] Color e icono autoexplicativos sin necesidad de leer texto
- [ ] Score visible solo para el Builder (no para Reviewers) (FR20)
- [ ] Skeleton loading mientras fetch del score

### Notas Técnicas

- `components/proof-score/ProofScoreBadge.tsx`
- `components/proof-score/ProofScoreWaiting.tsx`
- Score se calcula on-demand al cargar la vista de proyecto (no cached en DB)
- `aria-live="polite"` en el contenedor del score para screen readers

---

## Story 5.3: Builder Decision Registration

**Como** Builder,
**quiero** poder registrar mi decisión explícita (Iterar / Escalar / Abandonar) cuando tenga mi Proof Score,
**para que** mi equipo vea el cierre del ciclo de validación y podamos aprender colectivamente.

### Criterios de Aceptación

- [ ] Botón "Registrar decisión" visible en sidebar SOLO cuando Proof Score está disponible
- [ ] Dialog de confirmación con 3 opciones como Cards seleccionables (FR22):
  - Iterar ↺: "Refinar la propuesta antes de escalar"
  - Escalar ↑: "Llevar adelante la idea"
  - Abandonar ✗: "Detener el desarrollo de esta idea"
- [ ] Flujo dos pasos: selección → botón "Confirmar decisión" (disabled hasta seleccionar)
- [ ] Decisión irreversible visualmente — no se puede cambiar una vez registrada
- [ ] Post-confirmación: Dialog se cierra, `DecisionBadge` aparece en la vista de proyecto (FR23)
- [ ] `DecisionBadge` visible para TODOS los miembros de la comunidad (FR23)
- [ ] `DecisionBadge` aparece en la ProjectCard de la lista de proyectos
- [ ] Formulario de feedback bloqueado tras registrar decisión
- [ ] Botón "Registrar decisión" desaparece tras registrar

### Criterios de Rechazo

- [ ] NO debe ser un dropdown ni un select
- [ ] NO debe ser posible cambiar la decisión una vez registrada

### Notas Técnicas

- `components/projects/DecisionBadge.tsx`
- `app/api/projects/[id]/decision/route.ts` — POST con body `{ decision: 'iterate' | 'scale' | 'abandon' }`
- `lib/api/projects.ts` — `registerDecision(projectId, decision)`
- Tabla `projects`: columnas `decision` y `decided_at`
- RLS: solo el Builder puede escribir la decisión de su proyecto; todos los miembros de la comunidad pueden leer
