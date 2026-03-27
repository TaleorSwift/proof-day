---
stepsCompleted: [step-01-init, step-02-discovery, step-03-core-experience, step-04-skip, step-05-skip, step-06-design-system, step-07-screen-inventory, step-08-visual-foundation, step-09-skip, step-10-user-journeys, step-11-component-strategy, step-12-ux-patterns, step-13-responsive-accessibility, step-14-complete]
status: complete
completedAt: '2026-03-27'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/Briefing 330514772072819ea272e1a58bae097f.md"
preExistingDesign:
  source: Screenshots (prototipo Lovable)
  accessMethod: Screenshots provided
  coverage: ~40% (vista de proyecto individual)
workflowType: 'ux-design'
mode: REFINE
project_name: 'proof-day'
user_name: 'Javi'
date: '2026-03-27'
---

# UX Design Specification — Proof Day

**Autor:** Javi
**Fecha:** 2026-03-27
**Referencia visual:** Prototipo Lovable (fuente de autoridad para sistema visual)
**Componentes:** shadcn/ui
**Tipografía:** System font stack

---

<!-- UX design content se añade secuencialmente a través del workflow -->

## Executive Summary

### Project Vision

Proof Day transforma la validación de ideas de conversación informal a señal accionable.
El output de la plataforma es una decisión documentada — no popularidad, no engagement.
El Builder recibe un Proof Score interpretable y registra Iterar / Escalar / Abandonar
de forma visible para su comunidad. El aprendizaje organizacional ocurre por diseño.

### Target Users

**Builder** — crea proyectos y es el usuario más vulnerable de la plataforma.
Expone una idea incompleta a su equipo. El UX debe sentirse seguro y constructivo.
Su "aha moment" es el Proof Score: la primera vez que el sistema le dice qué hacer.

**Reviewer** — aporta criterio sin crear proyectos propios. Quiere que su expertise
sea visible. Su motivación es el reconocimiento (Top Reviewer, contador de feedbacks).
El UX debe hacer que dar feedback bien se sienta significativo, no laborioso.

**Admin** — facilita el acceso. Interacción mínima. UX de configuración: simple y
que no requiera mantenimiento posterior.

### Key Design Challenges

1. **Feedback que no parezca encuesta**: 4 preguntas obligatorias deben sentirse
   como una conversación estructurada, no un formulario de compliance. El patrón
   Yes/No/Somewhat del prototipo + texto libre es la dirección correcta.

2. **Estado de espera pre-Proof Score**: antes de 3 feedbacks el Proof Score está
   oculto. El Builder debe sentir progreso, no vacío. Necesita un estado motivador
   que comunique "faltan N feedbacks para tu señal".

3. **La decisión como momento de peso**: Iterar / Escalar / Abandonar es el climax
   del journey del Builder. No puede ser un dropdown — necesita peso visual y
   sensación de permanencia.

4. **Pantallas sin referencia visual**: login, comunidades, perfil, gamificación
   y landing deben extrapolarse del sistema visual del prototipo de forma coherente.

### Design Opportunities

1. **Tarjeta de hipótesis como patrón de "en juego"**: el tono peach/cream del
   prototipo puede ser el marcador visual de cualquier cosa que requiera atención
   o validación activa. Patrón reutilizable cross-screen.

2. **Top Reviewer como reconocimiento, no ranking**: el momento más social de la
   plataforma. Diseñarlo con peso visual de logro, no de tabla de clasificación fría.

3. **Decisión del Builder como "caso cerrado"**: la decisión visible en la comunidad
   es el artefacto de aprendizaje organizacional más valioso. Su diseño debe comunicar
   cierre y autoridad — el Builder ha decidido, el equipo puede aprender.

---

## Core User Experience

### Defining Experience

El ciclo de valor completo de Proof Day ocurre en una sola pantalla: la vista de proyecto.
Aquí el Builder expone su idea, el Reviewer aporta su criterio, el sistema calcula la señal,
y el Builder registra su decisión. Todo lo demás (login, comunidades, perfil, gamificación)
son pantallas de soporte. El diseño debe priorizar la vista de proyecto como el espacio de
máxima densidad y máximo peso emocional.

