import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api'

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

export function apiError(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

export function apiValidationError(errors: unknown): NextResponse<ApiResponse> {
  return apiError('Validation failed', 'VALIDATION_ERROR', 400, errors)
}
