// Story 10.2 — Fixtures para project_templates

import type { ProjectTemplate } from '@/lib/types/templates'

export const TEMPLATE_SAAS: ProjectTemplate = {
  id: '11111111-0000-0000-0000-000000000001',
  type: 'saas',
  name: 'SaaS',
  descriptionStructure: {
    problem: {
      placeholder: '¿Qué dolor o ineficiencia sufren tus usuarios?',
      example: 'Los equipos remotos no pueden medir el bienestar del equipo en tiempo real.',
    },
    solution: {
      placeholder: '¿Qué funcionalidad o módulo resuelve ese dolor?',
      example: 'Un dashboard de bienestar semanal con alertas automáticas para managers.',
    },
  },
  reviewerContext: 'Producto SaaS: valora claridad del problema, tamaño de mercado y diferenciación.',
  createdAt: '2026-01-01T00:00:00Z',
}

export const TEMPLATE_FEATURE: ProjectTemplate = {
  id: '11111111-0000-0000-0000-000000000002',
  type: 'feature',
  name: 'Feature / Mejora',
  descriptionStructure: {
    problem: {
      placeholder: '¿Qué funcionalidad falta o qué flujo es frustrante hoy?',
      example: 'Los usuarios abandonan el checkout porque no pueden ver el resumen antes de pagar.',
    },
    solution: {
      placeholder: '¿Qué cambio concreto propones para mejorar la experiencia?',
      example: 'Un panel lateral de resumen de pedido visible en todos los pasos del checkout.',
    },
  },
  reviewerContext: 'Feature/Mejora: valora impacto en UX, viabilidad técnica y priorización.',
  createdAt: '2026-01-01T00:00:00Z',
}

export const TEMPLATE_INTERNAL: ProjectTemplate = {
  id: '11111111-0000-0000-0000-000000000003',
  type: 'internal_process',
  name: 'Proceso Interno',
  descriptionStructure: {
    problem: {
      placeholder: '¿Qué proceso manual o ineficiencia interna existe?',
      example: 'El onboarding de nuevos empleados tarda 2 semanas porque la documentación está dispersa.',
    },
    solution: {
      placeholder: '¿Qué herramienta o automatización lo mejora?',
      example: 'Una wiki centralizada con checklist de onboarding generada automáticamente.',
    },
  },
  reviewerContext: 'Proceso Interno: valora ahorro de tiempo, adopción y ROI interno.',
  createdAt: '2026-01-01T00:00:00Z',
}

export const TEMPLATE_PHYSICAL: ProjectTemplate = {
  id: '11111111-0000-0000-0000-000000000004',
  type: 'physical_product',
  name: 'Producto Físico',
  descriptionStructure: {
    problem: {
      placeholder: '¿Qué necesidad física o de uso diario no está bien resuelta?',
      example: 'Las botellas de agua deportivas son difíciles de limpiar en los rincones.',
    },
    solution: {
      placeholder: '¿Cómo el diseño físico o los materiales mejoran la experiencia?',
      example: 'Diseño modular desmontable que se puede lavar en el lavavajillas completamente.',
    },
  },
  reviewerContext: 'Producto Físico: valora usabilidad, coste de fabricación y diferenciación de mercado.',
  createdAt: '2026-01-01T00:00:00Z',
}

export const TEMPLATE_SERVICE: ProjectTemplate = {
  id: '11111111-0000-0000-0000-000000000005',
  type: 'service',
  name: 'Servicio',
  descriptionStructure: {
    problem: {
      placeholder: '¿Qué servicio o asesoramiento es difícil de encontrar o muy caro?',
      example: 'Las PYMEs no pueden permitirse asesoría legal continua por sus altos costes.',
    },
    solution: {
      placeholder: '¿Cómo entregas el servicio de manera más accesible o eficiente?',
      example: 'Suscripción mensual a un abogado freelance para consultas ilimitadas por chat.',
    },
  },
  reviewerContext: 'Servicio: valora propuesta de valor, escalabilidad y modelo de precio.',
  createdAt: '2026-01-01T00:00:00Z',
}

export const ALL_TEMPLATES: ProjectTemplate[] = [
  TEMPLATE_SAAS,
  TEMPLATE_FEATURE,
  TEMPLATE_INTERNAL,
  TEMPLATE_PHYSICAL,
  TEMPLATE_SERVICE,
]
