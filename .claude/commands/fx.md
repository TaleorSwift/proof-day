---
description: "Error Recovery — Investigar y resolver errores detectados en el dashboard"
---

Ejecuta el modo de recuperación de errores:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga step-02 del dashboard: `_bmad/bmm/workflows/observe/project-dashboard/`
3. Lee `_bmad-output/execution-log.yaml` para encontrar entradas con errors
4. Para cada error encontrado, ofrece:
   - Investigar causa raíz
   - Reintentar el workflow que falló
   - Marcar como resuelto manualmente
5. Actualiza execution-log.yaml con las acciones tomadas
