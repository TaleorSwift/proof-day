---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
lastUpdated: "2026-04-10 — Epic 9 añadido (REFINE mode)"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/epic-1-infraestructura-auth.md"
  - "_bmad-output/planning-artifacts/epic-2-comunidades.md"
  - "_bmad-output/planning-artifacts/epic-3-proyectos.md"
  - "_bmad-output/planning-artifacts/epic-4-feedback.md"
  - "_bmad-output/planning-artifacts/epic-5-proof-score-decision.md"
  - "_bmad-output/planning-artifacts/epic-6-perfiles-gamificacion.md"
  - "_bmad-output/planning-artifacts/epic-7-landing-page.md"
  - "plan de análisis visual prototipo Lovable (2026-04-09)"
---

# Proof Day — Epic Breakdown

## Overview

Este documento contiene el desglose completo de épicas y stories para Proof Day. Los Epics 1-7 cubren el producto core (FR1-FR31). El Epic 8 recoge los requisitos de alineación visual con el prototipo de referencia (Lovable), identificados mediante análisis visual comparativo el 2026-04-09.

---

## Requirements Inventory

### Functional Requirements (PRD)

```
FR1: El usuario puede solicitar acceso introduciendo su email para recibir un magic link.
FR2: El sistema crea automáticamente una cuenta si el email no existe previamente.
FR3: El usuario puede autenticarse haciendo clic en un magic link válido e iniciar sesión.
FR4: El sistema invalida todos los magic links anteriores de un usuario al generar uno nuevo.
FR5: El usuario autenticado puede crear una comunidad privada con nombre, descripción e imagen.
FR6: El admin puede generar múltiples links de invitación para su comunidad.
FR7: El usuario puede unirse a una comunidad usando un link de invitación válido y de un solo uso.
FR8: El usuario accede únicamente a las comunidades de las que es miembro.
FR9: El Builder puede crear un proyecto en Draft dentro de una comunidad de la que es miembro.
FR10: El Builder puede editar su proyecto (título, descripción, hipótesis, imágenes) mientras está en Draft.
FR11: El Builder puede publicar su proyecto cambiando su estado a Live.
FR12: El Builder puede marcar su proyecto como Inactive.
FR13: El Builder debe proporcionar entre 1 y 5 imágenes en la galería de su proyecto.
FR14: Los miembros de la comunidad pueden ver proyectos en estado Live e Inactive.
FR15: Solo el creador puede ver su proyecto en estado Draft.
FR16: El Reviewer puede enviar feedback estructurado en proyectos Live de su comunidad.
FR17: El feedback requiere responder un conjunto de preguntas guiadas obligatorias.
FR18: El sistema asocia cada feedback con el usuario que lo envía y el proyecto que lo recibe.
FR19: El usuario no puede enviar feedback en proyectos en estado Draft o Inactive.
FR20: El Builder puede ver el Proof Score de su proyecto cuando ha recibido al menos 3 feedbacks.
FR21: El Proof Score presenta uno de tres estados: Promising / Needs iteration / Weak.
FR22: El Builder puede registrar su decisión explícita sobre el proyecto: Iterar / Escalar / Abandonar.
FR23: La decisión del Builder es visible para los miembros de su comunidad.
FR24: El usuario puede completar y editar su perfil con intereses y bio.
FR25: El perfil muestra el número de feedbacks dados y proyectos creados por el usuario.
FR26: El usuario puede ver el perfil de otros miembros de comunidades compartidas.
FR27: El usuario no puede acceder al perfil de usuarios con los que no comparte ninguna comunidad.
FR28: El usuario puede ver su contador personal de feedbacks dados en la comunidad.
FR29: La comunidad muestra un ranking Top Reviewer con el miembro que más feedbacks ha enviado.
FR30: La landing page pública presenta la propuesta de valor de Proof Day a visitantes no autenticados.
FR31: La landing page permite a los visitantes solicitar acceso o contactar con el equipo.
```

**Nuevos FRs derivados del análisis visual con el prototipo (Epic 8):**

```
FR32: El feed de la comunidad presenta proyectos en vista de lista vertical agrupados por estado (Live/Cerrados), con heading "Ideas en validación" y subtítulo.
FR33: Cada tarjeta de proyecto en el feed muestra thumbnail, título, badge de estado, descripción, avatar+nombre del autor, conteo de feedbacks y conteo de "lo usarían", y botón de corazón.
FR34: El navbar muestra únicamente logo+nombre a la izquierda y botón de auth a la derecha (sin community switcher).
FR35: La página de detalle de proyecto tiene navegación "← Volver al feed", imagen destacada con caption, y secciones: Problema, Solución, Usuario objetivo, Hipótesis, enlace "Ver demo", tags de temas de feedback.
FR36: La página de detalle muestra una card "Señal de validación" con indicador de semáforo, barras de progreso (% entiende el problema, % lo usaría) y conteo de entradas.
FR37: La sección "Perspectivas del equipo" en el detalle de proyecto es visible para todos los miembros (no solo el owner), mostrando cada feedback como card con nombre, badge de contribuidor, respuestas y comentario.
FR38: La page de detalle muestra una card "Ayuda a mejorar esta idea" con CTA contextual (sign-in o formulario según estado de auth).
FR39: La tabla "projects" incluye los campos target_user (text), demo_url (text) y feedback_topics (text[]).
FR40: El leaderboard lateral muestra los top ~5 contribuidores de la semana con avatar, nombre, badge y conteo de feedbacks.
FR41: Los labels de estado del proyecto en la UI son: Live (antes "Publicado"), Cerrado (antes "Inactivo"), Borrador (antes "Borrador").
```

