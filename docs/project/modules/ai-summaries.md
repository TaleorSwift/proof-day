# AI Summaries, Notificaciones y Copiloto IA

## Qué hace
Infraestructura de IA de Proof Day. Incluye: resúmenes automáticos de feedback con Ollama, notificaciones por usuario, tracking de costes mensual, y copiloto de creación de proyectos.
El copiloto IA ayuda al Builder a formular problema, solución e hipótesis durante el wizard, generando sugerencias de texto contextuales desde Ollama (local, sin coste económico).

## Reglas de comportamiento
- Cada proyecto tiene como máximo un resumen IA (relación 1:1 con UNIQUE project_id). (story 12.1)
- Las notificaciones son privadas: cada usuario solo puede leer y actualizar las suyas propias. (story 12.1)
- Los costes se agrupan por mes en formato YYYY-MM. (story 12.1)
- El copiloto IA genera sugerencias solo para campos `problem`, `solution`, `hypothesis`. Cualquier otro campo retorna 400. (story 13.7)
- El botón "Sugerir con IA" está deshabilitado si el Builder no ha escrito el nombre del proyecto. (story 13.7)
- Cuando el Builder recibe una sugerencia, el campo se rellena automáticamente y muestra el badge "✦ Generado con IA". (story 13.7)
- El badge "Generado con IA" desaparece en cuanto el Builder empieza a editar el campo manualmente. (story 13.7)
- Si Ollama no está disponible, la API retorna 503 — la UI no bloquea al Builder. (story 13.7)
- El copiloto usa el presupuesto global (centinela `'global'`), no el de una comunidad específica. (story 13.7)

## Ficheros clave
- `app/api/ai/suggest-project-field/route.ts` — API copiloto wizard
- `components/projects/wizard/AISuggestButton.tsx` — botón "Sugerir con IA"
- `lib/ai/ollamaClient.ts` — cliente Ollama singleton
- `lib/ai/costTracker.ts` — tracking de uso mensual

## Última actualización
Story 13.7 — 2026-05-07
