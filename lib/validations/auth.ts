import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Introduce un email válido' }),
})

export type LoginInput = z.infer<typeof loginSchema>
