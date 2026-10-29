// POST /api/comments { post, slug, name, email?, comment } → a new row in the Notion Comments database with
// Approved unchecked. It only appears on the post after Boko ticks Approved and the site rebuilds.
import type { APIRoute } from 'astro';
import { EMAIL, readBody, reply, secret } from '../../lib/api';

export const prerender = false;

const COMMENTS = '7c88a05d-bf37-4939-994d-47c1262f22f2'; // DATA_SOURCES.comments in lib/notion.ts
const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request }) => {
  const body = await readBody(request);
  const slug = (body.slug ?? '').replace(/[^a-z0-9-]/g, '');
  const back = { path: slug ? `/writing/${slug}` : '/writing', param: 'comment', hash: 'comments' };
  if (body.website) return reply(request, true, null, back); // honeypot

  const name = (body.name ?? '').trim().slice(0, 80);
  const email = (body.email ?? '').trim().slice(0, 254);
  const comment = (body.comment ?? '').trim().slice(0, 2000);
  if (!name || !comment || !UUID.test(body.post ?? '') || (email && !EMAIL.test(email))) return reply(request, false, 'invalid', back);

  const token = secret('NOTION_TOKEN');
  if (!token) return reply(request, false, 'server', back);
  const text = (content: string) => [{ type: 'text', text: { content } }];
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'notion-version': '2025-09-03', 'content-type': 'application/json' },
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: COMMENTS },
      properties: {
        Name: { title: text(name) },
        Comment: { rich_text: text(comment) },
        Email: { email: email || null },
        Post: { relation: [{ id: body.post }] },
        Approved: { checkbox: false },
      },
    }),
  });
  if (res.ok) return reply(request, true, null, back);
  console.error('notion comment', res.status, (await res.text()).slice(0, 300));
  return reply(request, false, 'server', back);
};