### Non-Functional Requirements

```
NFR-P1: Magic link entregado al email del usuario en <30 segundos bajo condiciones normales.
NFR-P2: Acciones de usuario (navegación, envío de feedback, cambio de estado) completadas en <2 segundos.
NFR-P3: Landing page: LCP < 2.5s, CLS < 0.1 (Core Web Vitals).
NFR-S1: Magic links e invitation links generados de forma criptográficamente no predecible.
NFR-S2: Magic links e invitation links son de un solo uso — se invalidan tras uso exitoso.
NFR-S3: Acceso a datos de comunidad restringido a miembros mediante RLS en Supabase.
NFR-S4: URLs directas a recursos privados sin sesión autenticada son rechazadas.
NFR-S5: Datos en tránsito cifrados via HTTPS. Cifrado en reposo gestionado por Supabase.
NFR-A1: Semántica HTML correcta y contraste de color ≥ 4.5:1 para texto normal.
NFR-A2: Navegación principal operable por teclado.
NFR-R1: Disponibilidad objetivo >99%, gestionada por Supabase + Vercel.
NFR-R2: La pérdida de sesión no provoca pérdida de datos.
NFR-UI1: Cada componente nuevo o refactorizado tiene su story documentada en Storybook.
NFR-UI2: Los componentes UI son reutilizables — extraídos a components/ui/ o su directorio de dominio.
```

### Additional Requirements (Architecture + UX)

```
- Stack: Next.js App Router + Supabase (PostgreSQL + Auth) + Vercel
- RLS en Supabase para aislamiento de datos por comunidad
- Sin real-time: datos actualizados on navigate/reload
- Responsive desktop-first; mobile no es caso de uso prioritario
- Componentes UI: shadcn/ui como base; design tokens en globals.css (variables CSS)
- Storybook v8.6.18 configurado en el proyecto, stories en carpeta stories/
- La UX spec (prototipo Lovable) es la fuente de autoridad visual
- Feedbacks públicos para todos los miembros (decisión tomada el 2026-04-09)
- Auth: magic link (Supabase). No se implementa GitHub OAuth — solo se actualiza estilo del botón
- Idioma UI: español (textos del prototipo en inglés se traducen)
```

### FR Coverage Map

| FR | Epic | Stories |
|---|---|---|
| FR1-FR4 | Epic 1 | 1.1-1.3 |
| FR5-FR8 | Epic 2 | 2.1-2.4 |
| FR9-FR15 | Epic 3 | 3.1-3.5 |
| FR16-FR19 | Epic 4 | 4.1-4.3 |
| FR20-FR23 | Epic 5 | 5.1-5.4 |
| FR24-FR27 | Epic 6 | 6.1-6.3 |
| FR28-FR29 | Epic 6 | 6.4-6.5 |
| FR30-FR31 | Epic 7 | 7.1-7.2 |
| FR32-FR41 | Epic 8 | 8.1-8.10 |
| NFR-UI1/UI2 | Epic 8 | Transversal a todas las stories |

---

## Epic List

1. Epic 1: Infraestructura & Autenticación _(ver epic-1-infraestructura-auth.md)_
2. Epic 2: Comunidades _(ver epic-2-comunidades.md)_
3. Epic 3: Proyectos _(ver epic-3-proyectos.md)_
4. Epic 4: Feedback _(ver epic-4-feedback.md)_
5. Epic 5: Proof Score & Decisión _(ver epic-5-proof-score-decision.md)_
6. Epic 6: Perfiles & Gamificación _(ver epic-6-perfiles-gamificacion.md)_
7. Epic 7: Landing Page _(ver epic-7-landing-page.md)_
8. **Epic 8: Rediseño UI — Alineación con prototipo** _(implementado)_
9. **Epic 9: Rediseño UI — Alineación prototipo Lovable v3** _(nuevo — 2026-04-10)_

---

## Epic 8: Rediseño UI — Alineación con prototipo

**Estado:** backlog
**Objetivo:** Alinear la interfaz de usuario de Proof Day con el prototipo de referencia (Lovable), introduciendo los componentes, layouts y patrones visuales definidos como target. Todo componente nuevo lleva su story en Storybook.
**FRs cubiertos:** FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41
**NFRs cubiertos:** NFR-UI1, NFR-UI2
**Referencia visual:** `id-preview--19da568b-3832-4ae6-ab10-9cbd34fe3185.lovable.app`

---

### Story 8.1: Migración DB — Nuevos campos de proyecto

Como Builder,
quiero poder añadir usuario objetivo, URL de demo y temas de feedback a mi proyecto,
para que el detalle de mi idea sea más completo y actionable para los Reviewers.

**Acceptance Criteria:**

**Given** que existe la tabla `projects` en Supabase
**When** se aplica la migración
**Then** la tabla incluye los campos `target_user` (text, nullable), `demo_url` (text, nullable) y `feedback_topics` (text[], nullable)
**And** los tipos TypeScript reflejan los nuevos campos

