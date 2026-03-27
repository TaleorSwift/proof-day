---
description: "BMAD Status — Resumen rápido del execution log"
---

Lee `_bmad-output/execution-log.yaml` y presenta:

1. Últimas 10 ejecuciones con: agent, trigger, result, timestamp
2. Ejecuciones con resultado FAILED o SESSION_END_UNEXPECTED
3. Ejecuciones STARTED sin closing (posibles orphans)
4. Resumen: total exitosas, fallidas, pendientes
