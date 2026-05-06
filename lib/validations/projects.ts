import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(120, 'El título no puede superar 120 caracteres'),
  problem: z.string()
    .min(1, 'La descripción del problema es obligatoria')
    .max(1000, 'La descripción no puede superar 1000 caracteres'),
  solution: z.string()
    .min(1, 'La solución propuesta es obligatoria')
    .max(1000, 'La solución no puede superar 1000 caracteres'),
  hypothesis: z.string()
    .min(1, 'La hipótesis es obligatoria')
    .max(500, 'La hipótesis no puede superar 500 caracteres'),
  imageUrls: z.array(z.string().url('URL de imagen inválida'))
    .min(1, 'Debes añadir al menos una imagen')
    .max(5, 'No puedes añadir más de 5 imágenes'),
  communityId: z.string().uuid(),
  // Story 8.1 — campos opcionales de detalle
  targetUser: z.string().max(300, 'El usuario objetivo no puede superar 300 caracteres').optional(),
  demoUrl: z.string().url('La URL de demo no es válida').optional().or(z.literal('')),
  feedbackTopics: z.array(
    z.string().min(1).max(100, 'Cada tema no puede superar 100 caracteres')
  ).max(10, 'No puedes añadir más de 10 temas').optional(),
  // Story 10.2 — template Phase 2
  template_id: z.string().uuid().nullable().optional(),
  // Story 11.2 — pregunta custom del Builder
  customQuestion: z
    .string()
    .max(200, 'La pregunta custom no puede superar 200 caracteres')
    .optional(),
})

export const updateProjectSchema = createProjectSchema.partial().omit({ communityId: true })

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const decisionSchema = z.object({
  decision: z.enum(['iterate', 'scale', 'abandon']),
})

export type DecisionInput = z.infer<typeof decisionSchema>

// ── Story 9.8: LaunchIdeaModal ────────────────────────────────────────────────

export const launchIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'El nombre del proyecto es obligatorio')
    .max(120, 'El nombre no puede superar 120 caracteres'),
  tagline: z
    .string()
    .min(1, 'El tagline es obligatorio')
    .max(200, 'El tagline no puede superar 200 caracteres'),
  problem: z
    .string()
    .min(1, 'El problema es obligatorio')
    .max(1000, 'El problema no puede superar 1000 caracteres'),
  solution: z
    .string()
    .min(1, 'La solución es obligatoria')
    .max(1000, 'La solución no puede superar 1000 caracteres'),
  targetUser: z
    .string()
    .max(300, 'El usuario objetivo no puede superar 300 caracteres')
    .optional(),
  // Story 10.5 — BREAKING CHANGE: hypothesis pasa de min(1) requerido a optional
  // La hipótesis se captura en el paso 4 del wizard y puede llegar vacía al submit temporal (paso 3)
  hypothesis: z
    .string()
    .max(500, 'La hipótesis no puede superar 500 caracteres')
    .optional(),
  demoLink: z
    .string()
    .url('La URL de demo no es válida')
    .optional()
    .or(z.literal('')),
  // Story 11.2 — pregunta custom del Builder (opcional, máx 200 chars)
  customQuestion: z
    .string()
    .max(200, 'La pregunta custom no puede superar 200 caracteres')
    .optional(),
})

export type LaunchIdeaFormValues = z.infer<typeof launchIdeaSchema>
