import { z } from 'zod'

export const createCheckoutSchema = z.object({
  resultsId: z.string().cuid(),
  email: z.string().email(),
  bookingDate: z.string().datetime().optional(),
})
