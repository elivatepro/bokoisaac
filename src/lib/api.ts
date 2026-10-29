// Shared bits for the on-demand endpoints (/api/subscribe, /api/comments, /api/contact). Everything else is prerendered.
// Keys come from the Worker's secrets (set by the deploy workflow from GitHub secrets), never from the repo.
import { env } from 'cloudflare:workers';

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function secret(name: 'NOTION_TOKEN' | 'BUTTONDOWN_API_KEY' | 'RESEND_API_KEY'): string | undefined {
  return env[name];
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
    return Response.json(ok ? { ok } : { ok, error }, { status: ok ? 200 : error === 'server' ? 502 : 400 });
  }
  const url = new URL(back.path, request.url);
  url.searchParams.set(back.param, ok ? 'ok' : error === 'invalid_email' ? 'invalid' : 'error');
  url.hash = back.hash;
  return Response.redirect(url.toString(), 303);
}
