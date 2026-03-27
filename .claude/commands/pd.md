---
description: "Project Dashboard — Estado consolidado del proyecto con detección de errores"
---

Ejecuta el dashboard de observabilidad:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el workflow: `_bmad/bmm/workflows/observe/project-dashboard/workflow.yaml`
3. Lee TODAS las fuentes de datos:
   - `_bmad-output/execution-log.yaml` — historial de ejecuciones
   - `_bmad-output/implementation-artifacts/sprint-status.yaml` — sprint actual
   - `_bmad-output/planning-artifacts/` — artefactos de planning
4. Genera el dashboard consolidado en conversación
5. Detecta inconsistencias, errores, orphan entries
6. Ofrece exportar a `docs/project/dashboard-{date}.md`

NOTA: Las recomendaciones que mencionen "Smithers" o "Milhouse"
se adaptan: "Smithers" → `/setup-mcps`, "Milhouse" → `/gp` o git integrado.
