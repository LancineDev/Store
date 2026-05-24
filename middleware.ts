import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import Redis from "ioredis";

// In-memory rate limiting store (fallback)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Optional Redis client (use REDIS_URL in production for multiple instances)
let redisClient: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
  } catch (err) {
    // If Redis cannot be created, continue with in-memory fallback
    // eslint-disable-next-line no-console
    console.warn("Failed to initialize Redis for rate limiting:", err);
    redisClient = null;
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  // Fallback to unknown
  return "unknown";
}

async function isRateLimited(ip: string): Promise<boolean> {
  if (redisClient) {
    const key = `rate:${ip}`;
    const ttl = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
    try {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, ttl);
      }
      return count > RATE_LIMIT_MAX_REQUESTS;
    } catch (err) {
      // Fall back to in-memory on Redis errors
      // eslint-disable-next-line no-console
      console.warn("Redis rate limit check failed, falling back to memory:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect /dashboard and /account routes
  if (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Rate limit /api/checkout
  if (nextUrl.pathname === "/api/checkout") {
    const clientIP = getClientIP(req);

    if (await isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/api/checkout"],
  runtime: "nodejs",
};
