import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Only initialize if environment variables are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const ratelimit = redisUrl && redisToken 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

// Helper to get IP from headers
export function getIP(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIP) return realIP.trim();
  
  return "127.0.0.1";
}
