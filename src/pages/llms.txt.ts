// /llms.txt: a plain summary of who Boko is and where things are, for AI search and answer engines (llmstxt.org).
import type { APIRoute } from 'astro';
import { live } from '../lib/content';
import { posts, postHref } from '../lib/posts';
import { projects } from '../lib/projects';
import { SITE } from '../lib/seo';

export const prerender = true;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export const GET: APIRoute = async () => {
  const services = await live('services');
  const writing = await posts();
  const u = (path: string) => `${SITE.url}${path}`;

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `- Role: ${SITE.jobTitle}`,
    '- Location: remote, working with clients worldwide',
    `- Languages: ${SITE.languages.join(', ')}`,
    `- Contact: ${SITE.email} or ${u('/contact')}`,
    `- Core stack: ${SITE.knowsAbout.slice(0, 7).join(', ')}`,
    '',
    '## Pages',
    '',
    `- [Work](${u('/work')}): case studies of shipped products, each with a measured result`,
    `- [Services](${u('/services')}): what Boko builds, with starting prices`,
    `- [Process](${u('/process')}): how a project runs, week by week`,
    `- [About](${u('/about')}): background and how Boko works`,
    `- [Resume](${u('/resume')}): experience and skills`,
    `- [Writing](${u('/writing')}): notes from real projects ([RSS](${u('/writing/rss.xml')}))`,
    `- [Lab](${u('/lab')}): open-source tools and experiments`,
    `- [Reviews](${u('/reviews')}): what clients say`,
    `- [FAQ](${u('/faq')}): common questions before a project`,
    `- [Contact](${u('/contact')}): start a project or book a call`,
    '',
    '## Case studies',
    '',
    ...projects.map((p) => `- [${p.name}](${u(`/work/${p.slug}`)}): ${p.summary} ${p.metric}: ${p.before} → ${p.after}. (${p.client}, ${p.role})`),
  ];

  if (services.length) {
    lines.push('', '## Services', '');
    for (const s of services) {
      const price = s.data.priceFrom ? ` From ${money(s.data.priceFrom)}${s.data.priceUnit === 'project' ? '' : ` per ${s.data.priceUnit}`}.` : '';
      lines.push(`- ${s.data.name}: ${s.data.summary}${price}`);
    }
  }

  if (writing.length) {
    lines.push('', '## Writing', '');
    for (const p of writing) lines.push(`- [${p.data.title}](${u(postHref(p.data.slug))}): ${p.data.excerpt}`);
  }

  lines.push('', '## Optional', '', `- [Sitemap](${u('/sitemap-index.xml')})`, '');
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
