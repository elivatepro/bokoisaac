// RSS for the Writing section (linked from every page's <head>). Published posts only in production.
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { posts, postHref } from '../../lib/posts';
import { SITE } from '../../lib/seo';

export const prerender = true;

export const GET: APIRoute = async ({ site }) =>
  rss({
    title: `${SITE.name} — Writing`,
    description: 'Notes from shipping real software. Written after the project, with the numbers and the code.',
    site: site ?? SITE.url,
    items: (await posts()).map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      link: postHref(p.data.slug),
      pubDate: p.data.published ?? p.data.updated,
      categories: p.data.tags,
    })),
    customData: '<language>en</language>',
  });
