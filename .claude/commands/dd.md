---
description: "Deploy Execute — Ejecutar despliegue con Wiggum (Deploy). Producción requiere doble confirmación."
---

Ejecuta el workflow de deploy siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/deploy.agent.yaml` — adopta la persona de Wiggum completa
3. Lee `_bmad-output/planning-artifacts/architecture.md` — respeta ADRs
4. Ejecuta el VRG gate de la sección `secture_adaptation` del agente:
   - Emite ARTIFACT INVENTORY
   - Emite EXECUTION MODE (VERIFY / REFINE / GENERATE)
   - ESPERA confirmación del usuario
5. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
6. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
7. Carga el workflow: `_bmad/bmm/workflows/deploy/deploy-execute/workflow.yaml`
8. Sigue workflow.xml para ejecutar el workflow paso a paso
9. Si deploy a producción: requiere DOBLE confirmación del usuario
10. Espera confirmación del usuario ([C]) entre cada paso
11. Al final: escribe entrada closing en execution-log.yaml (ELP)
