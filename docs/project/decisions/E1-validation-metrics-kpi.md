# E1 — KPI calculateValidationMetrics

**Fecha**: 2026-04-29
**Estado**: Aprobado

## Decisión
El denominador de los porcentajes es `feedbackCount` (total en BD), no `feedbacks.length`. Las no-respuestas (score p1 o p2 = 0) cuentan como "no entiende" / "no usaría".

## Motivación
Reflejar el % real de usuarios alcanzados, incluso si no todos han respondido en la página actual (paginación).

## Consecuencias
`calculateValidationMetrics` recibe dos parámetros: el array de feedbacks Y el total de la BD. El callsite debe pasarlos coherentes.
