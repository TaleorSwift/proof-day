# Story 7.1: Landing Page (Public, SEO-Optimized)

Status: ready-for-dev

## Story

Como visitante no autenticado,
quiero entender el valor de Proof Day y poder solicitar acceso,
para que pueda unirme a una comunidad y empezar a validar ideas.

## Acceptance Criteria

**Contenido:**
1. Sección Hero: headline, subheadline, CTA principal "Solicitar acceso" (FR30)
2. Sección "Cómo funciona": 3 pasos — Publica tu idea → Recibe feedback → Toma la decisión
3. Sección de propuesta de valor diferencial vs. likes / Slack / Product Hunt
4. Sección CTA final: formulario de contacto para solicitar acceso (FR31)
5. Footer: copyright, información de contacto

**SEO:**
6. Meta tags en `app/layout.tsx`: title, description, Open Graph (og:title, og:description, og:image) (NFR-P3)
7. Estructura semántica: `<main>`, `<section>`, `<h1>` único, `<h2>` por sección
8. `robots.txt` — disallow `/communities`, `/profile`, `/api`
9. `sitemap.xml` generado automáticamente vía Next.js `app/sitemap.ts`

**Performance:**
10. LCP < 2.5s, CLS < 0.1 (Core Web Vitals) — imágenes con `next/image`, fonts sistema ya configurados

**UX:**
11. Sin autenticación requerida — accesible sin sesión activa
12. Usuario autenticado que accede a `/` → redirect a `/communities`
13. Responsive: desktop + tablet + mobile

## Rejection Criteria

- NO requerir autenticación para ver la landing
- NO añadir componentes custom de la plataforma (FeedbackDialog, ProjectCard, etc.) — solo shadcn/ui + design tokens
- NO mostrar datos dinámicos de la plataforma (proyectos reales, usuarios reales) en la landing

## Tasks / Subtasks

- [ ] **T1: Feature branch**
  - [ ] `git checkout develop && git pull`
  - [ ] `git checkout -b feat/7-1-landing-page-public-seo-optimized`

- [ ] **T2: Middleware — redirect usuario autenticado** (AC: 12)
  - [ ] Actualizar `middleware.ts`:
    - Si usuario autenticado intenta acceder a `/`: `redirect('/communities')`
    - Mantener lógica existente para rutas protegidas

- [ ] **T3: Metadata global** (AC: 6)
  - [ ] Actualizar `app/layout.tsx`:
    ```typescript
    export const metadata: Metadata = {
      title: 'Proof Day — Valida tu idea antes de construirla',
      description: 'Recibe feedback estructurado de tu comunidad y decide con datos si tu idea vale la pena.',
      openGraph: {
        title: 'Proof Day — Valida tu idea antes de construirla',
        description: 'Recibe feedback estructurado de tu comunidad y decide con datos si tu idea vale la pena.',
        type: 'website',
        // og:image: añadir cuando exista imagen de og
      },
    }
    ```

- [ ] **T4: robots.txt** (AC: 8)
  - [ ] Crear `app/robots.ts`:
    ```typescript
    import type { MetadataRoute } from 'next'

    export default function robots(): MetadataRoute.Robots {
      return {
        rules: [
          {
            userAgent: '*',
            allow: '/',
            disallow: ['/communities', '/profile', '/api'],
          },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
      }
    }
    ```

- [ ] **T5: sitemap.xml** (AC: 9)
  - [ ] Crear `app/sitemap.ts`:
    ```typescript
    import type { MetadataRoute } from 'next'

    export default function sitemap(): MetadataRoute.Sitemap {
      return [
        {
          url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://proofday.app',
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 1,
        },
      ]
    }
    ```

- [ ] **T6: API Route POST /api/contact** (AC: 4)
  - [ ] Crear `app/api/contact/route.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import { z } from 'zod'

    const contactSchema = z.object({
      name: z.string().min(2, 'Nombre demasiado corto').max(100),
      email: z.string().email('Email no válido'),
      message: z.string().max(500).optional(),
    })

    export async function POST(request: Request) {
      const body = await request.json()
      const result = contactSchema.safeParse(body)
      if (!result.success) return NextResponse.json(
        { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
      )

      // Enviar vía Resend
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // await resend.emails.send({ from: 'noreply@proofday.app', to: 'hola@proofday.app', ... })

      // Por ahora: log y 200 (Resend se integra cuando esté disponible la API key)
      return NextResponse.json({ data: { success: true } })
    }
    ```
  - [ ] Añadir `RESEND_API_KEY` a `.env.example` (no a `.env.local` — es secreto)

