---
paths:
  - "tests/e2e/**/*.spec.ts"
  - "tests/e2e/**/*.setup.ts"
  - "playwright.config.ts"
---

# E2E Tests — Playwright

## Estructura de carpetas

```
tests/e2e/
├── auth.setup.ts              ← setup de autenticación (único fichero en raíz)
├── auth/                      ← autenticación y protección de rutas
├── communities/               ← módulo communities
├── feedback/                  ← módulo feedback
├── landing/                   ← página pública /
├── projects/                  ← módulo projects
└── proof-score/               ← módulo proof-score
```

- Cada módulo tiene su propia subcarpeta con el nombre en `kebab-case`.
- `auth.setup.ts` es el único fichero permitido en la raíz de `tests/e2e/`.
- Ningún `.spec.ts` va en la raíz — siempre dentro de una subcarpeta de módulo.

## Nombrado de ficheros

**Regla:** `kebab-case` para todos los ficheros.

```
✅  create-community.spec.ts
✅  project-feed.spec.ts
✅  route-protection.spec.ts
✅  feedback-cta.spec.ts
❌  createCommunity.spec.ts        (camelCase prohibido)
❌  FeedbackCTA.spec.ts            (PascalCase prohibido)
❌  community-projectfeed.spec.ts  (prefijo redundante con la carpeta)
```

El nombre describe la **funcionalidad o flujo** que se prueba, no el componente React.

## Estructura interna de cada spec

```ts
import { test, expect } from '@playwright/test'

// [Story X.Y] — Descripción breve
// Marcados con test.skip hasta que haya datos seed.  ← si aplica
// Auth setup: tests/e2e/auth.setup.ts (storageState configurado en playwright.config.ts)

test.describe('<Feature> — <contexto>', () => {
  test('<verbo> <qué> <condición>', async ({ page }) => {
    // ...
  })
})
```

- **Siempre** un `test.describe` por fichero.
- Nombres de test en español, formato `<verbo> <qué> <condición>`.
- Comillas simples (`'`) en todo el fichero.
- Comentarios de línea `//` — sin bloques JSDoc en cabecera.

## Assertions

- Usar siempre `expect(locator).toBeVisible()` — **nunca** `page.waitForSelector()` ni `.waitFor()`.
- Preferir `getByRole`, `getByLabel`, `getByTestId` sobre selectores CSS.
- Ningún test pasa condicionalmente: `if (await x.isVisible()) { expect(x)... }` está prohibido.

## Tests pendientes de datos seed

- Marcar con `test.skip(...)`.
- Añadir `// Requiere <entidad> con slug <slug> en el seed`.
- Tests con assertions contradictorias necesitan slugs distintos — nunca el mismo fixture para dos variantes opuestas.

## Tests sin sesión (rutas públicas)

Tests que verifican comportamiento sin autenticación (login, route-protection, landing) deben limpiar las cookies activas en `beforeEach`:

```ts
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies()
})
```

No usar `test.use({ storageState: ... })` dentro de `test.describe()` — provoca que Playwright cree contextos sin `baseURL`, rompiendo la navegación relativa en tests del mismo worker.

## Auth

- Los tests autenticados usan el `storageState` generado por `auth.setup.ts`.
- `auth.setup.ts` crea el usuario de test vía API admin de Supabase e inyecta la cookie SSR directamente — sin flujo de email ni magic link.
- `.auth/user.json` está en `.gitignore` y se regenera con el proyecto `setup`.

## Ejecución

Playwright busca `playwright.config.ts` en el CWD. Siempre lanzar desde la raíz del proyecto o pasar `--config` explícito:

```bash
npx playwright test --config=playwright.config.ts
```
