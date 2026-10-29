import type { ImageMetadata } from 'astro';
import qpimsImg from '../assets/home/work-qpims-platform.webp';
import walletImg from '../assets/home/work-elivate-wallet.webp';
import qpasImg from '../assets/home/work-qpas.webp';
import pdpImg from '../assets/home/work-pdp-enrichment-engine.webp';
import bookImg from '../assets/home/work-book-read-along.webp';
import invoicingImg from '../assets/home/work-qp-invoicing.webp';
import eduImg from '../assets/home/work-eduskillup-lms.webp';
import roudioImg from '../assets/home/work-roudio.webp';
import qpimsDashboard from '../assets/work/qpims-dashboard.webp';
import qpimsSketches from '../assets/work/qpims-sketches.webp';

// Projects for Home "Selected work", /work and /work/[slug]. Static copy from Paper; "20XX" years are
// placeholders still to be confirmed. The QPIMS study is from Paper; the other studies were drafted from each
// project's facts (summary, stack, metric) and are waiting for Boko's review.
export interface CaseStudy {
  problem: string[];
  approach: string[];
  gallery?: { image: ImageMetadata; alt: string; caption: string }[];
  result: string[];
  pullQuote?: string;
}

export interface Project {
  slug: string;
  name: string;
  client: string;
  year: string;
  summary: string;
  role: string;
  before: string;
  after: string;
  metric: string;
  stack: string[];
  tag: string;
  image: ImageMetadata;
  alt: string;
  study?: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: 'qpims-platform',
    name: 'QPIMS Platform',
    client: 'Quality Installs Co.',
    year: '2025',
    summary: 'Jobs, crews and installs in one platform that the field and the office both run on.',
    role: 'Lead software engineer',
    before: '2.9 s',
    after: '0.8 s',
    metric: 'LCP on a mid-range phone',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL'],
    tag: 'Platform',
    image: qpimsImg,
    alt: 'A laptop showing a dark dashboard on an office desk, a team working in the background',
    study: {
      problem: [
        'Quality Installs ran its jobs on spreadsheets, group chats and phone calls. Crews turned up without the right specs, and the office only knew a job was finished when someone remembered to call it in.',
      ],
      approach: [
        'One data model for jobs, crews and installs, in PostgreSQL on Supabase, so the field app and the office dashboard read the same record.',
        'Crews get the day’s jobs on their phone, with specs, photos and the customer’s notes, and close each one out from the site.',
        'The office watches every job move from booked to installed as it happens. Nobody has to call to ask.',
      ],
      gallery: [
        {
          image: qpimsDashboard,
          alt: 'A laptop on an office desk showing the QPIMS dashboard, with a coffee cup and phone beside it',
          caption: 'The office dashboard, where every job’s status lands as it changes',
        },
        {
          image: qpimsSketches,
          alt: 'Paper sketches of a phone screen with sticky notes, on a desk next to a phone and pens',
          caption: 'Early paper sketches of the crew’s job screen',
        },
      ],
      result: [
        'Every job now lives in one place, from the first booking to the signed-off install. The field app loads in 0.8 s on a mid-range phone, down from 2.9 s, so crews actually open it on site.',
      ],
      pullQuote: 'The office finally sees what the field sees, the moment it happens.',
    },
  },
  {
    slug: 'elivate-wallet',
    name: 'Elivate Wallet',
    client: 'Elivate',
    year: '20XX',
    summary: 'A digital wallet across web and mobile, from the API to the screens people tap.',
    role: 'Full-stack engineer',
    before: '14 min',
    after: '95 s',
    metric: 'From merge to production',
    stack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    tag: 'Mobile',
    image: walletImg,
    alt: 'A developer at a desk lamp-lit workstation, reading code on two monitors',
    study: {
      problem: [
        'Elivate needed one wallet that worked the same on the web and on a phone. Every release meant a manual build, a manual check and a long wait, so small fixes sat in a queue for days and nobody wanted to ship on a Friday.',
      ],
      approach: [
        'One TypeScript API in Node.js in front of PostgreSQL, so the web app and the mobile app read the same balances and the same rules.',
        'Money stored as whole cents, never as decimals, so a balance adds up the same way on every screen and in every report.',
        'A pipeline that tests, builds and deploys every merge on its own, with a one-click rollback if anything looks wrong.',
      ],
      result: [
        'A merge now reaches production in 95 s instead of 14 minutes. Fixes go out the same afternoon they are written, and releases stopped being an event.',
      ],
      pullQuote: 'Shipping became the boring part, which is how it should be.',
    },
  },
  {
    slug: 'qpas',
    name: 'QPAS',
    client: 'Quality Installs Co.',
    year: '2025',
    summary: 'Part of the Quality Installs suite, built on the same data model as QPIMS.',
    role: 'Lead software engineer',
    before: '380 ms',
    after: '48 ms',
    metric: 'INP on the transactions table',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'Redis'],
    tag: 'Platform',
    image: qpasImg,
    alt: 'A laptop and phone showing a dark analytics dashboard with an orange revenue chart',
    study: {
      problem: [
        'QPAS sits next to QPIMS in the Quality Installs suite, and its transactions table is where the office spends most of the day. With thousands of rows, every filter or sort froze the screen for a moment, long enough for people to click twice.',
      ],
      approach: [
        'Built on the same data model as QPIMS, so a job and its transactions are one record, not two systems kept in sync.',
        'Heavy totals worked out ahead of time and cached in Redis, so the table never adds up thousands of rows while someone waits.',
        'Only the rows on screen are drawn, and filters update the list without blocking the next click.',
      ],
      result: [
        'Interaction to next paint on the transactions table dropped from 380 ms to 48 ms. Filtering now feels instant, and the double clicks stopped.',
      ],
      pullQuote: 'The table answers before you notice you were waiting.',
    },
  },
  {
    slug: 'pdp-enrichment-engine',
    name: 'PDP Enrichment Engine',
    client: 'Freelance',
    year: '20XX',
    summary: 'An API that fills product detail pages with clean, complete data from messy sources.',
    role: 'Software developer',
    before: '12 fps',
    after: '60 fps',
    metric: 'Pan and zoom at 1M points',
    stack: ['Node.js', 'Python', 'Redis', 'Docker'],
    tag: 'API',
    image: pdpImg,
    alt: 'A monitor in a dark room showing orange line charts and a heatmap',
    study: {
      problem: [
        'Product data arrived from suppliers in every shape: spreadsheets, feeds and half-filled forms. Product pages went live with missing sizes and mismatched names, and checking a large catalogue by hand was slow and easy to get wrong.',
      ],
      approach: [
        'An API in Node.js that takes each messy source, cleans it, fills the gaps and returns one tidy record per product.',
        'The cleaning jobs run in Python workers, queued through Redis, so a big import never slows down the API.',
        'A review view that plots the whole catalogue, so the team can pan and zoom across a million data points and spot the gaps at a glance.',
      ],
      result: [
        'The review view went from 12 fps to a smooth 60 fps at a million points, so checking a full catalogue is something people actually do, not something they skip.',
      ],
      pullQuote: 'Clean data in, complete product pages out.',
    },
  },
  {
    slug: 'book-read-along',
    name: 'Book Read-Along',
    client: 'Freelance',
    year: '20XX',
    summary: 'A reading app that follows along with the reader, page by page.',
    role: 'Software developer',
    before: '71',
    after: '100',
    metric: 'Lighthouse accessibility, product average',
    stack: ['React', 'TypeScript', 'Node.js', 'Docker'],
    tag: 'Mobile',
    image: bookImg,
    alt: 'A desktop monitor showing a colourful app layout, with books and prints on shelves behind',
    study: {
      problem: [
        'A reading app is only useful if every reader can use it. The first version looked good but failed people using screen readers, larger text or a keyboard, which ruled out many of the readers it was meant for.',
      ],
      approach: [
        'Pages that follow the reader, highlighting each line as it is read, with controls that work by keyboard and by touch.',
        'Every screen checked with a screen reader and at large text sizes, not just with an automated scan.',
        'Clear labels, readable contrast and focus that always shows where you are on the page.',
      ],
      result: [
        'The product\'s average Lighthouse accessibility score went from 71 to 100. More importantly, the app now works for the readers who need it most.',
      ],
      pullQuote: 'Accessible from the first page, not patched in at the end.',
    },
  },
  {
    slug: 'qp-invoicing',
    name: 'QP Invoicing',
    client: 'Quality Installs Co.',
    year: '2025',
    summary: 'Invoicing for install jobs, from the finished work order to the paid invoice.',
    role: 'Lead software engineer',
    before: '38%',
    after: '71%',
    metric: 'Applications completed',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'GraphQL'],
    tag: 'Platform',
    image: invoicingImg,
    alt: 'A developer sitting at a desk with two monitors in a bright office',
    study: {
      problem: [
        'At Quality Installs, an install was finished long before it was billed. Turning a work order into an invoice meant retyping it, and customers often gave up partway through the application to pay.',
      ],
      approach: [
        'Invoices built straight from the finished work order in QPIMS, so nothing is typed twice.',
        'One GraphQL API over PostgreSQL that the office and the customer screens share.',
        'A short, clear application with fewer steps, progress that is saved as you go, and plain error messages.',
      ],
      result: [
        'Completed applications rose from 38% to 71%. Jobs now move from a finished install to a paid invoice without someone chasing them.',
      ],
      pullQuote: 'Finished work turns into paid work, without a phone call.',
    },
  },
  {
    slug: 'eduskillup-lms',
    name: 'EduSkillUp LMS',
    client: 'Freelance',
    year: '20XX',
    summary: 'A learning platform for courses, lessons and the people working through them.',
    role: 'Software developer',
    before: '1.9 s',
    after: '0.4 s',
    metric: 'Time to the first search result',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    tag: 'Web',
    image: eduImg,
    alt: 'A developer typing at a laptop in front of two monitors full of code',
    study: {
      problem: [
        'EduSkillUp had courses, lessons and learners spread across tools that did not talk to each other. Finding a lesson took several clicks, and search was slow enough that people stopped using it.',
      ],
      approach: [
        'One React app for courses, lessons and learner progress, backed by a Node.js API.',
        'Search built into PostgreSQL with proper indexes, so results come straight from the database.',
        'The whole stack runs in Docker, so a new environment is up in minutes, the same way every time.',
      ],
      result: [
        'The first search result now appears in 0.4 s, down from 1.9 s. Learners find the lesson they want instead of scrolling for it.',
      ],
      pullQuote: 'Search fast enough that people use it again.',
    },
  },
  {
    slug: 'roudio',
    name: 'Roudio',
    client: 'Freelance',
    year: '20XX',
    summary: 'A media product shipped end to end for a freelance client.',
    role: 'Software developer',
    before: '640 kB',
    after: '92 kB',
    metric: 'JavaScript shipped',
    stack: ['React', 'TypeScript', 'Node.js', 'AWS'],
    tag: 'Web',
    image: roudioImg,
    alt: 'A dark street map of a city seen from above',
    study: {
      problem: [
        'Roudio needed to go from an idea to a live media product for a freelance client, quickly and on a small budget. The first build shipped far more JavaScript than it needed, and it felt slow on everyday phones.',
      ],
      approach: [
        'Built end to end: the React front end, a Node.js API and hosting on AWS.',
        'Every screen loads only the code it needs, and heavy libraries were swapped for smaller ones or removed.',
        'Media served from AWS close to the listener, so the app shell loads first and the content follows.',
      ],
      result: [
        'JavaScript shipped dropped from 640 kB to 92 kB. The app opens quickly on a normal phone on a normal connection, which is where most people use it.',
      ],
      pullQuote: 'Small enough to load fast, complete enough to ship.',
    },
  },
];