**Given** que el Builder está en el formulario de creación/edición de proyecto
**When** rellena los campos opcionales "Usuario objetivo", "URL de demo" y "Temas de feedback"
**Then** los valores se persisten correctamente en la base de datos

**Notas técnicas:**
- Nueva migración en `supabase/migrations/`
- Actualizar `components/projects/ProjectForm.tsx` con los nuevos campos
- Actualizar tipos TypeScript del modelo Project
- Flow recomendado: Quick Flow (Bart)

---

### Story 8.2: Componentes atómicos base + Storybook

Como desarrollador,
quiero disponer de un conjunto de componentes UI reutilizables y documentados en Storybook,
para construir la nueva interfaz de forma consistente y mantenible.

**Acceptance Criteria:**

**Given** que ejecuto `npm run storybook`
**When** navego a la categoría "Shared"
**Then** encuentro stories para: UserAvatar, HeartButton, ProgressBar, SignalIndicator, BackButton, ContentTag, ContributorBadge

**Given** el componente `UserAvatar`
**When** se renderiza con un nombre
**Then** muestra un círculo con la inicial del nombre en color derivado del nombre, y opcionalmente el nombre completo

**Given** el componente `HeartButton`
**When** el usuario hace click
**Then** el icono se marca como activo y el contador se incrementa (o decrementa si ya estaba activo)

**Given** el componente `StatusBadge`
**When** se pasa status="live"
**Then** muestra "Live" (verde); status="closed" muestra "Cerrado" (gris); status="draft" muestra "Borrador" (amarillo)

**Notas técnicas:**
- `UserAvatar` → `components/ui/UserAvatar.tsx` + `stories/shared/UserAvatar.stories.tsx`
- `HeartButton` → `components/ui/HeartButton.tsx` + `stories/shared/HeartButton.stories.tsx`
- `ProgressBar` → `components/ui/ProgressBar.tsx` + `stories/shared/ProgressBar.stories.tsx`
- `SignalIndicator` → `components/ui/SignalIndicator.tsx` + `stories/shared/SignalIndicator.stories.tsx`
- `BackButton` → `components/ui/BackButton.tsx` + `stories/shared/BackButton.stories.tsx`
- `ContentTag` → `components/ui/ContentTag.tsx` + `stories/shared/ContentTag.stories.tsx`
- `ContributorBadge` → `components/ui/ContributorBadge.tsx` + `stories/shared/ContributorBadge.stories.tsx`
- Refactorizar `StatusBadge`: labels Publicado→Live, Inactivo→Cerrado
- Flow recomendado: Quick Flow (Bart)

---

### Story 8.3: Navbar reutilizable + Storybook

Como miembro de la plataforma,
quiero un navbar limpio y consistente que muestre solo el logo y mi estado de autenticación,
para orientarme fácilmente sin ruido visual.

**Acceptance Criteria:**

**Given** que el usuario NO está autenticado
**When** navega a cualquier página
**Then** el navbar muestra: izquierda — logo naranja + "Proof Day"; derecha — botón "Iniciar sesión" con estilo outlined naranja

**Given** que el usuario SÍ está autenticado
**When** navega a cualquier página autenticada
**Then** el navbar muestra: izquierda — logo naranja + "Proof Day"; derecha — botón "Cerrar sesión"
**And** NO aparece el Community Switcher en el navbar

**Given** que ejecuto `npm run storybook`
**When** navego a "Layout > Navbar"
**Then** encuentro stories para estado autenticado y no autenticado

**Notas técnicas:**
- Nuevo `components/layout/Navbar.tsx` con props `isAuthenticated`, `onLogout`
- `stories/layout/Navbar.stories.tsx`
- Actualizar `app/(app)/communities/layout.tsx` (líneas 45-92) para usar el nuevo Navbar
- El botón "Iniciar sesión" mantiene el flujo de magic link (no cambia auth)
- Flow recomendado: Full Flow (Homer)

---

### Story 8.4: ProjectCard rediseño + Storybook

Como Reviewer,
quiero ver los proyectos del feed como tarjetas horizontales con toda la información relevante de un vistazo,
para decidir rápidamente qué proyecto me interesa revisar.

**Acceptance Criteria:**

**Given** que hay proyectos en el feed
**When** se renderiza una tarjeta de proyecto
**Then** muestra: thumbnail a la izquierda (~120x90px), en el centro: título + badge de estado + descripción + avatar+nombre del autor + "N feedbacks" + "N lo usarían", a la derecha: botón de corazón con contador

**Given** que el proyecto no tiene imagen
**When** se renderiza la tarjeta
**Then** el thumbnail muestra un placeholder con gradiente y las iniciales del título

**Given** que ejecuto `npm run storybook`
**When** navego a "Projects > ProjectCard"
**Then** encuentro variantes: con imagen, sin imagen, estado Live, estado Cerrado

**Notas técnicas:**
- Refactorizar `components/projects/ProjectCard.tsx` (layout horizontal)
- Usa: `UserAvatar`, `StatusBadge`, `HeartButton` de Story 8.2
- Actualizar `stories/projects/ProjectCard.stories.tsx`
- Flow recomendado: Full Flow (Homer)

---

### Story 8.5: ProjectFeed + Rediseño Homepage

