import { live } from './content';

// Services for /services and /services/[slug]. Notion Services owns the name, price, order and Published flag;
// the summary, timeline and "Includes" come from Notion when filled in, otherwise from the copy below.
// Full-stack build's scope, steps and questions are from Paper ("Services Detail"); the other seven were
// drafted to match their Paper cards and are waiting for Boko's review.

export interface Step {
  when: string;
  title: string;
  body: string;
}
export interface Question {
  q: string;
  a: string;
}
interface Copy {
  summary: string;
  timeline: string;
  includes: string[];
  scope: string;
  steps: Step[];
  questions: Question[];
  /** The three "Other services" rows on the detail page. Defaults to the next three in order. */
  related?: string[];
  /** One-liner for "Other services" rows when the summary is long (Paper shortens AI and software management). */
  short?: string;
  /** "How it runs" heading: plain lead + coral accent. Defaults to Paper's "From the first note to the handover." */
  stepsTitle?: [string, string];
}

const COPY: Record<string, Copy> = {
  'full-stack-build': {
    summary: 'Your product end to end, from the data model to the screens people use.',
    timeline: '6 to 10 weeks',
    includes: ['Architecture note before any code', 'Web app, API and database', 'Tests on every critical flow', 'A handover call and written docs'],
    scope:
      'I join your team or start from a brief and take the product the whole way: data model, API, web app, tests and the release pipeline. You get working software every week, not a big reveal at the end.',
    steps: [
      { when: 'Week 0', title: 'Architecture note', body: 'Two pages: data model, routes, what gets tested and what does not. You sign it off before any code exists.' },
      { when: 'Week 1', title: 'First deploy', body: 'A real screen on a real URL, behind a login, with CI, a preview per pull request and error tracking switched on.' },
      {
        when: 'Weeks 2 to 8',
        title: 'One flow a week',
        body: 'Each flow is finished end to end before the next one starts: database, API, screens, empty and error states. A written update every Friday.',
      },
      { when: 'Last week', title: 'Handover', body: 'Docs in the repository, a recorded walkthrough and a call with whoever maintains it next.' },
    ],
    questions: [
      { q: 'Do you need finished designs?', a: 'No. Wireframes and a brand guide are enough. I settle the details in the browser, where they can be tested on a real phone.' },
      { q: 'Who owns the code?', a: 'You do, from the first commit. It lives in your repository and runs in your CI.' },
      {
        q: 'What if the scope changes?',
        a: 'The quote lists the two or three things that could move it. If one of them happens I tell you the same day, with the new range.',
      },
    ],
    related: ['mobile-app', 'ai-integration', 'software-management'],
  },
  'mobile-app': {
    stepsTitle: ['From the first note to the', 'store.'],
    summary: 'One app for iOS and Android, on the same API as your web product.',
    timeline: '6 to 10 weeks',
    includes: ['React Native for iOS and Android', 'Works offline on patchy signal', 'Push notifications and deep links', 'App Store and Play Store release'],
    scope:
      'One React Native app for iOS and Android, built on the same API as your web product, so a change reaches both at once. It keeps working on patchy signal, sends the notifications people actually want, and I take it through App Store and Play Store review with you.',
    steps: [
      { when: 'Week 0', title: 'App plan', body: 'The screens, the offline rules and what deserves a push notification, agreed in two pages before any code.' },
      { when: 'Week 1', title: 'First build on a phone', body: 'A real build on your phone through TestFlight and an internal Play track, with crash reporting switched on.' },
      { when: 'Weeks 2 to 8', title: 'One flow a week', body: 'Each flow is finished on both platforms, offline states included, before the next one starts. A written update every Friday.' },
      { when: 'Last week', title: 'Store release', body: 'Store listings, screenshots and review, then a handover call and docs for whoever maintains it next.' },
    ],
    questions: [
      { q: 'Do I need a web app too?', a: 'No. If you have one, the app uses the same API. If not, I build the API alongside the app.' },
      {
        q: 'Why React Native?',
        a: 'One codebase for iOS and Android, so features ship to both at the same time and cost less to maintain. Native code is added where a feature needs it.',
      },
      { q: 'Who owns the store accounts?', a: 'You do. The app is published under your developer accounts, and the code lives in your repository.' },
    ],
  },
  'ai-integration': {
    short: 'AI where it saves real time, inside the tools you already use.',
    stepsTitle: ['From the use case to the', 'numbers.'],
    summary: 'AI where it saves real time: assistants, document reading and automation inside the tools you already use.',
    timeline: '2 to 4 weeks',
    includes: ['Use case agreed before any build', 'Works on your data, kept private', 'Measured against the old way', 'Running costs you can see'],
    scope:
      'I pick one task where AI saves real time, like reading documents, answering questions from your own data or drafting replies, and build it into the tools your team already uses. It is measured against the old way, so you know it earns its place.',
    steps: [
      { when: 'Week 0', title: 'Use case', body: 'One task, how it is done today and how we will measure the new way, agreed before anything is built.' },
      { when: 'Week 1', title: 'Working prototype', body: 'A rough version on your real data, so we see early where the model helps and where it does not.' },
      { when: 'Weeks 2 to 3', title: 'Built in', body: 'Wired into your tools, with guardrails, logging and a fallback for when the model is unsure.' },
      { when: 'Last week', title: 'Measured handover', body: 'A side by side against the old way, the running cost per month, and docs for your team.' },
    ],
    questions: [
      { q: 'Is our data used to train a model?', a: 'No. I use providers and settings that do not train on your data, and send the model only what the task needs.' },
      { q: 'What if AI is not the right fit?', a: 'Then I say so after the use case step, and you only pay for that part.' },
      { q: 'What does it cost to run?', a: 'You see the running cost per month before launch, and it is logged afterwards so there are no surprises.' },
    ],
  },
  'apis-integrations': {
    stepsTitle: ['From the first map to the', 'docs.'],
    summary: 'Clean APIs, and the glue between the tools your business already runs on.',
    timeline: '1 to 3 weeks',
    includes: ['REST or GraphQL API design', 'Payments, maps and messaging', 'Webhooks and background jobs', 'Docs your team can build on'],
    scope:
      'Clean APIs for your product, and the glue between the tools your business already pays for: payments, maps, messaging, CRMs and spreadsheets. Each integration retries quietly when the other side is down, and tells you when something needs a person.',
    steps: [
      { when: 'Day 1', title: 'Map the flow', body: 'Which system owns which data, what triggers what, and what happens when a call fails.' },
      { when: 'Week 1', title: 'First connection', body: 'One flow working end to end on staging, with logs you can read.' },
      { when: 'Weeks 1 to 3', title: 'The rest of the flows', body: 'Each integration finished with retries, webhooks and background jobs before the next one starts.' },
      { when: 'Last week', title: 'Docs and handover', body: 'API docs your team can build on, and a short call on how to keep an eye on it.' },
    ],
    questions: [
      {
        q: 'REST or GraphQL?',
        a: 'Whichever suits the people using it. REST for most public APIs, GraphQL when several screens need different slices of the same data.',
      },
      { q: 'Can you work with our existing systems?', a: 'Yes. Most of the work is connecting what you already pay for, through their APIs and webhooks.' },
      {
        q: 'What happens when a service we rely on goes down?',
        a: 'Calls are queued and retried, and you get an alert if something still fails, so nothing is lost silently.',
      },
    ],
  },
  'small-tools': {
    short: 'Internal tools and automations that take a chore off your team.',
    stepsTitle: ['From the chore to the', 'handover.'],
    summary: 'Internal tools, dashboards and automations that take a chore off your team, built in days, not months.',
    timeline: '1 to 2 weeks',
    includes: ['One clear job per tool', 'Logins and roles when needed', 'Hosted and ready to use', 'A short video on how to use it'],
    scope:
      'Internal tools, dashboards and automations that take one chore off your team: a form that replaces a spreadsheet, a report that builds itself, an approval that used to be an email chain. Built in days, hosted and ready to use.',
    steps: [
      { when: 'Day 1', title: 'The chore', body: 'Who does it today, how long it takes and what done looks like.' },
      { when: 'Days 2 to 5', title: 'First version', body: 'A working tool on a real URL, tried on real data by the person who does the chore.' },
      { when: 'Week 2', title: 'Polish', body: 'Logins and roles if needed, the edge cases from the first week, and the small fixes.' },
      { when: 'Last day', title: 'Handover', body: 'Hosted and ready, with a short video on how to use it.' },
    ],
    questions: [
      { q: 'How small is small?', a: 'One clear job per tool. If it grows past two weeks, I quote it as a full-stack build instead.' },
      { q: 'Where is it hosted?', a: 'On your own accounts where possible, or on mine with a small monthly fee, whichever you prefer.' },
      { q: 'Can it grow later?', a: 'Yes. It is built on the same stack as a full product, so it can grow without starting again.' },
    ],
  },
  'software-management': {
    short: 'Hosting, updates, backups, monitoring and small fixes, every month.',
    stepsTitle: ['From the audit to the', 'monthly report.'],
    summary: 'I keep your software running: hosting, updates, backups, monitoring and small fixes.',
    timeline: 'Monthly',
    includes: ['Hosting and backups looked after', 'Security and dependency updates', 'Uptime and error monitoring', 'A few hours of changes each month'],
    scope:
      'I keep your software running after launch: hosting, backups, security and dependency updates, uptime and error monitoring, and a few hours each month for small changes. You get a short written report every month.',
    steps: [
      { when: 'Week 1', title: 'Audit', body: 'Hosting, backups, dependencies and monitoring checked, with a list of what needs fixing first.' },
      { when: 'Week 2', title: 'Safety net', body: 'Backups tested, alerts switched on and the urgent updates done.' },
      { when: 'Every month', title: 'Upkeep', body: 'Updates, monitoring and a few hours of changes, with a short written report.' },
      { when: 'Any time', title: 'Handover', body: 'Everything is documented as we go, so you can move it to someone else whenever you like.' },
    ],
    questions: [
      { q: 'Do you only look after software you built?', a: 'No. I start with an audit of what you have, then take it on.' },
      { q: 'What if something breaks at night?', a: 'Alerts reach me straight away, and urgent issues are fixed first. Response times are agreed up front.' },
      { q: 'Can I stop at any time?', a: 'Yes. It runs month to month, and the docs are kept up to date so you can move on whenever you want.' },
    ],
  },
  'team-embed': {
    stepsTitle: ['From the first day to the', 'review.'],
    summary: 'A senior full-stack engineer inside your team, three days a week.',
    timeline: '3 months minimum',
    includes: ['Three fixed days a week', 'Code review and pairing', 'Weekly written update', 'No lock-in after month three'],
    scope:
      'A senior full-stack engineer inside your team: in your standups, your repository and your chat. I take features end to end, review code and pair with your developers, on three fixed days a week.',
    steps: [
      { when: 'Week 1', title: 'Onboarding', body: 'Access, the codebase, the people, and a first small fix shipped.' },
      { when: 'Weeks 2 to 4', title: 'First feature', body: 'A real feature taken end to end through your process, with reviews both ways.' },
      { when: 'Every week', title: 'Steady work', body: 'Features, reviews and pairing on fixed days, plus a short written update.' },
      { when: 'Month three', title: 'Review', body: 'We look at how it is going and decide together whether to carry on.' },
    ],
    questions: [
      { q: 'Which days do you work?', a: 'Three fixed days a week, agreed at the start, so your team always knows when I am around.' },
      { q: 'Do you use our tools?', a: 'Yes. Your repository, your tickets, your chat and your review rules.' },
      { q: 'Why three months minimum?', a: 'It takes a few weeks to be really useful inside a team. After month three there is no lock-in.' },
    ],
  },
  consulting: {
    stepsTitle: ['From the question to the', 'notes.'],
    summary: 'A second pair of eyes on architecture, tech choices and code, billed by the hour.',
    timeline: 'By the hour',
    includes: ['Architecture and stack reviews', 'Code and pull request reviews', 'Written notes after every call', 'Book one hour or a block'],
    scope:
      'A second pair of eyes on architecture, tech choices and code. Bring a decision you are stuck on or a pull request you are unsure about, and leave with a clear recommendation and written notes.',
    steps: [
      { when: 'Before', title: 'Send the context', body: 'A short note, the repository or the document, so the call starts with the real question.' },
      { when: 'The call', title: 'Work through it', body: 'We go through the problem together, on a call or in writing if that suits you better.' },
      { when: 'Same day', title: 'Written notes', body: 'A summary of what we decided, the reasons behind it and the next steps.' },
      { when: 'After', title: 'Follow-up', body: 'Book another hour when the next question comes up, or a block for regular check-ins.' },
    ],
    questions: [
      { q: 'What can I bring?', a: 'Architecture and stack choices, code and pull request reviews, or a second opinion on a plan or a quote.' },
      { q: 'Do you need access to our systems?', a: 'Not usually. A branch, a document or a shared screen is enough for most reviews.' },
      { q: 'Can I book more than one hour?', a: 'Yes. Book a single hour, or a block if you want regular check-ins.' },
    ],
  },
};

