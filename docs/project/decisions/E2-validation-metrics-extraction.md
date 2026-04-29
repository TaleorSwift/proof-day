# E2 — calculateValidationMetrics: helper + test integración

**Fecha**: 2026-04-29
**Estado**: Aprobado

## Decisión
Mantener `calculateValidationMetrics` como helper extraído en `lib/projects/`. Añadir test de integración en `ProjectDetailPage.test.tsx` que use la implementación real (sin mock) para verificar que las métricas llegan a `ValidationSignalCard`.

## Motivación
El helper es puro y testeable en aislamiento. El test de integración fija el contrato entre la capa de cálculo y la presentación.
