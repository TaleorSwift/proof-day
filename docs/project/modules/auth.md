# Auth

## Qué hace

Gestiona la autenticación de usuarios mediante magic links (sin contraseña). El usuario introduce su email en `/login`, recibe un link por email (via Resend SMTP configurado en Supabase Auth), y al hacer clic queda autenticado y redirigido a `/communities`. Todas las rutas de la aplicación excepto las públicas están protegidas por middleware — sin sesión activa, se redirige automáticamente a `/login`.

## Reglas de comportamiento

- El formulario de login se encuentra en `/login` y es accesible sin sesión activa. (story 1.2)
- Al enviar un email válido, Supabase Auth dispara el magic link vía Resend SMTP sin código adicional en la app. (story 1.2)
- Tras enviar el email, se muestra el success state en el mismo card sin redirect: "Revisa tu email — te hemos enviado un link de acceso". (story 1.2)
- Los errores de validación de email se muestran inline bajo el campo (no toast, no alert). (story 1.2)
- El magic link procesa en `GET /auth/callback?code=...` y redirige a `/communities` si es válido. (story 1.2)
- Si el magic link ha expirado o es inválido, redirige a `/login?error=link-invalid` y muestra un CTA "Solicitar un nuevo link". (story 1.2)
- Un usuario autenticado que visita `/login` es redirigido automáticamente a `/communities`. (story 1.2)
- Supabase crea la cuenta automáticamente si el email no existe — no hay formulario de registro separado. (story 1.2)
- No existe campo de contraseña en ningún flujo. (story 1.2)
- `getSession()` está prohibido en toda la app (ESLint); se usa `getClaims()` en middleware y `getUser()` en Server Components. (story 1.1)
- Las importaciones directas de `@supabase/supabase-js` y `@supabase/ssr` fuera de `lib/supabase/` están bloqueadas por ESLint — usar `lib/supabase/client.ts` o `lib/supabase/server.ts`. (story 1.3)
- Rutas públicas exactas (sin subrutas): `/` y `/login`. Rutas públicas con subrutas: `/auth/callback`. El resto requieren sesión activa. (story 1.3)
- El middleware redirige a `/login` automáticamente cualquier request sin sesión a ruta protegida. (story 1.3)
- La sesión se refresca en cada request via `updateSession()` de `lib/supabase/middleware.ts` — el token se mantiene activo sin logout inesperado. (story 1.3)

## Ficheros clave

- `middleware.ts` — auth gate completo: PUBLIC_PATHS, isPublicPath, redirect a /login
- `lib/supabase/middleware.ts` — updateSession(): refresca sesión y retorna { response, user }
- `app/(auth)/login/page.tsx` — Server Component de la pantalla /login
- `app/(auth)/login/actions.ts` — Server Action: sendMagicLink
- `components/auth/LoginForm.tsx` — Client Component del formulario
- `app/auth/callback/route.ts` — Route Handler del magic link

## Última actualización

Story 1.3 — 2026-03-27