### Platform Strategy

- **Plataforma:** Web, desktop-first. Ratón + teclado como input primario.
- **Responsive:** Tablet como secundario funcional. Mobile fuera de alcance MVP.
- **Browser:** Últimas 2 versiones de Chrome, Firefox, Safari, Edge.
- **Layout base:** Dos columnas en vista de proyecto (contenido 60% + sidebar 40%).
- **Sin PWA ni offline.**

### Effortless Interactions

1. **Autenticación sin fricción:** email → magic link → sesión activa. Sin contraseñas, sin registro manual.
2. **Feedback guiado sin ambigüedad:** botones Yes/No/Somewhat (toggle group shadcn/ui) — respuesta visible antes del siguiente paso.
3. **Proof Score legible de un vistazo:** color e icono autoexplicativos. Sin necesidad de leer texto para entender el estado.
4. **Navegación entre proyectos:** lista limpia, sin ruido. El proyecto Live es el protagonista.

### Critical Success Moments

1. **Magic link → sesión**: el primer clic que convierte a un visitante en usuario. Debe ser inmediato y sin sorpresas.
2. **Primer Proof Score** (aha moment del Builder): la primera vez que el sistema dice "esto es lo que deberías hacer". Necesita peso visual — no puede pasar desapercibido.
3. **Registrar la decisión** (Iterar/Escalar/Abandonar): el momento de cierre. Irreversible visualmente. Debe sentirse como firmar algo.
4. **Top Reviewer aparece con nombre propio**: el momento más social. Reconocimiento público dentro de la comunidad.

### Experience Principles

1. **Una pantalla, una decisión** — cada pantalla tiene un único output esperado del usuario.
2. **La calidad del feedback es no-negociable** — el sistema no permite feedback incompleto. La estructura está al servicio de la señal.
3. **La señal habla por sí misma** — el Proof Score no necesita explicación. Color + label + descripción en una línea.
4. **El cierre es visible** — la decisión del Builder es pública en la comunidad. El aprendizaje organizacional requiere visibilidad del resultado.

---

## Design System

> Extraído del prototipo Lovable. Fuente de autoridad visual para la implementación.
> Ver `docs/project/design-tokens.md` para tokens completos listos para código.

### Paleta de Color

**Base**
- `--color-background`: `#FAFAF8` — off-white cálido (fondo general)
- `--color-surface`: `#FFFFFF` — blanco puro (cards, paneles)
- `--color-border`: `#E5E5E0` — gris cálido suave

**Hipótesis / Validación activa** (patrón "en juego" — reutilizable cross-screen)
- `--color-hypothesis-bg`: `#FDF0E8` — peach/cream muy claro
- `--color-hypothesis-border`: `#F0C9A8` — peach mid

**Texto**
- `--color-text-primary`: `#1A1A18` — casi negro cálido
- `--color-text-secondary`: `#6B6B63` — gris cálido
- `--color-text-muted`: `#9B9B8F` — gris apagado

**Proof Score (semántico)**
- Promising: texto `#2D7A4F`, fondo `#E8F5EE`
- Needs iteration: texto `#A05C00`, fondo `#FEF3E2`
- Weak: texto `#B91C1C`, fondo `#FEE2E2`

**Interactivo**
- `--color-primary`: `#1A1A18` — CTA principal
- `--color-accent`: `#E87D4A` — acciones de énfasis (peach saturado)

### Tipografía — System Font Stack

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

Escala: xs(12px) / sm(14px) / base(16px) / lg(18px) / xl(20px) / 2xl(24px) / 3xl(30px)
Pesos: 400 body · 500 labels · 600 headings · 700 CTA / Top Reviewer

### Espaciado

Escala 4px base: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64px

### Border Radius

sm(4px) · md(8px) · lg(12px) · xl(16px) · full(9999px)

### Inventario de Componentes shadcn/ui

