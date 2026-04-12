# Plan: Alineación UX con prototipo Lovable (v2)

> Generado tras navegación completa del prototipo el 2026-04-10.
> Prototipo: https://id-preview--19da568b-3832-4ae6-ab10-9cbd34fe3185.lovable.app/
> Logo: `Proof_Day.png` (corgi con gafas)

---

## Páginas identificadas en el prototipo

| # | Página | URL prototipo | Equivalente en localhost |
|---|--------|--------------|--------------------------|
| 1 | Login / Auth | `/` (pre-auth) | `/auth/login` |
| 2 | Feed autenticado | `/` (post-auth) | `/communities/[slug]` |
| 3 | Project Detail — Live (no-owner) | `/project/1`, `/project/2` | `/communities/[slug]/projects/[id]` |
| 4 | Project Detail — Closed (no-owner) | `/project/4` | misma ruta, status=inactive |
| 5 | Modal "Launch a new idea" | desde feed | `/communities/[slug]/projects/new` (actualmente página) |

**No existe en el prototipo:** landing page de marketing (`/`), vista owner de project detail con sidebar de feedback, perfil de usuario.

---

## Metodología de cada story

Para cada página:
1. Abrir prototipo lado a lado con localhost
2. Documentar diferencias visuales exactas
3. Implementar con Quick Flow (Bart): QS → QD → /cr → /qa

---

## Story 9.1 — Auth page: logo + copy aligned

### Prototipo
- Fondo crema (`var(--color-background)`)
- Centro de pantalla (no card blanca)
- Logo corgi grande (~150px) — `Proof_Day.png`
- H1: **"Welcome to Proof Day"**
- Subtítulo: *"Validate ideas. Learn faster. Build what matters."*
- Botón naranja full-width: "Sign in with GitHub" (ícono GitHub)
- Texto legal pequeño: "By signing in you agree to share constructive feedback and help your team learn."

### Actual (`app/auth/login/page.tsx`)
- Card blanca flotante con sombra
- Sin logo
- Texto "Proof Day" + "Valida tu idea. Toma la decisión."
- Campo email + botón "Continuar" (magic link, se mantiene)

### Cambios a implementar
- Eliminar card blanca — layout centrado sobre fondo crema
- Añadir `<Image src="/Proof_Day.png">` (~150px, circular recortado)
- Cambiar h1 a "Welcome to Proof Day"
- Cambiar subtítulo a "Validate ideas. Learn faster. Build what matters."
- Mantener flujo magic link pero cambiar texto del botón a "Continuar con email"
- Añadir texto legal debajo del botón
- Mover `Proof_Day.png` a `/public/logo.png`

---

## Story 9.2 — Navbar: logo + user avatar

### Prototipo
- Izquierda: logo corgi pequeño (~32px) + texto "Proof Day" (font-semibold)
- Derecha: círculo naranja con inicial "A" + nombre "Alex Rivera" + ícono logout (→)
- Sin community switcher
- Fondo crema, sin borde inferior visible, altura ~56px

### Actual (`components/layout/Navbar.tsx` o equivalente)
- Solo texto "Proof Day" sin logo
- Puede tener community switcher

### Cambios a implementar
- Añadir `<Image src="/public/logo.png">` en navbar (32×32px)
- Mostrar `UserAvatar` del usuario autenticado con nombre a la derecha
- Añadir ícono de logout (→) junto al nombre
- Eliminar community switcher del navbar (ya planificado en Story anterior)

---

## Story 9.3 — Feed: sección headers + subtítulo + button Launch idea como modal

### Prototipo
**Layout general:**
- Sin padding lateral excesivo, max-width ~960px centrado
- Dos columnas: feed principal (izquierda, ~60%) + sidebar Top Contributors (derecha, ~280px)

**Header del feed:**
- H1: **"Ideas in validation"** (font-bold, ~28px)
- Subtítulo: *"Give feedback. Learn faster. Decide what to build."* (text-muted)
- Botón "+ Launch idea" (naranja, alineado arriba a la derecha del header)

**Sección LIVE:**
- Label: `🔴 LIVE — ACCEPTING FEEDBACK` (uppercase, text-xs, text-muted, con punto rojo animado)

