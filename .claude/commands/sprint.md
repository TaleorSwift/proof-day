---
description: "Ejecutar sprint — Orquesta agent team para implementar stories en paralelo"
---

Lee `_bmad/bmm/config.yaml` para variables de sesión.
Lee el sprint backlog en `_bmad-output/implementation-artifacts/`.

Crea un agent team con estos roles:
1. **Tú (lead)**: coordinas. No implementas. Modo delegate.
2. **Homer (teammate)**: implementa stories asignadas al sprint
3. **Edna (teammate)**: valida cada story completada por Homer

Flujo por story:
- Homer implementa → commit → crea PR → marca task complete
- Homer actualiza Notion si story_tracking enabled
- Edna ejecuta tests y valida ACs
- Edna actualiza Notion: Resultado QA → Pass/Fail
- Si Edna aprueba → story Done
- Si Edna rechaza → Homer recibe feedback y corrige

Cada teammate trabaja en su propio worktree.
Cada agente escribe su propio ELP por story.