Como miembro de la comunidad,
quiero ver el feed de ideas en validación como una lista clara agrupada por estado,
para entender rápidamente qué proyectos necesitan mi feedback ahora.

**Acceptance Criteria:**

**Given** que hay proyectos Live y Cerrados en la comunidad
**When** el usuario visita la página principal de la comunidad
**Then** ve el heading "Ideas en validación" y el subtítulo "Da feedback. Aprende más rápido. Decide qué construir."
**And** ve la sección "EN VIVO — ACEPTANDO FEEDBACK" con los proyectos Live en lista vertical
**And** ve la sección "CERRADOS" con los proyectos inactivos
**And** NO ve el avatar ni el nombre de la comunidad como header prominente
**And** el botón "Nuevo proyecto" no aparece en el feed (o está en ubicación secundaria)

**Given** que no hay proyectos en ningún estado
**When** el usuario visita el feed
**Then** ve el estado vacío apropiado por sección

**Given** que ejecuto `npm run storybook`
**When** navego a "Projects > ProjectFeed"
**Then** encuentro variantes: con proyectos Live y Closed, solo Live, vacío

**Notas técnicas:**
- Nuevo `components/projects/ProjectFeed.tsx` (lista vertical + agrupación)
- `stories/projects/ProjectFeed.stories.tsx`
- Refactorizar `app/(app)/communities/[slug]/page.tsx`
- Eliminar/simplificar `CommunityHeader` en esta vista
- Flow recomendado: Full Flow (Homer)

---

### Story 8.6: TopContributors leaderboard + Storybook

Como miembro de la comunidad,
quiero ver un leaderboard de los contribuidores más activos de la semana con sus badges,
para reconocer el expertise de mis compañeros y motivarme a participar.

**Acceptance Criteria:**

**Given** que hay feedback en la comunidad esta semana
**When** el usuario ve el sidebar del feed
**Then** ve "TOP CONTRIBUIDORES ESTA SEMANA" con hasta 5 usuarios listados
**And** cada usuario muestra: avatar con inicial coloreada, nombre, badge de tipo ("Top reviewer", "Perspicaz", etc.) si aplica, y conteo de feedbacks

**Given** que no hay feedback esta semana
**When** el usuario ve el sidebar
**Then** ve el estado vacío: "Sé el primero en dar feedback esta semana"

**Given** que ejecuto `npm run storybook`
**When** navego a "Gamification > TopContributors"
**Then** encuentro variantes: con usuarios, vacío, con diferentes badges

**Notas técnicas:**
- Nuevo `components/gamification/TopContributors.tsx`
- `stories/gamification/TopContributors.stories.tsx`
- Nueva server action para obtener top contributors (multiples usuarios + badges)
- Usa `UserAvatar` y `ContributorBadge` de Story 8.2
- Reemplaza `PersonalFeedbackCounter` y `TopReviewerWidget`
- Flow recomendado: Full Flow (Homer)

---

### Story 8.7: Project Detail — Layout y contenido

Como miembro de la comunidad,
quiero ver el detalle de un proyecto con navegación clara, imagen destacada y todas las secciones de contexto,
para entender la idea en profundidad antes de dar mi feedback.

**Acceptance Criteria:**

**Given** que el usuario está en el detalle de un proyecto
**When** carga la página
**Then** ve "← Volver al feed" en la parte superior
**And** ve el header: título + badge estado + descripción corta + avatar+nombre del autor
**And** ve la imagen principal destacada debajo del header con caption "Usa estos visuales para dar feedback más preciso"
**And** ve las secciones: "Problema", "Solución", "Usuario objetivo" (si existe), "Hipótesis 🔬", enlace "Ver demo" (si existe demo_url), y tags "Feedback solicitado sobre" (si existen feedback_topics)
**And** las acciones de estado (publicar/inactivar) están en ubicación secundaria o menos prominente

**Notas técnicas:**
- Refactorizar `app/(app)/communities/[slug]/projects/[id]/page.tsx`
- Usa `BackButton`, `StatusBadge`, `UserAvatar`, `ContentTag` de Story 8.2
- Flow recomendado: Full Flow (Homer)

---

### Story 8.8: ValidationSignalCard + Storybook

Como Builder,
quiero ver mi señal de validación como una card clara con indicador de semáforo y barras de progreso,
para interpretar de forma inmediata si mi idea está funcionando.

**Acceptance Criteria:**

**Given** que el proyecto tiene ≥3 feedbacks con señal "Prometedora"
**When** el Builder o cualquier miembro ve el sidebar del detalle
**Then** ve la card "SEÑAL DE VALIDACIÓN" con: indicador verde + "Señal prometedora", barras "Entiende el problema" con %, "Lo usaría" con %, "Basado en N entradas de feedback", disclaimer en texto muted

**Given** que el proyecto tiene <3 feedbacks
**When** el usuario ve el sidebar
**Then** ve el estado de espera: barra de progreso hacia el umbral mínimo

**Given** que ejecuto `npm run storybook`
**When** navego a "ProofScore > ValidationSignalCard"
**Then** encuentro variantes: prometedora, necesita iteración, señal débil, esperando

**Notas técnicas:**
- Nuevo `components/proof-score/ValidationSignalCard.tsx`
- `stories/proof-score/ValidationSignalCard.stories.tsx`
- Usa `SignalIndicator` y `ProgressBar` de Story 8.2
- Refactorizar `ProofScoreSidebar.tsx` para usar `ValidationSignalCard`
- Flow recomendado: Full Flow (Homer)

