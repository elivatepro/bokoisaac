import type { ImageMetadata } from 'astro';
import offlineQueue from '../assets/home/lab/offline-queue.jpg';
import promptDiff from '../assets/home/lab/prompt-diff.jpg';
import moneySafe from '../assets/home/lab/money-safe.jpg';
import supaSeed from '../assets/home/lab/supa-seed.jpg';
import jobSheet from '../assets/home/lab/job-sheet.jpg';
import routeSketch from '../assets/home/lab/route-sketch.jpg';

// Lab items for /lab and /lab/[slug], from Paper ("Boko Isaac - Lab"). The Notion Lab rows are still drafts with
// no type, stack, repo or body, so this copy is the source for now. Stars and downloads are left out until they
// come from GitHub / npm (Paper's numbers were placeholders); cards and pages hide them when unset. Repo links stay hidden until `repo` is set.
export interface ReadmeBlock {
  kind: 'p' | 'list' | 'code' | 'quote';
  text?: string;
  items?: string[];
  lang?: string;
  code?: string;
}

export interface LabItem {
  slug: string;
  name: string;
  kind: 'Library' | 'Experiment' | 'Tool';
  summary: string;
  install: string;
  stars?: number;
  downloads?: number;
  license: string;
  repo?: string;
  image: ImageMetadata;
  alt: string;
  readme?: { intro: string; sections: { title: string; blocks: ReadmeBlock[] }[] };
}

export const lab: LabItem[] = [
  {
    slug: 'offline-queue',
    name: 'offline-queue',
    kind: 'Library',
    summary: 'Holds API calls while a phone has no signal, then sends them in order once it does.',
    install: 'npm install offline-queue',
    license: 'MIT',
    image: offlineQueue,
    alt: 'A city street seen from above at night, lit by street lamps',
    readme: {
      intro:
        'offline-queue is a 2 kB TypeScript queue for apps people use in the field. Requests made with no signal are saved on the device, then sent in the order they were made once the connection comes back.',
      sections: [
        {
          title: 'Usage',
          blocks: [
            {
              kind: 'code',
              lang: 'tsx',
              code: 'import { createQueue } from "offline-queue"\n\nconst queue = createQueue({\n  storage: "indexeddb",\n  retry: { times: 5, backoff: 2000 },\n})\n\n// Works the same with or without signal\nawait queue.add(() => api.post("/jobs/42/photos", form))',
            },
          ],
        },
        {
          title: 'What you get',
          blocks: [
            {
              kind: 'list',
              items: [
                'Jobs saved to IndexedDB or AsyncStorage, so they survive an app restart',
                'Sent in the order they were made, with retries and backoff',
                'queue.size and an onSent hook, so the screen can show what is still waiting',
              ],
            },
          ],
        },
        {
          title: 'Why it exists',
          blocks: [
            {
              kind: 'p',
              text: 'It started on QPIMS, where installers upload job photos from basements and rooftops. Uploads were failing without a word, and the office never saw the work. The queue fixed that in a week.',
            },
            { kind: 'quote', text: 'No dependencies. It runs the same in React Native and in the browser.' },
          ],
        },
      ],
    },
  },
  {
    slug: 'prompt-diff',
    name: 'prompt-diff',
    kind: 'Experiment',
    summary: 'Runs two versions of a prompt on the same inputs and shows where the answers changed.',
    install: 'npx prompt-diff a.md b.md',
    license: 'MIT',
    image: promptDiff,
    alt: 'Large weathered letterpress blocks stacked in the dark',
  },
  {
    slug: 'money-safe',
    name: 'money-safe',
    kind: 'Library',
    summary: 'Integer-only money math for TypeScript, so a wallet never shows $0.30000000000000004.',
    install: 'npm install money-safe',
    license: 'MIT',
    image: moneySafe,
    alt: 'A dark abstract close-up of curved metal catching a strip of light',
  },
  {
    slug: 'supa-seed',
    name: 'supa-seed',
    kind: 'Tool',
    summary: 'Fills a Supabase database with realistic test data, read straight from your own schema.',
    install: 'npx supa-seed --rows 500',
    license: 'MIT',
    image: supaSeed,
    alt: 'Hard window shadows falling across a concrete wall in a grid',
  },
  {
    slug: 'job-sheet',
    name: 'job-sheet',
    kind: 'Tool',
    summary: 'Turns a finished install job into a signed PDF the customer gets before the van leaves.',
    install: 'npx job-sheet ./job.json',
    license: 'MIT',
    image: jobSheet,
    alt: 'A metal grate resting on a dark surface, lit from the side',
  },
  {
    slug: 'route-sketch',
    name: 'route-sketch',
    kind: 'Experiment',
    summary: 'Plans a day of install jobs on a map and reorders the stops when one runs late.',
    install: 'npx degit bokoisaac/route-sketch',
    license: 'MIT',
    image: routeSketch,
    alt: 'Water droplets beaded on a dark surface',
  },
];

export const num = (n: number) => n.toLocaleString('en-US');