| Componente | Uso |
|---|---|
| `Button` | CTAs, acciones primarias, decisiones |
| `ToggleGroup` | Yes/No/Somewhat en feedback |
| `Card` | Proyectos, perfil, gamificación |
| `Badge` | Proof Score label, estados (Live/Draft/Inactive) |
| `Textarea` | Texto libre en feedback |
| `Input` | Email login, formularios |
| `Avatar` | Foto usuario, Top Reviewer |
| `Progress` | "Faltan N feedbacks para tu señal" |
| `Dialog` | Confirmación decisión Builder |
| `Tooltip` | Explicación preguntas feedback |
| `Skeleton` | Loading states |
| `NavigationMenu` | Navbar principal |
| `Tabs` | Proyectos vs. Feedbacks en perfil |

---

## Screen Inventory & Key Flows

### Pantallas

| # | Nombre | Ruta | Rol |
|---|---|---|---|
| 1 | Login / Magic Link | `/login` | Público |
| 2 | Auth Callback | `/auth/callback` | Sistema |
| 3 | Lista de Comunidades | `/communities` | Autenticado |
| 4 | Crear Comunidad | `/communities/new` | Autenticado |
| 5 | Comunidad — Proyectos | `/communities/[slug]` | Miembro |
| 6 | Vista de Proyecto | `/communities/[slug]/projects/[id]` | Miembro |
| 7 | Crear / Editar Proyecto | `/communities/[slug]/projects/new` | Builder |
| 8 | Formulario de Feedback | Modal o `/feedback/[projectId]` | Reviewer |
| 9 | Perfil de Usuario | `/profile/[id]` | Miembro |
| 10 | Gestión Invitaciones | `/communities/[slug]/settings` | Admin |
| 11 | Landing Page | `/` | Público |

### Estados clave — Vista de Proyecto (pantalla principal)

| Estado | Condición | UI |
|---|---|---|
| Draft | Solo Builder | Banner "En borrador — no visible para la comunidad" |
| Live (pre-score) | Live, feedbacks < 3 | Progress bar "Faltan N feedbacks para tu señal" |
| Live (score visible) | Live, feedbacks ≥ 3 | Proof Score badge con color semántico |
| Decisión registrada | Builder registró decisión | Badge de decisión, feedback bloqueado |
| Inactive | Builder marcó como inactivo | Banner "Proyecto inactivo", feedback bloqueado |

### Key Flows

**Flow 1 — Builder publica:**
`/communities` → `/communities/[slug]/projects/new` → Draft → Live

**Flow 2 — Reviewer da feedback:**
Vista de proyecto (sidebar "Dar feedback") → formulario 4 preguntas → redirect con counter +1

**Flow 3 — Builder registra decisión:**
Proof Score visible → Dialog confirmación → badge de decisión visible en comunidad

**Flow 4 — Admin gestiona acceso:**
`/communities/new` → `/communities/[slug]/settings` → invitation link → `/invite/[token]`

---

## Visual Foundation — Wireframe Annotations

### Pantalla 1 — Login

- Fondo: `--color-background`, card centrado max-width 420px
- Input email + botón "Continuar" + estado success "Revisa tu email"
- Sin opciones de registro manual — el sistema crea cuenta automáticamente

### Pantalla 5 — Comunidad: Lista de Proyectos

- Grid 3 columnas desktop / 2 tablet
- Cards de proyecto: img + título + badge estado + contador feedbacks / Proof Score badge
- Widget Top Reviewer al pie: fondo `--color-hypothesis-bg`, border `--color-hypothesis-border`

### Pantalla 6 — Vista de Proyecto (pantalla principal)

Layout dos columnas:
- **Izquierda (60%):** galería imágenes → problema → solución → tarjeta hipótesis (patrón "en juego")
- **Derecha (40%):** Proof Score (o progress bar pre-score) → feedbacks recibidos (lista) → CTA "Dar feedback"