---

### Story 8.9: TeamPerspectives — Feedbacks públicos + Storybook

Como miembro de la comunidad,
quiero ver las perspectivas del equipo sobre un proyecto aunque no sea el owner,
para aprender de los criterios de mis compañeros y dar feedback más informado.

**Acceptance Criteria:**

**Given** que un proyecto tiene feedbacks
**When** CUALQUIER miembro autenticado visita el detalle del proyecto
**Then** ve la sección "Perspectivas del equipo" con las cards de feedback
**And** cada card muestra: avatar+nombre del reviewer, badge de contribuidor si aplica, respuesta sí/no a "¿Entiende el problema?", respuesta sí/no a "¿Lo usaría?", comentario de texto

**Given** que las RLS policies de Supabase restringen los feedbacks
**When** se aplica la nueva migración de políticas
**Then** los miembros autenticados de la comunidad pueden leer feedbacks de proyectos de su comunidad

**Given** que ejecuto `npm run storybook`
**When** navego a "Feedback > TeamPerspectives"
**Then** encuentro variantes: con feedbacks, vacío, con diferentes badges

**Notas técnicas:**
- Nuevo `components/feedback/FeedbackEntry.tsx` + story
- Nuevo `components/feedback/TeamPerspectives.tsx` + story
- Usa `UserAvatar` y `ContributorBadge` de Story 8.2
- Nueva migración RLS en `supabase/migrations/` para permitir lectura de feedbacks a miembros
- Actualizar query en `app/(app)/communities/[slug]/projects/[id]/page.tsx`
- Flow recomendado: Full Flow (Homer)

---

### Story 8.10: FeedbackCTA — Card contextual + Storybook

Como Reviewer,
quiero ver una invitación clara a dar feedback en el detalle de cada proyecto,
para saber exactamente qué se espera de mí y poder contribuir fácilmente.

**Acceptance Criteria:**

**Given** que el usuario NO está autenticado
**When** visita el detalle de un proyecto Live
**Then** ve la card "Ayuda a mejorar esta idea" con texto motivacional y el mensaje "Inicia sesión para compartir tu perspectiva y ayudar a mejorar esta idea"

**Given** que el usuario SÍ está autenticado y aún NO ha dado feedback
**When** visita el detalle de un proyecto Live del que no es owner
**Then** ve la card "Ayuda a mejorar esta idea" con el botón de feedback (o formulario inline)

**Given** que el usuario ya ha dado feedback en este proyecto
**When** visita el detalle
**Then** la card muestra su feedback previo o un mensaje de confirmación

**Given** que ejecuto `npm run storybook`
**When** navego a "Feedback > FeedbackCTA"
**Then** encuentro variantes: no-auth, auth sin feedback, auth con feedback previo

**Notas técnicas:**
- Nuevo `components/feedback/FeedbackCTA.tsx`
- `stories/feedback/FeedbackCTA.stories.tsx`
- Integra con `FeedbackDialog` existente o formulario inline
- Flow recomendado: Full Flow (Homer)

---

## Epic 9: Rediseño UI — Alineación prototipo Lovable v3

**Estado:** backlog
**Objetivo:** Alinear cada vista de Proof Day con el prototipo de referencia actualizado (2026-04-10), resolviendo las diferencias identificadas en la navegación real página a página. Todo componente UI nuevo o modificado lleva story en Storybook. Implementación con TDD Outside-In, SOLID y Clean Code. Cada story en rama propia con worktree; lint/test/build verdes antes de PR.
**FRs cubiertos:** FR-9-1, FR-9-2, FR-9-3, FR-9-4, FR-9-5, FR-9-6, FR-9-7, FR-9-8, FR-9-9, FR-9-10, DB-9-1, DB-9-2, BUG-9-1, BUG-9-2
**NFRs cubiertos:** NFR-9-1 (TDD Outside-In), NFR-9-2 (Storybook), NFR-9-3 (worktree + verde antes de PR)
**Referencia visual:** `https://id-preview--19da568b-3832-4ae6-ab10-9cbd34fe3185.lovable.app`
**Orden de implementación:** 9.1 → 9.2 → 9.3 → 9.4 → 9.5 → 9.6 → 9.7 → 9.8 → 9.9 → 9.10

---

### Story 9.1: Migración DB — tagline y would_use_count

Como desarrollador,
quiero añadir el campo `tagline` a proyectos y un contador `would_use_count` con trigger automático,
para que las vistas del feed y el detalle de proyecto puedan mostrar esos datos sin cálculos ad-hoc en tiempo de render.

**Acceptance Criteria:**

**Given** que ejecuto la migración 014
**When** inspecciono la tabla `projects`
**Then** existe la columna `tagline text` (nullable)
**And** los tipos TypeScript reflejan el nuevo campo

**Given** que ejecuto la migración 015
**When** inspecciono la tabla `projects`
**Then** existe la columna `would_use_count int NOT NULL DEFAULT 0`
**And** existe el trigger `feedbacks_recompute_would_use` en la tabla `feedbacks`

