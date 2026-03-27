---
description: "Dev Story — Implementar story con Homer (Dev)"
---

Ejecuta el workflow de implementación de story siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/dev.agent.yaml` — adopta la persona de Homer completa
3. Ejecuta el VRG gate de la sección `secture_adaptation` del agente:
   - Emite ARTIFACT INVENTORY
   - Emite EXECUTION MODE (VERIFY / REFINE / GENERATE)
   - ESPERA confirmación del usuario
4. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
5. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
6. Carga el workflow: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`
7. Sigue workflow.xml para ejecutar el workflow paso a paso
8. Espera confirmación del usuario ([C]) entre cada paso
9. Si story_tracking.enabled: sincroniza Phase y Tasks con Notion
10. Al completar: `git add`, `git commit` (Conventional Commits), `git push`, crear PR
11. Actualiza la documentación funcional del módulo afectado en `docs/project/modules/{modulo}.md`:
    - Si no existe, créalo
    - Si existe, actualízalo sin borrar reglas que no hayan cambiado
    - Lenguaje FUNCIONAL. "El usuario puede filtrar por fecha" SÍ. "Se usa useState con un reducer" NO.
    - Las reglas de comportamiento se ACTUALIZAN, no se acumulan. Si un comportamiento cambia, reescribe la regla.
    - Máximo 3-5 ficheros en "Ficheros clave". Solo los principales.
    - Máximo 50 líneas por módulo. Si crece más, sobra detalle.
    - Si la story afecta varios módulos, actualiza todos.
    - Cada regla lleva la referencia de la story: (story X.Y)
    - Formato OBLIGATORIO:

      # {Nombre del módulo}

      ## Qué hace
      {Descripción funcional en 3-5 líneas. Qué hace, para quién, dónde aparece.}

      ## Reglas de comportamiento
      - {Regla 1} (story X.Y)
      - {Regla 2} (story X.Z)

      ## Ficheros clave
      - `{path/al/fichero1}`
      - `{path/al/fichero2}`

      ## Última actualización
      Story {X.Y} — {fecha}
12. Al final: escribe entrada closing en execution-log.yaml (ELP)
