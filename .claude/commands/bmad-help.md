---
description: "BMAD Help — Tabla completa de workflows por fase, agente, y trigger"
---

Para ayudar al usuario, sigue estos pasos:

1. Lee `_bmad/bmm/module-help.csv` — contiene TODOS los workflows del módulo BMM
2. Lee `_bmad/core/module-help.csv` — contiene los workflows core
3. Si el usuario pide ayuda genérica:
   - Presenta la tabla organizada por fases (1-analysis, 2-planning, 3-solutioning, 4-implementation, anytime)
   - Para cada workflow: muestra nombre, code (trigger), agente, si es required, y descripción
4. Si el usuario pide orientación:
   - Escanea `_bmad-output/planning-artifacts/` para ver qué artefactos existen
   - Recomienda el siguiente paso basándose en la fase actual
5. Aplica las ROUTING RULES de `_bmad/core/tasks/help.md`:
   - required=true bloquea progreso
   - Busca artefactos existentes para determinar qué workflows ya se ejecutaron
   - Guía por la secuencia de fases del módulo
