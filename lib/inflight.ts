// lib/inflight.ts
/**
 * Super-simple, process-local de-dupe lock.
 * Prevents rapid double-submits (e.g., double-click) from sending two emails.
 * NOTE: Works per process/region only (good enough for most small sites).
 * For global de-dupe use Redis/DB instead.
 */

const g = globalThis as unknown as { __inflight?: Map<string, number> };
const bucket = (g.__inflight ??= new Map<string, number>());

function prune(now: number) {
  for (const [k, exp] of bucket) if (exp <= now) bucket.delete(k);
}

/**
 * Try to acquire a short-lived lock for `key`.
 * @returns true if we acquired the lock; false if a recent lock exists.
 */
export function lockOnce(key: string, ttlMs = 8000): boolean {
  const now = Date.now();
  prune(now);
  if (bucket.has(key)) return false;
  bucket.set(key, now + ttlMs);
  return true;
}

/** Manually release a lock (usually not needed). */
export function releaseLock(key: string) {
  bucket.delete(key);
}
