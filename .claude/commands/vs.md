---
description: "Validate Story — Validar story antes de desarrollo con Ned (SM)"
---

Ejecuta este workflow en MODO VALIDACIÓN siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/sm.agent.yaml` — adopta la persona de Ned completa
3. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
4. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
5. Carga el workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
6. Ejecuta en **modo validación** — no crear, solo validar la story existente
7. Espera confirmación del usuario ([C]) entre cada paso
8. Al final: escribe entrada closing en execution-log.yaml (ELP)
