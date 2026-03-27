---
description: "Setup Project — Inicializar proyecto BMAD-S, configurar variables y generar manifests"
---

Ejecuta este workflow siguiendo estos pasos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
3. Carga el workflow: `_bmad/bmm/workflows/setup/setup-project/workflow.yaml`
4. Sigue workflow.xml para ejecutar el workflow paso a paso
5. Espera confirmación del usuario entre cada paso
6. Al finalizar, genera manifests en `_bmad/_config/`:
   - `task-manifest.csv` — catálogo de tasks (para LT de BMad Master)
   - `workflow-manifest.csv` — catálogo de workflows (para LW de BMad Master)
   - `agent-manifest.csv` — catálogo de agentes instalados
