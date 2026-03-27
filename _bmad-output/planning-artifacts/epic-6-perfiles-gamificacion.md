# Epic 6: Perfiles & Gamificación

**Estado:** backlog
**Objetivo:** Visibilidad del expertise del Reviewer y datos del Builder dentro de la comunidad.
**FRs cubiertos:** FR24, FR25, FR26, FR27, FR28, FR29
**Valor entregado:** Los Reviewers tienen reconocimiento visible por su contribución; los Builders pueden ver su historial de proyectos.

---

## Story 6.1: User Profile (View & Edit)

**Como** usuario,
**quiero** tener un perfil con mi bio e intereses, y poder ver el perfil de mis compañeros de comunidad,
**para que** el contexto de quién da feedback sea visible y el expertise sea reconocible.

### Criterios de Aceptación

**Ver perfil propio:**
- [ ] Ruta `/profile` — perfil propio del usuario autenticado
- [ ] Campos editables: nombre/alias, bio (texto libre), intereses (tags)
- [ ] Formulario de edición inline (no página separada)
- [ ] Métricas visibles: número de feedbacks dados, número de proyectos creados (FR25)
- [ ] Tabs: "Proyectos creados" | "Feedbacks dados"

**Ver perfil de otros:**
- [ ] Ruta `/profile/[id]` — perfil de otro usuario
- [ ] Solo visible si comparten al menos una comunidad (FR26, FR27)
- [ ] Acceso a perfil de usuario sin comunidad compartida → 403 / redirect (FR27)
- [ ] Campos visibles: nombre, bio, intereses, métricas
- [ ] Tabs: "Proyectos creados" (públicos) | (feedbacks dados — no visibles para terceros)

### Notas Técnicas

- `app/profile/page.tsx` — perfil propio
- `app/profile/[id]/page.tsx` — perfil de otro usuario
- `app/api/profiles/[id]/route.ts` — GET (con verificación de comunidad compartida), PATCH (solo propio)
- `lib/api/profiles.ts` — `getProfile(id)`, `updateProfile(data)`
- RLS: profiles accesibles si `auth.uid()` comparte community_members con el perfil target
- Tabla `profiles`: id (= auth.uid()), name, bio, interests (text[]), avatar_url

---

## Story 6.2: Feedback Counter & Top Reviewer Widget

**Como** Reviewer,
**quiero** ver mi contador personal de feedbacks y aparecer como Top Reviewer si soy el más activo,
**para que** mi contribución sea reconocida por la comunidad.

### Criterios de Aceptación

**Contador personal:**
- [ ] Sidebar de la lista de proyectos (`/communities/[slug]`) muestra: "Has dado N feedbacks en esta comunidad" (FR28)
- [ ] Contador se actualiza al recargar/navegar

**Top Reviewer:**
- [ ] Widget `TopReviewerWidget` en la página de comunidad muestra el miembro con más feedbacks (FR29)
- [ ] Datos del widget: avatar + nombre + "N feedbacks esta semana"
- [ ] Si hay empate: el que llegó primero al número
- [ ] Período: esta semana (lunes a domingo)
- [ ] "Esta semana" puede ser sin feedbacks: widget oculto o "Sé el primero en dar feedback"
- [ ] Estilo del widget: fondo `--color-hypothesis-bg` — patrón reconocimiento, no ranking frío
- [ ] Avatar del Top Reviewer enlaza a su perfil

### Notas Técnicas

- `components/gamification/TopReviewerWidget.tsx`
- `app/api/gamification/top-reviewer/route.ts` — GET con communityId + semana actual
- `lib/api/gamification.ts` — `getTopReviewer(communityId)`, `getFeedbackCount(communityId)`
- Query: COUNT feedbacks por reviewer en la semana actual, agrupado por community_id
- RLS: solo miembros de la comunidad pueden ver los datos de gamificación de esa comunidad