- [ ] **T7: Componente ContactForm** (AC: 4)
  - [ ] Crear `components/landing/ContactForm.tsx` — Client Component:
    - `react-hook-form` + `zodResolver(contactSchema)`
    - Campos: nombre (Input), email (Input), mensaje opcional (Textarea)
    - Botón "Solicitar acceso" con estado de carga
    - `onSubmit`: POST `/api/contact` + toast de confirmación
    - En éxito: mostrar "¡Gracias! Te contactaremos pronto."

- [ ] **T8: Sección Hero** (AC: 1)
  - [ ] Crear `components/landing/HeroSection.tsx`:
    - `<h1>` con headline principal
    - Subheadline como `<p>`
    - CTA "Solicitar acceso" (anchor scroll a `#contact`)
    - Sin imágenes grandes en el hero (preservar LCP) — solo texto + CTA

- [ ] **T9: Sección Cómo funciona** (AC: 2)
  - [ ] Crear `components/landing/HowItWorksSection.tsx`:
    - `<h2>Cómo funciona</h2>`
    - 3 pasos en grid: Publica tu idea → Recibe feedback → Toma la decisión
    - Número de paso + título + descripción breve

- [ ] **T10: Sección Propuesta de valor** (AC: 3)
  - [ ] Crear `components/landing/ValuePropSection.tsx`:
    - `<h2>` con título diferenciador
    - Comparativa: Proof Day vs likes / Slack / Product Hunt
    - Texto estático — no tablas de comparación complejas

- [ ] **T11: Página principal** (AC: 1-5, 7, 10, 11, 13)
  - [ ] Crear/actualizar `app/page.tsx` — Server Component:
    ```typescript
    import { HeroSection } from '@/components/landing/HeroSection'
    import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
    import { ValuePropSection } from '@/components/landing/ValuePropSection'
    import { ContactForm } from '@/components/landing/ContactForm'

    export default function LandingPage() {
      return (
        <main>
          <HeroSection />
          <HowItWorksSection />
          <ValuePropSection />
          <section id="contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Solicita acceso</h2>
            <ContactForm />
          </section>
          <footer>
            <p>© {new Date().getFullYear()} Proof Day</p>
          </footer>
        </main>
      )
    }
    ```

- [ ] **T12: Tests unitarios** (AC: 4, 6)
  - [ ] Crear `tests/unit/landing/contactForm.test.ts`:
    - `contactSchema` rechaza email inválido
    - `contactSchema` rechaza nombre < 2 chars
    - `contactSchema` acepta mensaje vacío/undefined (opcional)
    - Al menos 3 tests

- [ ] **T13: PR y cierre**
  - [ ] `npm run test` — todos deben pasar
  - [ ] Commit: `feat(landing): add public landing page with SEO and contact form`
  - [ ] Push + PR contra `develop`
  - [ ] Actualizar `sprint-status.yaml`: `7-1-landing-page-public-seo-optimized: review`

## Dev Notes

### Redirect de usuario autenticado

El middleware ya gestiona rutas protegidas. Añadir la regla inversa: si el usuario tiene sesión válida y accede a `/`, redirigir a `/communities`. Esto evita que el usuario autenticado vea la landing.

### Core Web Vitals

- Hero sin imágenes garantiza LCP rápido (texto renderiza inmediatamente)
- `next/image` con `width`/`height` explícitos evita CLS
- No hay fuentes custom (ya configurado el sistema tipográfico en `tailwind.config`)

### Resend — integración diferida

La API Route `/api/contact` está estructurada para Resend pero el envío real está comentado. Homer debe verificar si `RESEND_API_KEY` está disponible en el entorno. Si no, el endpoint devuelve 200 sin enviar email (MVP acceptable).

### Dependencias

- Sin dependencias de otras stories — es la story más autónoma del proyecto
- Requiere `NEXT_PUBLIC_APP_URL` en `.env` para robots.txt y sitemap.xml

### References

- [Source: epic-7-landing-page.md#Story 7.1] — ACs y notas técnicas
- [Source: ux-design-specification.md#Screen Inventory] — ruta `/` pública
- [Source: architecture.md#Structure Patterns] — `components/landing/`, `app/page.tsx`

## Dev Agent Record

### Agent Model Used

_pendiente_

### Debug Log References

### Completion Notes List

### File List
