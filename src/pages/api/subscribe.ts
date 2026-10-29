// POST /api/subscribe { email } → adds the address to Buttondown, which sends its own confirmation email.
import type { APIRoute } from 'astro';
import { EMAIL, readBody, reply, secret } from '../../lib/api';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  const back = { path: new URL(request.headers.get('referer') ?? '/writing', request.url).pathname, param: 'newsletter', hash: 'newsletter' };
  if (body.website) return reply(request, true, null, back); // honeypot: pretend it worked
  const email = (body.email ?? '').trim().slice(0, 254);
  if (!EMAIL.test(email)) return reply(request, false, 'invalid_email', back);

  const key = secret('BUTTONDOWN_API_KEY');
  if (!key) return reply(request, false, 'server', back);
  const res = await fetch('https://api.buttondown.com/v1/subscribers', {
    method: 'POST',
    headers: { authorization: `Token ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email_address: email, referrer_url: request.headers.get('referer') ?? undefined, tags: ['website'] }),
  });
  if (res.ok) return reply(request, true, null, back);
  const detail = await res.text();
  // Already subscribed counts as success; Buttondown rejecting the address is a bad email.
  if (/already|exists/i.test(detail)) return reply(request, true, null, back);
  if (res.status === 400 && /email/i.test(detail)) return reply(request, false, 'invalid_email', back);
  console.error('buttondown', res.status, detail.slice(0, 300));
  return reply(request, false, 'server', back);
};
