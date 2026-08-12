"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { recallEntity, rememberEntities, rememberEntity } from "@/lib/entity-cache";
import type { PaginatedResponse } from "@/types/api-types";

interface UseEntityDetailOptions {
  /** Page size used while scanning for a cache miss. Independent of any
   * list page's own configured `limit` — this never touches those. */
  pageSize?: number;
  /** Safety cap on how many pages to scan before giving up. */
  maxPages?: number;
}

/**
 * Loads a single entity for a `/dashboard/{resource}/[id]` page when the
 * only read API available is a paginated list (see `entity-cache.ts` for
 * why). Resolution order:
 *
 *  1. Instant: return whatever's in the module cache for `resource:id`, if
 *     anything (the overwhelmingly common case — the admin just clicked this
 *     row in a list that already fetched it).
 *  2. Always, in the background: page through `fetchPage` (capped) looking
 *     for a match, remembering everything it sees along the way. This keeps
 *     the view fresh and is what makes a hard refresh / direct link work at
 *     all, since step 1 has nothing to offer there.
 *
 * For a resource nested under a parent (episodes under a course, steps under
 * a roadmap), scope the cache key per parent, e.g.
 * `useEntityDetail(\`episodes:${courseId}\`, episodeId, (p) => fetchEpisodes(courseId, p))`.
 */
export function useEntityDetail<T extends { id: string }>(
  resource: string,
  id: string | null,
  fetchPage: (params: {
    limit: number;
    offset: number;
  }) => Promise<PaginatedResponse<T>>,
  options: UseEntityDetailOptions = {},
) {
  const { pageSize = 50, maxPages = 6 } = options;

  const [entity, setEntityState] = useState<T | undefined>(() =>
    id ? recallEntity<T>(resource, id) : undefined,
  );
  const [loading, setLoading] = useState(() => !!id && !entity);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cancelledRef = useRef(false);

  // Held in a ref so a fresh inline `fetchPage` each render doesn't
  // retrigger the scan — only resource/id/pageSize/maxPages should do that.
  // Synced in a layout effect (not during render) so the ref mutation stays
  // outside React's render pass, and runs before the plain effect below.
  const fetchPageRef = useRef(fetchPage);
  useLayoutEffect(() => {
    fetchPageRef.current = fetchPage;
  });

  const scan = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    cancelledRef.current = false;
    setNotFound(false);
    setError(null);
    if (!recallEntity<T>(resource, id)) setLoading(true);

    try {
      let seen = 0;
      for (let page = 0; page < maxPages; page++) {
        const res = await fetchPageRef.current({
          limit: pageSize,
          offset: page * pageSize,
        });
        if (cancelledRef.current) return;

        rememberEntities(resource, res.data);
        const match = res.data.find((item) => item.id === id);
        if (match) {
          setEntityState(match);
          setLoading(false);
          return;
        }

        seen += res.data.length;
        const exhausted =
          res.data.length < pageSize || seen >= res.meta.totalItems;
        if (exhausted) break;
      }

      if (!cancelledRef.current) {
        setNotFound(true);
        setLoading(false);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to load"));
        setLoading(false);
      }
    }
  }, [resource, id, pageSize, maxPages]);

  useEffect(() => {
    scan();
    return () => {
      cancelledRef.current = true;
    };
  }, [scan]);

  /** Update the entity in place after a mutation (e.g. an edit PATCH response). */
  const setEntity = useCallback(
    (next: T) => {
      setEntityState(next);
      rememberEntity(resource, next);
    },
    [resource],
  );

  return { entity, loading, notFound, error, refetch: scan, setEntity };
}