**Estados del sidebar derecho:**
- Pre-score (< 3 feedbacks): Progress bar + texto motivador "Faltan N feedbacks"
- Score visible (≥ 3): Badge semántico Promising/Needs iteration/Weak + botón "Registrar decisión"
- Decisión registrada: card "DECISIÓN DEL BUILDER" con fondo `--color-decision-bg`, feedback bloqueado

### Pantalla 8 — Formulario de Feedback (Dialog)

- 4 preguntas secuenciales con ToggleGroup (Yes/Somewhat/No) + textarea libre
- Botón "Enviar" disabled hasta completar todas las preguntas
- Post-envío: redirect a vista de proyecto con counter +1

### Dialog — Registrar Decisión (peso visual máximo)

- 3 opciones como Cards seleccionables: Iterar / Escalar / Abandonar
- Flujo en 2 pasos: selección → confirmar (acción irreversible)
- Descripción corta bajo cada opción para contextualizar
- Botón "Confirmar decisión" disabled hasta seleccionar una opción

---

## User Journey Flows

### Journey 1 — Builder: De la idea a la decisión

```mermaid
flowchart TD
    A([Usuario autenticado]) --> B[/communities/slug]
    B --> C[+ Nuevo proyecto]
    C --> D[/projects/new\nFormulario: título, problema, solución, hipótesis, imágenes]
    D --> E{¿Guardar?}
    E -->|Guardar borrador| F[Estado: Draft\nSolo visible para Builder]
    E -->|Publicar| G[Estado: Live\nVisible para la comunidad]
    F --> H[Editar proyecto\n/projects/id/edit]
    H --> G
    G --> I{¿Feedbacks recibidos?}
    I -->|< 3| J[Progress bar\nFaltan N feedbacks para tu señal]
    J --> I
    I -->|≥ 3| K[Proof Score visible\nPromising / Needs iteration / Weak]
    K --> L[Builder lee feedbacks\ny comprende señal]
    L --> M[Dialog: Registrar decisión\nIterar / Escalar / Abandonar]
    M --> N[Decisión visible en comunidad\nBadge permanente en proyecto]
    N --> O([Journey completo])
```

**Optimizaciones:**
- Draft autoguardado local (sin submit) — reduce miedo a perder trabajo
- Progress bar con número concreto "Faltan 2 feedbacks" no "Esperando..."
- Proof Score aparece con animación de entrada — momento de peso visual

---

### Journey 2 — Reviewer: Expertise que se vuelve visible

```mermaid
flowchart TD
    A([Usuario autenticado]) --> B[/communities/slug\nLista de proyectos Live]
    B --> C{¿Ya dio feedback?}
    C -->|Sí| D[Proyecto aparece con badge\nFeedback dado ✓]
    C -->|No| E[Proyecto muestra botón\nDar feedback]
    D --> F([Loop — explorar otros proyectos])
    E --> G[Vista de proyecto\n/projects/id]
    G --> H[Sidebar: botón Dar feedback]
    H --> I[Dialog: Formulario 4 preguntas\nToggleGroup Yes/Somewhat/No + texto]
    I --> J{¿Preguntas completas?}
    J -->|No| K[Botón Enviar disabled]
    K --> J
    J -->|Sí| L[Botón Enviar activo]
    L --> M[Enviar feedback]
    M --> N[Redirect a proyecto\nCounter +1 visible]
    N --> O[Sidebar: contador personal actualizado]
    O --> P{¿Top Reviewer?}
    P -->|Sí| Q[Widget Top Reviewer\nnombre propio visible en comunidad]
    P -->|No| R([Explorar más proyectos])
    Q --> R
```

**Optimizaciones:**
- Formulario de feedback en Dialog (no página nueva) — mantiene contexto del proyecto
- ToggleGroup con selección visual inmediata — feedback táctil antes de continuar
- Contador personal actualizado en tiempo real en sidebar — gratificación inmediata

---

### Journey 3 — Admin: El que abre la puerta

