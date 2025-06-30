import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextFunction, Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

// Create rate limiter: 10 requests per 60 seconds per IP
const rateLimiter = new RateLimiterMemory({
  keyPrefix: "middleware",
  points: 10, // max requests
  duration: 60, // per 60 seconds
});

// Middleware function
export const RateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.toString() ||
    req.connection.remoteAddress ||
    "unknown";

  // Skip rate limiting in development
  if (!isProduction) {
    console.log(`[RateLimiter] 🛑 Skipped in dev for IP: ${ip}`);
    return next();
  }

  try {
    await rateLimiter.consume(ip);

    // Optional logging in prod
    if (process.env.LOG_RATE_LIMIT === "true") {
      console.log(`[RateLimiter] ✅ Passed for IP: ${ip}`);
    }

    next();
  } catch (err) {
    const rejRes = err as RateLimiterRes;
    const retrySecs = Math.ceil((rejRes.msBeforeNext || 0) / 1000);

    console.warn(`[RateLimiter] ❌ Too many requests from IP: ${ip}`);

    res.set("Retry-After", retrySecs.toString());
    res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: `${retrySecs}s`,
    });
  }
};
