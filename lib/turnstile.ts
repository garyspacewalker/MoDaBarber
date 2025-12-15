// lib/turnstile.ts
import 'server-only';

export async function verifyTurnstile(token: string | undefined, ip?: string | null) {
  if (!token || !process.env.TURNSTILE_SECRET_KEY) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY || '',
      response: token,
      remoteip: ip || '',
    }),
    // Optional: set a short timeout via AbortController if you like
  });

  const json = await res.json();
  return !!json.success;
}
