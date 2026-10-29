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
// placeholders still to be confirmed. Only projects with `study` have a written case study so far.
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
  },
];
