// /llms-full.txt: the whole site as one plain-text file (llmstxt.org), so AI search and answer engines can read
// the services, case studies, FAQs and posts in full without crawling every page. /llms.txt is the short index.
import type { APIRoute } from 'astro';
import { live } from '../lib/content';
import { posts, postHref, day } from '../lib/posts';
import { projects } from '../lib/projects';
import { services } from '../lib/services';
import { SITE } from '../lib/seo';

export const prerender = true;

const u = (path: string) => `${SITE.url}${path}`;

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };
const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e: string) => entities[e]!);

/** The post HTML from lib/notion-blocks.ts as Markdown: headings, lists, quotes, code and links. Everything else is dropped. */
function markdown(html: string) {
  return decode(
    html
      .replace(
        /<figure class="post-code"><figcaption><span>([^<]*)<\/span>[\s\S]*?<\/figcaption><pre[^>]*><code>([\s\S]*?)<\/code><\/pre><\/figure>/g,
        (_, lang: string, code: string) => `\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`,
      )
      .replace(/<figcaption>([\s\S]*?)<\/figcaption>/g, '\n_$1_\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n### $1\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n#### $1\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '- $1\n')
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, '\n> $1\n')
      .replace(/<code>([\s\S]*?)<\/code>/g, '`$1`')
      .replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, '**$2**')
      .replace(/<(em|i)>([\s\S]*?)<\/\1>/g, '_$2_')
      .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href: string, text: string) => `[${text}](${href.startsWith('/') ? u(href) : href})`)
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/(p|ul|ol|figure|div)>/g, '\n\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const [all, faqs, writing] = await Promise.all([services(), live('faqs'), posts()]);
  const out: string[] = [`# ${SITE.name}`, '', `> ${SITE.description}`, '', `Contact: ${SITE.email} or ${u('/contact')}. Short index: ${u('/llms.txt')}.`];

  if (all.length) {
    out.push('', '## Services');
    for (const s of all) {
      out.push('', `### ${s.name}`, '', `URL: ${u(`/services/${s.slug}`)}`);
      if (s.price) out.push(`Price: ${s.price}${s.timeline ? `. Timeline: ${s.timeline}` : ''}`);
      out.push('', s.summary, '', s.scope);
      if (s.includes.length) out.push('', 'Includes:', ...s.includes.map((i) => `- ${i}`));
      if (s.steps.length) out.push('', 'How it runs:', ...s.steps.map((st) => `- ${st.when}, ${st.title}: ${st.body}`));
      for (const q of s.questions) out.push('', `Q: ${q.q}`, `A: ${q.a}`);
    }
  }

  out.push('', '## Case studies');
  for (const p of projects) {
    out.push('', `### ${p.name}`, '', `URL: ${u(`/work/${p.slug}`)}`, `Client: ${p.client}. Role: ${p.role}. Stack: ${p.stack.join(', ')}.`);
    out.push(`Result: ${p.metric}, ${p.before} → ${p.after}.`, '', p.summary);
    if (p.study) {
      out.push('', 'Problem:', '', ...p.study.problem.flatMap((t) => [t, '']));
      out.push('Approach:', '', ...p.study.approach.flatMap((t) => [t, '']));
      out.push('Result:', '', ...p.study.result.flatMap((t) => [t, '']));
      out.pop();
    }
  }

  const answered = faqs.filter((f) => f.data.question && f.data.answer);
  if (answered.length) {
    out.push('', '## FAQ', '', `URL: ${u('/faq')}`);
    for (const f of answered) out.push('', `### ${f.data.question}`, '', f.data.answer);
  }

  if (writing.length) {
    out.push('', '## Writing');
    for (const p of writing) {
      out.push('', `### ${p.data.title}`, '', `URL: ${u(postHref(p.data.slug))}`);
      if (p.data.published) out.push(`Published: ${day(p.data.published)}`);
      out.push('', p.rendered?.html ? markdown(p.rendered.html) : p.data.excerpt);
    }
  }

  out.push('');
  return new Response(out.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