**Sección CLOSED:**
- Label: `CLOSED` (uppercase, text-xs, text-muted)

**Project cards:**
- Layout horizontal: thumbnail izquierda (90px alto, 120px ancho, border-radius) + contenido centro + heart button derecha
- Contenido centro: Título + badge (Live/Closed) + tagline (una línea, text-muted) + fila de meta: avatar-autor + nombre + comentario-count + "X would use this"
- Heart button: corazón outline + número debajo

**Launch idea:** abre MODAL sobre el feed (no navega a nueva página)

### Actual (`app/(app)/communities/[slug]/page.tsx`)
- Sección headers con estilos diferentes
- Botón "Nuevo proyecto" navega a página separada
- Los cards usan `problem` como tagline (no existe campo `tagline`)
- "Would use this" no existe

### Cambios a implementar
- Actualizar h1 a "Ideas in validation" + subtítulo
- Actualizar labels de sección: `🔴 LIVE — ACCEPTING FEEDBACK` y `CLOSED`
- Convertir "Nuevo proyecto" / "+ Launch idea" en modal (Sheet o Dialog)
- En ProjectCard: mostrar `tagline` si existe, fallback a `problem` truncado a 1 línea
- Añadir "X would use this" en metadata de card (requiere campo `would_use_count` — ver nota DB abajo)
- Ajustar layout del header de página

**Nota DB:** El prototipo muestra "would use this" count. Esto requiere migration nueva o se puede omitir en v1 si se prioriza el resto visual.

---

## Story 9.4 — Modal "Launch a new idea"

### Prototipo
Modal Dialog centrado, ~540px ancho, con campos:
- **Project name** (required) — input texto, placeholder "e.g. Pulse Check"
- **Tagline** (required) — input texto, "One sentence that captures your idea"
- **What problem does this solve?** (required) — textarea
- **What's your proposed solution?** (required) — textarea
- **Who is the target user?** — input texto
- **🚀 Hypothesis to validate** (required) — textarea con placeholder "If [action], then [outcome] — what do you believe will happen?"
- **Demo link (optional)** — input URL
- **Images (up to 3)** — uploader con botón "Add"
- **What feedback are you looking for?** — chips toggleables: Problem clarity, Willingness to use, Technical feasibility, Missing features, Market fit, UX concerns
- Botones: Cancel (secundario) + "+ Launch Project" (naranja)

### Actual (`app/(app)/communities/[slug]/projects/new/page.tsx`)
- Página completa separada
- Campos similares pero sin "Tagline" específico (usa problem/solution como base)
- Abre en nueva URL

### Cambios a implementar
- Convertir la page de new project en un Dialog/Sheet reutilizable
- Añadir campo "Tagline" (mapea a `target_user` o nuevo campo `tagline` en DB — requiere migration)
- Abrir el dialog desde el botón "+ Launch idea" del feed
- Chips de feedback topics (ya existe `feedback_topics` en DB — usar como checkboxes visuales)
- Tras submit exitoso: cerrar modal + revalidar feed

**Nota DB:** Añadir columna `tagline text` a `projects` en migration 014.

---

## Story 9.5 — Project Detail: layout y secciones alineadas con prototipo

### Prototipo (Live, non-owner view)
**Columna izquierda:**
- "← Back to feed" (link, text-sm, text-muted)
- Título (h1, bold) + badge Live/Closed (inline)
- **Tagline** como h2/subtítulo debajo del título (text-muted, una línea)
- Author: avatar pequeño + nombre (no data-testid, solo visual)
- Imagen grande (full-width, ~450px alto, border-radius)
- Caption bajo imagen: *"Use these visuals to give more precise feedback"* (text-xs, text-muted, ícono imagen)
- **Problem** — label bold + texto (sin h2 como header, solo `<p class="font-semibold">Problem</p>`)
- **Solution** — igual
- **Target user** — igual
- **🚀 Hypothesis to validate** — sección destacada con border naranja, label naranja + emoji, textarea con texto

**Columna derecha (sidebar, SIEMPRE VISIBLE — no solo owner):**

