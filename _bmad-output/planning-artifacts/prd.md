---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - "_bmad-output/planning-artifacts/Briefing 330514772072819ea272e1a58bae097f.md"
  - "_bmad-output/planning-artifacts/EARS 330514772072812db976d8db34255e2a.md"
  - "_bmad-output/planning-artifacts/HUs 330514772072813a8da4e3312cb15ac1.md"
  - "_bmad-output/planning-artifacts/Gherkin 33051477207281b1ad6bdf869daf36f9.md"
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document — Proof Day

**Autor:** Javi
**Fecha:** 2026-03-27
**Stack:** Next.js + Supabase
**Contexto:** Greenfield · MVP · Plataforma web interna

---

## Executive Summary

Proof Day es una plataforma interna de validación de ideas que convierte opiniones en señales accionables. Cualquier miembro del equipo puede lanzar un proyecto, recibir feedback estructurado de su comunidad y obtener un Proof Score que le indica qué debe hacer: iterar, escalar o abandonar.

**Problema:** Las ideas existen pero no se validan. El feedback interno es superficial (likes) o inexistente, el esfuerzo se desperdicia y el aprendizaje organizacional no ocurre.

**Solución:** Un sistema de tres capas — presentación estructurada de la idea, feedback guiado obligatorio, señal de viabilidad interpretable — que fuerza calidad por diseño y produce decisiones documentadas, no conversaciones.

**Diferenciación clave:** No es Product Hunt (popularidad) ni Slack (ruido). Es un sistema de decision-making: el output es la decisión del Builder, no el engagement de la comunidad.

**Roles:**
- **Builder** — crea proyectos, recibe feedback, toma decisiones
- **Reviewer** — aporta feedback estructurado guiado
- **Admin** — crea comunidades, gestiona acceso mediante invitaciones

Un mismo usuario puede ejercer cualquier rol en distintos proyectos.

---

## Success Criteria

### User Success

El Builder recibe un Proof Score (Promising / Needs iteration / Weak) cuando acumula ≥3 feedbacks y sabe exactamente qué acción tomar. El "aha moment" es la señal interpretable sin ambigüedad.

### Business Success

- **Métrica clave:** 80% de proyectos Live reciben ≥3 feedbacks a los 3 meses del lanzamiento.
- >60% de Builders registran una decisión explícita (Iterar / Escalar / Abandonar) tras recibir su Proof Score.
- % de proyectos que evolucionan vs. proyectos sin resolución.

### Measurable Outcomes

| Métrica | Umbral | Timeframe |
|---|---|---|
| Proyectos Live con ≥3 feedbacks | 80% | 3 meses post-lanzamiento |
| Builders con decisión explícita | >60% | 3 meses post-lanzamiento |
| Entrega magic link | <30s | Siempre |
| Proof Score visible (umbral mínimo feedbacks) | ≥3 feedbacks | Siempre |

---

## Product Scope

### MVP (Phase 1)

Ciclo completo Builder → Feedback → Proof Score → Decisión dentro de comunidades privadas:

- Autenticación magic link via Supabase Auth
- Comunidades privadas con invitaciones de un solo uso
- Proyectos con galería (1-5 imágenes), estados Draft / Live / Inactive
- Feedback estructurado con 4 preguntas guiadas obligatorias
- Proof Score triestado (Promising / Needs iteration / Weak), visible desde ≥3 feedbacks
- Decisión explícita del Builder visible en la comunidad
- Perfil de usuario con visibilidad restringida a comunidades compartidas
- Gamificación básica: contador de feedbacks dados + ranking Top Reviewer por comunidad
- Landing page pública optimizada para SEO

### Growth (Phase 2)

- Notificaciones por email al recibir nuevo feedback
- Sistema de badges extendido
- Historial de decisiones del Builder
- Exportación de insights del Proof Score
- Reactivación de proyectos desde Inactive