**Given** que se inserta un feedback con `text_responses->>'would_use' = 'Yes'`
**When** el trigger se dispara
**Then** `would_use_count` del proyecto correspondiente se incrementa en 1

**Given** que se elimina un feedback con `would_use = 'Yes'`
**When** el trigger se dispara
**Then** `would_use_count` se decrementa correctamente

**Given** que hay feedbacks existentes en el seed al aplicar la migración
**When** se ejecuta el backfill inicial incluido en migration 015
**Then** `would_use_count` refleja el estado real de los feedbacks actuales

**Notas técnicas:**
- `supabase/migrations/014_add_tagline_to_projects.sql`
- `supabase/migrations/015_add_would_use_counter.sql` (columna + función + trigger + backfill)
- Regenerar `lib/types/database.ts` vía `mcp__supabase-local__generate_typescript_types`
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.2: Login — logo, textos y layout sin card

Como usuario no autenticado,
quiero que la página de login muestre el logo de Proof Day, un titular motivador y texto legal,
para percibir profesionalidad y claridad sobre lo que implica registrarme.

**Acceptance Criteria:**

**Given** que navego a `/login`
**When** la página carga
**Then** veo el logo corgi (`/public/logo.png`) centrado encima del título, con ~128px de alto
**And** el fondo es `var(--color-background)` (crema) sin card flotante con sombra
**And** el H1 es "Bienvenido a Proof Day"
**And** el subtítulo es "Valida ideas. Aprende más rápido. Construye lo que importa."
**And** el botón "Continuar" es naranja full-width (`var(--color-primary)`)
**And** debajo del botón aparece el texto: "Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender."

**Given** que envío el formulario con un email válido
**When** el magic link se envía
**Then** la pantalla inline "check email" mantiene el mismo layout (logo + mensaje centrado, sin card)

**Given** que ejecuto `npm run storybook`
**When** navego a "Auth > LoginForm"
**Then** encuentro story para el estado inicial y el estado "check email"

**Notas técnicas:**
- Mover `Proof_Day.png` (root del proyecto) a `public/logo.png`
- Modificar `components/auth/LoginForm.tsx`: quitar `Card`, añadir `<Image>`, actualizar textos
- Modificar `app/(auth)/layout.tsx` si el fondo crema no lo aplica ya
- `stories/auth/LoginForm.stories.tsx`
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.3: Fix ruta /auth/login

Como usuario que hace clic en "Iniciar sesión" desde cualquier parte de la app,
quiero que el enlace me lleve directamente a `/login`,
para no experimentar redirecciones innecesarias que puedan causar pérdida del estado PKCE.

**Acceptance Criteria:**

**Given** que hay un enlace a `/auth/login` en `app/page.tsx` u otros componentes
**When** hago clic
**Then** navego directamente a `/login` sin redirect intermedio

**Given** que busco en el codebase la cadena `/auth/login`
**When** reviso los resultados en `app/`, `components/` y `lib/`
**Then** ningún enlace ni `href` interno apunta a `/auth/login`

**Given** que navego a `/auth/callback` o `/auth/confirm`
**When** Supabase completa el flujo PKCE
**Then** esas rutas siguen funcionando correctamente

**Notas técnicas:**
- `grep -r "/auth/login"` en `app/`, `components/`, `lib/` — reemplazar con `/login`
- Verificar que no existe `app/auth/login/page.tsx` que genere conflicto
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.4: Landing / — welcome screen

Como usuario que llega a la raíz de la app,
quiero ver la welcome screen del prototipo (logo + titular + CTA),
para tener una primera impresión coherente con la identidad visual del producto.

**Acceptance Criteria:**

**Given** que navego a `/` sin sesión activa
**When** la página carga
**Then** veo logo (`/public/logo.png`, ~128px), H1 "Bienvenido a Proof Day", subtítulo "Valida ideas. Aprende más rápido. Construye lo que importa.", botón naranja full-width "Continuar con email", y texto legal
**And** el botón lleva a `/login` y no contiene formulario inline
**And** el fondo es `var(--color-background)` sin ningún elemento del antiguo marketing

**Given** que navego a `/` con sesión activa
**When** la página carga
**Then** soy redirigido a `/communities`

**Notas técnicas:**
- Reescribir `app/page.tsx` — eliminar hero y secciones de marketing
- Reutilizar el layout visual creado en Story 9.2 (extraer componente compartido si procede)
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.5: Navbar — logo, nombre de usuario e icono logout

Como miembro autenticado,
quiero ver el logo del producto y mi nombre en el navbar,
para confirmar que estoy en la sesión correcta y salir fácilmente.

**Acceptance Criteria:**

**Given** que estoy autenticado y navego a cualquier página del área `/communities`
**When** el navbar se renderiza
**Then** a la izquierda veo el logo (`/public/logo.png`, 32×32px, redondeado) junto al texto "Proof Day" (semibold)
**And** a la derecha veo mi nombre (`profile.name` o prefijo del email como fallback) y un icono de logout con `aria-label="Cerrar sesión"`

**Given** que hago clic en el icono de logout
**When** la acción se completa
**Then** soy redirigido a `/login` con la sesión cerrada

**Given** que ejecuto `npm run storybook`
**When** navego a "Layout > Navbar"
**Then** existe story para estado autenticado mostrando logo + nombre + icono logout

