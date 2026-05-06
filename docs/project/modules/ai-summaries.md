# AI Summaries & Notifications

## Qué hace
Infraestructura de base de datos para el sistema de resúmenes IA y notificaciones de Proof Day.
Permite almacenar resúmenes generados por IA para proyectos, notificaciones por usuario, preferencias de notificación, y tracking de costes de IA mensual.
Forma la base sobre la que las stories de funcionalidad de Epic 12 construyen la experiencia de resúmenes y alertas.

## Reglas de comportamiento
- Cada proyecto tiene como máximo un resumen IA (relación 1:1 con UNIQUE project_id). (story 12.1)
- Las notificaciones son privadas: cada usuario solo puede leer y actualizar las suyas propias. (story 12.1)
- Las preferencias de notificación son exclusivas por par (usuario, tipo): no puede haber duplicados. (story 12.1)
- Los resúmenes IA son legibles por todos los usuarios autenticados (igual que los proyectos dentro de una comunidad). (story 12.1)
- El tracking de costes de IA es exclusivo del rol service_role — no hay acceso público ni autenticado. (story 12.1)
- Los costes se agrupan por mes en formato YYYY-MM. (story 12.1)

## Ficheros clave
- `supabase/migrations/027_create_ai_summaries.sql`
- `supabase/migrations/028_create_notifications.sql`
- `supabase/migrations/031_rls_ai_tables.sql`
- `lib/types/ai.ts`

## Última actualización
Story 12.1 — 2026-05-06
