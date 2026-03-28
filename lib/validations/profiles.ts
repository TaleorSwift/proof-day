import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().max(60, 'Nombre demasiado largo').optional(),
  bio: z.string().max(500, 'Bio demasiado larga').optional(),
  interests: z.array(z.string().max(30)).max(10, 'Máximo 10 intereses').optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
