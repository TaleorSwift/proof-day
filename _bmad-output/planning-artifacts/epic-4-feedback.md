# Epic 4: Feedback

**Estado:** backlog
**Objetivo:** Feedback estructurado guiado obligatorio — calidad de señal garantizada por diseño.
**FRs cubiertos:** FR16, FR17, FR18, FR19
**Valor entregado:** Un Reviewer puede dar feedback estructurado y significativo a un proyecto Live; el Builder recibe inputs de calidad.

---

## Story 4.1: Feedback Form (4 Guided Questions)

**Como** Reviewer,
**quiero** dar feedback estructurado a un proyecto Live respondiendo 4 preguntas guiadas,
**para que** mi criterio contribuya a la señal de viabilidad del Builder de forma significativa.

### Criterios de Aceptación

- [ ] Botón "Dar feedback" visible en el sidebar de vista de proyecto (solo en proyectos Live)
- [ ] Formulario de feedback en Dialog (no página separada) (FR16)
- [ ] 4 preguntas guiadas obligatorias con ToggleGroup (Yes / Somewhat / No) (FR17):
  - P1: ¿Entiendes claramente el problema planteado?
  - P2: ¿Usarías esta solución si estuviera disponible?
  - P3: ¿Te parece viable técnicamente la solución propuesta?
  - P4: (Texto libre obligatorio) ¿Qué mejorarías de esta propuesta?
- [ ] Botón "Enviar feedback" disabled hasta que las 4 preguntas estén respondidas
- [ ] Preguntas P1-P3: ToggleGroup (Yes=3pts / Somewhat=2pts / No=1pt) + textarea libre opcional
- [ ] Pregunta P4: textarea obligatorio (mínimo 10 caracteres)
- [ ] Tooltip con icono `?` junto a cada pregunta explicando el criterio de evaluación
- [ ] Post-envío: Dialog se cierra, proyecto se actualiza con counter +1

### Criterios de Rechazo

- [ ] NO debe ser posible enviar feedback sin responder las 4 preguntas
- [ ] NO debe haber campo de puntuación numérica visible para el Reviewer (la conversión a puntos es interna)

### Notas Técnicas

- `components/feedback/FeedbackDialog.tsx` — Dialog container
- `components/feedback/FeedbackQuestion.tsx` — ToggleGroup + Textarea compuesto
- Scoring interno: Yes=3, Somewhat=2, No=1 (no visible para Reviewer)
- `app/api/feedback/route.ts` — POST handler

---

## Story 4.2: Feedback Submission & Association

**Como** plataforma,
**quiero** registrar cada feedback asociado al usuario que lo envía y al proyecto que lo recibe,
**para que** el Proof Score pueda calcularse correctamente y el Builder vea quién le dio feedback.

### Criterios de Aceptación

- [ ] Cada feedback queda asociado a: reviewer_id, project_id, community_id (FR18)
- [ ] Un Reviewer solo puede dar feedback UNA VEZ por proyecto (validación backend)
- [ ] El Builder NO puede dar feedback en su propio proyecto (validación backend)
- [ ] Feedback en proyectos Draft o Inactive es rechazado con error (FR19)
- [ ] Lista de feedbacks visible en sidebar de vista de proyecto para el Builder
- [ ] Cada feedback en la lista muestra: avatar + nombre del Reviewer + respuestas textuales
- [ ] Feedbacks ordenados por fecha (más recientes primero)
- [ ] Counter de feedbacks actualizado tras envío (revalidación de ruta Next.js)

### Notas Técnicas

- `app/api/feedback/route.ts` — validaciones backend antes de insert
- `lib/api/feedback.ts` — `submitFeedback()`, `getFeedbacks(projectId)`
- Tabla `feedbacks`: id, project_id, reviewer_id, community_id, scores (jsonb), text_responses (jsonb), created_at
- `scores`: { p1: 1|2|3, p2: 1|2|3, p3: 1|2|3 }
- `text_responses`: { p1?: string, p2?: string, p3?: string, p4: string }
- RLS: solo el Builder puede leer feedbacks de sus proyectos; Reviewers solo pueden leer sus propios feedbacks
