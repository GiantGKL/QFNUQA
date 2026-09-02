import type { H3Event } from 'h3'
import { setResponseStatus } from 'h3'

export function apiError(event: H3Event, status: number, error: string) {
  setResponseStatus(event, status)
  return { success: false as const, error }
}
