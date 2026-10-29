// Regenerates public/boko-isaac-cv.pdf ("Download CV" on /resume) by printing the resume page with its
// print stylesheet (one A4 page, black on white). Run against a dev or preview server after editing the resume:
//   PW_CORE=/path/to/node_modules/playwright-core node scripts/cv-pdf.mjs http://localhost:4321/resume
// Needs playwright-core and a local Chrome (it is not a project dependency, to keep installs small).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const url = process.argv[2] ?? 'http://localhost:4321/resume';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_CORE ?? 'playwright-core');
const out = fileURLToPath(new URL('../public/boko-isaac-cv.pdf', import.meta.url));

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: 'A4', printBackground: false, preferCSSPageSize: true });
await browser.close();
console.log(`Wrote ${out}`);
