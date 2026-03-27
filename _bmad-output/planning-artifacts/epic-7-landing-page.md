# Epic 7: Landing Page

**Estado:** backlog
**Objetivo:** Puerta pública de entrada al producto, optimizada para SEO y conversión.
**FRs cubiertos:** FR30, FR31
**Valor entregado:** Cualquier visitante puede entender el valor de Proof Day y solicitar acceso.

---

## Story 7.1: Landing Page (Public, SEO-Optimized)

**Como** visitante no autenticado,
**quiero** entender el valor de Proof Day y poder solicitar acceso,
**para que** pueda unirme a una comunidad y empezar a validar ideas.

### Criterios de Aceptación

**Contenido:**
- [ ] Sección Hero: headline, subheadline, CTA principal "Solicitar acceso" (FR30)
- [ ] Sección "Cómo funciona": 3 pasos — Publica tu idea → Recibe feedback → Toma la decisión
- [ ] Sección de propuesta de valor diferencial vs. likes/Slack/Product Hunt
- [ ] Sección CTA final: formulario de contacto o email para solicitar acceso (FR31)
- [ ] Footer: copyright, información de contacto

**SEO:**
- [ ] Meta tags: title, description, Open Graph (og:title, og:description, og:image) (NFR-P3)
- [ ] Estructura semántica: `<main>`, `<section>`, `<h1>` único, `<h2>` por sección
- [ ] LCP < 2.5s, CLS < 0.1 (Core Web Vitals) (NFR-P3)
- [ ] No indexar rutas autenticadas — solo `/` indexable
- [ ] `robots.txt` y `sitemap.xml` generados automáticamente por Next.js

**UX:**
- [ ] Sin autenticación requerida — accesible sin sesión
- [ ] Usuario autenticado que accede a `/` → redirect a `/communities`
- [ ] Sistema visual consistente con la plataforma (mismo design system)
- [ ] Responsive: desktop + tablet + mobile (landing SÍ debe ser mobile-friendly)

### Notas Técnicas

- `app/page.tsx` — Server Component, sin auth requirement
- `app/layout.tsx` — metadata global (title, description)
- Componentes: solo shadcn/ui + design tokens, sin componentes custom de la plataforma
- Core Web Vitals: imágenes con `next/image`, fonts system (ya configurado), no layout shift
- `robots.txt`: disallow `/communities`, `/profile`, `/api`
- Formulario de contacto: envío a email via Resend (POST a `/api/contact`)
- `app/api/contact/route.ts` — POST handler para email de solicitud de acceso
