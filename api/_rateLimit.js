// Shared rate limiter — 20 AI requests per IP per day
// Uses module-level Map (persists across requests within same Vercel function instance)
// Not perfectly durable across cold starts, but sufficient for small-scale usage

const dailyCounts = new Map(); // key: "YYYY-MM-DD:ip" → count
let lastCleanup = Date.now();

function today() {
  return new Date().toISOString().slice(0, 10);
}

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 3600_000) return; // cleanup hourly
  const prefix = today();
  for (const key of dailyCounts.keys()) {
    if (!key.startsWith(prefix)) dailyCounts.delete(key);
  }
  lastCleanup = now;
}

export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

const DAILY_LIMIT = 20;

export function checkRateLimit(req) {
  cleanup();
  const ip = getClientIP(req);
  const key = `${today()}:${ip}`;
  const count = dailyCounts.get(key) || 0;

  if (count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_LIMIT, count };
  }

  dailyCounts.set(key, count + 1);
  return { allowed: true, remaining: DAILY_LIMIT - count - 1, limit: DAILY_LIMIT, count: count + 1 };
}

export function getRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
  };
}
