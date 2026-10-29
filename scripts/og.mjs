// Share cards (Open Graph images), from Paper "Boko Isaac - System" → "Share card — Post".
// Runs after `astro build` (integrations/og.mjs): every built page carries <meta name="bi-og" content="{…}"> from
// layouts/Base.astro, and this renders that data to dist/client/og/<path>.png at 1200×630 with satori + resvg.
// The home page and 404 use the exported "Share card — Default" (public/og/default.png) instead.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const C = { bg: '#0B0C0E', ink: '#F1F2EC', muted: '#9197A0', coral: '#FF7F50', rule: '#F1F2EC24' };

let fonts;
async function loadFonts() {
  fonts ??= [
    { name: 'Lexend', data: await readFile(join(here, 'og-fonts/Lexend-SemiBold.ttf')), weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: await readFile(join(here, 'og-fonts/JetBrainsMono-Medium.ttf')), weight: 500, style: 'normal' },
  ];
  return fonts;
}

const h = (type, style, children) => ({ type, props: { style, children } });
const mono = (color, text) => h('div', { color, fontFamily: 'JetBrains Mono', fontSize: 20, lineHeight: 1 }, text);

/** @param {{ section: string; title: string; meta?: string; date?: string }} d */
export async function renderCard(d) {
  // Last word coral, with a full stop when the title has no closing punctuation (same rule as the pages).
  const words = d.title.trim().split(/\s+/);
  let last = words.pop() ?? '';
  if (!/[.!?]$/.test(last)) last += '.';
  const len = d.title.length;
  const size = len > 64 ? 64 : len > 44 ? 76 : 92;
  const word = (t, color) => h('span', { color }, t);

  const tree = h(
    'div',
    { width: 1200, height: 630, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: C.bg, paddingTop: 64, paddingRight: 72, paddingBottom: 72, paddingLeft: 72, fontFamily: 'Lexend' },
    [
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 8 }, [
          h('div', { color: C.ink, fontSize: 30, fontWeight: 600, letterSpacing: -0.9, lineHeight: 1 }, 'Boko Isaac'),
          h('div', { width: 13, height: 26, backgroundColor: C.coral }, undefined),
        ]),
        h('div', { display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 20, lineHeight: 1, color: C.ink }, [word('//', C.coral), word(' ' + d.section, C.ink)]),
      ]),
      h(
        'div',
        { display: 'flex', flexWrap: 'wrap', columnGap: size * 0.24, maxWidth: 1000, color: C.ink, fontSize: size, fontWeight: 600, letterSpacing: size * -0.045, lineHeight: 0.98 },
        [...words.map((w) => word(w, C.ink)), word(last, C.coral)],
      ),
      h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: C.rule, paddingTop: 28 }, [
        mono(C.muted, [d.section, d.meta, 'bokoisaac.com'].filter(Boolean).join(' · ')),
        d.date
          ? h('div', { display: 'flex', alignItems: 'center', gap: 10 }, [h('div', { width: 10, height: 10, borderRadius: 5, backgroundColor: C.coral }, undefined), mono(C.ink, d.date)])
          : h('div', { display: 'flex' }, undefined),
      ]),
    ],
  );
  const svg = await satori(tree, { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Renders a card for every built page that asks for one. Returns the number written. */
export async function renderAll(clientDir, log = console.log) {
  let n = 0;
  for await (const file of htmlFiles(clientDir)) {
    const html = await readFile(file, 'utf8');
    const m = html.match(/<meta name="bi-og" content="([^"]*)"/);
    if (!m) continue;
    const data = JSON.parse(unescape(m[1]));
    const out = join(clientDir, 'og', `${data.path}.png`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, await renderCard(data));
    n++;
  }
  log(`Rendered ${n} share cards`);
  return n;
}

// `node scripts/og.mjs <dist/client>` renders without a full build; `node scripts/og.mjs --sample out.png` renders one.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [arg, out] = process.argv.slice(2);
  if (arg === '--sample') {
    await writeFile(out ?? '/tmp/og-sample.png', await renderCard({ section: 'Writing', title: 'Build for one bar of signal', meta: '6 min', date: '2026-10-06' }));
  } else await renderAll(arg ?? 'dist/client');
}
