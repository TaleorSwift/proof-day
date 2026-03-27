---
name: cr
description: Code Review — Revisión de código con Homer en contexto aislado. Usar después de DS completado.
context: fork
agent: homer
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Code Review — Revisión en contexto aislado

Ejecuta el workflow de code review siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Lee `_bmad/bmm/agents/dev.agent.yaml` — adopta la persona de Homer completa
3. Ejecuta el VRG gate de la sección `secture_adaptation` del agente:
   - Emite ARTIFACT INVENTORY
   - Emite EXECUTION MODE (VERIFY / REFINE / GENERATE)
   - Procede automáticamente (no hay usuario interactivo en fork)
4. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
5. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
6. Carga el workflow: `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`
7. Sigue workflow.xml para ejecutar el workflow paso a paso
8. Ejecuta todos los pasos del workflow de forma autónoma sin esperar confirmación
9. Al final: escribe entrada closing en execution-log.yaml (ELP)

## Restricciones
Code Review NO tiene acceso a Write ni Edit. El reviewer lee y analiza,
pero NUNCA modifica código. Si encuentra issues, los documenta.

## Contexto aislado
Este skill corre en ventana de contexto separada de 200K tokens.
Al terminar, el resumen debe incluir:
- Story revisada (key + título)
- Veredicto: APPROVED o CHANGES_REQUESTED
- Si APPROVED: siguiente paso → QA (Edna)
- Si CHANGES_REQUESTED: lista de issues → volver a DS (Homer)
- Estado ELP (SUCCESS/PARTIAL/FAILED)