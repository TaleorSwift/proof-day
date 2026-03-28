# Gamificación

## Qué hace
Muestra en cada página de comunidad dos widgets en la barra lateral derecha: un contador personal de feedbacks dados en esa comunidad, y el Top Reviewer de la semana en curso (lunes–domingo UTC). Ambos widgets son visibles solo para miembros de la comunidad. El objetivo es reconocer la participación activa sin convertirlo en un ranking frío.

## Reglas de comportamiento
- El contador personal muestra solo los feedbacks del usuario autenticado en esa comunidad específica — no el total de la comunidad. (story 6.2)
- El Top Reviewer es el miembro con más feedbacks en la semana en curso (lunes 00:00 UTC a domingo 23:59 UTC). (story 6.2)
- En caso de empate en número de feedbacks, gana quien hizo su primer feedback antes (menor `created_at`). (story 6.2)
- Si no hay feedbacks en la semana actual, el widget Top Reviewer muestra el empty state "Sé el primero en dar feedback esta semana" — nunca se oculta del todo para motivar participación. (story 6.2)
- El avatar del Top Reviewer enlaza a su perfil `/profile/[id]`. (story 6.2)
- Los widgets muestran skeleton mientras cargan y nunca pantalla en blanco. (story 6.2)
- Solo miembros de la comunidad pueden consultar los datos de gamificación (guard 403 en la API). (story 6.2)

## Ficheros clave
- `components/gamification/TopReviewerWidget.tsx`
- `components/gamification/PersonalFeedbackCounter.tsx`
- `lib/utils/gamification.ts`
- `app/api/gamification/top-reviewer/route.ts`
- `app/api/gamification/feedback-count/route.ts`

## Última actualización
Story 6.2 — 2026-03-28