### Visión (Phase 3)

- Feedback asistido por IA
- Analytics cross-community para admins multi-comunidad
- Matching automático Builder ↔ Reviewer por intereses
- Integración con herramientas externas (Jira, Notion, Linear)

### Fuera de alcance MVP

| Decisión | Justificación |
|---|---|
| Moderación de contenido | Comunidad interna de confianza |
| Retención de datos post-baja de usuario | No prioritario en v1 |
| Logs de auditoría de actividad | No requerido en MVP |
| Reactivación de proyectos Inactive | Growth feature |

---

## User Journeys

### Journey 1 — Builder: De la idea a la decisión

**Persona:** Marta, Product Designer en un equipo de 40 personas. Lleva semanas con una idea para mejorar el onboarding interno. Ha recibido "qué interesante" en reuniones pero nada accionable.

**Opening Scene:** Marta entra en Proof Day. Se autentica con su email — magic link en segundos, hace clic, está dentro.

**Rising Action:** Crea un proyecto en Draft: problema, solución, hipótesis, tres capturas. Solo ella lo ve. Lo refina dos días. Cuando está lista, lo publica: estado Live.

**Climax:** Sus compañeros dejan feedback estructurado. Con 4 feedbacks, el Proof Score muestra: **"Needs iteration"** — el problema es claro, la solución genera dudas. Lee los comentarios. Entiende exactamente qué falla.

**Resolution:** Toma la decisión: **Iterar**. Tiene insights accionables. Ha ahorrado semanas de desarrollo en la dirección equivocada.

---

### Journey 2 — Reviewer: Expertise que antes se perdía en Slack

**Persona:** Carlos, desarrollador backend. No crea proyectos propios, pero tiene criterio sobre todo.

**Opening Scene:** Carlos ve la lista de proyectos Live en su comunidad. Uno le llama la atención: automatizar el proceso de deploy. Su área exacta.

**Rising Action:** Abre el proyecto. El sistema le guía: ¿Entiendes el problema? ¿Lo usarías? ¿Por qué? ¿Qué mejorarías? Carlos escribe un párrafo con contexto real, no un "me gusta".

**Climax:** Al terminar, ve su contador: 12 feedbacks esta semana. Está en el **Top Reviewer** de la comunidad. Sus compañeros lo ven.

**Resolution:** Carlos influye en decisiones reales con su expertise. Tiene visibilidad interna que antes no tenía.

---

### Journey 3 — Community Admin: El que abre la puerta

**Persona:** Ana, Engineering Manager. Quiere validar ideas de producto con su equipo de 15 antes de meterlas en el roadmap.

**Opening Scene:** Ana crea una comunidad: nombre, descripción, imagen. Queda como admin automáticamente.

**Rising Action:** Genera un link de invitación. Lo comparte en Slack. Los 15 se unen durante el día.

**Resolution:** Ana no gestiona nada más. La comunidad es privada — solo su equipo ve y participa. Los proyectos fluyen, el feedback se acumula, el Proof Score habla solo.

---

### Journey Requirements Summary

| Journey | Capacidades requeridas |
|---|---|
| Builder | Crear/editar proyecto en Draft, publicar a Live, ver Proof Score y feedbacks, registrar decisión |
| Reviewer | Listar proyectos Live, enviar feedback guiado, ver contador personal y Top Reviewer |
| Admin | Crear comunidad, generar invitation links, gestionar membresía |

---

## Domain-Specific Requirements

No aplica regulación externa. La plataforma opera en contexto de comunidad interna privada bajo responsabilidad de la organización adoptante.

**Scoping de datos por comunidad:** toda visibilidad (proyectos, perfiles, feedback) está restringida a miembros de la misma comunidad, implementada mediante Row Level Security (RLS) en Supabase. El acceso no autorizado por URL directa es rechazado por diseño.

**Sin integraciones externas requeridas en MVP.** Plataforma autocontenida.

