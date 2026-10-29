import type { BlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';
import { notion } from './notion';

// Renders a Notion page body to the HTML the post template styles (.post-body in pages/writing/[slug].astro).
// Supported: paragraphs, headings (H1/H2 → h2, H3 → h3), bulleted + numbered lists, quotes, callouts (as quotes),
// code (with a Copy button), dividers and external images. Notion-hosted images are skipped: their URLs expire
// after an hour, so they would break on the static site. TODO: download them at build time, like the covers.

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function rich(items: RichTextItemResponse[]): string {
  return items
    .map((t) => {
      let s = esc(t.plain_text).replace(/\n/g, '<br>');
      const a = t.annotations;
      if (a.code) s = `<code>${s}</code>`;
      if (a.bold) s = `<strong>${s}</strong>`;
      if (a.italic) s = `<em>${s}</em>`;
      if (a.strikethrough) s = `<s>${s}</s>`;
      const href = t.href;
      if (href) {
        const external = /^https?:\/\//.test(href) && !href.startsWith('https://bokoisaac.com');
        s = `<a href="${esc(href)}"${external ? ' rel="noopener" target="_blank"' : ''}>${s}</a>`;
      }
      return s;
    })
    .join('');
}

const plain = (items: RichTextItemResponse[]) => items.map((t) => t.plain_text).join('');

async function children(id: string): Promise<BlockObjectResponse[]> {
  const out: BlockObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion().blocks.children.list({ block_id: id, start_cursor: cursor, page_size: 100 });
    out.push(...res.results.filter(isFullBlock));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return out;
}

const copyIcon =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

async function render(blocks: BlockObjectResponse[], headings: Heading[]): Promise<string> {
  const html: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    // Consecutive list items become one list.
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const tag = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === b.type) {
        const item = blocks[i];
        const text = item.type === 'bulleted_list_item' ? item.bulleted_list_item.rich_text : item.type === 'numbered_list_item' ? item.numbered_list_item.rich_text : [];
        const nested = item.has_children ? await render(await children(item.id), headings) : '';
        items.push(`<li>${rich(text)}${nested}</li>`);
        i++;
      }
      i--;
      html.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }
    switch (b.type) {
      case 'paragraph': {
        const inner = rich(b.paragraph.rich_text);
        if (inner) html.push(`<p>${inner}</p>`);
        break;
      }
      case 'heading_1':
      case 'heading_2':
      case 'heading_3': {
        const text = b.type === 'heading_1' ? b.heading_1.rich_text : b.type === 'heading_2' ? b.heading_2.rich_text : b.heading_3.rich_text;
        const depth = b.type === 'heading_3' ? 3 : 2;
        let slug = slugify(plain(text)) || 'section';
        while (headings.some((h) => h.slug === slug)) slug += '-2';
        headings.push({ depth, slug, text: plain(text) });
        html.push(`<h${depth} id="${slug}">${rich(text)}</h${depth}>`);
        break;
      }
      case 'quote':
        html.push(`<blockquote><p>${rich(b.quote.rich_text)}</p></blockquote>`);
        break;
      case 'callout':
        html.push(`<blockquote><p>${rich(b.callout.rich_text)}</p></blockquote>`);
        break;
      case 'code': {
        const lang = b.code.language === 'plain text' ? 'text' : b.code.language === 'typescript' ? 'ts' : b.code.language === 'javascript' ? 'js' : b.code.language;
        html.push(
          `<figure class="post-code"><figcaption><span>${esc(lang)}</span><button type="button" data-copy aria-label="Copy code"><span data-copy-label>Copy</span>${copyIcon}</button></figcaption>` +
            `<pre data-lenis-prevent><code>${esc(plain(b.code.rich_text))}</code></pre></figure>`,
        );
        break;
      }
      case 'divider':
        html.push('<hr>');
        break;
      case 'image': {
        if (b.image.type !== 'external') break;
        const caption = plain(b.image.caption);
        html.push(
          `<figure class="post-img"><img src="${esc(b.image.external.url)}" alt="${esc(caption)}" loading="lazy">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`,
        );
        break;
      }
    }
  }
  return html.join('\n');
}

export async function renderPage(pageId: string): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = [];
  const html = await render(await children(pageId), headings);
  return { html, headings };
}