```mermaid
flowchart TD
    A([Usuario autenticado]) --> B[/communities\nLista de comunidades]
    B --> C[Crear nueva comunidad]
    C --> D[/communities/new\nFormulario: nombre, descripción, imagen]
    D --> E[Crear comunidad]
    E --> F[/communities/slug\nAdmin automático]
    F --> G[/communities/slug/settings]
    G --> H[Generar invitation link]
    H --> I[Link copiado al clipboard\nURL: /invite/token]
    I --> J[Compartir link fuera de la plataforma\nSlack, email, etc.]
    J --> K{¿Usuarios se unen?}
    K -->|Sí| L[/invite/token → join community\nUsuario queda como miembro]
    L --> M([Comunidad activa\nAdmin no gestiona nada más])
    K -->|No| N[Generar nuevo link\nEl anterior expira tras uso]
    N --> J
```

**Optimizaciones:**
- Link copiado con un clic (sin "seleccionar texto")
- Link de un solo uso — si se comparte públicamente no hay riesgo masivo
- Admin no necesita aprobar cada usuario — acceso automático con link válido

---

### Journey Patterns

| Patrón | Descripción | Aplicación |
|---|---|---|
| **Confirmación de dos pasos** | Selección → confirmar — para acciones irreversibles | Registrar decisión, eliminar proyecto |
| **Estado motivador** | Nunca "vacío" — siempre hay información accionable | Pre-Proof Score, empty state comunidad |
| **Gratificación inmediata** | El counter sube en el momento del envío | Feedback enviado, proyecto publicado |
| **Contexto preservado** | Acciones en Dialog/Sheet — el usuario no pierde dónde estaba | Formulario de feedback, registrar decisión |
| **Error inline** | Mensajes de error junto al campo, no en toast | Email inválido en login, campo vacío |

### Flow Optimization Principles

1. **Mínimo de pasos al valor** — Builder puede publicar en menos de 5 acciones
2. **Feedback visual en cada acción** — ningún botón queda sin respuesta perceptible
3. **Recovery sin fricción** — el usuario puede volver atrás sin perder datos
4. **Un único CTA por pantalla** — siempre está claro qué hacer a continuación

---

## Component Strategy

### Componentes shadcn/ui (base — no modificar)

Button, ToggleGroup, Card, Badge, Textarea, Input, Avatar, Progress, Dialog, Tooltip, Skeleton, NavigationMenu, Tabs, Sheet, DropdownMenu, Form, Label, Separator

### Custom Components

#### ProofScoreBadge

**Propósito:** Mostrar el estado del Proof Score con peso visual y semántica de color clara.
**Uso:** Sidebar de vista de proyecto cuando feedbacks ≥ 3.
**Anatomía:** `[icono] [label] + [descripción corta (opcional)]`
**Estados:** Promising / Needs iteration / Weak
**Variantes:** `compact` (solo icono + label) / `full` (con descripción de una línea)
**Accesibilidad:** `role="status"`, `aria-label="Proof Score: Promising"`
**Fichero:** `components/proof-score/ProofScoreBadge.tsx`

#### FeedbackQuestion

**Propósito:** Encapsular una pregunta de feedback con su control ToggleGroup + texto libre.
**Uso:** Formulario de feedback (4 instancias).
**Anatomía:** `[número] [pregunta] + ToggleGroup(Yes/Somewhat/No) + Textarea opcional`
**Estados:** unanswered / answered (ToggleGroup seleccionado) / complete (con texto)
**Accesibilidad:** `fieldset` + `legend` por pregunta, labels ARIA en ToggleGroup
**Fichero:** `components/feedback/FeedbackQuestion.tsx`

#### ProjectCard

**Propósito:** Representar un proyecto en la lista de comunidad.
**Uso:** Grid de proyectos en `/communities/[slug]`.
**Anatomía:** `[imagen destacada] + [título] + [badge estado] + [métricas]`
**Estados:** Live (activo), Live+score (con ProofScoreBadge compact), Inactive (opacidad reducida), Draft (solo Builder, badge especial)
**Fichero:** `components/projects/ProjectCard.tsx`

#### ProofScoreWaiting

