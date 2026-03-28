# Feedback

## Qué hace
Permite a los miembros de una comunidad dar feedback estructurado a los proyectos `live` de otros builders. Cada feedback consiste en 3 scores (1-3) para preguntas de problema, solución y viabilidad, más un texto obligatorio de mejora (P4, mínimo 10 chars, máximo 2000). Un reviewer solo puede dar feedback una vez por proyecto. El feedback alimenta el Proof Score del proyecto.

## Reglas de comportamiento
- Solo se puede dar feedback a proyectos en estado `live` con decisión `null`. (story 4.x)
- El builder no puede dar feedback en su propio proyecto. (story 4.x)
- Solo se puede dar feedback si el reviewer es miembro de la comunidad del proyecto. (story 4.x)
- El `communityId` del request debe coincidir con el del proyecto. (story 4.x)
- Un reviewer solo puede dar feedback una vez por proyecto (unicidad en DB). (story 4.x)
- Los scores válidos son 1 (No), 2 (Parcialmente), 3 (Sí). Valores fuera de rango rechazados. (story 4.x)
- P4 (texto de mejora) es obligatorio (mín 10 chars, máx 2000). P1-P3 son textos opcionales. (story 4.x, Fase 2)
- `GET /api/feedback?projectId=X` solo accesible para el builder del proyecto. (story 4.x)
- El dialog de feedback incluye `DialogDescription` para accesibilidad de lectores de pantalla. (Fase 5)

## Ficheros clave
- `app/api/feedback/route.ts` — thin controller: POST (submit) + GET (list para builder)
- `lib/services/feedback.service.ts` — validateEligibility (7 reglas de negocio)
- `lib/repositories/feedback.repository.ts` — queries Supabase
- `lib/validations/feedback.ts` — submitFeedbackSchema con Zod
- `components/feedback/FeedbackDialog.tsx` — formulario de feedback (Dialog)
- `components/feedback/FeedbackList.tsx` — lista de feedbacks para el builder

## Última actualización
Arch Fase 3 — 2026-03-28 | A11y Fase 5 — 2026-03-28
