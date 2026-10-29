import { Client, isFullPage } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Loader } from 'astro/loaders';
import { renderPage } from './notion-blocks';

// Data source IDs for the databases on the "Boko Isaac — Website CMS" page in Notion.
export const DATA_SOURCES = {
  blog: '26088c54-2a18-48cd-a862-68cf4a602628',
  lab: '4ad1cf2e-e6f7-4728-8a0c-32c572155a28',
  reviews: '596e216e-6161-44c7-88a6-1d825dae904f',
  faqs: 'c19ac45f-6735-479e-89ce-68642e813b3a',
  services: '954c189c-98c6-4dc9-b44e-d76ca783f325',
  now: '021c284c-146c-41ea-ae29-5c87732aa7bc',
  stack: '8380516d-b9e0-45aa-8be9-46090bf4e327',
  leads: '871e472e-2d50-4cd8-8c98-2448f0331e76',
  comments: '7c88a05d-bf37-4939-994d-47c1262f22f2',
} as const;

let client: Client | undefined;

export function notion(): Client {
  const auth = process.env.NOTION_TOKEN;
  if (!auth) throw new Error('NOTION_TOKEN is not set. Run through `npm run dev` / `npm run build`, which load it from Keychain.');
  client ??= new Client({ auth });
  return client;
}

export async function queryAll(dataSourceId: string): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion().dataSources.query({ data_source_id: dataSourceId, start_cursor: cursor, page_size: 100 });
    pages.push(...res.results.filter(isFullPage));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

type Property = PageObjectResponse['properties'][string];

// Turns a Notion property into a plain value: text, number, boolean, date string, list of names or file URLs.
export function plain(prop: Property | undefined): unknown {
  if (!prop) return undefined;
  switch (prop.type) {
    case 'title':
      return prop.title.map((t) => t.plain_text).join('');
    case 'rich_text':
      return prop.rich_text.map((t) => t.plain_text).join('');
    case 'number':
      return prop.number;
    case 'checkbox':
      return prop.checkbox;
    case 'select':
      return prop.select?.name ?? null;
    case 'status':
      return prop.status?.name ?? null;
    case 'multi_select':
      return prop.multi_select.map((o) => o.name);
    case 'date':
      return prop.date?.start ?? null;
    case 'url':
      return prop.url;
    case 'email':
      return prop.email;
    case 'files':
      return prop.files.map((f) => (f.type === 'file' ? f.file.url : f.external.url));
    case 'relation':
      return prop.relation.map((r) => r.id);
    case 'created_time':
      return prop.created_time;
    case 'last_edited_time':
      return prop.last_edited_time;
    default:
      return undefined;
  }
}

export function flatten(page: PageObjectResponse): Record<string, unknown> {
  const out: Record<string, unknown> = { id: page.id };
  for (const [name, prop] of Object.entries(page.properties)) out[name] = plain(prop);
  return out;
}

// Astro content loader: one entry per Notion row, keyed by page id, with flattened properties as data.
// With { body: true } the page content is rendered too, so `render(entry)` gives <Content /> and its headings.
export function notionLoader(dataSourceId: string, opts: { body?: boolean } = {}): Loader {
  return {
    name: 'notion',
    async load({ store, parseData, generateDigest, logger }) {
      const pages = await queryAll(dataSourceId);
      store.clear();
      for (const page of pages) {
        const raw = flatten(page);
        const data = await parseData({ id: page.id, data: raw });
        const rendered = opts.body ? await renderPage(page.id) : undefined;
        store.set({
          id: page.id,
          data,
          digest: generateDigest({ edited: page.last_edited_time }),
          rendered: rendered && { html: rendered.html, metadata: { headings: rendered.headings } },
        });
      }
      logger.info(`Loaded ${pages.length} rows`);
    },
  };
}
