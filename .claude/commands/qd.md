---
description: "Quick Dev — Desarrollo rápido con Bart (Quick Flow). Acepta tech-spec o instrucciones directas."
---

Ejecuta el workflow de quick dev siguiendo estos pasos exactos:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/quick-flow-solo-dev.agent.yaml` — adopta la persona de Bart completa
3. Escribe entrada STARTED en `_bmad-output/execution-log.yaml` (ELP)
4. Captura baseline commit: `git rev-parse HEAD` como {baseline_commit}
5. Carga el motor de workflows: `_bmad/core/tasks/workflow.xml`
6. Carga el workflow: `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md`
7. Step 1 — Detección de modo:
   - Si el usuario proporcionó path a tech-spec → Mode A (extrae tasks, salta a execute)
   - Si el usuario describió la tarea → Mode B (evalúa complejidad)
   - Si Mode B detecta complejidad excesiva → ofrece [P] Plan first, [W] Full BMad, [E] Execute
8. Sigue el workflow paso a paso hasta completar implementación
9. Step 05 — Self-Review Adversarial: diff contra {baseline_commit}, invoca review-adversarial-general.xml
10. Step 06 — Resuelve findings: [W] Walk-through, [F] Fix auto, [S] Skip
11. Git: `git add`, `git commit` (Conventional Commits), `git push`, crear PR
12. Actualiza la documentación funcional del módulo afectado en `docs/project/modules/{modulo}.md`:
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
13. Al final: escribe entrada closing en execution-log.yaml (ELP)
