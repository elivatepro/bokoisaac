// Prints "changed=true" to $GITHUB_OUTPUT when any CMS row was edited in the last N minutes (default 65).
// Used by the hourly deploy check so the site only rebuilds when Notion content actually changed.
import { appendFileSync } from 'node:fs';
import { Client } from '@notionhq/client';

const minutes = Number(process.env.WINDOW_MINUTES ?? 65);
const since = new Date(Date.now() - minutes * 60_000).toISOString();
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Same IDs as DATA_SOURCES in src/lib/notion.ts, minus Leads (never shown on the site).
const sources = [
  '26088c54-2a18-48cd-a862-68cf4a602628', // blog
  '4ad1cf2e-e6f7-4728-8a0c-32c572155a28', // lab
  '596e216e-6161-44c7-88a6-1d825dae904f', // reviews
  'c19ac45f-6735-479e-89ce-68642e813b3a', // faqs
  '954c189c-98c6-4dc9-b44e-d76ca783f325', // services
  '021c284c-146c-41ea-ae29-5c87732aa7bc', // now
  '8380516d-b9e0-45aa-8be9-46090bf4e327', // stack & uses
  '7c88a05d-bf37-4939-994d-47c1262f22f2', // comments
];

let changed = false;
for (const id of sources) {
  const res = await notion.dataSources.query({
    data_source_id: id,
    page_size: 1,
    filter: { timestamp: 'last_edited_time', last_edited_time: { on_or_after: since } },
  });
  if (res.results.length) {
    changed = true;
    break;
  }
}

console.log(changed ? `Notion changed since ${since}` : `No Notion changes since ${since}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
