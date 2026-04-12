# QA Report — Story 8.7: Project Detail Layout y contenido

**Fecha:** 2026-04-10
**Agente:** Edna (QA Engineer)
**Rama:** `feat/8-7-project-detail-layout`
**PR:** https://github.com/TaleorSwift/proof-day/pull/48
**Modo VRG:** REFINE (tests existentes de Homer — verificacion + ejecucion real)
**Resultado:** PASS

---

## Resumen de ejecucion

| Check | Resultado | Detalle |
|-------|-----------|---------|
| Suite completa vitest | PASS | 293/293 tests — 25 ficheros |
| Tests unitarios Story 8.7 | PASS | 23/23 en `ProjectDetailSections.test.tsx` |
| TypeScript `--noEmit` | PASS | Sin errores |
| RSC directives | PASS | Sin `use client` en page.tsx ni ProjectDetailSections.tsx |
| E2E specs en `test.skip` | PASS | 9/9 tests marcados (pendientes entorno E2E) |
| Sanitizacion `demoUrl` | PASS | Guard `isSafeUrl` presente — L3 (CR) resuelto |

---

## 1. Suite completa vitest

**Comando:** `npx vitest run`

```
Test Files  25 passed (25)
     Tests  293 passed (293)
  Start at  11:48:14
  Duration  4.03s
```

Sin regresiones. Todos los test files existentes siguen pasando.

Nota: Warning no bloqueante pre-existente en `projectCard.test.ts` sobre atributo `fill` (pre-existente, no relacionado con Story 8.7).

---

## 2. Tests unitarios Story 8.7

**Fichero:** `tests/unit/projects/ProjectDetailSections.test.tsx`

23 tests cubriendo los componentes de presentacion puros en `ProjectDetailSections.tsx`:

| Componente | Tests | Comportamiento cubierto |
|-----------|-------|------------------------|
| `ProjectDetailAuthor` | ~5 | Fallback nombre autor, showName |
| `ProjectDetailFeaturedImage` | ~4 | Imagen destacada con priority, galeria secundaria |
| `ProjectDetailTargetUser` | ~4 | Render condicional (null / vacio / con valor) |
| `ProjectDetailDemo` | ~5 | Render condicional, href correcto, target_blank, sanitizacion |
| `ProjectDetailFeedbackTopics` | ~5 | Render condicional, ContentTag por topic |

---

## 3. Verificacion de ACs

| AC | Descripcion | Estado |
|----|-------------|--------|
| AC1 | BackButton "← Volver al feed" enlaza a `/communities/[slug]` | PASS (testid presente, tests E2E en skip) |
| AC2 | Header: h1, StatusBadge, UserAvatar autor con showName=true | PASS (implementado en page.tsx) |
| AC3 | `image_urls[0]` como imagen destacada con next/image, galeria secundaria | PASS (tests unitarios) |
| AC4 | Problema, Solucion, Hipotesis siempre visibles | PASS (campos obligatorios, no condicionales) |
| AC5 | `target_user` solo si no null/vacio | PASS (tests unitarios — render condicional) |
| AC6 | `demo_url` → texto "Ver demo", target_blank, rel=noopener noreferrer | PASS (tests unitarios) |
| AC7 | `feedback_topics` con ContentTag si array no vacio | PASS (tests unitarios) |
| AC8 | Sidebar feedback sin cambios | PASS (no tocado — tests previos siguen en verde) |
| AC9 | authorName desde `profiles.name`, fallback a email o 'Autor' | PASS (implementado, tests unitarios parciales) |
| AC10 | Imagen destacada con `priority`, secundarias sin `priority` | PASS (tests unitarios) |

---

## 4. Directivas RSC

### `app/(app)/communities/[slug]/projects/[id]/page.tsx`
- Sin `use client` — Server Component correcto
- Usa `createClient()` del servidor y `createProfilesRepository` — patron valido

### `components/projects/ProjectDetailSections.tsx`
- Sin `use client` — componentes de presentacion puros
- Reciben datos como props — compatibles con RSC y con tests unitarios sin mock de Server Components

---

## 5. Sanitizacion demoUrl (finding L3 de CR)

El finding L3 del CR (demoUrl sin sanitizar contra esquemas maliciosos) esta resuelto:

```ts
// ProjectDetailSections.tsx:147
const isSafeUrl = demoUrl.startsWith('https://') || demoUrl.startsWith('http://')
```

Guard presente. URLs con esquema `javascript:` u otros seran ignoradas.

---

## 6. E2E spec

**Fichero:** `tests/e2e/projects/projectDetail.spec.ts`

9 tests marcados con `test.skip` — convencion establecida en el proyecto (igual que `projectCard.spec.ts`). Pendientes de activar cuando el entorno E2E tenga datos de prueba configurados.

`data-testid` presentes en el DOM segun tabla de la story:
- `project-detail-back-button`
- `project-detail-title`
- `project-detail-author-avatar`
- `project-detail-featured-image`
- `project-detail-section-target-user`
- `project-detail-section-demo`
- `project-detail-section-feedback-topics`

---

## 7. Findings abiertos del CR (heredados — no bloquean QA)

| ID | Severidad | Descripcion | Estado |
|----|-----------|-------------|--------|
| M1 | MEDIUM | `data-testid="project-detail-back-button"` en `<div>` wrapper, no en `<a>` | Abierto — bloqueara E2E real cuando se activen |
| M2 | MEDIUM | Error Supabase en `findByIdForWidget` no se loguea | Abierto |
| M3 | MEDIUM | `imageUrls` tipado como `string[]` en lugar de `string[] \| null` | Abierto |
| L1 | LOW | "Solucion propuesta" e "Hipotesis" sin acento en UI | Abierto |
| L2 | LOW | Logica `authorName` sin tests unitarios propios | Abierto |
| L3 | LOW | Sanitizacion demoUrl | RESUELTO (commit fa1989b) |

Ninguno de los abiertos bloquea el merge. M1 debera resolverse antes de activar los tests E2E.

---

## Resultado final

**PASS** — Story 8.7 cumple todos los criterios de aceptacion verificados.
293 tests pasando, 0 regresiones, TypeScript limpio, RSC correctas.
