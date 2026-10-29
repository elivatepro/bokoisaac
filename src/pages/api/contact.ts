// POST /api/contact { need (joined with "|"), budget, name, email, message } from the contact page.
// 1. Adds a row to the Notion Leads database (Status "New", Source "Contact page").
// 2. Emails Boko through Resend from the verified bokoisaac.com domain, with Reply-To set to the sender.
// The message counts as sent when either step works; it only fails when both do.
import type { APIRoute } from 'astro';
import { EMAIL, readBody, reply, secret } from '../../lib/api';

export const prerender = false;

const LEADS = '871e472e-2d50-4cd8-8c98-2448f0331e76'; // DATA_SOURCES.leads in lib/notion.ts
const TO = 'hello@bokoisaac.com';
const FROM = 'Boko Isaac website <website@bokoisaac.com>';
// Same option names as the Notion Leads "Need" and "Budget" properties.
const NEEDS = ['Full-stack build', 'Mobile app', 'AI integration', 'APIs & integrations', 'Team embed', 'Something else'];
const BUDGETS = ['Under $1k', '$1–3k', '$3–10k', '$10k+', 'Not sure yet'];

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  const back = { path: '/contact', param: 'sent', hash: 'message' };
  if (body.website) return reply(request, true, null, back); // honeypot

  const name = (body.name ?? '').trim().slice(0, 120);
  const email = (body.email ?? '').trim().slice(0, 254);
  const message = (body.message ?? '').trim().slice(0, 2000);
  const need = (body.need ?? '').split('|').map((n) => n.trim()).filter((n) => NEEDS.includes(n));
  const budget = BUDGETS.includes((body.budget ?? '').trim()) ? body.budget.trim() : null;
  if (!EMAIL.test(email)) return reply(request, false, 'invalid_email', back);
  if (!name || !message) return reply(request, false, 'invalid', back);

  const [saved, mailed] = await Promise.all([saveLead({ name, email, message, need, budget }), notify({ name, email, message, need, budget })]);
  return reply(request, saved || mailed, saved || mailed ? null : 'server', back);
};

interface Lead {
  name: string;
  email: string;
  message: string;
  need: string[];
  budget: string | null;
}

async function saveLead(l: Lead): Promise<boolean> {
  const token = secret('NOTION_TOKEN');
  if (!token) return false;
  const text = (content: string) => [{ type: 'text', text: { content } }];
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'notion-version': '2025-09-03', 'content-type': 'application/json' },
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: LEADS },
      properties: {
        Name: { title: text(l.name) },
        Email: { email: l.email },
        Message: { rich_text: text(l.message) },
        Need: { multi_select: l.need.map((name) => ({ name })) },
        Budget: { select: l.budget ? { name: l.budget } : null },
        Source: { select: { name: 'Contact page' } },
        Status: { status: { name: 'New' } },
      },
    }),
  });
  if (!res.ok) console.error('notion lead', res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

async function notify(l: Lead): Promise<boolean> {
  const key = secret('RESEND_API_KEY');
  if (!key) return false;
  const lines = [
    `Name: ${l.name}`,
    `Email: ${l.email}`,
    `Need: ${l.need.join(', ') || 'not picked'}`,
    `Budget: ${l.budget ?? 'not picked'}`,
    '',
    l.message,
    '',
    'Saved to Notion → Leads. Reply to this email to answer them directly.',
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: l.email, subject: `New enquiry from ${l.name}`, text: lines.join('\n') }),
  });
  if (!res.ok) console.error('resend', res.status, (await res.text()).slice(0, 300));
  return res.ok;
}
