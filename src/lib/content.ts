import { getCollection, type CollectionEntry, type DataEntryMap } from 'astro:content';

// In `npm run dev` every row shows, so drafts can be checked against Paper.
// In production only rows marked Published / Show (or Blog/Lab status "Published") appear.
const SHOW_DRAFTS = import.meta.env.DEV;

type Name = keyof DataEntryMap;

function isLive(data: Record<string, unknown>): boolean {
  if ('status' in data) return data.status === 'Published';
  if ('published' in data) return data.published === true;
  if ('show' in data) return data.show === true;
  if ('approved' in data) return data.approved === true;
  return true;
}

/** Live rows of a collection, sorted by `order` (then newest first when a date exists). */
export async function live<N extends Name>(name: N): Promise<CollectionEntry<N>[]> {
  const rows = await getCollection(name, (e) => SHOW_DRAFTS || isLive(e.data as Record<string, unknown>));
  return rows.sort((a, b) => {
    const da = a.data as Record<string, unknown>;
    const db = b.data as Record<string, unknown>;
    const order = Number(da.order ?? 999) - Number(db.order ?? 999);
    if (order) return order;
    const ta = (da.published ?? da.date) instanceof Date ? (da.published ?? da.date) as Date : null;
    const tb = (db.published ?? db.date) instanceof Date ? (db.published ?? db.date) as Date : null;
    return (tb?.getTime() ?? 0) - (ta?.getTime() ?? 0);
  });
}
