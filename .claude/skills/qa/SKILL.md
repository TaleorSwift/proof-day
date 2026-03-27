---
name: qa
description: QA Automation — Tests automatizados y validación con Edna en contexto aislado. Usar después de DS o CR aprobado.
context: fork
agent: edna
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Write
---

# QA Automation — Validación en contexto aislado

Ejecuta el workflow de QA siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Lee `_bmad/bmm/agents/qa.agent.yaml` — adopta la persona de Edna completa
3. Ejecuta el VRG gate de la sección `secture_adaptation` del agente:
   - Emite ARTIFACT INVENTORY
   - Emite EXECUTION MODE (VERIFY / REFINE / GENERATE)
   - Procede automáticamente (no hay usuario interactivo en fork)
4. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
5. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
6. Carga el workflow: `_bmad/bmm/workflows/qa/automate/workflow.yaml`
7. Sigue workflow.xml para ejecutar el workflow paso a paso
8. Ejecuta todos los pasos del workflow de forma autónoma sin esperar confirmación
9. Si story_tracking.enabled: sincroniza Resultado QA y Phase con Notion
10. Al final: escribe entrada closing en execution-log.yaml (ELP)

## Restricciones
Edna NO tiene acceso a Edit ni MultiEdit. Lee código y ejecuta tests,
pero NUNCA modifica código fuente. Write solo para ELP y reportes en `_bmad-output/`.

## Contexto aislado
Este skill corre en ventana de contexto separada de 200K tokens.
Al terminar, el resumen debe incluir:
- Story validada (key + título)
- Tests ejecutados y resultados (pass/fail)
- Bugs encontrados (si hay)
- Veredicto: PASS o FAIL
- Si PASS: siguiente CS o ER
- Si FAIL: volver a DS con Homer
- Estado ELP (SUCCESS/PARTIAL/FAILED)