// Site-wide facts for metadata and structured data (layouts/Base.astro, llms.txt, RSS).
export const SITE = {
  name: 'Boko Isaac',
  url: 'https://bokoisaac.com',
  email: 'hello@bokoisaac.com',
  jobTitle: 'Full-stack software engineer',
  tagline: 'Full-stack engineer, Remote',
  description:
    'Boko Isaac is a full-stack software engineer who builds web and mobile products, APIs and AI integrations end to end, in TypeScript, Node.js and PostgreSQL. Remote, working worldwide, in English and French.',
  /** The meta description when a page sets none: the same facts, short enough not to be cut off in results (≤160). */
  summary: 'Full-stack software engineer building web and mobile products, APIs and AI integrations in TypeScript, Node.js and PostgreSQL. Remote, worldwide.',
  knowsAbout: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Next.js', 'React Native', 'Supabase', 'APIs', 'AI integrations', 'Field-service software', 'Fintech'],
  languages: ['English', 'French'],
  /** Profile links. Empty ones are hidden in the footer and left out of the structured data. */
  social: { GitHub: 'https://github.com/elivatepro', LinkedIn: 'https://www.linkedin.com/in/ielivate/', Bluesky: '' } as Record<string, string>,
};
const sameAs = Object.values(SITE.social).filter(Boolean);

export const person = {
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  url: SITE.url,
  email: `mailto:${SITE.email}`,
  jobTitle: SITE.jobTitle,
  description: SITE.description,
  image: `${SITE.url}/og/default.png`,
  knowsAbout: SITE.knowsAbout,
  knowsLanguage: SITE.languages,
  workLocation: { '@type': 'Place', name: 'Remote, worldwide' },
  worksFor: { '@type': 'Organization', name: 'Quality Installs Co.' },
  hasOccupation: { '@type': 'Occupation', name: SITE.jobTitle, occupationLocation: { '@type': 'Place', name: 'Remote, worldwide' }, skills: SITE.knowsAbout.join(', ') },
  ...(sameAs.length ? { sameAs } : {}),
};

export const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  inLanguage: 'en',
  publisher: { '@id': person['@id'] },
};

/** BreadcrumbList for detail pages: [['Work', '/work'], ['QPIMS Platform', '/work/qpims-platform']]. */
export function breadcrumbs(items: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ...items].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE.url}${path}` })),
  };
}

/** ProfilePage for the pages that are about Boko himself (About, Resume). */
export function profilePage(path: string, name: string) {
  const url = `${SITE.url}${path}`;
  return { '@type': 'ProfilePage', '@id': `${url}#page`, url, name, mainEntity: { '@id': person['@id'] }, isPartOf: { '@id': website['@id'] } };
}

/** A listing page (Work, Writing, Services…): the items it links to, in order. */
export function collectionPage(path: string, name: string, items: { name: string; path: string }[]) {
  const url = `${SITE.url}${path}`;
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name,
    isPartOf: { '@id': website['@id'] },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: `${SITE.url}${it.path}` })),
    },
  };
}

/** FAQPage from question/answer pairs; null when there are none. */
export function faqPage(qa: { q: string; a: string }[], path?: string) {
  if (!qa.length) return null;
  return {
    '@type': 'FAQPage',
    ...(path && { '@id': `${SITE.url}${path}#faq` }),
    mainEntity: qa.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
