---
description: "Quick Spec — Spec rápido conversacional con Bart (Quick Flow)"
---

Ejecuta el workflow de quick spec siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/quick-flow-solo-dev.agent.yaml` — adopta la persona de Bart completa
3. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
4. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
5. Carga el workflow: `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md`
6. Sigue el workflow de 4 pasos:
   - Understand: descubre qué quiere el usuario
   - Investigate: escanea código existente, patrones, dependencias
   - Generate: produce tech-spec usando template
   - Review: valida "Ready for Development" (Actionable, Logical, Testable, Complete, Self-Contained)
7. Espera confirmación del usuario ([C]) entre cada paso
8. Output: tech-spec en `_bmad-output/planning-artifacts/`
9. Al final: escribe entrada closing en execution-log.yaml (ELP)
