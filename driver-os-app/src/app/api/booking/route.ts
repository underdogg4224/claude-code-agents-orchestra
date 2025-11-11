import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { validateRequest } from '@/lib/api/middleware'
import { createBookingSchema } from '@/lib/validations/booking'
import type { BookingResponse } from '@/types/api'

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, createBookingSchema)

  if (!validation.valid) {
    return validation.response
  }

  const { userId, dateTime, timezone, paymentId } = validation.data

  try {
    // TODO: Integrate with Cal.com API
    // For now, return a placeholder response

    const response: BookingResponse = {
      bookingId: `booking_${userId}_${Date.now()}`,
      calendarLink: `https://cal.com/driver-os/consultation`,
      meetingUrl: `https://meet.google.com/placeholder`,
      scheduledAt: dateTime,
    }

    return apiSuccess(response, 201)
  } catch (error) {
    console.error('Booking creation error:', error)
    return apiError('Failed to create booking', 'BOOKING_ERROR', 500)
  }
}
