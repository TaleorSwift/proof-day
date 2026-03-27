---
description: "Extraer design tokens desde Figma y generar docs/project/design-tokens.md"
---

Extrae los design tokens del proyecto desde Figma:

1. Lee `_bmad/bmm/config.yaml` para variables de sesión
2. Carga el agente `_bmad/bmm/agents/ux-designer.agent.yaml` — adopta la persona de Marge
3. Pregunta al usuario la URL del fichero Figma (si no la tiene ya en `docs/project/design-tokens.md`)
4. Usa el Figma MCP para leer del fichero:
   - Colores: todos los color styles y variables de color
   - Tipografía: font families, pesos, tamaños usados
   - Spacing: variables numéricas usadas para padding/margin/gap
   - Bordes: radius, grosores, colores de borde
   - Sombras: efectos de sombra definidos
5. Genera `docs/project/design-tokens.md` con el formato siguiente
6. Si el fichero ya existe, actualízalo preservando la sección "Reglas para Homer"

## Formato OBLIGATORIO del fichero generado
```markdown
# Design Tokens

## Fuente de diseño
- Herramienta: Figma
- Link: [URL del fichero Figma]
- Última extracción: [fecha]

## Colores
| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--nombre` | #hex | Descripción del uso |

## Tipografía
| Uso | Familia | Peso | Tamaño |
|-----|---------|------|--------|
| Títulos | Font | weight | size |
| Body | Font | weight | size |

## Spacing
| Token | Valor | Uso |
|-------|-------|-----|
| `--space-xs` | Xpx | Descripción |

## Bordes
- Radius: Xpx por defecto
- Color: `var(--nombre)`
- Grosor: Xpx

## Sombras
| Nivel | Valor | Uso |
|-------|-------|-----|
| Card | valor CSS | Dónde se usa |

## Reglas para Homer
- SIEMPRE usar CSS variables, NUNCA hardcodear valores
- Si necesitas un color que no está en la tabla, PREGUNTA antes de inventarlo
- Si el diseño de Figma usa un valor que no coincide con un token, reporta la discrepancia
- Seguir el patrón de estilos del proyecto (inline/Tailwind/CSS modules según corresponda)
```

## Reglas de extracción
- Extraer SOLO lo que existe en el fichero Figma — no inventar tokens
- Nombrar tokens con el patrón que ya use el proyecto en su CSS (leer index.css o equivalente primero)
- Si el proyecto ya tiene CSS variables, mapear los tokens de Figma a las variables existentes
- Si hay discrepancias entre Figma y código, listarlas al final como "Discrepancias detectadas"
- Máximo 60 líneas. Si Figma tiene 200 colores, agrupar por categoría y listar los principales