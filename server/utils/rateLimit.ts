import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'

const buckets = new Map<string, { count: number; startedAt: number }>()

export function checkRateLimit(key: string, maximum = 10, windowMs = 60_000, now = Date.now()) {
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.startedAt >= windowMs) {
    buckets.set(key, { count: 1, startedAt: now })
    return { allowed: true, remaining: maximum - 1 }
  }
  if (bucket.count >= maximum) return { allowed: false, remaining: 0 }
  bucket.count += 1
  return { allowed: true, remaining: maximum - bucket.count }
}

export function getClientIP(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

export function resetRateLimits() {
  buckets.clear()
}
