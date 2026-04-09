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
})

export const updateProjectSchema = createProjectSchema.partial().omit({ communityId: true })

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

export const decisionSchema = z.object({
  decision: z.enum(['iterate', 'scale', 'abandon']),
})

export type DecisionInput = z.infer<typeof decisionSchema>
