import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { live } from './content';

export type Post = CollectionEntry<'blog'>;

/** Live posts, newest first. */
export async function posts(): Promise<Post[]> {
  return (await live('blog')).sort((a, b) => (b.data.published?.getTime() ?? 0) - (a.data.published?.getTime() ?? 0));
}

// Notion file URLs expire after an hour, so covers are bundled in src/assets/home/writing/<slug>.webp for now.
// TODO: replace with a Notion image download step at build time.
const covers = import.meta.glob<{ default: ImageMetadata }>('../assets/home/writing/*.{webp,jpg,jpeg,png}', { eager: true });
export const coverFor = (slug: string) =>
  Object.entries(covers).find(([path]) => path.split('/').pop()!.replace(/\.\w+$/, '') === slug)?.[1].default;

export const postHref = (slug: string) => `/writing/${slug}`;
export const day = (d: Date | null) => d?.toISOString().slice(0, 10) ?? '';
export const readTime = (m: number | null) => (m ? `${m} min read` : '');
