# Módulo: Landing (/)

## Descripción

La ruta raíz `/` es la welcome screen del producto. No es una landing de marketing.
Su función es presentar la identidad visual y redirigir al flujo de autenticación.

## Comportamiento

- **Sin sesión activa**: Muestra la welcome screen (logo + H1 + subtítulo + CTA → /login + texto legal)
- **Con sesión activa**: Redirect inmediato a `/communities` (Server Component, sin flash)

## Archivos

| Archivo | Rol |
|---------|-----|
| `app/page.tsx` | Server Component — lógica de auth + redirect + render WelcomeScreen |
| `components/landing/WelcomeScreen.tsx` | Componente visual puro — testeable y usable en Storybook |

## Reglas

1. `app/page.tsx` DEBE ser Server Component (no `'use client'`). El redirect requiere ejecución en servidor.
2. La lógica visual DEBE vivir en `WelcomeScreen` para permitir testing sin el wrapper async.
3. El CTA DEBE ser un `<Link>` (navegación), no un `<button>` (acción).
4. Usar SIEMPRE CSS variables de design-tokens — nunca valores hardcodeados.
5. NO añadir elementos de marketing (nav, hero, secciones de features, footer).

## Textos canónicos

- **H1**: "Bienvenido a Proof Day"
- **Subtítulo**: "Valida ideas. Aprende más rápido. Construye lo que importa."
- **CTA**: "Continuar con email" → href="/login"
- **Texto legal**: "Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender."

## Design tokens usados

- `--color-background` — fondo crema
- `--color-primary` — fondo del botón naranja
- `--color-surface` — texto del botón
- `--color-text-primary` — H1
- `--color-text-secondary` — subtítulo y texto legal

## Storybook

Story: `pages/LandingPage > Default`
Componente: `WelcomeScreen` (sin lógica de auth)

## Historia

- **Story 9.4** — Reemplazar landing de marketing por welcome screen del prototipo
