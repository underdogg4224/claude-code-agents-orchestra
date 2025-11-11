import { z } from 'zod'

export const createBookingSchema = z.object({
  userId: z.string().cuid(),
  dateTime: z.string().datetime(),
  timezone: z.string(),
  paymentId: z.string().cuid(),
})
