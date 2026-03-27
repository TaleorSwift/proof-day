# Design Tokens — Proof Day

> **IMPORTANTE:** Homer y Bart DEBEN leer este fichero antes de implementar cualquier componente UI.
> Fuente de autoridad: prototipo Lovable + decisiones de sesión UX (Marge, 2026-03-27).
> No usar valores hardcoded — usar siempre los tokens CSS custom properties definidos aquí.

---

## CSS Custom Properties

Añadir en `app/globals.css` dentro de `:root`:

```css
:root {
  /* === COLORES BASE === */
  --color-background:   #FAFAF8;  /* fondo general — off-white cálido */
  --color-surface:      #FFFFFF;  /* cards, paneles, modales */
  --color-border:       #E5E5E0;  /* bordes generales — gris cálido suave */

  /* === PATRÓN HIPÓTESIS / "EN JUEGO" === */
  /* Usar en cualquier elemento que requiere atención o validación activa */
  --color-hypothesis-bg:     #FDF0E8;  /* peach/cream muy claro */
  --color-hypothesis-border: #F0C9A8;  /* peach mid */

  /* === TEXTO === */
  --color-text-primary:   #1A1A18;  /* casi negro cálido — body principal */
  --color-text-secondary: #6B6B63;  /* gris cálido — subtítulos, metadata */
  --color-text-muted:     #9B9B8F;  /* gris apagado — placeholders, disabled */

  /* === PROOF SCORE (semántico) === */
  --color-promising-text: #2D7A4F;
  --color-promising-bg:   #E8F5EE;
  --color-needs-text:     #A05C00;
  --color-needs-bg:       #FEF3E2;
  --color-weak-text:      #B91C1C;
  --color-weak-bg:        #FEE2E2;

  /* === DECISIÓN DEL BUILDER (estado "cerrado") === */
  --color-decision-bg:     #F0F0F0;
  --color-decision-border: #D0D0C8;

  /* === INTERACTIVO === */
  --color-primary:       #1A1A18;  /* CTA principal */
  --color-primary-hover: #3A3A32;
  --color-accent:        #E87D4A;  /* peach saturado — acciones de énfasis */
  --color-accent-hover:  #D4683A;

  /* === TIPOGRAFÍA === */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
               Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  /* === ESCALA TIPOGRÁFICA === */
  --text-xs:   0.75rem;    /* 12px — labels, metadata, captions */
  --text-sm:   0.875rem;   /* 14px — body small, secondary */
  --text-base: 1rem;       /* 16px — body default */
  --text-lg:   1.125rem;   /* 18px — subtítulos de sección */
  --text-xl:   1.25rem;    /* 20px — section headers */
  --text-2xl:  1.5rem;     /* 24px — page titles */
  --text-3xl:  1.875rem;   /* 30px — hero, Proof Score label */

  /* Line heights correspondientes */
  --leading-xs:   1rem;
  --leading-sm:   1.25rem;
  --leading-base: 1.5rem;
  --leading-lg:   1.75rem;
  --leading-xl:   1.75rem;
  --leading-2xl:  2rem;
  --leading-3xl:  2.25rem;

  /* === PESOS TIPOGRÁFICOS === */
  --font-regular:  400;  /* body, metadata */
  --font-medium:   500;  /* labels, botones secundarios */
  --font-semibold: 600;  /* headings, Proof Score */
  --font-bold:     700;  /* CTA principal, nombre Top Reviewer */

  /* === ESPACIADO (escala 4px base) === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* === BORDER RADIUS === */
  --radius-sm:   4px;     /* inputs, badges pequeños */
  --radius-md:   8px;     /* cards, paneles, botones */
  --radius-lg:   12px;    /* modales, sidebars */
  --radius-xl:   16px;    /* tarjeta de hipótesis */
  --radius-full: 9999px;  /* avatares, chips, pills */

  /* === SOMBRAS === */
  --shadow-sm: 0 1px 2px rgba(26, 26, 24, 0.05);
  --shadow-md: 0 4px 8px rgba(26, 26, 24, 0.08);
  --shadow-lg: 0 8px 24px rgba(26, 26, 24, 0.12);
}
```

---

## Tailwind Config

