import { headers } from 'next/headers';

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so memory stays flat across long uptimes
function pruneBuckets(now: number, maxAgeMs: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets.entries()) {
    const fresh = bucket.timestamps.filter((t) => now - t < maxAgeMs);
    if (fresh.length === 0) {
      buckets.delete(key);
    } else {
      bucket.timestamps = fresh;
    }
  }
}

export async function getClientFingerprint(): Promise<string> {
  try {
    const hdrs = await headers();
    const forwarded = hdrs.get('x-forwarded-for');
    if (forwarded) {
      const firstIp = forwarded.split(',')[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = hdrs.get('x-real-ip')?.trim();
    if (realIp) return realIp;
  } catch {
    // Fallback if called outside request header context
  }
  return 'local-client';
}

export async function enforceRateLimit(
  actionKey: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const now = Date.now();
  pruneBuckets(now, windowMs);

  const client = await getClientFingerprint();
  const key = `${actionKey}:${client}`;
  const existing = buckets.get(key) || { timestamps: [] };

  const recent = existing.timestamps.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const oldest = recent[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(key, { timestamps: recent });
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });
  return { allowed: true, retryAfterSec: 0 };
}