**Notas técnicas:**
- Modificar `components/layout/Navbar.tsx`: añadir `<Image src="/logo.png" width={32} height={32}>` + nombre de usuario
- El nombre viene de `profiles.name`; pasar como prop desde el layout servidor
- `stories/layout/Navbar.stories.tsx` actualizada
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.6: Feed — secciones Live/Cerrados, ProjectCard horizontal y fix bugs autor

Como Reviewer,
quiero ver el feed agrupado en secciones Live/Cerradas con tarjetas horizontales que muestren el nombre real del autor y el contador "lo usarían",
para decidir rápidamente qué idea revisar y confiar en la información mostrada.

**Acceptance Criteria:**

**Given** que hay proyectos `live` e `inactive` en la comunidad
**When** se renderiza el feed
**Then** aparece primero la sección `🔴 Live — aceptando feedback` (uppercase, text-xs, muted) con proyectos live
**And** aparece después la sección `Cerrados` (uppercase, text-xs, muted) con proyectos inactive
**And** los proyectos `draft` sólo son visibles para su builder

**Given** que se renderiza una ProjectCard con `image_urls`
**When** el proyecto tiene al menos una URL de imagen
**Then** el thumbnail (~120×90px, border-radius) se muestra a la izquierda
**And** en el centro aparece: título + `StatusBadge` + tagline (campo `tagline` si existe, fallback a `problem` truncado a 1 línea) + `profiles.name` del autor + `N feedbacks` + `N lo usarían` (`would_use_count`)
**And** a la derecha aparece un `HeartButton` (toggle visual)

**Given** que el proyecto no tiene imágenes
**When** se renderiza la tarjeta
**Then** el thumbnail muestra un placeholder con gradiente

**Given** que el builder tiene UUID como identificador
**When** se renderiza su tarjeta en el feed
**Then** el nombre del autor muestra `profiles.name` real, no el UUID

**Given** que hay feedbacks en la comunidad
**When** se renderiza el widget `Top Contribuidores`
**Then** cada revisor muestra su `profiles.name` real y no el fallback `"Usuario"`

**Given** que ejecuto `npm run storybook`
**When** navego a "Projects > ProjectCard"
**Then** encuentro stories para: con imagen, sin imagen, Live, Closed, con tagline, sin tagline

**Notas técnicas:**
- Modificar `components/projects/ProjectCard.tsx` → layout horizontal
- Fix `app/(app)/communities/[slug]/page.tsx`: traer `profiles(name, avatar_url)` del builder en la query
- Fix `components/gamification/TopContributors.tsx` + `lib/repositories/gamification.repository.ts`
- Depende de Story 9.1 (campos `tagline` y `would_use_count` en DB)
- `stories/projects/ProjectCard.stories.tsx` actualizada
- Flow recomendado: Full Flow (Homer)

---

### Story 9.7: Project Detail — tagline, caption imagen, hipótesis 🔬, sidebar universal y feedback inline

Como Reviewer o Builder,
quiero que el detalle de un proyecto muestre el tagline, la sidebar con señal de validación y el formulario de feedback inline visibles para todos,
para dar o recibir feedback con toda la información relevante a la vista.

**Acceptance Criteria:**

**Given** que navego al detalle de un proyecto
**When** la página carga
**Then** debajo del H1 aparece el `tagline` del proyecto como subtítulo muted en una línea (vacío si no hay tagline)
**And** debajo de la imagen destacada aparece el caption "Usa estas imágenes para dar feedback más preciso." (text-xs, muted)
**And** la sección de hipótesis tiene heading "🔬 Hipótesis a validar" con el estilo destacado existente

**Given** que el proyecto tiene `status = 'live'` y el usuario NO es el owner
**When** navega al detalle
**Then** la sidebar derecha es visible
**And** muestra `ValidationSignalCard`: indicador semáforo (🟢/🟡/🔴), barra "Comprenden el problema X%", barra "Lo usarían X%", "Basado en N feedbacks", disclaimer en itálica
**And** debajo aparece formulario inline: "¿Entiendes el problema?" (Sí/Parcialmente/No), "¿Lo usarías?" (Sí/No), textarea "¿Qué mejorarías?", botón "Compartir insight" (naranja, full-width)
**And** al enviar con respuestas válidas el feedback se persiste y el formulario muestra confirmación

**Given** que el proyecto tiene `status = 'inactive'`
**When** cualquier usuario navega al detalle
**Then** la sidebar muestra `ValidationSignalCard` y el texto "Esta idea ya no acepta feedback."

**Given** que el usuario es el OWNER
**When** navega al detalle
**Then** la sidebar además incluye `FeedbackList` + `ProofScoreSidebar` por debajo de `ValidationSignalCard`

**Given** que hay feedbacks con `text_responses`
**When** se renderizan en "Perspectivas del equipo"
**Then** cada entrada muestra: nombre del revisor, pill "Problema: sí/parcialmente/no", pill "Lo usaría: sí/no", texto principal, texto de mejora

**Given** que ejecuto `npm run storybook`
**When** navego a "ProofScore > ValidationSignalCard"
**Then** encuentro stories para señal verde, ámbar, roja y sin datos
**When** navego a "Feedback > FeedbackFormInline"
**Then** encuentro stories para estado inicial, cargando y confirmación

