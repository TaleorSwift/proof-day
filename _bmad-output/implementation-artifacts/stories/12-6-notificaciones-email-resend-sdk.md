# Story 12.6 — Notificaciones email: Resend SDK

## Metadata
- **Epic:** 12 — AI Summaries & Notifications
- **Story key:** 12.6
- **Phase:** ready-for-dev
- **Agent:** Homer
- **Flow:** Full Flow (Homer)
- **Prerrequisito:** Story 12.5 Done (patrón de notificaciones establecido)

## User Story

Como Builder,
quiero recibir un email cuando mi síntesis de IA está lista,
para enterarme aunque no esté navegando en la aplicación en ese momento.

## Acceptance Criteria

**AC1 — Cliente Resend singleton**
Given que importo `lib/email/resendClient.ts`
When lo uso en varios módulos
Then obtengo siempre la misma instancia de `Resend` (singleton)
And usa la variable de entorno `RESEND_API_KEY`

**AC2 — Template aiSynthesisReady**
Given que llamo a `buildAiSynthesisReadyEmail({projectTitle, projectUrl, summaryText})`
When el template se genera
Then retorna un objeto `{subject: string, html: string}`
And `subject` contiene el título del proyecto: `"Tu síntesis de IA está lista para [projectTitle]"`
And `html` contiene el resumen del proyecto (`summaryText`) formateado
And `html` contiene un enlace CTA con el texto "Ver síntesis" que apunta a `projectUrl`
And el HTML es válido y utiliza estilos inline básicos (compatible con clientes de email)

**AC3 — Función sendEmail**
Given que llamo a `sendEmail({to, subject, html})`
When la llamada a Resend tiene éxito
Then el email se envía a la dirección indicada
And se usa `EMAIL_FROM` como dirección de remitente
And la función retorna `Promise<void>` (no retorna el ID del email ni otros datos)
Given que la llamada a Resend falla con un error de red o API
Then la función lanza una excepción que el llamador puede capturar

**AC4 — Integración en webhook ai-synthesis (Story 12.3)**
Given que se genera una síntesis exitosa en `POST /api/webhooks/ai-synthesis`
When se va a enviar la notificación al Builder
Then se consulta `notification_preferences` del Builder para el tipo `ai_synthesis_ready`
And si no existe fila en `notification_preferences` (comportamiento por defecto), se asume `email_enabled = true`
And si `email_enabled = true`: se llama a `sendEmail()` con los datos del proyecto y el resumen
And si `email_enabled = false`: NO se envía email (se omite sin error)
And el envío de email es fire-and-forget en relación al webhook — si falla, el webhook retorna 200 igualmente (el email no es crítico para la respuesta)

**AC5 — Variables de entorno documentadas**
Given que reviso `.env.example`
When busco las variables de email
Then encuentro `RESEND_API_KEY` ya presente (verificar) y `EMAIL_FROM` documentado con ejemplo `no-reply@proof-day.com`

**AC6 — Tests**
Given que ejecuto `npm run test:unit`
When se procesan los tests de `lib/email/`
Then hay tests para:
  - `resendClient`: singleton (misma instancia en múltiples imports)
  - `buildAiSynthesisReadyEmail`: asunto contiene el título, HTML contiene summaryText, HTML contiene el enlace CTA
  - `sendEmail`: mock de Resend, verifica que se llama con los parámetros correctos, verifica que usa `EMAIL_FROM`
  - integración con webhook: email enviado si email_enabled=true, email NO enviado si email_enabled=false

## Tasks

