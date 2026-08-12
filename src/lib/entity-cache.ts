/**
 * In-memory "have we seen this record before" cache, keyed by resource name
 * then id. Every list hook (`useUsers`, `useCourses`, ...) remembers each
 * page it fetches here as a free side effect, so a detail page navigated to
 * from a list has its data instantly, with no network flicker.
 *
 * This exists because the admin API has no `GET /{resource}/{id}` for any
 * top-level resource — only paginated lists. See `use-entity-detail.ts` for
 * the bounded-scan fallback used when nothing is cached yet (a hard refresh
 * or a direct link). If the backend ever adds single-entity GETs, only that
 * one hook needs to change — this module and every list hook stay as-is.
 *
 * Deliberately a plain module-level Map, not React state: reads/writes here
 * are a side effect of fetching, not something that should itself trigger a
 * re-render anywhere.
 */

type WithId = { id: string };

const stores = new Map<string, Map<string, unknown>>();

function getStore(resource: string): Map<string, unknown> {
  let store = stores.get(resource);
  if (!store) {
    store = new Map();
    stores.set(resource, store);
  }
  return store;
}

/** Remember every item in a freshly-fetched page/list. */
export function rememberEntities<T extends WithId>(
  resource: string,
  items: T[],
): void {
  const store = getStore(resource);
  for (const item of items) store.set(item.id, item);
}

/** Remember (or overwrite) a single item, e.g. after an edit page's PATCH returns. */
export function rememberEntity<T extends WithId>(resource: string, item: T): void {
  getStore(resource).set(item.id, item);
}

export function recallEntity<T>(resource: string, id: string): T | undefined {
  return stores.get(resource)?.get(id) as T | undefined;
}

export function forgetEntity(resource: string, id: string): void {
  stores.get(resource)?.delete(id);
}