**Propósito:** Estado pre-score motivador — comunica progreso sin vacío.
**Uso:** Sidebar de vista de proyecto cuando feedbacks < 3.
**Anatomía:** `[título "Faltan N feedbacks"] + [Progress bar] + [texto motivador]`
**Comportamiento:** número dinámico según feedbacks recibidos (3 - actual)
**Fichero:** `components/proof-score/ProofScoreWaiting.tsx`

#### DecisionBadge

**Propósito:** Mostrar la decisión del Builder de forma permanente y con autoridad.
**Uso:** Vista de proyecto cuando el Builder ha registrado decisión. Visible en lista de proyectos de la comunidad.
**Anatomía:** `[icono decisión] [label Iterar/Escalar/Abandonar]`
**Estilo:** fondo `--color-decision-bg`, permanente e inmutable visualmente
**Fichero:** `components/projects/DecisionBadge.tsx`

#### HypothesisCard

**Propósito:** Card con patrón visual "en juego" — peach/cream para elementos que requieren validación activa.
**Uso:** Sección de hipótesis en vista de proyecto. Reutilizable para otros contextos de validación.
**Estilo:** `--color-hypothesis-bg`, `--color-hypothesis-border`, `--radius-xl`
**Fichero:** `components/projects/HypothesisCard.tsx`

#### TopReviewerWidget

**Propósito:** Reconocimiento visible del top contributor de la comunidad.
**Uso:** Widget en lista de proyectos de comunidad (`/communities/[slug]`).
**Anatomía:** `[icono trofeo] + [Avatar + nombre] + [N feedbacks esta semana]`
**Estilo:** fondo `--color-hypothesis-bg` — patrón "en juego" como reconocimiento
**Fichero:** `components/gamification/TopReviewerWidget.tsx`

### Estrategia de Implementación

```
components/
├── ui/                    ← shadcn/ui — NO modificar
├── proof-score/
│   ├── ProofScoreBadge.tsx
│   └── ProofScoreWaiting.tsx
├── feedback/
│   └── FeedbackQuestion.tsx
├── projects/
│   ├── ProjectCard.tsx
│   ├── DecisionBadge.tsx
│   └── HypothesisCard.tsx
└── gamification/
    └── TopReviewerWidget.tsx
```

**Regla:** Custom components usan tokens CSS (`var(--color-*)`) y componen primitivos shadcn/ui. Nunca hardcoded values.

### Implementation Roadmap

**Fase 1 — Críticos (builder journey):**
HypothesisCard → ProofScoreWaiting → ProofScoreBadge → DecisionBadge

**Fase 2 — Comunidad (reviewer journey):**
ProjectCard → FeedbackQuestion → TopReviewerWidget

---

## UX Consistency Patterns

### Button Hierarchy

| Nivel | Componente | Uso |
|---|---|---|
| **Primario** | `Button variant="default"` | Un único CTA por pantalla (Publicar, Enviar feedback, Confirmar decisión) |
| **Secundario** | `Button variant="outline"` | Acciones alternativas (Guardar borrador, Cancelar) |
| **Ghost** | `Button variant="ghost"` | Acciones terciarias (Editar, Ver perfil, links de navegación) |
| **Destructivo** | `Button variant="destructive"` | Acciones irreversibles con impacto negativo (si aplica) |

**Regla:** nunca dos botones primarios en la misma pantalla/dialog.

### Feedback Patterns (success / error / warning)

| Situación | Patrón | Componente |
|---|---|---|
| Acción completada (feedback enviado, proyecto publicado) | Toast breve, auto-dismiss 3s | `sonner` o `toast` shadcn/ui |
| Error de validación en campo | Mensaje inline bajo el campo | `FormMessage` de shadcn/ui |
| Error de servidor | Banner inline en formulario (no modal) | `Alert variant="destructive"` |
| Estado vacío (sin proyectos, sin comunidades) | Empty state ilustrado con CTA | Custom empty state component |
| Loading | Skeleton en forma del contenido | `Skeleton` shadcn/ui |