---

## Innovation & Novel Patterns

### Tres decisiones de diseño que diferencian Proof Day

**1. Proof Score como señal de decisión, no de popularidad**
El sistema produce un estado triestado (Promising / Needs iteration / Weak) calculado desde feedback estructurado. No es un ranking — es una recomendación accionable. El Builder sabe qué hacer, no quién "gana".

**2. Feedback estructurado como primitivo obligatorio**
No existen likes. Cada feedback responde preguntas guiadas obligatorias. La plataforma no puede degradarse hacia comportamiento de red social: la calidad de la señal está garantizada por diseño.

**3. La decisión como output de primera clase**
Proof Day mide decisiones, no engagement. El Builder registra explícitamente Iterar / Escalar / Abandonar, y esa decisión es visible en la comunidad. La plataforma es un sistema de aprendizaje organizacional.

### Landscape competitivo

| | Product Hunt | Slack/idea channels | Proof Day |
|---|---|---|---|
| Output | Popularidad | Ruido | Decisión documentada |
| Feedback | Likes + comentarios libres | Sin estructura | Guiado obligatorio |
| Audiencia | Externa | Interna (sin estructura) | Interna privada |

### Validación del modelo

- Proof Score válido con ≥3 feedbacks — por debajo el Builder ve "esperando más feedback".
- Métrica de validación: % de proyectos con decisión explícita registrada.

### Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Feedback de baja calidad | Preguntas guiadas obligatorias; sin respuesta completa no se registra |
| Builders que no toman decisión | Decisión visible en comunidad — incentivo social para cerrar el ciclo |

---

## Web App Specific Requirements

**Stack:** Next.js (App Router) · Supabase (PostgreSQL + Auth) · API Routes como capa backend · Hosting compatible con Vercel.

**Browser support:** Chrome, Firefox, Safari, Edge — últimas 2 versiones. Sin soporte IE ni legacy.

**Responsive:** Desktop-first. Responsive básico para tablet. Mobile no es caso de uso prioritario en MVP.

**SEO:**
- Plataforma autenticada: sin indexación — contenido privado.
- Landing page pública: optimizada para posicionamiento (meta tags, Open Graph, estructura semántica, Core Web Vitals). La landing es un artefacto separado de la plataforma principal y forma parte del alcance MVP.

**Accesibilidad:** Best-effort — semántica HTML correcta, contraste mínimo aceptable, navegación por teclado. Sin certificación WCAG AA formal.

**Decisiones de implementación:**
- Supabase Auth gestiona magic link nativo — reduce complejidad de EARS-AUTH.
- RLS en Supabase implementa el scoping de comunidad a nivel de base de datos.
- API Routes de Next.js actúan como capa de validación entre cliente y Supabase.
- Proof Score y contadores se actualizan al navegar/recargar — no se requiere WebSocket ni SSE.

---

## Functional Requirements

### Autenticación y Acceso

- **FR1:** El usuario puede solicitar acceso introduciendo su email para recibir un magic link.
- **FR2:** El sistema crea automáticamente una cuenta si el email no existe previamente.
- **FR3:** El usuario puede autenticarse haciendo clic en un magic link válido e iniciar sesión.
- **FR4:** El sistema invalida todos los magic links anteriores de un usuario al generar uno nuevo.

### Comunidades

- **FR5:** El usuario autenticado puede crear una comunidad privada con nombre, descripción e imagen.
- **FR6:** El admin puede generar múltiples links de invitación para su comunidad.
- **FR7:** El usuario puede unirse a una comunidad usando un link de invitación válido y de un solo uso.
- **FR8:** El usuario accede únicamente a las comunidades de las que es miembro.

### Proyectos

