// Shared bits for the on-demand endpoints (/api/subscribe, /api/comments, /api/contact). Everything else is prerendered.
// Keys come from the Worker's secrets (set by the deploy workflow from GitHub secrets), never from the repo.
import { env } from 'cloudflare:workers';

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function secret(name: 'NOTION_TOKEN' | 'BUTTONDOWN_API_KEY' | 'RESEND_API_KEY' | 'TURNSTILE_SECRET_KEY'): string | undefined {
  return (env as unknown as Record<string, string | undefined>)[name];
}

interface Limiter {
  limit(o: { key: string }): Promise<{ success: boolean }>;
}

/**
 * Bot check for the form endpoints, run after the honeypot. Two layers:
 * 1. FORM_LIMIT (wrangler.jsonc "ratelimits"): a few posts per minute per IP, across all three forms.
 * 2. Cloudflare Turnstile: the form sends the token from scripts/turnstile.ts as "turnstile". Only enforced once
 *    the TURNSTILE_SECRET_KEY secret exists, so the site key and secret have to be switched on together.
 * Pages and crawlers never touch this: it only guards POSTs to /api/*.
 */
export async function human(request: Request, body: Record<string, string>): Promise<boolean> {
  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const limiter = (env as unknown as { FORM_LIMIT?: Limiter }).FORM_LIMIT;
  if (limiter && ip && !(await limiter.limit({ key: ip })).success) return false;

  const key = secret('TURNSTILE_SECRET_KEY');
  if (!key) return true;
  if (!body.turnstile) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: key, response: body.turnstile.slice(0, 2048), remoteip: ip }),
  }).catch(() => null);
  if (!res?.ok) return false;
  const out = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  if (!out.success) console.warn('turnstile', out['error-codes']?.join(','));
  return out.success;
}

/** Reads a JSON or form-encoded body into plain strings. A form field sent more than once (checkboxes) is joined with "|". */
export async function readBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const data = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : '']));
  }
  const form = await request.formData().catch(() => new FormData());
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v !== 'string') continue;
    out[k] = k in out ? `${out[k]}|${v}` : v;
  }
  return out;
}

/** JSON for fetch() callers; a redirect back to the page for plain form posts (no JS). */
export function reply(request: Request, ok: boolean, error: string | null, back: { path: string; param: string; hash: string }) {
  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return Response.json(ok ? { ok } : { ok, error }, { status: ok ? 200 : error === 'server' ? 502 : error === 'blocked' ? 429 : 400 });
  }
  const url = new URL(back.path, request.url);
  url.searchParams.set(back.param, ok ? 'ok' : error === 'invalid_email' ? 'invalid' : 'error');
  url.hash = back.hash;
  return Response.redirect(url.toString(), 303);
}
