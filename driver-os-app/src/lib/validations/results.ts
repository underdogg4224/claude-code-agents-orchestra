import { z } from 'zod'

export const resultsQuerySchema = z.object({
  id: z.string().cuid(),
})
