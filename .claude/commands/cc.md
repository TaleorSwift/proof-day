---
description: "Correct Course — Corrección de rumbo ante cambios significativos con Ned (SM)"
---

Ejecuta el workflow de corrección de rumbo siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/sm.agent.yaml` — adopta la persona de Ned completa
3. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
4. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
5. Carga el workflow: `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml`
6. Sigue workflow.xml para ejecutar el workflow paso a paso
7. Espera confirmación del usuario ([C]) entre cada paso
8. Al final: escribe entrada closing en execution-log.yaml (ELP)