**Regla:** Toasts solo para confirmaciones de acciones completadas. Errores siempre inline.

### Form Patterns

- Validación **onBlur** (no onChange) — no interrumpir mientras el usuario escribe
- Botón submit **disabled** hasta que el formulario es válido
- Labels siempre visibles (no solo placeholder)
- Campos obligatorios con `*` visible + `aria-required`
- Mensajes de error: texto específico, no genérico ("Email inválido" no "Error")

### Navigation Patterns

- Navbar persistente en todas las pantallas autenticadas
- Breadcrumb en vistas de proyecto: `← Comunidad / Nombre del Proyecto`
- Back navigation: siempre mediante breadcrumb, nunca botón "Atrás" custom
- Estado activo en navbar: highlight de la comunidad actual

### Modal & Overlay Patterns

- Dialog para: acciones irreversibles (decisión Builder), confirmaciones críticas
- Sheet (panel lateral) para: formularios largos en mobile/tablet
- Tooltip para: explicaciones contextuales (preguntas de feedback)
- No usar múltiples overlays anidados

### Empty States

| Pantalla | Empty State | CTA |
|---|---|---|
| Lista de comunidades | "Aún no perteneces a ninguna comunidad" | "Usar link de invitación" o "Crear comunidad" |
| Lista de proyectos | "Esta comunidad no tiene proyectos Live aún" | "Crear el primero" (si Builder) |
| Feedbacks recibidos (< 3) | ProofScoreWaiting component | — |
| Perfil — tab Proyectos | "Aún no has creado proyectos" | "Crear proyecto" |

---

## Responsive Design & Accessibility

### Responsive Strategy

**Desktop (1024px+) — Primary target:**
- Layout 2 columnas en vista de proyecto (60/40)
- Grid 3 columnas en lista de proyectos
- Navbar horizontal completa
- Toda la funcionalidad disponible

**Tablet (768px–1023px) — Secondary functional:**
- Layout 1 columna en vista de proyecto (sidebar se mueve bajo el contenido)
- Grid 2 columnas en lista de proyectos
- Navbar horizontal simplificada
- Formulario de feedback en Sheet en lugar de Dialog

**Mobile (< 768px) — Fuera de alcance MVP:**
- No se optimiza en MVP. Si acceden, verán la vista tablet.
- Sin PWA ni experiencia mobile específica.

### Breakpoint Strategy

```css
/* Tailwind defaults — suficientes para este proyecto */
sm:  640px   /* no usado activamente en MVP */
md:  768px   /* tablet — layout changes */
lg:  1024px  /* desktop — primary target */
xl:  1280px  /* desktop wide — grid improvements */
```

**Desktop-first:** media queries solo para adaptar a tablet (md). Sin mobile-first en MVP.

### Accessibility Strategy

**Nivel objetivo: best-effort WCAG AA** (definido en PRD NFR-A1, NFR-A2)

| Requisito | Implementación |
|---|---|
| Contraste ≥ 4.5:1 texto normal | Tokens validados (negro cálido sobre off-white) |
| Contraste ≥ 3:1 UI components | Bordes y estados de foco |
| Navegación por teclado | `Tab`, `Enter`, `Esc` en todos los componentes interactivos |
| Screen reader | Semántica HTML correcta, ARIA labels en componentes custom |
| Focus indicators | `focus-visible` ring visible — no eliminar outline |
| Touch targets | Mínimo 44×44px en elementos interactivos |

### Reglas de implementación para Homer

```
✅ Usar unidades relativas (rem, %) — no px fijos para tipografía
✅ Semántica HTML: <main>, <nav>, <section>, <article>, <h1>-<h6> correctos
✅ Alt text en todas las imágenes de galería de proyectos
✅ aria-label en botones con solo icono
✅ aria-live en counters que se actualizan (feedbacks, Proof Score)
✅ Keyboard trap en Dialogs (focus loop dentro del Dialog)
✅ Skip link al contenido principal en todas las páginas autenticadas
```

