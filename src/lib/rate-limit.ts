/**
 * 简单的内存限流器（IP 维度）
 * 用于防止 AI 接口被滥用
 */

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * 检查请求是否超过频率限制
 * @param key 限流维度（通常是 IP 地址）
 * @param maxRequests 时间窗口内最大请求数
 * @param windowMs 时间窗口（毫秒）
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.resetTime > windowMs) {
    // 新窗口或已过期，重置计数
    rateLimitMap.set(key, { count: 1, resetTime: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * 从请求中提取客户端 IP
 */
export function getClientIP(request: Request): string {
  // Render 等反向代理会把真实 IP 放在 x-forwarded-for 头里
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}
