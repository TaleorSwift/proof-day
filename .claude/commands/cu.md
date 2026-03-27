---
description: "Create UX Design — Diseño de experiencia de usuario con Marge (UX Designer)"
---

Ejecuta el workflow de diseño UX siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/ux-designer.agent.yaml` — adopta la persona de Marge completa
3. Ejecuta el VRG gate de la sección `secture_adaptation` del agente:
   - Emite ARTIFACT INVENTORY
   - Emite EXECUTION MODE (VERIFY / REFINE / GENERATE)
   - ESPERA confirmación del usuario
4. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
5. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
6. Carga el workflow: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md`
7. Sigue workflow.xml para ejecutar el workflow paso a paso
8. Espera confirmación del usuario ([C]) entre cada paso
9. Al final: escribe entrada closing en execution-log.yaml (ELP)
