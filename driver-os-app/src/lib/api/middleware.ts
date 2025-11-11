import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiValidationError } from './response'

export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ valid: true; data: T } | { valid: false; response: Response }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { valid: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, response: apiValidationError(error.issues) }
    }
    return {
      valid: false,
      response: apiValidationError('Invalid request body')
    }
  }
}

export function requireMethod(request: NextRequest, methods: string[]): boolean {
  return methods.includes(request.method)
}
