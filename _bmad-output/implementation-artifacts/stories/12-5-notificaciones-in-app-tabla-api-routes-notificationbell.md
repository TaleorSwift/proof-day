# Story 12.5 — Notificaciones in-app: API routes + NotificationBell

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.5
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.1 Done (tabla notifications con RLS)

## User Story

Como Builder,
quiero ver un icono de campana en la navbar con mis notificaciones no leídas y poder marcarlas como leídas,
para saber cuándo está lista mi síntesis IA y navegar directamente al proyecto correspondiente.

## Acceptance Criteria

**AC1 — GET /api/notifications: lista de notificaciones**
Given que soy un usuario autenticado
When llamo a `GET /api/notifications`
Then retorna las notificaciones del usuario autenticado (`user_id = auth.uid()`)
And están ordenadas por `created_at DESC`
And el máximo de notificaciones retornadas es 20
And por defecto solo retorna las no leídas (`read = false`)
And con el query param `?all=true` retorna todas (leídas y no leídas)
Given que no estoy autenticado
When llamo a `GET /api/notifications`
Then retorna 401

**AC2 — PATCH /api/notifications/[id]: marcar como leída**
Given que soy un usuario autenticado y la notificación me pertenece (`user_id = auth.uid()`)
When llamo a `PATCH /api/notifications/[id]` con `{read: true}`
Then retorna 200 con la notificación actualizada
And `read` es `true` en la base de datos
Given que la notificación pertenece a otro usuario
When llamo a `PATCH /api/notifications/[id]`
Then retorna 403 `{error: 'Forbidden'}`
Given que no estoy autenticado
When llamo a `PATCH /api/notifications/[id]`
Then retorna 401

**AC3 — NotificationBell: badge de no leídas**
Given que el usuario tiene notificaciones no leídas
When renderizo `NotificationBell`
Then se muestra `data-testid="notification-bell"`
And se muestra `data-testid="notification-badge"` con el número de notificaciones no leídas
Given que el usuario NO tiene notificaciones no leídas
Then `data-testid="notification-badge"` NO está presente en el DOM

**AC4 — NotificationBell: dropdown de notificaciones**
Given que el usuario hace click en `NotificationBell`
When el dropdown se abre
Then se muestra la lista de notificaciones con `data-testid="notification-item-[id]"` para cada una
And cada notificación muestra su tipo y fecha relativa
And si la notificación es de tipo `ai_synthesis_ready`, muestra el título del proyecto del payload
Given que el usuario hace click en una notificación
Then se marca como leída (llamada a `PATCH /api/notifications/[id]`)
And si el payload contiene `projectSlug` y `communitySlug`, navega a `/communities/[communitySlug]/projects/[projectSlug]`

**AC5 — NotificationBell en navbar**
Given que el usuario está autenticado y en cualquier página de la app
When miro la navbar
Then `NotificationBell` está visible junto al avatar/menú del usuario

**AC6 — Storybook**
Given que ejecuto Storybook
When navego a la story de `NotificationBell`
Then encuentro 3 stories:
  - `WithNotifications` — con 2-3 notificaciones no leídas, badge visible
  - `Empty` — sin notificaciones, badge oculto
  - `WithBadgeCount` — con número alto (ej: 5) para mostrar el badge con número

**AC7 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `NotificationBell` y las API routes
Then hay tests para:
  - API GET: 401 sin auth, 200 con lista de notificaciones, filtra por read=false por defecto, ?all=true retorna todas
  - API PATCH: 401 sin auth, 403 si notif de otro usuario, 200 OK marca como leída
  - Componente: badge visible cuando hay no leídas, badge oculto cuando no hay, click en notif llama al PATCH

## Tasks

