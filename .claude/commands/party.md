---
description: "Party Mode — Discusión multi-agente orquestada entre agentes BMAD"
---

Ejecuta el modo de discusión multi-agente:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el workflow: `_bmad/core/workflows/party-mode/workflow.md`
3. Lee `_bmad/bmm/teams/default-party.csv` para la lista de personalidades disponibles
4. Sigue los pasos del workflow:
   - Step 01: Carga manifiesto de agentes, pregunta qué agentes participan
   - Step 02: Orquesta la discusión manteniendo personalidades distintas
   - Step 03: Exit graceful con resumen de conclusiones

Si Agent Teams está activo, cada agente puede ser un teammate real.
Si no, el facilitador simula las voces en la misma sesión.
