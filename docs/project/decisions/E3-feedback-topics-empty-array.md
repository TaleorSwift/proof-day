# E3 — feedbackTopics [] = borrado explícito

**Fecha**: 2026-04-29
**Estado**: Aprobado

## Decisión
El cliente envía siempre el array `feedbackTopics`, incluyendo `[]` cuando se eliminan todos los temas. La API route convierte `[]` a `NULL` en Supabase (`feedback_topics` columna `text[]`).

## Motivación
Semántica clara: ausencia de campo = sin cambio. Array vacío = borrado intencional. Evita ambigüedad en PATCH parciales.

## Consecuencias
`ProjectForm` envía `feedbackTopics` siempre. La route tiene la lógica de conversión: `length > 0 ? array : null`.
