/**
 * Shared TypeScript type definitions for Driver OS v2
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment types
export interface Assessment {
  id: string;
  userId: string;
  status: AssessmentStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssessmentStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
