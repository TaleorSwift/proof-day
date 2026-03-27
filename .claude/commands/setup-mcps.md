---
description: "Setup MCPs — Configurar servidores MCP (GitHub, Notion, Cloud)"
---

Ejecuta este workflow siguiendo estos pasos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
3. Carga el workflow: `_bmad/bmm/workflows/setup/setup-mcps/workflow.yaml`
4. Sigue workflow.xml para ejecutar el workflow paso a paso
5. Espera confirmación del usuario entre cada paso
6. Genera o actualiza `.mcp.json` con los servidores configurados