**Notas técnicas:**
- Modificar `app/(app)/communities/[slug]/projects/[id]/page.tsx`: mover sidebar fuera del `isOwner` check, añadir `tagline` al SELECT
- Nuevo `components/proof-score/ValidationSignalCard.tsx` + `stories/proof-score/ValidationSignalCard.stories.tsx`
- Nuevo `components/feedback/FeedbackFormInline.tsx` (reutiliza acción server de `FeedbackDialog`) + `stories/feedback/FeedbackFormInline.stories.tsx`
- Enriquecer `components/feedback/TeamPerspectives.tsx` con pills de respuestas
- Depende de Story 9.1 (`tagline` en DB)
- Flow recomendado: Full Flow (Homer)

---

### Story 9.8: Modal "Lanzar idea" — tagline, chips predefinidos e imágenes inline

Como Builder,
quiero lanzar una nueva idea desde un modal sobre el feed con todos los campos del prototipo,
para crear proyectos completos sin abandonar el contexto del feed.

**Acceptance Criteria:**

**Given** que hago clic en "+ Lanzar idea" en el feed
**When** el modal se abre
**Then** aparece un `Dialog` centrado (~540px) con campos: Nombre (required), Tagline (required), Descripción del problema (required), Solución propuesta (required), Usuario objetivo, 🔬 Hipótesis a validar (required), Demo link (optional), uploader de hasta 3 imágenes, chips de feedback topics

**Given** que el campo "Tagline" está vacío al intentar enviar
**When** el usuario hace clic en "Lanzar proyecto"
**Then** aparece error de validación y el formulario no se envía

**Given** que el usuario selecciona chips de feedback topics
**When** hace clic en opciones predefinidas ("Claridad del problema", "Disposición a usar", "Viabilidad técnica", "Funcionalidades que faltan", "Encaje de mercado", "Problemas de UX")
**Then** los chips seleccionados se marcan visualmente y se guardan en `feedback_topics`

**Given** que el usuario sube hasta 3 imágenes (jpg/png/webp, máx. 5MB cada una)
**When** el formulario se envía correctamente
**Then** las imágenes se suben a Supabase Storage y las URLs se guardan en `image_urls`

**Given** que el formulario se envía con todos los campos requeridos válidos
**When** el servidor crea el proyecto
**Then** el modal se cierra, el feed se revalida y el nuevo proyecto aparece en la sección Live con su `tagline`

**Given** que el usuario hace clic en "Cancelar"
**When** el modal se cierra
**Then** no se crea ningún proyecto

**Notas técnicas:**
- Nuevo `components/projects/LaunchIdeaDialog.tsx` + `stories/projects/LaunchIdeaDialog.stories.tsx`
- Refactorizar `components/projects/ProjectForm.tsx` para ser reutilizable en el dialog
- Actualizar `lib/validations/projects.ts`: `tagline` required
- Actualizar `lib/actions/projects.ts`: incluir `tagline`, upload de imágenes inline
- Chips predefinidos en `lib/constants/feedback-topics.ts`
- Depende de Story 9.1 (`tagline` en DB)
- Flow recomendado: Full Flow (Homer)

---

### Story 9.9: Feed header — "Ideas en validación", subtítulo y botón Lanzar idea

Como miembro de una comunidad,
quiero que el header del feed muestre un título claro con un botón para lanzar ideas,
para entender de un vistazo el propósito del espacio y acceder a la creación de proyectos.

**Acceptance Criteria:**

**Given** que navego a `/communities/[slug]`
**When** la página carga
**Then** el H1 principal del feed es "Ideas en validación"
**And** debajo aparece el subtítulo "Da feedback. Aprende más rápido. Decide qué construir." (text-muted)
**And** a la derecha del H1 aparece el botón "+ Lanzar idea" naranja
**And** los metadatos de la comunidad se muestran en un bloque secundario discreto encima del header de ideas

**Given** que hago clic en "+ Lanzar idea"
**When** el modal se abre
**Then** se muestra el `LaunchIdeaDialog` (Story 9.8)

**Notas técnicas:**
- Modificar `app/(app)/communities/[slug]/page.tsx`: cambiar H1, añadir subtítulo, añadir botón que dispara `LaunchIdeaDialog`
- Depende de Story 9.8 para el dialog
- Flow recomendado: Quick Flow (Bart)

---

### Story 9.10: /communities — redirect condicional

Como miembro de la plataforma con una sola comunidad,
quiero que al entrar a `/communities` sea redirigido automáticamente a mi feed,
para no hacer un click adicional innecesario.

**Acceptance Criteria:**

**Given** que el usuario autenticado pertenece a exactamente 1 comunidad
**When** navega a `/communities`
**Then** es redirigido automáticamente a `/communities/[slug]` de esa comunidad

**Given** que el usuario autenticado pertenece a 0 comunidades
**When** navega a `/communities`
**Then** ve el estado vacío ("Aún no formas parte de ninguna comunidad" + CTA "Crear comunidad")

**Given** que el usuario autenticado pertenece a 2 o más comunidades
**When** navega a `/communities`
**Then** ve la lista de sus comunidades

**Notas técnicas:**
- Modificar `app/(app)/communities/page.tsx`: lógica condicional de redirect antes del render
- Tests: tres escenarios (0 / 1 / 2+ comunidades)
- Flow recomendado: Quick Flow (Bart)
