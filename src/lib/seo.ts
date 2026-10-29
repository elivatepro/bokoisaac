// Site-wide facts for metadata and structured data (layouts/Base.astro, llms.txt, RSS).
export const SITE = {
  name: 'Boko Isaac',
  url: 'https://bokoisaac.com',
  email: 'hello@bokoisaac.com',
  jobTitle: 'Full-stack software engineer',
  tagline: 'Full-stack engineer, Remote',
  description:
    'Boko Isaac is a full-stack software engineer who builds web and mobile products, APIs and AI integrations end to end, in TypeScript, Node.js and PostgreSQL. Remote, working worldwide, in English and French.',
  knowsAbout: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Next.js', 'React Native', 'Supabase', 'APIs', 'AI integrations', 'Field-service software', 'Fintech'],
  languages: ['English', 'French'],
  /** Profile links. Empty ones are hidden in the footer and left out of the structured data.
   *  TODO: real profile URLs are not known yet. */
  social: { GitHub: '', LinkedIn: '', Bluesky: '' } as Record<string, string>,
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