- [ ] Task 1: Crear `lib/email/resendClient.ts` — singleton de Resend con `RESEND_API_KEY`
- [ ] Task 2: Crear `lib/email/templates/aiSynthesisReady.ts` — función `buildAiSynthesisReadyEmail()` que retorna `{subject, html}`
- [ ] Task 3: Crear `lib/email/sendEmail.ts` — función `sendEmail({to, subject, html}): Promise<void>`
- [ ] Task 4: Crear `lib/email/index.ts` — barrel export
- [ ] Task 5: Modificar `app/api/webhooks/ai-synthesis/route.ts` — añadir consulta de notification_preferences y llamada a sendEmail (fire-and-forget)
- [ ] Task 6: Verificar/añadir `EMAIL_FROM` en `.env.example`
- [ ] Task 7: Crear `tests/unit/email/resendClient.test.ts`
- [ ] Task 8: Crear `tests/unit/email/aiSynthesisReady.test.ts`
- [ ] Task 9: Crear `tests/unit/email/sendEmail.test.ts`
- [ ] Task 10: Añadir casos de test de integración en `tests/unit/webhooks/ai-synthesis.test.ts` (email enviado/no enviado según preferencia)

## Dev Notes

### Ficheros a crear
- `lib/email/resendClient.ts`
- `lib/email/templates/aiSynthesisReady.ts`
- `lib/email/sendEmail.ts`
- `lib/email/index.ts`
- `tests/unit/email/resendClient.test.ts`
- `tests/unit/email/aiSynthesisReady.test.ts`
- `tests/unit/email/sendEmail.test.ts`

### Ficheros a modificar
- `app/api/webhooks/ai-synthesis/route.ts` — integrar envío de email post-notificación
- `.env.example` — verificar `RESEND_API_KEY` (ya existe como `re_dummy_local`) y añadir `EMAIL_FROM`
- `tests/unit/webhooks/ai-synthesis.test.ts` — añadir casos de email

### Nota sobre RESEND_API_KEY en .env.example
El fichero `.env.example` ya tiene `RESEND_API_KEY=re_dummy_local`. Solo añadir `EMAIL_FROM` si no existe.

### Patrón singleton Resend
```typescript
// lib/email/resendClient.ts
import { Resend } from 'resend'

let instance: Resend | null = null

export function getResendClient(): Resend {
  if (!instance) {
    instance = new Resend(process.env.RESEND_API_KEY)
  }
  return instance
}
```

### Template HTML — compatibilidad con clientes de email
Los emails HTML deben usar estilos inline (no clases CSS externas). Estructura mínima recomendada:
- Contenedor con `max-width: 600px; margin: 0 auto; font-family: sans-serif`
- Título del proyecto en `<h1>` o `<h2>`
- Resumen en `<p>` o `<blockquote>`
- Botón CTA con `<a>` estilizado inline: `background-color: #1A1A18; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none`
- Footer con texto "Proof Day"

### Consulta de notification_preferences en webhook
```typescript
const { data: pref } = await supabaseAdmin
  .from('notification_preferences')
  .select('email_enabled')
  .eq('user_id', project.builder_id)
  .eq('type', 'ai_synthesis_ready')
  .maybeSingle()

const emailEnabled = pref?.email_enabled ?? true // default: true si no hay fila
```

### Obtener email del Builder
Para enviar el email se necesita la dirección del Builder. Usar el service role client para consultar `auth.users`:
```typescript
const { data: { user: builderAuthUser } } = await supabaseAdmin.auth.admin.getUserById(project.builder_id)
const builderEmail = builderAuthUser?.email
```
Si no se obtiene email, saltar el envío sin error.

### Fire-and-forget en webhook
El envío de email no debe bloquear la respuesta del webhook. Patrón:
```typescript
// Después del insert de notificación in-app
sendEmail({ to: builderEmail, subject, html }).catch((err) => {
  console.error('[ai-synthesis webhook] Email send failed:', err)
})

return NextResponse.json({ success: true, projectId, summaryId })
```

### Tipos de referencia (`lib/types/ai.ts`)
- `NotificationPreference` / `NotificationPreferenceRow` — para tipar el resultado de la query de preferencias
- `notificationPreferenceFromRow()` — mapper disponible

### TDD Outside-In
1. Test del template: verificar asunto y contenido HTML
2. Test del sendEmail: mock de Resend, verificar llamada
3. Test de integración en webhook: mock de sendEmail, verificar que se llama o no según preferencia
