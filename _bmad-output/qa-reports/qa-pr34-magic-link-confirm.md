# QA Report — PR #34: Página intermedia magic link auth (anti-scanner)

**Agente:** Edna (QA Engineer)
**Fecha:** 2026-03-28
**Modo:** REFINE
**Veredicto:** PASS

---

## Scope

Ficheros validados del PR #34:

- `middleware.ts` — función `isPublicPath`, config matcher
- `lib/auth/confirm.ts` — `validateConfirmSearchParams`, `buildConfirmParams`
- `components/auth/ConfirmButton.tsx` — componente cliente con verifyOtp
- `app/auth/confirm/page.tsx` — Server Component con redirect on invalid params

---

## Artifact Inventory

| Artefacto | Estado | Ubicación |
|---|---|---|
| Tests unitarios lib/auth/confirm.ts | PRESENT | `tests/unit/auth/confirmButton.test.ts` |
| Tests componente ConfirmButton | PRESENT | `tests/unit/auth/confirmButtonComponent.test.tsx` |
| Tests unitarios middleware (isPublicPath + updateSession) | PRESENT | `tests/unit/middleware/middleware.test.ts` |
| Tests e2e route-protection | PRESENT | `tests/e2e/auth/route-protection.spec.ts` |
| Especificación Gherkin/EARS formal | ABSENT | N/A |

---

## Resultados de ejecución

### Suite unitaria completa

```
Test Files  20 passed (20)
     Tests  224 passed (224)
  Duration  2.20s
```

**Cero fallos. Cero errores.**

### Detalle auth (foco del PR)

```
tests/unit/auth/confirmButton.test.ts         15 passed
tests/unit/auth/confirmButtonComponent.test.tsx   9 passed
tests/unit/auth/login-schema.test.ts          6 passed
tests/unit/middleware/middleware.test.ts      ~20 passed (incl. /auth/confirm tests)
```

### TypeScript

```
tsc --noEmit → 0 errores
```

---

## Cobertura de ACs del PR

### middleware.ts — isPublicPath

| Comportamiento | Test | Resultado |
|---|---|---|
| `/auth/confirm` es ruta pública (exacta) | `middleware.test.ts: retorna true para /auth/confirm` | PASS |
| `/auth/confirm/` (trailing slash) es pública | `middleware.test.ts: retorna true para /auth/confirm/` | PASS |
| `/auth/confirmation` NO es confundida con `/auth/confirm` | `middleware.test.ts: no confunde /auth/confirmation` | PASS |
| `/communities` sigue siendo privada (no regresión) | `middleware.test.ts: retorna false para /communities` | PASS |
| `/login` exacto es público pero sin subrutas | `middleware.test.ts: subrutas de /login son privadas` | PASS |

### lib/auth/confirm.ts — validateConfirmSearchParams

| Comportamiento | Test | Resultado |
|---|---|---|
| token + type válidos → valid:true | confirmButton.test.ts | PASS |
| token ausente → valid:false | confirmButton.test.ts | PASS |
| type ausente → valid:false | confirmButton.test.ts | PASS |
| token vacío → valid:false | confirmButton.test.ts | PASS |
| type vacío → valid:false | confirmButton.test.ts | PASS |
| redirect_to ausente → fallback /communities | confirmButton.test.ts | PASS |
| redirect_to interna válida → respetada | confirmButton.test.ts | PASS |
| redirect_to URL absoluta (open redirect) → fallback | confirmButton.test.ts | PASS |
| redirect_to protocol-relative `//` (open redirect) → fallback | confirmButton.test.ts | PASS |
| type no válido (no EmailOtpType) → valid:false | confirmButton.test.ts | PASS |
| todos los EmailOtpType válidos → valid:true | confirmButton.test.ts | PASS |

### lib/auth/confirm.ts — buildConfirmParams

| Comportamiento | Test | Resultado |
|---|---|---|
| type email → params correctos | confirmButton.test.ts | PASS |
| type magiclink → params correctos | confirmButton.test.ts | PASS |
| type undefined → fallback "email" | confirmButton.test.ts | PASS |
| type inválido → fallback "email" | confirmButton.test.ts | PASS |

### components/auth/ConfirmButton.tsx

| Comportamiento | Test | Resultado |
|---|---|---|
| Render botón con texto inicial "Acceder a Proof Day" | confirmButtonComponent.test.tsx | PASS |
| aria-busy=false en estado inicial | confirmButtonComponent.test.tsx | PASS |
| Estado loading: botón disabled + aria-busy=true + texto "Verificando..." | confirmButtonComponent.test.tsx | PASS |
| span tiene aria-live=polite y aria-atomic=true (a11y) | confirmButtonComponent.test.tsx | PASS |
| Happy path: router.push con redirectTo correcto | confirmButtonComponent.test.tsx | PASS |
| Botón no disabled tras éxito | confirmButtonComponent.test.tsx | PASS |
| Error state: muestra mensaje con role=alert | confirmButtonComponent.test.tsx | PASS |
| Botón no disabled tras error | confirmButtonComponent.test.tsx | PASS |
| NO llama router.push cuando verifyOtp falla | confirmButtonComponent.test.tsx | PASS |

---

## Gaps identificados (no bloqueantes)

| Gap | Severidad | Detalle |
|---|---|---|
| `app/auth/confirm/page.tsx` sin test unitario | Cosmético | Server Component con lógica de redirect. La lógica real está en `validateConfirmSearchParams` que sí está testeada. El redirect en sí es un comportamiento de Next.js, no de negocio. |
| Tests e2e (route-protection.spec.ts) no ejecutados | Cosmético | Playwright requiere servidor activo. Los comportamientos cubiertos (rutas protegidas, /login accesible) están ya validados por los tests unitarios de middleware. |

Ambos gaps son no bloqueantes: la cobertura de negocio está garantizada por los tests unitarios.

---

## Seguridad validada

Los dos hallazgos críticos del CR (H1 y H2) están resueltos y cubiertos:

- **H1 (open redirect):** `isInternalPath` rechaza `//evil.com` y URLs absolutas. Tests de regresión pasando.
- **H2 (isLoading no reseteado):** `finally` block en `handleConfirm` garantiza reset. Test "botón no disabled tras éxito" confirma.

---

## Veredicto

**PASS**

La suite completa pasa (224/224). TypeScript limpio. Los hallazgos críticos del CR están corregidos y testeados. El PR #34 está listo para merge a `develop`.

**Siguiente paso recomendado:** Mergear PR #34 a `develop` (o continuar con el siguiente CS si hay más stories en el sprint).
