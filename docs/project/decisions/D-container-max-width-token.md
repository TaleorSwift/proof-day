# D — Token CSS --container-max-width

**Fecha**: 2026-04-29
**Estado**: Aprobado

## Decisión
`--container-max-width: 960px` definido en `app/globals.css :root`. Todos los layouts y stories usan `var(--container-max-width)` sin fallback hardcodeado.

## Motivación
Centralizar el breakpoint de layout para cambios futuros sin búsqueda/reemplazo global.

## Consecuencias
El atributo `sizes` de `next/image` no puede usar CSS custom properties — mantener `960px` literal con comentario `// coincide con --container-max-width`.