- **FR9:** El Builder puede crear un proyecto en Draft dentro de una comunidad de la que es miembro.
- **FR10:** El Builder puede editar su proyecto (título, descripción, hipótesis, imágenes) mientras está en Draft.
- **FR11:** El Builder puede publicar su proyecto cambiando su estado a Live.
- **FR12:** El Builder puede marcar su proyecto como Inactive.
- **FR13:** El Builder debe proporcionar entre 1 y 5 imágenes en la galería de su proyecto.
- **FR14:** Los miembros de la comunidad pueden ver proyectos en estado Live e Inactive.
- **FR15:** Solo el creador puede ver su proyecto en estado Draft.

### Feedback

- **FR16:** El Reviewer puede enviar feedback estructurado en proyectos Live de su comunidad.
- **FR17:** El feedback requiere responder un conjunto de preguntas guiadas obligatorias.
- **FR18:** El sistema asocia cada feedback con el usuario que lo envía y el proyecto que lo recibe.
- **FR19:** El usuario no puede enviar feedback en proyectos en estado Draft o Inactive.

### Proof Score y Decisión

- **FR20:** El Builder puede ver el Proof Score de su proyecto cuando ha recibido al menos 3 feedbacks.
- **FR21:** El Proof Score presenta uno de tres estados: Promising / Needs iteration / Weak.
- **FR22:** El Builder puede registrar su decisión explícita sobre el proyecto: Iterar / Escalar / Abandonar.
- **FR23:** La decisión del Builder es visible para los miembros de su comunidad.

### Perfiles de Usuario

- **FR24:** El usuario puede completar y editar su perfil con intereses y bio.
- **FR25:** El perfil muestra el número de feedbacks dados y proyectos creados por el usuario.
- **FR26:** El usuario puede ver el perfil de otros miembros de comunidades compartidas.
- **FR27:** El usuario no puede acceder al perfil de usuarios con los que no comparte ninguna comunidad.

### Gamificación

- **FR28:** El usuario puede ver su contador personal de feedbacks dados en la comunidad.
- **FR29:** La comunidad muestra un ranking Top Reviewer con el miembro que más feedbacks ha enviado.

### Landing Page

- **FR30:** La landing page pública presenta la propuesta de valor de Proof Day a visitantes no autenticados.
- **FR31:** La landing page permite a los visitantes solicitar acceso o contactar con el equipo.

---

## Non-Functional Requirements

### Performance

- **NFR-P1:** Magic link entregado al email del usuario en <30 segundos bajo condiciones normales. Medible via logs de Supabase Auth.
- **NFR-P2:** Acciones de usuario (navegación, envío de feedback, cambio de estado) completadas en <2 segundos bajo carga normal. Medible via Core Web Vitals / APM.
- **NFR-P3:** Landing page: LCP < 2.5s, CLS < 0.1 (Core Web Vitals de Google).

### Seguridad

- **NFR-S1:** Magic links e invitation links generados de forma criptográficamente no predecible.
- **NFR-S2:** Magic links e invitation links son de un solo uso — se invalidan tras uso exitoso.
- **NFR-S3:** Acceso a datos de comunidad (proyectos, perfiles, feedback) restringido a miembros mediante RLS en Supabase.
- **NFR-S4:** URLs directas a recursos privados sin sesión autenticada son rechazadas.
- **NFR-S5:** Datos en tránsito cifrados via HTTPS. Cifrado en reposo gestionado por Supabase.

### Accesibilidad

- **NFR-A1:** Semántica HTML correcta y contraste de color ≥ 4.5:1 para texto normal.
- **NFR-A2:** Navegación principal operable por teclado.

### Fiabilidad

- **NFR-R1:** Disponibilidad objetivo >99%, gestionada por Supabase + Vercel.
- **NFR-R2:** La pérdida de sesión no provoca pérdida de datos — el usuario puede re-autenticarse y continuar.

### Escalabilidad

No es requisito crítico en MVP. Supabase gestiona escalado de base de datos de forma transparente. Target de usuarios concurrentes se revisará en base a adopción real post-lanzamiento.
