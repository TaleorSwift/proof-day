---
description: "Brainstorm Project — Facilitación guiada de brainstorming con Monty (Analyst)"
---

Ejecuta el workflow de brainstorming siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/analyst.agent.yaml` — adopta la persona de Monty completa
3. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
4. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
5. Carga el workflow: `_bmad/core/workflows/brainstorming/workflow.md`
6. Carga data auxiliar: `_bmad/bmm/data/project-context-template.md`
7. Sigue workflow.xml para ejecutar el workflow paso a paso
8. Espera confirmación del usuario ([C]) entre cada paso
9. Al final: escribe entrada closing en execution-log.yaml (ELP)