Si se usa Tailwind (Next.js default), extender `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        background:  'var(--color-background)',
        surface:     'var(--color-surface)',
        border:      'var(--color-border)',
        hypothesis: {
          bg:     'var(--color-hypothesis-bg)',
          border: 'var(--color-hypothesis-border)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
        },
        proof: {
          promising: { text: 'var(--color-promising-text)', bg: 'var(--color-promising-bg)' },
          needs:     { text: 'var(--color-needs-text)',     bg: 'var(--color-needs-bg)' },
          weak:      { text: 'var(--color-weak-text)',      bg: 'var(--color-weak-bg)' },
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover:   'var(--color-accent-hover)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
}

export default config
```

---

## Componentes shadcn/ui — Guía de Uso

| Componente | Uso en Proof Day | Notas |
|---|---|---|
| `Button` | CTAs, acciones primarias, decisiones Builder | variant=`default` para CTA principal |
| `ToggleGroup` | Yes/No/Somewhat en formulario de feedback | 3 opciones fijas por pregunta |
| `Card` | Tarjetas de proyecto, perfil, gamificación | Usar `--color-surface` + `--shadow-md` |
| `Badge` | Proof Score label, estado proyecto | Colores semánticos del proof score |
| `Textarea` | Campo texto libre en feedback | Min 3 chars para habilitar envío |
| `Input` | Email login, nombre comunidad, campos formulario | — |
| `Avatar` | Foto usuario, Top Reviewer | `--radius-full` siempre |
| `Progress` | "Faltan N feedbacks" (pre-Proof Score) | value = feedbacks recibidos / 3 * 100 |
| `Dialog` | Confirmación decisión Builder (Iterar/Escalar/Abandonar) | Acción irreversible — siempre Dialog |
| `Tooltip` | Explicación de preguntas de feedback | Trigger en icono `?` junto a la pregunta |
| `Skeleton` | Loading states proyectos, Proof Score | Siempre durante fetch |
| `NavigationMenu` | Navbar principal (comunidades, perfil, logout) | — |
| `Tabs` | Proyectos vs. Feedbacks dados en perfil de usuario | — |
| `Sheet` | Panel lateral mobile si aplica en tablet | — |
| `DropdownMenu` | Menú usuario (perfil, cerrar sesión) | En navbar, avatar como trigger |
| `Form` + `Label` | Todos los formularios (crear proyecto, editar perfil) | Siempre con validación |
| `Separator` | Divisores de sección en vistas de proyecto | — |

---

## Patrones de Componente — Proof Score Badge

```tsx
// components/proof-score/ProofScoreBadge.tsx
type ProofScoreState = 'Promising' | 'Needs iteration' | 'Weak'

const proofScoreConfig = {
  'Promising':       { label: 'Promising',       colorClass: 'text-[--color-promising-text] bg-[--color-promising-bg]', icon: '✓' },
  'Needs iteration': { label: 'Needs iteration', colorClass: 'text-[--color-needs-text] bg-[--color-needs-bg]',     icon: '⟳' },
  'Weak':            { label: 'Weak',            colorClass: 'text-[--color-weak-text] bg-[--color-weak-bg]',         icon: '✗' },
}
```

---

## Patrón "En Juego" — Hipótesis Card

Cualquier elemento que requiere atención activa o validación usa:
```css
background-color: var(--color-hypothesis-bg);   /* #FDF0E8 */
border: 1px solid var(--color-hypothesis-border); /* #F0C9A8 */
border-radius: var(--radius-xl);                 /* 16px */
```

Aplica a: tarjeta de hipótesis del proyecto, feedback pendiente, pre-Proof Score.

---

## Reglas para Homer y Bart

1. **No hardcodear colores** — siempre `var(--color-*)` o clases Tailwind extendidas.
2. **No modificar `components/ui/`** — shadcn/ui es intocable. Wrappear si se necesita customizar.
3. **System font únicamente** — no instalar ni importar webfonts.
4. **Proof Score siempre con Badge semántico** — nunca texto plano.
5. **Decisión Builder siempre en Dialog** — nunca inline ni dropdown.
6. **Estados loading siempre con Skeleton** — nunca pantalla en blanco.
