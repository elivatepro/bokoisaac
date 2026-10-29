// Copy for /stack, /uses and /now, from Paper ("Boko Isaac - Stack / Uses / Now").
// The Notion "Stack & Uses" database has no Years or Level fields and is empty, and the Notion "Now" rows are
// shorter than the design (no detail lines), so these pages use the Paper copy for now.
// TODO: move to Notion once the Stack DB has Years/Level and the Now rows have details.

export type Level = 'Daily' | 'Weekly' | 'Comfortable';

export interface Tool {
  name: string;
  years: number;
  level: Level;
  note: string;
}

export const LEVELS: { level: Level; note: string }[] = [
  { level: 'Daily', note: 'On most working days. Ask me anything.' },
  { level: 'Weekly', note: 'In regular use. I ship with it without looking things up.' },
  { level: 'Comfortable', note: 'I can deliver with it, a little slower.' },
];

/** The years bar is full at this many years. */
export const MAX_YEARS = 6;

export const STACK: { name: string; tools: Tool[] }[] = [
  {
    name: 'Languages',
    tools: [
      { name: 'TypeScript', years: 6, level: 'Daily', note: 'Strict mode, no any. Types end to end, from the database to the screen.' },
      { name: 'JavaScript', years: 6, level: 'Daily', note: 'The platform underneath everything else, and still where the bugs live.' },
      { name: 'Node.js', years: 6, level: 'Daily', note: 'APIs, background jobs and the glue between services.' },
      { name: 'SQL', years: 4, level: 'Weekly', note: 'Schemas, migrations and the queries an ORM gets wrong.' },
    ],
  },
  {
    name: 'Frameworks',
    tools: [
      { name: 'React', years: 6, level: 'Daily', note: 'Web apps and dashboards. Plain state until it needs more.' },
      { name: 'React Native / Expo', years: 4, level: 'Daily', note: 'One codebase for iOS and Android, built for the field and bad signal.' },
      { name: 'Next.js', years: 4, level: 'Weekly', note: 'The default when a product needs a server and a deadline.' },
      { name: 'Tailwind CSS', years: 3, level: 'Weekly', note: 'Fast styling that stays close to the component.' },
    ],
  },
  {
    name: 'Data',
    tools: [
      { name: 'Postgres', years: 5, level: 'Daily', note: 'Model the data first. Constraints in the database, not in hope.' },
      { name: 'Supabase', years: 4, level: 'Daily', note: 'Auth, storage and row-level security for most of what I ship.' },
      { name: 'Drizzle or Prisma', years: 3, level: 'Weekly', note: 'Typed queries and migrations that live in the repo.' },
      { name: 'REST and GraphQL', years: 6, level: 'Weekly', note: 'APIs for apps and partners, with the docs written down.' },
    ],
  },
  {
    name: 'Ship and AI',
    tools: [
      { name: 'Vercel / Railway', years: 4, level: 'Weekly', note: 'Preview deploys on every pull request, and servers for the jobs that run long.' },
      { name: 'Cloudflare', years: 3, level: 'Comfortable', note: 'DNS, caching and the odd worker at the edge.' },
      { name: 'GitHub Actions', years: 5, level: 'Weekly', note: 'Type checks and tests on every push. Nothing ships red.' },
      { name: 'OpenAI / Anthropic APIs', years: 2, level: 'Weekly', note: 'AI features that earn their place, with a fallback when they do not.' },
    ],
  },
];

export interface UseItem {
  name: string;
  note: string;
  href?: string;
}

export const USES: { name: string; items: UseItem[] }[] = [
  {
    name: 'Hardware',
    items: [
      { name: '14-inch laptop', note: 'Fast enough for a build, a simulator and a local database at once. It gets replaced when it slows me down.' },
      { name: '27-inch 4K display', note: 'One screen, not two. Code on the left, the app on the right.' },
      { name: 'Mid-range Android phone', note: 'The test device. If the React Native app feels fast on this, it is fast.' },
      { name: 'An older iPhone', note: 'For iOS builds and the details that only show up on a real device.' },
      { name: 'Keyboard and mouse', note: 'Nothing special. Quiet and comfortable for long days.' },
    ],
  },
  {
    name: 'Editor',
    items: [
      { name: 'VS Code', note: 'Format on save, a short list of extensions, TypeScript strict in every project.' },
      { name: 'JetBrains Mono, 13 px', note: 'The same typeface as the labels on this site. Ligatures off.' },
      // Paper shows a link tile here; no theme has been named yet, so no link until there is one.
      { name: 'A quiet dark theme', note: 'Low contrast for the chrome, full contrast for the code.' },
      { name: 'Terminal and zsh', note: 'A plain prompt: directory, branch, exit code. Everything else is an alias.' },
    ],
  },
  {
    name: 'Apps',
    items: [
      { name: 'Supabase Studio', note: 'Tables, policies and logs. Where every data model gets checked.' },
      { name: 'Expo Go', note: 'Quick previews of React Native builds on real phones.' },
      { name: 'TablePlus', note: 'For reading production data with care. Read-only by default.' },
      { name: 'Paper', note: 'Layouts and screens get sketched here before any code.', href: 'https://paper.design' },
      { name: 'TickTick', note: 'One list per client and per project. One task in progress at a time.' },
    ],
  },
  {
    name: 'Desk',
    items: [
      { name: 'A plain desk', note: 'Big enough for a laptop, a screen and two test phones.' },
      { name: 'A good chair', note: 'The best money on this list.' },
      { name: 'Headphones', note: 'For calls and for focus. Nothing fancy.' },
      { name: 'A paper notebook', note: 'Data models get drawn here before any file is opened.' },
    ],
  },
];

export const EDITOR_CONFIG = `{
  // the short list. The rest is default.
  "editor.fontFamily": "JetBrains Mono",
  "editor.fontSize": 13,
  "editor.fontLigatures": false,
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "editor.tabSize": 2,
  "files.trimTrailingWhitespace": true
}`;

/** When the Uses list was last checked (Paper says "20XX"; set when the list was built). */
export const USES_CHECKED = 'October 2026';

export interface NowEntry {
  date: string;
  title: string;
  detail: string;
}

// Paper also had "Reading [book title to confirm]" (a placeholder, hidden in Notion too), left out until confirmed.
export const NOW: NowEntry[] = [
  {
    date: '2026-10-20',
    title: 'Leading QPIMS at Quality Installs Co.',
    detail: 'The main job. QPIMS runs jobs, crews and installs for the field and the office. This month: a cleaner path from booked job to finished install.',
  },
  {
    date: '2026-10-12',
    title: 'QPAS and QP Invoicing, on the same data',
    detail: 'Invoices come straight from finished jobs, so nobody types a number twice. Money is stored as integers, end to end.',
  },
  {
    date: '2026-10-05',
    title: 'Open to one new project alongside it',
    detail: 'One outside project at a time, next to the Quality Installs work. A full-stack build, a mobile app or an AI feature. Write with what you are building.',
  },
  {
    date: '2026-09-28',
    title: 'Writing about field apps',
    detail: 'Short notes on building for crews who work with one bar of signal. First up: Build for one bar of signal.',
  },
  {
    date: '2026-09-15',
    title: 'Working on offline-queue in the Lab',
    detail: 'A small tool that keeps writes on the phone and syncs them when the signal comes back. Notes go in the repository as I go.',
  },
];

export const NOW_UPDATED = 'October 2026';