export interface Service extends Copy {
  slug: string;
  name: string;
  price: string;
  order: number;
}

const money = (n: number) => `$${n.toLocaleString('en-US')}`;
export function priceLabel(from: number | null, unit: 'project' | 'month' | 'hour') {
  if (from == null) return '';
  if (unit === 'hour') return `${money(from)} an hour`;
  if (unit === 'month') return `From ${money(from)} a month`;
  return `From ${money(from)}`;
}

/** Live services in Notion order, with the page copy merged in. Rows without copy are skipped. */
export async function services(): Promise<Service[]> {
  const rows = await live('services');
  return rows.flatMap(({ data: d }) => {
    const copy = COPY[d.slug];
    if (!copy) return [];
    return [
      {
        ...copy,
        slug: d.slug,
        name: d.name,
        price: priceLabel(d.priceFrom, d.priceUnit),
        order: d.order,
        summary: d.summary || copy.summary,
        timeline: d.timeline || copy.timeline,
        includes: d.includes.length ? d.includes : copy.includes,
      },
    ];
  });
}

/** The three services listed under "Other services" on a detail page. */
export function relatedTo(service: Service, all: Service[]): Service[] {
  const picked = service.related?.map((s) => all.find((x) => x.slug === s)).filter((s): s is Service => !!s) ?? [];
  if (picked.length >= 3) return picked.slice(0, 3);
  const i = all.findIndex((s) => s.slug === service.slug);
  const rest = [...all.slice(i + 1), ...all.slice(0, i)].filter((s) => !picked.includes(s));
  return [...picked, ...rest].slice(0, 3);
}

/** Lead "Need" names from the Contact brief (components/home/Contact.astro), so Start can preselect one. */
const NEEDS = ['Full-stack build', 'Mobile app', 'APIs & integrations', 'Team embed'];
export function contactHref(service: Service, call = false) {
  const q = new URLSearchParams({ service: service.slug });
  q.set('need', NEEDS.includes(service.name) ? service.name : 'Something else');
  if (call) q.set('call', '1');
  return `/contact?${q}`;
}
