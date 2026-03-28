import { z } from 'zod'

const scoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const submitFeedbackSchema = z.object({
  projectId: z.string().uuid(),
  communityId: z.string().uuid(),
  scores: z.object({
    p1: scoreSchema,
    p2: scoreSchema,
    p3: scoreSchema,
  }),
  textResponses: z.object({
    p1: z.string().max(2000).optional(),
    p2: z.string().max(2000).optional(),
    p3: z.string().max(2000).optional(),
    p4: z.string().min(10, 'Escribe al menos 10 caracteres en tu respuesta').max(2000),
  }),
})

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
