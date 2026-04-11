# Feedback

## Qué hace
Permite a los miembros de una comunidad dar feedback estructurado a los proyectos `live` de otros builders. Cada feedback consiste en 3 scores (1-3) para preguntas de problema, solución y viabilidad, más un texto obligatorio de mejora (P4, mínimo 10 chars). Un reviewer solo puede dar feedback una vez por proyecto. El feedback alimenta el Proof Score del proyecto y la señal de validación universal.

## Reglas de comportamiento
- Solo se puede dar feedback a proyectos en estado `live` con decisión `null`. (story 4.x)
- El builder no puede dar feedback en su propio proyecto. (story 4.x)
- Solo se puede dar feedback si el reviewer es miembro de la comunidad del proyecto. (story 4.x)
- El `communityId` del request debe coincidir con el del proyecto. (story 4.x)
- Un reviewer solo puede dar feedback una vez por proyecto (unicidad en DB). (story 4.x)
- Los scores válidos son 1 (No), 2 (Parcialmente), 3 (Sí). Valores fuera de rango rechazados. (story 4.x)
- P4 (texto de mejora) es obligatorio (mín 10 chars). P1-P3 son textos opcionales. (story 4.x)
- `GET /api/feedback?projectId=X` solo accesible para el builder del proyecto. (story 4.x)
- `FeedbackFormInline` en la sidebar de la página de detalle permite dar feedback con 2 preguntas (p1, p2) y un textarea. P3 se envía como 2 (valor neutral, no preguntado al usuario). (story 9.7)
- Cada `FeedbackEntry` muestra pills de scores: "Problema: sí/parcialmente/no" y "Lo usaría: sí/no" cuando `scores` están disponibles. La paleta usa los tokens semáforo: weak/needs/promising. (story 9.7)

## Ficheros clave
- `app/api/feedback/route.ts` — thin controller: POST (submit) + GET (list para builder)
- `lib/services/feedback.service.ts` — validateEligibility (7 reglas de negocio)
- `lib/repositories/feedback.repository.ts` — queries Supabase (incluye `scores` en findByProject desde story 9.7)
- `components/feedback/FeedbackFormInline.tsx` — formulario inline en sidebar (story 9.7)
- `components/feedback/FeedbackEntry.tsx` — entrada individual con pills de scores (story 9.7)
- `components/feedback/FeedbackDialog.tsx` — formulario de feedback completo (Dialog)

## Última actualización
Story 9.7 — 2026-04-11