- [ ] Task 1: Crear `app/api/notifications/route.ts` — GET handler con requireAuth, query de notifications (máx 20, ordenadas, filtro por read)
- [ ] Task 2: Crear `app/api/notifications/[id]/route.ts` — PATCH handler con requireAuth, verificación de ownership, update de read
- [ ] Task 3: Crear `components/shared/NotificationBell.tsx` — componente client con fetch de notificaciones, badge, dropdown
- [ ] Task 4: Integrar `NotificationBell` en la navbar del proyecto (identificar el componente de navbar existente e integrarlo)
- [ ] Task 5: Crear `components/shared/NotificationBell.stories.tsx` con las 3 stories
- [ ] Task 6: Crear `tests/unit/api/notifications.test.ts` con los tests de API del AC7
- [ ] Task 7: Crear `tests/unit/components/NotificationBell.test.tsx` con los tests del componente del AC7

## Dev Notes

### Ficheros a crear
- `app/api/notifications/route.ts`
- `app/api/notifications/[id]/route.ts`
- `components/shared/NotificationBell.tsx`
- `components/shared/NotificationBell.stories.tsx`
- `tests/unit/api/notifications.test.ts`
- `tests/unit/components/NotificationBell.test.tsx`

### Ficheros a modificar
- Navbar del proyecto — identificar el componente (buscar en `components/` o `app/` el layout con la navbar) e integrar `NotificationBell`

### Tipos de referencia (`lib/types/ai.ts`)
- `Notification` — interfaz de dominio: `id`, `userId`, `type`, `payload`, `read`, `createdAt`
- `NotificationRow` — row de Supabase snake_case
- `notificationFromRow()` — mapper disponible

### Schema de la tabla notifications (migración 028)
- `read` — boolean (NOT NULL DEFAULT false) — NOTA: el campo en la tabla se llama `read`, no `is_read`
- `payload` — jsonb, estructura libre según el tipo de notificación
- RLS: SELECT y UPDATE propios (auth.uid() = user_id); INSERT solo service_role

### Patrón de ownership en PATCH
La RLS de `notifications` permite UPDATE al propio usuario. Sin embargo, para retornar 403 explícito (en lugar de 0 rows updated), consultar primero si la notificación existe y pertenece al usuario:
```typescript
const { data: notification } = await supabase
  .from('notifications')
  .select('id, user_id')
  .eq('id', id)
  .maybeSingle()

if (!notification) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
if (notification.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

### NotificationBell — patrón de fetch
`NotificationBell` es un Client Component. Usar `fetch('/api/notifications')` con `useEffect` o SWR para obtener las notificaciones. Recuerda que el proyecto NO usa `react-query` ni SWR (verificar con `package.json` antes de asumir). Si no hay librería de fetch, usar `useEffect` + `useState`.

### Payload de notificación ai_synthesis_ready
El payload tiene la forma:
```typescript
{
  projectId: string
  projectSlug: string
  projectTitle: string
}
```
Para la navegación, se necesita también el `communitySlug`. Opciones:
1. Añadir `communitySlug` al payload en Story 12.3 (recomendado — documentar esta decisión)
2. Hacer una consulta adicional al hacer click para obtener el slug de la comunidad

### Dropdown UI
Usar `DropdownMenu` de `@/components/ui/dropdown-menu` (shadcn/ui) para el dropdown de notificaciones. Ver `design-tokens.md` para la referencia del componente. Trigger: el icono de campana.

### Patrones del proyecto (design-tokens.md)
- NO usar Tailwind directamente — usar `var(--color-*)`, `var(--space-*)` en los estilos inline
- NO modificar `components/ui/` (shadcn/ui intocable)
- Badge de contador: usar `var(--color-accent)` como color de fondo del badge (peach saturado — color de énfasis del sistema)

### Nota sobre `Notification` vs DOM global
El tipo `Notification` de `lib/types/ai.ts` sombrea el `interface Notification` del DOM (LOW-3 del CR de Story 12.1). En los ficheros que usen ambos (poco probable), importar como `import type { Notification as AppNotification } from '@/lib/types/ai'` para evitar ambigüedad.
