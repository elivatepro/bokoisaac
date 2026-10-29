// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

/** Renders the share cards once the pages exist (scripts/og.mjs reads <meta name="bi-og"> from each page). */
const ogCards = () => ({
  name: 'bi-og-cards',
  hooks: {
    /** @param {{ dir: URL; logger: { info: (m: string) => void } }} opts */
    'astro:build:done': async ({ dir, logger }) => {
      const { renderAll } = await import('./scripts/og.mjs');
      await renderAll(fileURLToPath(dir), (m) => logger.info(m));
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://bokoisaac.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    sitemap({ filter: (page) => !/\/(404|api)(\/|$)/.test(new URL(page).pathname) }),
    ogCards(),
  ],
  adapter: cloudflare()
});