**Card 1: Validation Signal**
- Header: "VALIDATION SIGNAL" (uppercase, text-xs, tracking-wide) + badge de señal (verde/ámbar/rojo)
- Progress bars: "Understand the problem X%" + "Would use it X%"
- "Based on N feedback entries" (text-xs, text-muted)
- Disclaimer: "Based on early feedback — this is a directional signal, not a final judgment." (text-xs, italic)

**Card 2: Help improve this idea (solo si proyecto está Live)**
- Header: "Help improve this idea"
- Subtítulo: "Your feedback helps the team learn and make better decisions."
- Pregunta 1: "Do you understand the problem?" → botones Yes / Somewhat / No
- Pregunta 2: "Would you use this?" → botones Yes / No
- Pregunta 3: "What would you improve?" → textarea
- Botón: "Share insight" (naranja, full-width)

**Card 2 alternativa (proyecto Closed):**
- Texto: "This idea is no longer accepting feedback." (text-muted, centrado)

### Actual
- Sidebar solo visible para el owner (isOwner)
- Feedback form es un Dialog/modal (FeedbackCTA → FeedbackDialog)
- TeamPerspectives visible para todos (debajo del main content)
- Secciones tienen h2 como headers
- No hay tagline como subtítulo
- No hay caption bajo imagen

### Cambios a implementar
- Añadir `tagline` como subtítulo bajo el título (desde campo `tagline` de DB o fallback a `problem` truncado)
- Cambiar section headers a texto bold (no h2) para Problem/Solution/Target user
- Añadir caption "*Use these visuals to give more precise feedback*" bajo imagen
- Refactorizar hypothesis box con label "🚀 Hypothesis to validate" en naranja
- Hacer sidebar visible para TODOS (no solo owner)
- Sidebar siempre muestra: ValidationSignalCard + FeedbackForm inline (para no-owners en proyectos Live) o "no longer accepting" (Closed)
- FeedbackForm inline: reemplazar el Dialog actual por formulario inline en sidebar
- Mover/ocultar TeamPerspectives del layout principal (el prototipo no lo muestra en el scroll principal visible)
- El owner sigue viendo su sidebar adicional (FeedbackList + ProofScore)

---

## Story 9.6 — Landing page: simplificar o redirigir

### Prototipo
No existe landing page de marketing. La URL raíz `/` redirige directamente a login o feed.

### Actual (`app/page.tsx`)
Landing page con hero, "Cómo funciona", 3 cards explicativas.

### Opciones (preguntar al usuario)
- **Opción A:** Mantener la landing page como está (el prototipo es interno, la landing es para marketing externo)
- **Opción B:** Simplificar la landing para que sea idéntica al login centrado
- **Opción C:** Redirigir `/` a `/auth/login` directamente

**Recomendación:** Opción A — mantener landing page, es valor de marketing no presente en el prototipo.

---

## Orden de implementación sugerido

| Story | Prioridad | Complejidad | Dependencias |
|-------|-----------|-------------|--------------|
| 9.1 Auth page | Alta | Baja | Logo en /public |
| 9.2 Navbar | Alta | Baja | Logo en /public |
| 9.3 Feed headers + cards | Alta | Media | - |
| 9.4 Launch idea modal | Media | Alta | Migration tagline |
| 9.5 Project detail | Alta | Alta | FeedbackForm inline |
| 9.6 Landing | Baja | Baja | Decisión del usuario |

**Migrations necesarias:**
- `014_add_tagline_to_projects.sql`: `ALTER TABLE projects ADD COLUMN tagline text;`
- `015_add_would_use_count.sql` (opcional): contador para "X would use this"

---

## Verificación por página

Para cada story, tras implementar, abrir en paralelo:
- Prototipo: https://id-preview--19da568b-3832-4ae6-ab10-9cbd34fe3185.lovable.app/
- Local: http://localhost:3000

Checklist visual por story:
- [ ] Colores idénticos (fondo crema, naranja #F97316, texto muted)
- [ ] Tipografía y tamaños alineados
- [ ] Espaciado y padding consistente
- [ ] Componentes en la posición correcta
- [ ] Estados (Live/Closed) correctos
- [ ] Responsive básico (no crítico en esta fase)
