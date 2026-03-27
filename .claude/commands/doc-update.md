---
description: "Actualizar documentación funcional del módulo afectado tras completar una story. Ejecutar después de cada /ds completado."
---

Actualiza la documentación funcional del módulo afectado:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` — adopta la persona de Kent completa
3. Pregunta qué story se acaba de completar (o lee la más reciente del execution-log.yaml)
4. Lee la story completa
5. Identifica qué módulo(s) funcional(es) afecta
6. Para cada módulo afectado, lee `docs/modules/{modulo}.md`
   - Si no existe, créalo
   - Si existe, actualízalo

## Reglas de actualización
- Lenguaje FUNCIONAL. "El usuario puede filtrar por fecha" SÍ. "Se usa useState con un reducer" NO.
- Las reglas de comportamiento se ACTUALIZAN, no se acumulan. Si un comportamiento cambia, reescribe la regla.
- Máximo 3-5 ficheros en "Ficheros clave". Solo los principales, no todos los tocados.
- Máximo 50 líneas por módulo. Si crece más, sobra detalle.
- Si la story afecta varios módulos, actualiza todos.
- No borres reglas existentes a menos que hayan cambiado.
- Cada regla lleva la referencia de la story entre paréntesis: (story X.Y)

## Formato OBLIGATORIO del fichero

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